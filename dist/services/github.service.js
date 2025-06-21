"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareCommits = compareCommits;
const generateJWT_1 = __importDefault(require("../utils/generateJWT"));
async function getInstallationAccessToken(installationId) {
    const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${(0, generateJWT_1.default)()}`,
            Accept: 'application/vnd.github+json'
        }
    });
    const data = await response.json();
    return data.token;
}
async function compareCommits(organization, repository, beforeCommitHash, afterCommitHash, installationId) {
    const installationAccessToken = await getInstallationAccessToken(installationId);
    const response = await fetch(`https://api.github.com/repos/${organization}/${repository}/compare/${beforeCommitHash}...${afterCommitHash}`, {
        headers: {
            Authorization: `token ${installationAccessToken}`,
            Accept: 'application/vnd.github+json'
        }
    });
    return response.json();
}
