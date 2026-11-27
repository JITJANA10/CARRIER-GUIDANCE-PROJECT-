// Live Browser Functional Persistence Verification Script (CDP)
const http = require('http');

function httpRequest(method, urlStr, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: data ? { 'Content-Type': 'application/json' } : {}
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('[1] Fetching CDP targets on port 9222...');
  let target;
  try {
    target = await httpRequest('PUT', 'http://localhost:9222/json/new?http://localhost:5173/dashboard');
  } catch (err) {
    console.log('Direct CDP target creation error:', err.message);
    const targets = await httpRequest('GET', 'http://localhost:9222/json/list');
    target = targets.find(t => t.type === 'page');
  }

  if (!target || !target.webSocketDebuggerUrl) {
    console.error('No target available');
    process.exit(1);
  }

  console.log('Connected to target:', target.id);
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const curId = id++;
      pending.set(curId, resolve);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);
  console.log('WebSocket open.');

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('[2] Navigating to http://localhost:5173/dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('[3] Inspecting localStorage in browser...');
  const res1 = await send('Runtime.evaluate', {
    expression: `window.localStorage.getItem('pathpilot_state_v1')`,
    returnByValue: true
  });

  const stateStr = res1.result?.value;
  console.log('localStorage content exists:', Boolean(stateStr));
  if (stateStr) {
    const parsed = JSON.parse(stateStr);
    console.log('Hydrated Profile:', parsed.profile?.firstName, parsed.profile?.lastName);
    console.log('Active Goal:', parsed.activeGoal);
    console.log('Saved Careers:', parsed.savedCareers);
    console.log('Tasks Count:', parsed.tasks?.length);
    console.log('Version:', parsed.version);
    console.log('Updated At:', new Date(parsed.updatedAt).toISOString());
  }

  console.log('[4] Mutating state in browser and testing persistence...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const state = JSON.parse(window.localStorage.getItem('pathpilot_state_v1'));
        state.profile.firstName = 'VerifiedUser';
        state.profile.lastName = 'Phase1';
        state.savedCareers.push('cybersecurity-specialist');
        state.tasks.push({
          id: 'test-persistent-task',
          title: 'Automated Verification Task',
          status: 'todo',
          time: 15,
          createdAt: new Date().toISOString()
        });
        state.updatedAt = Date.now();
        window.localStorage.setItem('pathpilot_state_v1', JSON.stringify(state));
      })()
    `
  });

  console.log('[5] Reloading browser page to test persistence across hard reload...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  const res2 = await send('Runtime.evaluate', {
    expression: `window.localStorage.getItem('pathpilot_state_v1')`,
    returnByValue: true
  });

  const stateAfterReload = JSON.parse(res2.result?.value);
  console.log('--- RELOAD PERSISTENCE VERIFICATION ---');
  console.log('Name after reload:', stateAfterReload.profile.firstName, stateAfterReload.profile.lastName);
  console.log('Saved careers count:', stateAfterReload.savedCareers.length);
  console.log('Contains verified task:', stateAfterReload.tasks.some(t => t.id === 'test-persistent-task'));

  const pass1 = stateAfterReload.profile.firstName === 'VerifiedUser';
  const pass2 = stateAfterReload.tasks.some(t => t.id === 'test-persistent-task');
  const pass3 = stateAfterReload.savedCareers.includes('cybersecurity-specialist');

  console.log('Test 1 (Profile survives reload):', pass1 ? 'PASS' : 'FAIL');
  console.log('Test 2 (Tasks survive reload):', pass2 ? 'PASS' : 'FAIL');
  console.log('Test 3 (Saved careers survive reload):', pass3 ? 'PASS' : 'FAIL');

  console.log('[6] Testing corrupted localStorage resilience in browser...');
  await send('Runtime.evaluate', {
    expression: `window.localStorage.setItem('pathpilot_state_v1', 'CORRUPT_NOT_JSON{{')`
  });
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  const res3 = await send('Runtime.evaluate', {
    expression: `document.body ? document.body.innerText.length : 0`,
    returnByValue: true
  });
  console.log('Body rendered after corrupted localStorage (length):', res3.result?.value);
  const passCorrupt = (res3.result?.value || 0) > 100;
  console.log('Test 4 (Corrupted storage resilience):', passCorrupt ? 'PASS' : 'FAIL');

  // Reset to clean default state for pristine app operation
  await send('Runtime.evaluate', {
    expression: `window.localStorage.removeItem('pathpilot_state_v1')`
  });
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 1500));

  ws.close();
  if (pass1 && pass2 && pass3 && passCorrupt) {
    console.log('ALL BROWSER LIVE FUNCTIONAL PERSISTENCE TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('ONE OR MORE TESTS FAILED');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
