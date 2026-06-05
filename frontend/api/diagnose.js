// Vercel Serverless Proxy for /api/diagnose
// Forwards JSON symptom data to the Render backend.
// Same-origin call from browser — no CORS needed.

export const config = {
    api: {
        maxDuration: 30,
    },
};

const RENDER_BACKEND = 'https://csp-project-f6aq.onrender.com';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch(`${RENDER_BACKEND}/api/diagnose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Failed to connect to diagnosis server',
            details: error.message
        });
    }
}
