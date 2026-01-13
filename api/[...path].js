const app = require('../server');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
    const normalizeToken = (value) => (value || '').trim().replace(/\/+$/, '');
    const parseOrigin = (originValue) => {
        const raw = (originValue || '').trim();
        if (!raw) return { raw: '', origin: '', host: '' };
        try {
            const url = new URL(raw);
            return { raw, origin: url.origin, host: url.host };
        } catch {
            // If not a full URL, treat it as hostname (e.g. frontend.vercel.app)
            return { raw, origin: '', host: normalizeToken(raw) };
        }
    };

    const allowedRaw = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map(normalizeToken)
        .filter(Boolean);

    const allowed = allowedRaw.map(parseOrigin);
    const requestOriginRaw = req.headers.origin;
    const requestParsed = parseOrigin(requestOriginRaw);

    const allowAny = allowed.length === 0 || allowedRaw.includes('*');
    const originAllowed =
        !!requestParsed.raw &&
        (allowAny ||
            allowed.some((a) =>
                (a.origin && requestParsed.origin && a.origin === requestParsed.origin) ||
                (a.host && requestParsed.host && a.host === requestParsed.host)
            ));

    if (originAllowed && requestOriginRaw) {
        // Reflect the request origin (supports cookies/credentials and avoids '*' restrictions)
        res.setHeader('Access-Control-Allow-Origin', requestOriginRaw);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    } else if (allowAny && requestOriginRaw) {
        // When not configured, reflect origin for browser requests
        res.setHeader('Access-Control-Allow-Origin', requestOriginRaw);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
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
