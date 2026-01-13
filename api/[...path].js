const app = require('../server');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
    // Ensure CORS headers are present even when we fail before Express runs
    const allowedOrigins = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const requestOrigin = req.headers.origin;
    const originAllowed = !!requestOrigin && (allowedOrigins.length === 0 || allowedOrigins.includes(requestOrigin));

    if (originAllowed) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    } else if (allowedOrigins.length === 0) {
        // fallback: allow all when CORS_ORIGIN not configured
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
