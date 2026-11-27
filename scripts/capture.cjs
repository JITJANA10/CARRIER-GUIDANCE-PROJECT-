const fs = require('fs');
const path = require('path');

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 }
];

const routes = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'explorer', path: '/dashboard/explorer' },
  { name: 'assessments', path: '/dashboard/assessments' },
  { name: 'skills', path: '/dashboard/skills' },
  { name: 'routine', path: '/dashboard/routine' },
  { name: 'roadmap', path: '/dashboard/roadmap' },
  { name: 'ai-mentor', path: '/dashboard/ai-mentor' },
  { name: 'mentors', path: '/dashboard/mentors' },
  { name: 'landing', path: '/' },
  { name: 'onboarding', path: '/onboarding' }
];

async function capture() {
  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Beginning comprehensive visual QA screenshot capture...');

  for (const vp of viewports) {
    console.log(`\nCapturing viewport: ${vp.name} (${vp.width}x${vp.height})`);
    
    // Create dedicated page
    const res = await fetch(`http://localhost:9222/json/new?about:blank`, { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let reqId = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const curId = reqId++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send('Page.enable');
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 600
    });

    for (const route of routes) {
      const targetUrl = `http://localhost:5173${route.path}`;
      await send('Page.navigate', { url: targetUrl });
      
      // Allow dynamic rendering and animations to settle
      await new Promise(r => setTimeout(r, 1200));

      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      const filename = `${route.name}-${vp.name}.png`;
      const outPath = path.join(screenshotsDir, filename);
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
      console.log(`  ✓ Saved ${filename}`);
    }

    ws.close();
    await fetch(`http://localhost:9222/json/close/${target.id}`, { method: 'PUT' }).catch(() => {});
  }

  console.log('\nAll screenshots captured successfully.');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
