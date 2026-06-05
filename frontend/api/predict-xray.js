/**
 * Vercel Serverless Function — X-Ray Analysis Proxy
 * Forwards multipart image uploads to Render backend.
 * bodyParser MUST be false to get the raw stream for multipart/form-data.
 */

const RENDER = 'https://csp-project-f6aq.onrender.com';

async function handler(req, res) {
    // Always return JSON, never let Vercel's HTML error page through
    try {
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Collect raw request body chunks (works with Node 18 async iteration)
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const rawBody = Buffer.concat(chunks);

        // Forward to Render with the exact same Content-Type (preserves multipart boundary)
        const upstream = await fetch(`${RENDER}/api/predict-xray`, {
            method: 'POST',
            headers: {
                'content-type': req.headers['content-type'] || 'multipart/form-data',
            },
            body: rawBody,
        });

        let data;
        const text = await upstream.text();
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: 'Backend returned non-JSON', raw: text.slice(0, 500) };
        }

        return res.status(upstream.status).json(data);

    } catch (err) {
        console.error('[predict-xray proxy error]', err);
        return res.status(500).json({
            error: 'Proxy function crashed',
            message: err.message,
        });
    }
}

// bodyParser must be false — Vercel must NOT touch the multipart body
handler.config = {
    api: {
        bodyParser: false,
        maxDuration: 60,
    },
};

module.exports = handler;
