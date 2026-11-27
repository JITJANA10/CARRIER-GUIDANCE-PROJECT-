// Inspect browser console and page status
const http = require('http');

function httpRequest(method, urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch { resolve(body); }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function debugBrowser() {
  const targets = await httpRequest('GET', 'http://localhost:9222/json/list');
  const target = targets.find(t => t.type === 'page');
  console.log('Target:', target.url, target.id);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  let onLoadFired = null;

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value ?? a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('[BROWSER EXCEPTION]', msg.params.exceptionDetails?.text, msg.params.exceptionDetails?.exception?.description);
    }
    if (msg.method === 'Page.loadEventFired') {
      console.log('[PAGE LOAD EVENT FIRED]');
      if (onLoadFired) onLoadFired();
    }
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
  await send('Page.enable');
  await send('Runtime.enable');

  const loadPromise = new Promise(r => onLoadFired = r);
  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await loadPromise;
  console.log('Page loaded completely.');

  // Give React time to mount
  await new Promise(r => setTimeout(r, 1000));

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      return JSON.stringify({
        url: window.location.href,
        title: document.title,
        bodyLength: document.body ? document.body.innerText.length : 0,
        storageKeys: Object.keys(window.localStorage),
        storageVal: window.localStorage.getItem('pathpilot_state_v1')
      });
    })()`,
    returnByValue: true
  });

  console.log('Full evalRes:', JSON.stringify(evalRes));

  const parsed = JSON.parse(evalRes.result?.value || '{}');
  console.log('URL:', parsed.url);
  console.log('Title:', parsed.title);
  console.log('Body Length:', parsed.bodyLength);
  console.log('Storage Keys:', parsed.storageKeys);
  if (parsed.storageVal) {
    const state = JSON.parse(parsed.storageVal);
    console.log('State version:', state.version);
    console.log('Profile:', state.profile?.firstName, state.profile?.lastName);
    console.log('Tasks:', state.tasks?.length);
  } else {
    console.log('Storage value is null/empty');
  }

  ws.close();
}

debugBrowser().catch(console.error);
