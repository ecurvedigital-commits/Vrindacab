const https = require('https');

https.get('https://vrindacab.com', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const images = data.match(/https?:\/\/[^"'\s]+\.(?:png|ico|svg|jpg|webp)/gi);
    console.log('IMAGES:', [...new Set(images)].slice(0, 30));
  });
}).on('error', err => console.error(err));
