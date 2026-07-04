// Események API – Upstash Redis (Vercel KV) REST
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || process.env.EVENTS_ADMIN_PASSWORD || '';
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

  // brute-force vedelem: max 20 hibas proba / ora / IP
  const ip = (req.headers['x-forwarded-for'] || 'ismeretlen').split(',')[0].trim();
  const rlKey = `evlogin:${ip}`;
  const rlRes = await fetch(`${KV_URL}/get/${rlKey}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } }).then((r) => r.json());
  if (parseInt(rlRes.result || '0', 10) >= 20) {
    return res.status(429).json({ error: 'Túl sok próbálkozás. Próbáld újra egy óra múlva.' });
  }
  if (!ADMIN_PASS || typeof body.password !== 'string' || body.password !== ADMIN_PASS) {
    await fetch(`${KV_URL}/incr/${rlKey}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
    await fetch(`${KV_URL}/expire/${rlKey}/3600`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
    return res.status(401).json({ error: 'Hibás jelszó.' });
  }

  let events = await kvGet();

  if (req.method === 'POST') {
    const e = body.event || {};
    if (!e.title || !e.date) return res.status(400).json({ error: 'A cím és a dátum kötelező.' });
    if (e.id) events = events.filter((ev) => ev.id !== e.id);
    const sanitize = (html) =>
      String(html || '')
        .replace(/<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/javascript:/gi, '')
        .slice(0, 5000);
    const url = (u) => {
      let v = String(u || '').trim();
      if (v && !/^https?:\/\//i.test(v) && /^[\w.-]+\.[a-z]{2,}([\/?#]|$)/i.test(v)) v = 'https://' + v;
      return /^https?:\/\//i.test(v) ? v.slice(0, 500) : '';
    };
    const img = (u) => {
      const v = String(u || '').trim();
      if (/^data:image\/(jpeg|png|webp);base64,/i.test(v) && v.length < 900000) return v;
      return url(v);
    };
    events.push({
      id: e.id || Math.random().toString(36).slice(2) + Date.now().toString(36),
      title: String(e.title).slice(0, 200),
      image: img(e.image),
      date: String(e.date).slice(0, 10),
      time: String(e.time || '').slice(0, 30),
      duration: String(e.duration || '').slice(0, 60),
      location: String(e.location || '').slice(0, 200),
      fee: String(e.fee || '').slice(0, 60),
      mode: e.mode === 'online' ? 'online' : 'szemelyes',
      desc: sanitize(e.desc),
      signupUrl: url(e.signupUrl),
      fbUrl: url(e.fbUrl),
    });
    events[events.length - 1].createdAt = Date.now();
    events.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
