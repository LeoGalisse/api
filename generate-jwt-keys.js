const crypto = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

let envContent = fs.readFileSync('.env.local', 'utf8');

envContent = envContent.replace(
  /JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/,
  `JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`
);

envContent = envContent.replace(
  /JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----[\s\S]*?-----END PUBLIC KEY-----/,
  `JWT_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`
);

fs.writeFileSync('.env.local', envContent);

console.log('JWT keys generated and saved to .env.local');
console.log('Private key preview:', privateKey.substring(0, 100) + '...');
console.log('Public key preview:', publicKey.substring(0, 100) + '...');
