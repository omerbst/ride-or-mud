// Vercel Serverless Function: proxies Tomorrow.io API calls
// This keeps the API key on the server side, not exposed to clients.

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat/lng parameters' });
    }

    const apiKey = process.env.TOMORROW_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const url = `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lng}&apikey=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({
                error: `Tomorrow.io API error: ${response.status}`,
                details: text.slice(0, 200),
            });
        }

        const data = await response.json();

        // Cache for 30 minutes on Vercel's edge
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
