import https from 'https';

const sitemapUrl = encodeURIComponent('https://www.homedesignenglish.com/sitemap.xml');
const targetUrl = 'https://www.homedesignenglish.com/plans/store';

const pingEndpoints = [
  { name: 'Google Sitemap Ping', url: `https://www.google.com/ping?sitemap=${sitemapUrl}` },
  { name: 'Bing Sitemap Ping', url: `https://www.bing.com/ping?sitemap=${sitemapUrl}` },
];

function ping(name, url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.get(parsed, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          console.log(`[${name}] Status: ${res.statusCode} ${res.statusMessage}`);
          resolve({ name, status: res.statusCode });
        });
      });
      req.on('error', (err) => {
        console.warn(`[${name}] Network notice: ${err.message}`);
        resolve({ name, error: err.message });
      });
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ name, timeout: true });
      });
    } catch (e) {
      resolve({ name, error: e.message });
    }
  });
}

async function run() {
  console.log(`Pinging search engines for sitemap and URL: ${targetUrl}`);
  for (const ep of pingEndpoints) {
    await ping(ep.name, ep.url);
  }
  console.log('Search engine pings complete.');
}

run();
