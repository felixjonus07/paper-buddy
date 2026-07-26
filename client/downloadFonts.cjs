const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const lilitaBuf = await download('https://raw.githubusercontent.com/google/fonts/main/ofl/lilitaone/LilitaOne-Regular.ttf');
    // Using an OTF for gagalin if TTF is not easily found, but jsPDF supports some OTF or we can try a TTF repo
    const gagalinBuf = await download('https://raw.githubusercontent.com/Ileriayo/markdown-badges/master/fonts/Gagalin-Regular.otf');
    
    // Actually jsPDF prefers TTF. Let's find a TTF for gagalin.
    const gagalinTTF = await download('https://raw.githubusercontent.com/Ileriayo/markdown-badges/master/fonts/Gagalin-Regular.otf'); 
    
    const content = `
export const lilitaOneBase64 = '${lilitaBuf.toString('base64')}';
export const gagalinBase64 = '${gagalinTTF.toString('base64')}';
`;
    const dir = path.join(process.cwd(), 'src', 'utils');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'fonts.js'), content);
    console.log('Fonts downloaded and saved as base64');
  } catch (e) {
    console.error('Error:', e);
  }
})();
