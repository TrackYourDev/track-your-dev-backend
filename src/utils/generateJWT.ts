import jwt from 'jsonwebtoken';
import fs from 'fs';

const appId = '1265874';

let privateKey = process.env.PRIVATE_KEY;

if (!privateKey && process.env.PRIVATE_KEY_BASE64) {
  privateKey = Buffer.from(process.env.PRIVATE_KEY_BASE64, 'base64').toString('utf8');
}

if (!privateKey) {
  privateKey = fs.readFileSync('./private-key.pem', 'utf8'); // fallback for local dev
}

const jwtToken = jwt.sign(
  {
    iss: appId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
  },
  privateKey,
  { algorithm: 'RS256' }
);

export default jwtToken;
