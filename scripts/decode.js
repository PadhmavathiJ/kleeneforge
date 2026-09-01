const fs = require('fs');
const [,, outPath, b64] = process.argv;
fs.writeFileSync(outPath, Buffer.from(b64, 'base64').toString('utf8'), 'utf8');
console.log('Saved:', outPath);
