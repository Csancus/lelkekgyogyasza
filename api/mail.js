// Kapcsolat űrlap – saját magyar HTML email a virágos design színeivel.
// Küldés a Brevo (ingyenes, 300 email/nap) API-val; env: BREVO_API_KEY,
// opcionálisan MAIL_FROM_EMAIL (a Brevo-ban hitelesített feladó címe).
const BREVO_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || 'csanad.peter.czarth@gmail.com';
const TO = [
  { email: 'csanad.peter.czarth@gmail.com', name: 'Czarth Csanád' },
  { email: 'n.b.ildiko72@gmail.com', name: 'Berényi Ildikó' },
];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function sor(cimke, ertek, opts) {
  if (!ertek) return '';
  const o = opts || {};
  const border = o.utolso ? '' : 'border-bottom:1px solid #E8DFD0;';
  const val = o.tobbsoros
    ? '<span style="line-height:1.7">' + esc(ertek).replace(/\n/g, '<br>') + '</span>'
    : o.link
      ? '<a href="' + o.link + esc(ertek) + '" style="color:#4E7249;font-weight:600">' + esc(ertek) + '</a>'
      : '<span style="' + (o.kiemelt ? 'font-weight:600;' : '') + '">' + esc(ertek) + '</span>';
  return (
    '<tr>' +
    '<td style="padding:12px 18px;' + border + 'color:#6B6056;font-size:13px;white-space:nowrap;width:120px;vertical-align:top">' + cimke + '</td>' +
    '<td style="padding:12px 18px;' + border + 'font-size:15px;color:#2E2A25">' + val + '</td>' +
    '</tr>'
  );
}

function buildHtml(d) {
  const datum = new Date().toLocaleString('hu-HU', {
    timeZone: 'Europe/Budapest',
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FBF8F3;font-family:'Inter','Segoe UI',Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">${esc(d.name)} időpontot szeretne foglalni – ${esc(d.service || 'érdeklődés')}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F3;padding:36px 12px">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 6px 32px rgba(78,62,45,.12)">

      <tr><td style="background:#4E7249;padding:30px 34px;background-image:linear-gradient(135deg,#4E7249,#7B9E76)">
        <p style="margin:0;color:#EAF1E8;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase">🌸 Lelkek Gyógyásza</p>
        <h1 style="margin:8px 0 0;color:#FFFFFF;font-size:22px;font-weight:700;font-family:Georgia,'Playfair Display',serif">Új érdeklődő érkezett</h1>
        <p style="margin:6px 0 0;color:#A8C4A3;font-size:13px">lelkekgyogyasza.hu – kapcsolatfelvételi űrlap</p>
      </td></tr>

      <tr><td style="padding:30px 34px 10px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8DFD0;border-radius:12px;overflow:hidden;background:#FFFFFF">
          ${sor('👤 Név', d.name, { kiemelt: true })}
          ${sor('✉️ Email', d.email, { link: 'mailto:' })}
          ${sor('📞 Telefon', d.phone, { link: 'tel:' })}
          ${sor('🏠 Lakcím', d.address)}
          ${sor('🌿 Érdekli', d.service)}
          ${sor('💬 Üzenet', d.message, { tobbsoros: true, utolso: true })}
        </table>
      </td></tr>

      <tr><td style="padding:22px 34px 30px">
        <a href="mailto:${esc(d.email)}?subject=${encodeURIComponent('Időpontfoglalás – lelkekgyogyasza.hu')}"
           style="display:inline-block;background:#4E7249;color:#FFFFFF;text-decoration:none;padding:12px 26px;border-radius:50px;font-size:14px;font-weight:600">Válasz küldése ${esc(d.name.split(' ')[0] || '')} részére →</a>
        <p style="margin:22px 0 0;color:#B0A898;font-size:12px;border-top:1px solid #F3EDE3;padding-top:16px">
          Beérkezett: ${datum} · <a href="https://lelkekgyogyasza.hu" style="color:#C4856A;text-decoration:none">lelkekgyogyasza.hu</a>
        </p>
      </td></tr>

    </table>
    <p style="margin:18px 0 0;color:#B0A898;font-size:11px">Ezt a levelet a weboldal kapcsolatfelvételi űrlapja küldte automatikusan.</p>
  </td></tr>
</table>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Csak POST kérés fogadható.' });
  if (!BREVO_KEY) return res.status(501).json({ ok: false, error: 'A BREVO_API_KEY környezeti változó nincs beállítva.' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const d = {
    name: String(b.name || '').trim().slice(0, 200),
    email: String(b.email || '').trim().slice(0, 200),
    phone: String(b.phone || '').trim().slice(0, 60),
    address: String(b.address || '').trim().slice(0, 200),
    service: String(b.service || '').trim().slice(0, 200),
    message: String(b.message || '').trim().slice(0, 3000),
  };
  if (!d.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) {
    return res.status(400).json({ ok: false, error: 'Név és érvényes email cím kötelező.' });
  }

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Lelkek Gyógyásza weboldal', email: FROM_EMAIL },
      to: TO,
      replyTo: { email: d.email, name: d.name },
      subject: 'Új érdeklődő – lelkekgyogyasza.hu',
      htmlContent: buildHtml(d),
    }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    return res.status(502).json({ ok: false, error: 'Brevo hiba: ' + t.slice(0, 300) });
  }
  return res.status(200).json({ ok: true });
}
