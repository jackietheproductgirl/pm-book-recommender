const https = require('https');
const fs = require('fs');

// Read the manual covers file
const manualCovers = JSON.parse(fs.readFileSync('manual-covers.json', 'utf8'));

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // Check if response is valid (not empty or error)
        const isValid = res.statusCode === 200 && data.length > 1000;
        resolve({ url, statusCode: res.statusCode, isValid, contentLength: data.length });
      });
    }).on('error', (err) => {
      resolve({ url, statusCode: 0, isValid: false, error: err.message });
    });
  });
}

async function testAllCovers() {
  console.log('Testing all cover URLs...\n');
  
  for (const [bookTitle, url] of Object.entries(manualCovers.manual_covers)) {
    console.log(`Testing: ${bookTitle}`);
    const result = await testUrl(url);
    
    if (result.isValid) {
      console.log(`✅ Working: ${url}`);
    } else {
      console.log(`❌ Failed: ${url} (Status: ${result.statusCode}, Length: ${result.contentLength})`);
    }
    console.log('');
  }
}

testAllCovers(); 