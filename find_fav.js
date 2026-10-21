const https = require('https');

https.get('https://vrindacab.com', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const lines = d.split('\n');
    lines.forEach(line => {
      if (/icon|favicon|shortcut/i.test(line)) {
        console.log(line.trim());
      }
    });
  });
});
