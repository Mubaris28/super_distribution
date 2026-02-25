<?php
/**
 * Super Distribution — Contact Form Mailer
 * Endpoint: POST assets/php/contact-mail.php
 * Returns:  JSON { success: bool, message: string }
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/SecurityUtil.php';
require_once __DIR__ . '/security-config.php';

if (!SecurityUtil::checkOrigin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Request origin not allowed.']);
    exit;
}

$clientIp = SecurityUtil::getClientIP();
if (!SecurityUtil::checkRateLimit($clientIp)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many submissions. Please try again later.']);
    exit;
}

/* ── Load PHPMailer ───────────────────────────────────────────── */
$autoload = __DIR__ . '/../../vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: autoload not found.']);
    exit;
}
require_once $autoload;
require_once __DIR__ . '/mail-config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/* ── Helper ───────────────────────────────────────────────────── */
function contact_clean(string $v): string {
    return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
}

/* ── Read & sanitise inputs ───────────────────────────────────── */
$firstName = contact_clean($_POST['firstName'] ?? '');
$lastName  = contact_clean($_POST['lastName']  ?? '');
$email     = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone     = contact_clean($_POST['phone']     ?? '');
$subject   = contact_clean($_POST['subject']   ?? '');
$message   = contact_clean($_POST['message']   ?? '');

/* ── Validate ─────────────────────────────────────────────────── */
$errors = [];
if (!$firstName)                                           $errors[] = 'First name is required.';
if (!$lastName)                                            $errors[] = 'Last name is required.';
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email address is required.';
if (!$subject)                                             $errors[] = 'Subject is required.';
if (!$message)                                             $errors[] = 'Message is required.';

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ── Subject label ────────────────────────────────────────────── */
$labels = [
    'general'   => 'General Enquiry',
    'wholesale' => 'Wholesale / Bulk Order',
    'retail'    => 'Retail Partnership',
    'products'  => 'Product Information',
    'delivery'  => 'Delivery Query',
    'other'     => 'Other',
];
$subjectLabel = $labels[$subject] ?? ucfirst($subject);
$phoneDisplay = $phone ? $phone : 'Not provided';
$fullName     = $firstName . ' ' . $lastName;
$now          = date('d M Y, H:i') . ' (UTC)';

/* ── Shared layout helpers ────────────────────────────────────── */
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

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#8B0000 0%,#C8000A 40%,#E8171B 100%);padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Super Distribution</p>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;line-height:1.2;">&#9993; New Contact Message</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Received ' . $now . '</p>
          </td>
          <td style="text-align:right;width:80px;">
            <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;line-height:52px;text-align:center;">&#128236;</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Subject badge -->
  <tr>
    <td style="padding:24px 40px 0;">
      <span style="display:inline-block;background:#fff3f3;color:#C8000A;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 12px;border-radius:20px;border:1px solid #ffd0d0;">' . $subjectLabel . '</span>
    </td>
  </tr>

  <!-- Details table -->
  <tr>
    <td style="padding:20px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">'
        . $tableRow('Name', $fullName)
        . $tableRow('Email', '<a href="mailto:' . $email . '" style="color:#C8000A;text-decoration:none;">' . $email . '</a>')
        . $tableRow('Phone', $phoneDisplay)
        . $tableRow('Subject', $subjectLabel)
      . '</table>
    </td>
  </tr>

  <!-- Message -->
  <tr>
    <td style="padding:0 40px 32px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
      <div style="background:#fafafa;border-left:4px solid #E8171B;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;line-height:1.75;color:#333;">'
        . nl2br($message) .
      '</div>
    </td>
  </tr>

  <!-- Reply button -->
  <tr>
    <td style="padding:0 40px 36px;">
      <a href="mailto:' . $email . '?subject=Re: ' . rawurlencode($subjectLabel) . '" style="display:inline-block;background:linear-gradient(135deg,#C8000A,#E8171B);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">&#8617; Reply to ' . $firstName . '</a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8f8f8;padding:16px 40px;border-top:1px solid #eee;">
      <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
        This message was submitted via the contact form at <strong>superdistribution.mu</strong>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body></html>';

