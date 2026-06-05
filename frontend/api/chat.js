/**
 * Vercel Serverless Function — Gemini AI Chat Proxy
 * API key is stored securely as GEMINI_API_KEY environment variable in Vercel.
 */

const GEMINI_MODEL = 'gemini-2.5-flash';

async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured in Vercel environment variables.' });
        }

        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

        const upstream = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        let data;
        const text = await upstream.text();
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: 'Gemini API returned non-JSON', raw: text.slice(0, 500) };
        }

        return res.status(upstream.status).json(data);

    } catch (err) {
        console.error('[chat proxy error]', err);
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
