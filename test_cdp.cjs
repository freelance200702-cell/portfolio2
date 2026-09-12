const http = require('http');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9222',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    console.log('Tabs:', tabs);
    if (tabs.length > 0) {
      const wsUrl = tabs[0].webSocketDebuggerUrl;
      console.log('WebSocket URL:', wsUrl);
    }
  } catch (err) {
    console.error('Error fetching tabs:', err.message);
  } finally {
    edge.kill();
  }
}, 3000);
