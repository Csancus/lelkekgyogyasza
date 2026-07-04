// Események API – Upstash Redis (Vercel KV) REST
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || process.env.EVENTS_ADMIN_PASSWORD || 'lelkek';
const KEY = 'esemenyek';

async function kvGet() {
  const r = await fetch(`${KV_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const { result } = await r.json();
  return result ? JSON.parse(result) : [];
}

async function kvSet(events) {
  await fetch(`${KV_URL}/set/${KEY}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: JSON.stringify(events),
  });
}

export default async function handler(req, res) {
  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: 'A Redis nincs bekötve (KV_REST_API_URL / KV_REST_API_TOKEN hiányzik).' });
  }

  if (req.method === 'GET') {
    const events = await kvGet();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(events);
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (body.password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Hibás jelszó.' });
  }

  let events = await kvGet();

  if (req.method === 'POST') {
    const e = body.event || {};
    if (!e.title || !e.date) return res.status(400).json({ error: 'A cím és a dátum kötelező.' });
    events.push({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      title: String(e.title).slice(0, 200),
      date: String(e.date).slice(0, 10),
      time: String(e.time || '').slice(0, 20),
      location: String(e.location || '').slice(0, 200),
      desc: String(e.desc || '').slice(0, 1000),
    });
    events.sort((a, b) => a.date.localeCompare(b.date));
    await kvSet(events);
    return res.status(200).json(events);
  }

  if (req.method === 'DELETE') {
    events = events.filter((ev) => ev.id !== body.id);
    await kvSet(events);
    return res.status(200).json(events);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
