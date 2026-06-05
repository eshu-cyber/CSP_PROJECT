// Vercel Serverless Proxy for /api/predict-xray
// Forwards the multipart image upload to Render backend.
// Because this runs on Vercel (same origin as the frontend), CORS is never an issue.

export const config = {
    api: {
        bodyParser: false, // Required for multipart/form-data file uploads
        maxDuration: 60,   // 60-second timeout for model inference
    },
};

const RENDER_BACKEND = 'https://csp-project-f6aq.onrender.com';

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Collect the raw multipart body (file upload)
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
        }
        const rawBody = Buffer.concat(chunks);

        // Forward to Render backend with the exact same Content-Type (including boundary)
        const response = await fetch(`${RENDER_BACKEND}/api/predict-xray`, {
            method: 'POST',
            headers: {
                'Content-Type': req.headers['content-type'],
            },
            body: rawBody,
        });

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Failed to connect to analysis server',
            details: error.message
        });
    }
}
