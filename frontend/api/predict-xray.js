// Vercel Serverless Proxy — forwards X-ray image uploads to Render backend
// Uses CommonJS (module.exports) which is required for .js files in Vercel

const RENDER_BACKEND = 'https://csp-project-f6aq.onrender.com';

module.exports = async function handler(req, res) {
    // Handle preflight
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
        // Collect raw multipart body using Node.js streams
        const rawBody = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', chunk => chunks.push(Buffer.from(chunk)));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
        });

        // Forward to Render with the same Content-Type (preserves multipart boundary)
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
};

module.exports.config = {
    api: {
        bodyParser: false, // Required for multipart/form-data
        maxDuration: 60,   // 60s timeout for model inference
    },
};
