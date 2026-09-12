const { spawn } = require('child_process');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9224',
  '--window-size=1920,1080',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9224/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
    if (!pageTab) {
      console.log('No page tab');
      edge.kill();
      return;
    }

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const canvas = document.querySelector('canvas');
              if (!canvas) return { error: 'no canvas' };
              const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
              const pixels = new Uint8Array(4);
              if (gl) {
                gl.readPixels(canvas.width / 2, canvas.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
              }
              return {
                width: canvas.width,
                height: canvas.height,
                pixelCenter: Array.from(pixels),
                title: document.title
              };
            })()
          `,
          returnByValue: true
        }
      }));
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === 2) {
        console.log('Canvas state:', msg.result.result.value);

        // Advance the journey to t = 0.08 to see the 3D world clearly past intro overlay!
        ws.send(JSON.stringify({
          id: 3,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              window.__journeyStore = window.__journeyStore || document.querySelector('#root');
              // Dispatch wheel or call startJourney if available
              const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('INITIALIZE EXPEDITION'));
              if (startBtn) {
                startBtn.click();
              }
              'clicked start';
            `,
            returnByValue: true
          }
        }));
      } else if (msg.id === 3) {
        console.log('Clicked start button:', msg.result.result.value);
        // Wait 1.5 seconds for camera to travel to first project exhibit, then capture screenshot via CDP!
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 4,
            method: 'Page.captureScreenshot',
            params: { format: 'png' }
          }));
        }, 1500);
      } else if (msg.id === 4) {
        const base64Data = msg.result.data;
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync('C:\\Users\\adelr\\.gemini\\antigravity\\brain\\9c097643-12c5-4f33-b8bf-05af1141ca7a\\expedition_view.png', buffer);
        console.log('Saved expedition_view.png! Size:', buffer.length);
        ws.close();
        edge.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error(err);
    edge.kill();
  }
}, 3500);
