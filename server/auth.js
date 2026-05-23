const jwt = require('jsonwebtoken');

// Secret key for JWT. In production, this should be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'falguni_super_secret_key_123';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
    }
};

module.exports = {
    verifyToken,
    JWT_SECRET
};
