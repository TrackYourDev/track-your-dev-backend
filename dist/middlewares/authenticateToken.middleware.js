"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const authenticateToken = async (req, res, next) => {
    const token = req.cookies['github_token'];
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'trackyourdev'
            }
        });
        if (response.ok) {
            const userData = await response.json();
            req.githubId = userData.id;
            next();
        }
        else {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
    }
    catch (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
    }
};
exports.authenticateToken = authenticateToken;