$textBody = "New Contact Message — Super Distribution\n"
    . str_repeat('─', 44) . "\n\n"
    . "Name:    $fullName\n"
    . "Email:   $email\n"
    . "Phone:   $phoneDisplay\n"
    . "Subject: $subjectLabel\n"
    . "Date:    $now\n\n"
    . "Message:\n$message\n\n"
    . str_repeat('─', 44) . "\n"
    . "Submitted via superdistribution.mu\n";

/* ── Auto-reply HTML to customer ─────────────────────────────── */
$autoReplyHtml = '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:\'Helvetica Neue\',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.09);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#8B0000 0%,#C8000A 40%,#E8171B 100%);padding:36px 40px;text-align:center;">
      <p style="margin:0 0 8px;color:rgba(255,255,255,0.8);font-size:11px;text-transform:uppercase;letter-spacing:2px;">Super Distribution Mauritius</p>
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">Thanks for reaching out!</h1>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">We\'ve received your message and will respond within one business day.</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px;">
      <p style="margin:0 0 20px;font-size:15px;color:#333;line-height:1.6;">Hi <strong>' . $firstName . '</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
        Thank you for contacting <strong>Super Distribution</strong>. Your message has been received and our team will get back to you as soon as possible.
      </p>

      <div style="background:#fafafa;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Your message summary</p>
        <p style="margin:0;font-size:13px;color:#666;"><strong>Subject:</strong> ' . $subjectLabel . '</p>
      </div>

      <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.7;">Need to reach us directly?</p>
      <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;">
        <tr><td style="padding:3px 0;">&#128222;&nbsp;</td><td><a href="tel:+23052345678" style="color:#C8000A;text-decoration:none;">+230 5234 5678</a></td></tr>
        <tr><td style="padding:3px 0;">&#9993;&nbsp;</td><td><a href="mailto:orders@superdistribution.mu" style="color:#C8000A;text-decoration:none;">orders@superdistribution.mu</a></td></tr>
        <tr><td style="padding:3px 0;">&#128205;&nbsp;</td><td style="color:#555;">Port Louis, Mauritius</td></tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8f8f8;padding:20px 40px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#333;">Super Distribution Ltd.</p>
      <p style="margin:0;font-size:11px;color:#bbb;">Mauritius\'s trusted household goods distributor since 2010.</p>
      <p style="margin:8px 0 0;font-size:10px;color:#ccc;">Please do not reply to this auto-confirmation email.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body></html>';

$autoReplyText = "Hi $firstName,\n\n"
    . "Thank you for contacting Super Distribution.\n"
    . "Your message has been received. We will respond within one business day.\n\n"
    . "Subject: $subjectLabel\n\n"
    . "Contact us directly:\n"
    . "Phone: +230 5234 5678\n"
    . "Email: orders@superdistribution.mu\n\n"
    . "Super Distribution Ltd.\n"
    . "Port Louis, Mauritius\n";

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
    $mail->Subject = '[Contact] ' . $subjectLabel . ' — ' . $fullName;
    $mail->Body    = $htmlBody;
    $mail->AltBody = $textBody;

    $mail->send();

    /* ── Send auto-reply to customer ──────────────────────────── */
    $mail->clearAddresses();
    $mail->clearReplyTos();
    $mail->addAddress($email, $fullName);
    $mail->addReplyTo(TO_EMAIL, TO_NAME);
    $mail->Subject = 'We received your message — Super Distribution';
    $mail->Body    = $autoReplyHtml;
    $mail->AltBody = $autoReplyText;
    $mail->send();

    SecurityUtil::logSubmission($clientIp, $email);

    echo json_encode([
        'success' => true,
        'message' => 'Message sent! We will get back to you within one business day. A confirmation has been sent to your email.'
    ]);

} catch (Exception $e) {
    error_log('[SD contact] PHPMailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not send right now. Please email us directly at orders@superdistribution.mu'
    ]);
}
