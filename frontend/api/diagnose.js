/**
 * Vercel Serverless Function — Diagnose Proxy
 * Forwards JSON symptom data to Render backend.
 */

const RENDER = 'https://csp-project-f6aq.onrender.com';

async function handler(req, res) {
    try {
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const upstream = await fetch(`${RENDER}/api/diagnose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
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
        console.error('[diagnose proxy error]', err);
        return res.status(500).json({
            error: 'Proxy function crashed',
            message: err.message,
        });
    }
}

handler.config = {
    api: {
        maxDuration: 30,
    },
};

module.exports = handler;
