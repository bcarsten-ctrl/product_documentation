// Serverless proxy: forwards /api/proxy/<path>?<query> to the SteelEngine API,
// injecting the server-side API key. The browser never sees the key.
//
// Env vars (set in Vercel project settings):
//   STEELENGINE_API_KEY   - a SteelEngine workspace/personal API key that can
//                           run the deployed workflow AND read workspace tables.
//                           (NOTE: the MCP "copilot" key does NOT work here.)
//   STEELENGINE_BASE_URL  - defaults to https://steelengine.com

const STEELENGINE_BASE_URL = (process.env.STEELENGINE_BASE_URL || 'https://steelengine.com').replace(/\/+$/, '');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Execution-Mode');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { path, ...rest } = req.query;
  if (!path) { res.status(400).json({ error: 'Missing path parameter' }); return; }
  if (!process.env.STEELENGINE_API_KEY) {
    res.status(500).json({ error: 'Missing STEELENGINE_API_KEY on the server' });
    return;
  }

  // Reassemble the downstream path and forward any extra query params
  // (e.g. workspaceId, filter, limit for the tables API).
  const pathStr = Array.isArray(path) ? path.join('/') : path;
  const qs = new URLSearchParams(rest).toString();
  const url = `${STEELENGINE_BASE_URL}/${pathStr}${qs ? `?${qs}` : ''}`;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.STEELENGINE_API_KEY,
    };
    if (req.headers['x-execution-mode']) headers['X-Execution-Mode'] = req.headers['x-execution-mode'];

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Proxy error: ' + e.message });
  }
}
