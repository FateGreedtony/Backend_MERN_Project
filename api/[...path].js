const app = require('../server');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
    const normalizeOrigin = (value) => (value || '').trim().replace(/\/+$/, '');

    const allowedOrigins = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean);

    const requestOriginRaw = req.headers.origin;
    const requestOrigin = normalizeOrigin(requestOriginRaw);

    const allowAny = allowedOrigins.length === 0 || allowedOrigins.includes('*');
    const originAllowed = !!requestOrigin && (allowAny || allowedOrigins.includes(requestOrigin));

    if (originAllowed) {
        // Prefer reflecting the request origin (works with credentials and avoids '*' restrictions)
        res.setHeader('Access-Control-Allow-Origin', requestOriginRaw);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    } else if (allowAny && requestOriginRaw) {
        // When not configured, reflect origin instead of returning '*'
        res.setHeader('Access-Control-Allow-Origin', requestOriginRaw);
        res.setHeader('Vary', 'Origin');
    } else if (allowAny) {
        // Non-browser clients without Origin header
        res.setHeader('Access-Control-Allow-Origin', '*');
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
