const https = require('https');

function get(url) {
  https.get(url, (res) => {
    console.log(url, res.statusCode, res.headers.location);
    if (res.headers.location) {
      get(res.headers.location);
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const matches = data.match(/<link[^>]*rel=['"][^'"]*icon[^>]*>/gi);
      console.log('ICON TAGS:', matches);
      const title = data.match(/<title[^>]*>([^<]+)<\/title>/i);
      console.log('TITLE:', title ? title[1] : null);
    });
  }).on('error', err => console.error(err));
}

get('https://vrindacab.com');
