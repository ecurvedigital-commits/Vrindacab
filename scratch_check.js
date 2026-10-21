
const http = require('http');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const p = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--window-size=375,812',
  'http://localhost:3000/test_overflow.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9226/json', r => {
        let b = ''; r.on('data', c => b += c); r.on('end', () => res(JSON.parse(b)));
      }).on('error', rej);
    });
    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: '(' + function() {
            const w = 375;
            const bad = [];
            // check elements that exceed 375
            document.querySelectorAll('*').forEach(el => {
              if (el.offsetWidth > w) {
                // only record if parent does not also have the same offsetWidth or if it's the root cause
                bad.push({
                  tag: el.tagName,
                  id: el.id,
                  cls: (el.className || '').toString().slice(0, 30),
                  offW: el.offsetWidth,
                  scrollW: el.scrollWidth,
                  parent: el.parentElement ? el.parentElement.tagName + '.' + (el.parentElement.className || '') : ''
                });
              }
            });
            return bad;
          }.toString() + ')()',
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === 1) {
        console.log('OVERSIZED_ELEMENTS:');
        const items = data.result.value || [];
        // filter down to key containers and culprits
        items.forEach(it => {
          if (!['HTML', 'BODY', 'MAIN'].includes(it.tag)) {
            console.log(it.tag, '#' + it.id, '.' + it.cls, 'offW=' + it.offW, 'scrollW=' + it.scrollW, 'parent=' + it.parent.slice(0, 35));
          }
        });
        ws.close();
        p.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    p.kill();
    process.exit(1);
  }
}, 2500);
