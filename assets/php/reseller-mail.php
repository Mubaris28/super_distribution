<?php
/**
 * Super Distribution — Reseller Application Mailer
 * Endpoint: POST assets/php/reseller-mail.php
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
function reseller_clean(string $v): string {
    return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
}

/* ── Read & sanitise inputs ───────────────────────────────────── */
$companyName  = reseller_clean($_POST['companyName']  ?? '');
$shopName     = reseller_clean($_POST['shopName']     ?? '');
$region       = reseller_clean($_POST['region']       ?? '');
$address      = reseller_clean($_POST['address']      ?? '');
$email        = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telephone    = reseller_clean($_POST['telephone']    ?? '');
$whatsapp     = reseller_clean($_POST['whatsapp']     ?? '');
$brn          = reseller_clean($_POST['brn']          ?? '');
$vat          = reseller_clean($_POST['vat']          ?? '');
$resellerType = reseller_clean($_POST['resellerType'] ?? '');
$notes        = reseller_clean($_POST['notes']        ?? '');
$agentName    = reseller_clean($_POST['agentName']    ?? '');
$agentTel     = reseller_clean($_POST['agentTel']     ?? '');

// Checkboxes arrive as serviceTypes[] array
$rawServices  = $_POST['serviceTypes'] ?? [];
if (!is_array($rawServices)) {
    $rawServices = [];
}
$serviceTypes = array_values(array_filter(array_map('reseller_clean', $rawServices)));

/* ── Validate ─────────────────────────────────────────────────── */
$errors = [];
if (!$companyName)                                         $errors[] = 'Company / full name is required.';
if (!$shopName)                                            $errors[] = 'Shop name is required.';
if (!$region)                                              $errors[] = 'Region is required.';
if (!$address)                                             $errors[] = 'Address is required.';
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email address is required.';
if (!$telephone)                                           $errors[] = 'Telephone number is required.';
if (!$resellerType)                                        $errors[] = 'Please select reseller type (Existing or New).';
if (count($serviceTypes) === 0)                            $errors[] = 'Please select at least one service type.';

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ── Labels ───────────────────────────────────────────────────── */
$resellerTypeLabel = ($resellerType === 'existing') ? 'Existing reseller' : 'New reseller';

$serviceMap = [
    'wholesale'    => 'Wholesale',
    'retail'       => 'Retail',
    'food-service' => 'Food service',
    'events'       => 'Events',
    'other'        => 'Other',
];
$serviceList = implode(', ', array_map(function ($v) use ($serviceMap) {
    return $serviceMap[$v] ?? $v;
}, $serviceTypes));

$whatsappD = $whatsapp ?: 'Not provided';
$brnD      = $brn      ?: 'Not provided';
$vatD      = $vat      ?: 'Not provided';
$notesD    = $notes    ?: 'None';
$agentD    = ($agentName !== '' || $agentTel !== '')
    ? trim($agentName . ($agentTel ? ' — ' . $agentTel : ''))
    : 'Not provided';
$now = date('d M Y, H:i') . ' (UTC)';

/* ── Shared layout helpers ────────────────────────────────────── */
$row = function (string $label, string $value): string {
    return '
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;width:170px;color:#888;font-size:13px;font-weight:600;vertical-align:top;">' . $label . '</td>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;color:#1a1a1a;font-size:14px;vertical-align:top;">' . $value . '</td>
      </tr>';
};

$rows = $row('Company / Name',  $companyName)
      . $row('Shop Name',        $shopName)
      . $row('Region',           $region)
      . $row('Address',          $address)
      . $row('Email',            '<a href="mailto:' . $email . '" style="color:#C8000A;text-decoration:none;">' . $email . '</a>')
      . $row('Telephone',        $telephone)
      . $row('WhatsApp',         $whatsappD)
      . $row('BRN',              $brnD)
      . $row('VAT Number',       $vatD)
      . $row('Reseller Type',    $resellerTypeLabel)
      . $row('Service Types',    $serviceList)
      . $row('Sales Agent',      $agentD);

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
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;line-height:1.2;">&#128203; New Reseller Application</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Received ' . $now . '</p>
          </td>
          <td style="text-align:right;width:80px;">
            <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;line-height:52px;text-align:center;">&#129309;</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Type badges -->
  <tr>
    <td style="padding:24px 40px 0;display:flex;gap:8px;">
      <span style="display:inline-block;background:#fff3f3;color:#C8000A;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 12px;border-radius:20px;border:1px solid #ffd0d0;">' . $resellerTypeLabel . '</span>
      &nbsp;
      <span style="display:inline-block;background:#f0f9ff;color:#0369a1;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:5px 12px;border-radius:20px;border:1px solid #bae6fd;">' . $serviceList . '</span>
    </td>
  </tr>

  <!-- Details table -->
  <tr>
    <td style="padding:20px 40px 8px;">
      <table width="100%" cellpadding="0" cellspacing="0">' . $rows . '</table>
    </td>
  </tr>

  <!-- Notes -->
  <tr>
    <td style="padding:16px 40px 32px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Notes / Additional Info</p>
      <div style="background:#fafafa;border-left:4px solid #E8171B;border-radius:0 8px 8px 0;padding:14px 18px;font-size:14px;line-height:1.7;color:#444;">'
        . nl2br($notesD) .
      '</div>
    </td>
  </tr>

  <!-- Reply button -->
  <tr>
    <td style="padding:0 40px 36px;">
      <a href="mailto:' . $email . '?subject=Re: Reseller Application — ' . rawurlencode($shopName) . '" style="display:inline-block;background:linear-gradient(135deg,#C8000A,#E8171B);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">&#8617; Reply to ' . $companyName . '</a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8f8f8;padding:16px 40px;border-top:1px solid #eee;">
      <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
        Reseller application submitted via <strong>superdistribution.mu</strong>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body></html>';

