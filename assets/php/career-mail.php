<?php
/**
 * Super Distribution — Career Application Mailer
 * Endpoint: POST assets/php/career-mail.php
 * Returns:  JSON { success: bool, message: string }
 */

declare(strict_types=1);

ob_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/SecurityUtil.php';
require_once __DIR__ . '/security-config.php';

if (!SecurityUtil::checkOrigin()) {
    ob_end_clean();
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Request origin not allowed.']);
    exit;
}

$clientIp = SecurityUtil::getClientIP();
if (!SecurityUtil::checkRateLimit($clientIp)) {
    ob_end_clean();
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many submissions. Please try again later.']);
    exit;
}

/* ── Load PHPMailer ───────────────────────────────────────────── */
$autoload = __DIR__ . '/../../vendor/autoload.php';
if (!file_exists($autoload)) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: autoload not found.']);
    exit;
}
require_once $autoload;
require_once __DIR__ . '/mail-config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/* ── Helper ───────────────────────────────────────────────────── */
function career_clean(string $v): string {
    return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
}

/* ── Read & sanitise inputs ───────────────────────────────────── */
$firstName   = career_clean($_POST['firstName']   ?? '');
$lastName    = career_clean($_POST['lastName']    ?? '');
$email       = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone       = career_clean($_POST['phone']       ?? '');
$role        = career_clean($_POST['role']        ?? '');
$experience  = career_clean($_POST['experience']  ?? '');
$message     = career_clean($_POST['message']     ?? '');

/* ── Validate ─────────────────────────────────────────────────── */
$errors = [];
if (!$firstName)                                           $errors[] = 'First name is required.';
if (!$lastName)                                            $errors[] = 'Last name is required.';
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email address is required.';
if (!$role)                                                $errors[] = 'Please select a position.';
if (!$message)                                             $errors[] = 'Cover letter / message is required.';

/* ── Optional CV upload (max 5MB, PDF/DOC/DOCX) ────────────────── */
$cvPath = null;
$cvName = null;
if (!empty($_FILES['cv']['name']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
    $allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $ext = strtolower(pathinfo($_FILES['cv']['name'], PATHINFO_EXTENSION));
    $allowedExt = ['pdf', 'doc', 'docx'];
    $maxBytes = 5 * 1024 * 1024; // 5MB
    if ($_FILES['cv']['size'] > $maxBytes) {
        $errors[] = 'CV file must be 5MB or less.';
    } elseif (!in_array($ext, $allowedExt, true)) {
        $errors[] = 'CV must be PDF, DOC or DOCX.';
    } else {
        $cvPath = $_FILES['cv']['tmp_name'];
        $cvName = career_clean($_FILES['cv']['name']);
    }
}

if ($errors) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ── Role label ────────────────────────────────────────────────── */
$roleLabels = [
    'salesman' => 'Salesman',
    'driver'   => 'Driver / Helper',
];
$roleLabel = $roleLabels[$role] ?? ucfirst($role);
$phoneDisplay = $phone ?: 'Not provided';
$expDisplay   = $experience ?: 'Not provided';
$fullName     = $firstName . ' ' . $lastName;
$now          = date('d M Y, H:i') . ' (UTC)';

/* ── Table row helper ─────────────────────────────────────────── */
$tableRow = function (string $label, string $value): string {
    return '
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;width:150px;color:#888;font-size:13px;font-weight:600;vertical-align:top;">' . $label . '</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#1a1a1a;font-size:14px;vertical-align:top;">' . $value . '</td>
      </tr>';
};

/* ── HTML email to business ───────────────────────────────────── */
$htmlBody = '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:\'Helvetica Neue\',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.09);">

  <tr>
    <td style="background:linear-gradient(135deg,#8B0000 0%,#C8000A 40%,#E8171B 100%);padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Super Distribution</p>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">&#128196; New Career Application</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Received ' . $now . '</p>
          </td>
          <td style="text-align:right;width:80px;">
            <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;">&#128100;</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:24px 40px 0;">
      <span style="display:inline-block;background:#fff3f3;color:#C8000A;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 12px;border-radius:20px;border:1px solid #ffd0d0;">' . $roleLabel . '</span>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">'
        . $tableRow('Name', $fullName)
        . $tableRow('Email', '<a href="mailto:' . $email . '" style="color:#C8000A;text-decoration:none;">' . $email . '</a>')
        . $tableRow('Phone', $phoneDisplay)
        . $tableRow('Position', $roleLabel)
        . $tableRow('Experience', $expDisplay)
        . ($cvName ? $tableRow('CV attached', $cvName) : '')
      . '</table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 40px 32px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Cover Letter / Message</p>
      <div style="background:#fafafa;border-left:4px solid #E8171B;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;line-height:1.75;color:#333;">'
        . nl2br($message) .
      '</div>
    </td>
  </tr>

  <tr>
    <td style="padding:0 40px 36px;">
      <a href="mailto:' . $email . '?subject=Re: Career application – ' . rawurlencode($roleLabel) . '" style="display:inline-block;background:linear-gradient(135deg,#C8000A,#E8171B);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">&#8617; Reply to ' . $firstName . '</a>
    </td>
  </tr>

  <tr>
    <td style="background:#f8f8f8;padding:16px 40px;border-top:1px solid #eee;">
      <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">Submitted via career form at <strong>superdistribution.mu</strong></p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body></html>';

$textBody = "New Career Application — Super Distribution\n"
    . str_repeat('─', 44) . "\n\n"
    . "Name:       $fullName\n"
    . "Email:      $email\n"
    . "Phone:      $phoneDisplay\n"
    . "Position:   $roleLabel\n"
    . "Experience: $expDisplay\n"
    . ($cvName ? "CV:         $cvName (attached)\n" : "")
    . "Date:       $now\n\n"
    . "Message:\n$message\n\n"
    . str_repeat('─', 44) . "\n"
    . "Submitted via superdistribution.mu\n";

/* ── Send ─────────────────────────────────────────────────────── */
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(FROM_EMAIL, FROM_NAME);
    $mail->addAddress(TO_EMAIL, TO_NAME);
    $mail->addReplyTo($email, $fullName);

    $mail->isHTML(true);
    $mail->Subject = '[Career] ' . $roleLabel . ' — ' . $fullName;
    $mail->Body    = $htmlBody;
    $mail->AltBody = $textBody;

    if ($cvPath && $cvName && is_uploaded_file($cvPath)) {
        $mail->addAttachment($cvPath, $cvName);
    }

    $mail->send();

    SecurityUtil::logSubmission($clientIp, $email);

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Application received! Our team will review your details and contact you within 2 business days.'
    ]);

} catch (Exception $e) {
    ob_end_clean();
    error_log('[SD career] PHPMailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not send right now. Please email your CV to superdistributionltd@gmail.com'
    ]);
}
