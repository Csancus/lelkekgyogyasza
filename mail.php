<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$name    = strip_tags(trim($_POST['name']    ?? ''));
$email   = filter_var(trim($_POST['email']   ?? ''), FILTER_VALIDATE_EMAIL);
$phone   = strip_tags(trim($_POST['phone']   ?? ''));
$service = strip_tags(trim($_POST['service'] ?? ''));
$message = strip_tags(trim($_POST['message'] ?? ''));

if (!$name || !$email) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

$to      = 'csanad.peter.czarth@gmail.com';
$subject = '=?UTF-8?B?' . base64_encode('Új érdeklődő – lelkekgyogyasza.hu') . '?=';

$phone_row = $phone
    ? "<tr><td style='padding:10px 16px;border-bottom:1px solid #e8dfd0;color:#6b6056;font-size:13px;white-space:nowrap;width:130px'>📞 Telefon</td><td style='padding:10px 16px;border-bottom:1px solid #e8dfd0;font-size:14px;color:#2e2a25'>" . htmlspecialchars($phone) . "</td></tr>"
    : '';

$service_row = $service
    ? "<tr><td style='padding:10px 16px;border-bottom:1px solid #e8dfd0;color:#6b6056;font-size:13px;white-space:nowrap;width:130px'>🌿 Érdekli</td><td style='padding:10px 16px;border-bottom:1px solid #e8dfd0;font-size:14px;color:#2e2a25'>" . htmlspecialchars($service) . "</td></tr>"
    : '';

$message_row = $message
    ? "<tr><td style='padding:10px 16px;color:#6b6056;font-size:13px;vertical-align:top;width:130px'>💬 Üzenet</td><td style='padding:10px 16px;font-size:14px;color:#2e2a25;line-height:1.6'>" . nl2br(htmlspecialchars($message)) . "</td></tr>"
    : '';

$date_hu = strftime('%Y. %B %d., %H:%M') ?: date('Y. m. d., H:i');

$html = <<<HTML
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3ede3;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3ede3;padding:32px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(78,62,45,.10)">
      <!-- Header -->
      <tr><td style="background:#4e7249;padding:28px 32px">
        <p style="margin:0;color:#a8c4a3;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Lelkek gyógyásza</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700">Új érdeklődő a weblapról</h1>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:28px 32px 8px">
        <p style="margin:0 0 20px;color:#6b6056;font-size:14px">Valaki kitöltötte az időpontfoglaló űrlapot a <a href="https://lelkekgyogyasza.hu" style="color:#4e7249">lelkekgyogyasza.hu</a> oldalon.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8dfd0;border-radius:10px;overflow:hidden">
          <tr><td style="padding:10px 16px;border-bottom:1px solid #e8dfd0;color:#6b6056;font-size:13px;white-space:nowrap;width:130px">👤 Név</td><td style="padding:10px 16px;border-bottom:1px solid #e8dfd0;font-size:14px;color:#2e2a25;font-weight:600">{$name}</td></tr>
          <tr><td style="padding:10px 16px;border-bottom:1px solid #e8dfd0;color:#6b6056;font-size:13px;white-space:nowrap">✉️ Email</td><td style="padding:10px 16px;border-bottom:1px solid #e8dfd0;font-size:14px"><a href="mailto:{$email}" style="color:#4e7249">{$email}</a></td></tr>
          {$phone_row}{$service_row}{$message_row}
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:20px 32px 28px">
        <a href="mailto:{$email}" style="display:inline-block;background:#4e7249;color:#fff;text-decoration:none;padding:11px 24px;border-radius:50px;font-size:14px;font-weight:600">Válasz küldése →</a>
        <p style="margin:20px 0 0;color:#b0a898;font-size:12px">Beküldve: {$date_hu} · lelkekgyogyasza.hu</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;

$headers = implode("\r\n", [
    'From: noreply@lelkekgyogyasza.hu',
    "Reply-To: {$email}",
    'Content-Type: text/html; charset=UTF-8',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . phpversion(),
]);

$sent = mail($to, $subject, $html, $headers);
echo json_encode(['ok' => (bool)$sent]);
