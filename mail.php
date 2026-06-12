<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$name    = strip_tags(trim($_POST['name']    ?? ''));
$email   = filter_var(trim($_POST['email']   ?? ''), FILTER_VALIDATE_EMAIL);
$service = strip_tags(trim($_POST['service'] ?? ''));
$message = strip_tags(trim($_POST['message'] ?? ''));

if (!$name || !$email) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

$to      = 'csanad.peter.czarth@gmail.com';
$subject = '=?UTF-8?B?' . base64_encode('Új érdeklődő – lelkekgyogyasza.hu') . '?=';
$body    = "Név: $name\nEmail: $email\nMódszer: $service\n\nÜzenet:\n$message";
$headers = implode("\r\n", [
    'From: noreply@lelkekgyogyasza.hu',
    "Reply-To: $email",
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
]);

$sent = mail($to, $subject, $body, $headers);
echo json_encode(['ok' => (bool)$sent]);
