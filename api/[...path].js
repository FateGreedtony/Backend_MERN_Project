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
            // Allow providing hostname only in CORS_ORIGIN (e.g. frontend.vercel.app)
            const host = normalizeToken(raw).replace(/^https?:\/\//, '');
            return { raw, origin: '', host };
        }
    };

    const allowedRaw = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map(normalizeToken)
        .filter(Boolean);

    const allowAny = allowedRaw.length === 0 || allowedRaw.includes('*');
    const allowed = allowedRaw.map(parseOrigin);

    const requestOriginRaw = req.headers.origin;
    const requestParsed = parseOrigin(requestOriginRaw);

    const originAllowed =
        !!requestParsed.raw &&
        (allowAny ||
            allowed.some((a) =>
                (a.origin && requestParsed.origin && a.origin === requestParsed.origin) ||
                (a.host && requestParsed.host && a.host === requestParsed.host)
            ));

    if (requestOriginRaw && originAllowed) {
        // Reflect origin so it works with credentials and avoids '*' restrictions
        res.setHeader('Access-Control-Allow-Origin', requestOriginRaw);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    } else if (requestOriginRaw && allowAny) {
        // When not configured, still reflect browser Origin
        res.setHeader('Access-Control-Allow-Origin', requestOriginRaw);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Max-Age', '86400');

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