$textBody = "New Reseller Application — Super Distribution\n"
    . str_repeat('─', 46) . "\n\n"
    . "Company:      $companyName\n"
    . "Shop:         $shopName\n"
    . "Region:       $region\n"
    . "Address:      $address\n"
    . "Email:        $email\n"
    . "Telephone:    $telephone\n"
    . "WhatsApp:     $whatsappD\n"
    . "BRN:          $brnD\n"
    . "VAT:          $vatD\n"
    . "Type:         $resellerTypeLabel\n"
    . "Services:     $serviceList\n"
    . "Agent:        " . ($agentName ?: 'Not provided') . ($agentTel ? " ($agentTel)" : '') . "\n\n"
    . "Notes:\n$notesD\n\n"
    . str_repeat('─', 46) . "\n"
    . "Submitted via superdistribution.mu\n";

/* ── Auto-reply HTML to applicant ────────────────────────────── */
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
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">Application Received!</h1>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Our team will review your details and contact you shortly.</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px;">
      <p style="margin:0 0 20px;font-size:15px;color:#333;line-height:1.6;">Hi <strong>' . $companyName . '</strong>,</p>
      <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.7;">
        Thank you for applying to become an authorised reseller with <strong>Super Distribution</strong>. We have received your application and our partnerships team will be in touch.
      </p>

      <div style="background:#fafafa;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Application summary</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;color:#555;">
          <tr><td style="padding:4px 0;width:120px;color:#888;font-weight:600;">Shop Name</td><td>' . $shopName . '</td></tr>
          <tr><td style="padding:4px 0;color:#888;font-weight:600;">Region</td><td>' . $region . '</td></tr>
          <tr><td style="padding:4px 0;color:#888;font-weight:600;">Type</td><td>' . $resellerTypeLabel . '</td></tr>
          <tr><td style="padding:4px 0;color:#888;font-weight:600;">Services</td><td>' . $serviceList . '</td></tr>
        </table>
      </div>

      <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.7;">Questions? Reach us directly:</p>
      <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;">
        <tr><td style="padding:3px 0;">&#128222;&nbsp;</td><td><a href="tel:+23052345678" style="color:#C8000A;text-decoration:none;">+230 5234 5678</a></td></tr>
        <tr><td style="padding:3px 0;">&#9993;&nbsp;</td><td><a href="mailto:orders@superdistribution.mu" style="color:#C8000A;text-decoration:none;">orders@superdistribution.mu</a></td></tr>
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

$autoReplyText = "Hi $companyName,\n\n"
    . "Thank you for applying to become a reseller with Super Distribution.\n"
    . "Your application has been received. Our team will review it and contact you shortly.\n\n"
    . "Application Summary:\n"
    . "  Shop:     $shopName\n"
    . "  Region:   $region\n"
    . "  Type:     $resellerTypeLabel\n"
    . "  Services: $serviceList\n\n"
    . "Contact us: orders@superdistribution.mu | +230 5234 5678\n\n"
    . "Super Distribution Ltd. — Port Louis, Mauritius\n";

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
    $mail->addReplyTo($email, $companyName);

    // Attach shop photo if uploaded
    if (
        !empty($_FILES['shopPhoto']['tmp_name'])
        && is_uploaded_file($_FILES['shopPhoto']['tmp_name'])
        && $_FILES['shopPhoto']['error'] === UPLOAD_ERR_OK
    ) {
        $origName = basename($_FILES['shopPhoto']['name'] ?? 'shop-photo.jpg');
        $mail->addAttachment($_FILES['shopPhoto']['tmp_name'], $origName);
    }

    $mail->isHTML(true);
    $mail->Subject = '[Reseller] ' . $shopName . ' — ' . $companyName . ' (' . $resellerTypeLabel . ')';
    $mail->Body    = $htmlBody;
    $mail->AltBody = $textBody;

    $mail->send();

    /* ── Send auto-reply to applicant ─────────────────────────── */
    $mail->clearAddresses();
    $mail->clearReplyTos();
    $mail->clearAttachments();
    $mail->addAddress($email, $companyName);
    $mail->addReplyTo(TO_EMAIL, TO_NAME);
    $mail->Subject = 'Application Received — Super Distribution';
    $mail->Body    = $autoReplyHtml;
    $mail->AltBody = $autoReplyText;
    $mail->send();

    SecurityUtil::logSubmission($clientIp, $email);

    echo json_encode([
        'success' => true,
        'message' => 'Application submitted! Our team will review your details and contact you shortly. A confirmation has been sent to your email.'
    ]);

} catch (Exception $e) {
    error_log('[SD reseller] PHPMailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not submit right now. Please email us at orders@superdistribution.mu'
    ]);
}
