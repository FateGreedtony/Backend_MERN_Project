const app = require('../server');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
    const normalize = (v) => (v || '').trim().replace(/\/+$/, '');

    const allowedOrigins = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map(normalize)
        .filter(Boolean);

    const requestOrigin = normalize(req.headers.origin);

    const allowAny = allowedOrigins.length === 0 || allowedOrigins.includes('*');
    const originAllowed = requestOrigin && (allowAny || allowedOrigins.includes(requestOrigin));

    if (originAllowed && requestOrigin) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    } else if (allowAny && requestOrigin) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        await connectDB();
    } catch (err) {
        return res.status(500).json({
            message: 'Database connection failed',
            error: err?.message || String(err),
        });
    }

    return app(req, res);
};
