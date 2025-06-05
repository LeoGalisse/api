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

// Convert PEM keys to base64 as expected by the application
const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

let envContent;
try {
  envContent = fs.readFileSync('.env.local', 'utf8');
} catch (error) {
  // If .env.local doesn't exist, create a basic template
  envContent = `# Database
DATABASE_URL=mongodb://admin:password123@localhost:27017/inatel_api?authSource=admin
DATABASE_URL_TEST=mongodb://admin:password123@localhost:27018/inatel_api_test?authSource=admin

# Server
PORT=3333
CORS_ORIGIN=http://localhost:3000

# JWT Keys (base64 encoded)
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
`;
}

// Replace or add JWT keys (now as base64 without quotes)
envContent = envContent.replace(
  /JWT_PRIVATE_KEY=.*/,
  `JWT_PRIVATE_KEY=${privateKeyBase64}`
);

envContent = envContent.replace(
  /JWT_PUBLIC_KEY=.*/,
  `JWT_PUBLIC_KEY=${publicKeyBase64}`
);

fs.writeFileSync('.env.local', envContent);

console.log('JWT keys generated and saved to .env.local');
console.log('Keys are now base64 encoded as expected by the application');
console.log('Private key base64 length:', privateKeyBase64.length);
console.log('Public key base64 length:', publicKeyBase64.length);
