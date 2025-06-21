"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const appId = '1265874';
let privateKey = process.env.PRIVATE_KEY;
if (!privateKey && process.env.PRIVATE_KEY_BASE64) {
    privateKey = Buffer.from(process.env.PRIVATE_KEY_BASE64, 'base64').toString('utf8');
}
if (!privateKey) {
    privateKey = fs_1.default.readFileSync('./private-key.pem', 'utf8'); // fallback for local dev
}
const generateJwtToken = () => {
    return jsonwebtoken_1.default.sign({
        iss: appId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
    }, privateKey, { algorithm: 'RS256' });
};
exports.default = generateJwtToken;
