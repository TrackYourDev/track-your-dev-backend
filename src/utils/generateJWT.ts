import jwt from 'jsonwebtoken';
import fs from 'fs';

const appId = '1265874'; // from GitHub Developer App
const privateKey = fs.readFileSync('./private-key.pem', 'utf8');

const jwtToken = jwt.sign(
  {
    iss: appId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 60), // max 10 minutes
  },
  privateKey,
  { algorithm: 'RS256' }
);

export default jwtToken;