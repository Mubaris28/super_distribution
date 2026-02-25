<?php
/**
 * Shared SMTP config — used by contact-mail.php and reseller-mail.php
 *
 * HOW TO SET UP (one-time):
 * 1. Enable 2-Step Verification on your Google account:
 *    https://myaccount.google.com/security
 * 2. Generate a Gmail App Password:
 *    https://myaccount.google.com/apppasswords
 *    → App: "Mail", Device: "Other (custom name)" → "Super Distribution"
 * 3. Paste the 16-character password in SMTP_PASS below (no spaces).
 * 4. Change TO_EMAIL to the inbox where you want to RECEIVE the enquiries.
 */
define('SMTP_HOST',  'smtp.gmail.com');
define('SMTP_PORT',  587);                              // 587 = STARTTLS
define('SMTP_USER',  'mubarismuhammed33@gmail.com');    // Gmail address sending the mail
define('SMTP_PASS',  'PASTE_YOUR_APP_PASSWORD_HERE');   // ← paste 16-char App Password here
define('FROM_EMAIL', 'mubarismuhammed33@gmail.com');    // must match SMTP_USER for Gmail
define('FROM_NAME',  'Super Distribution Website');
define('TO_EMAIL',   'orders@superdistribution.mu');    // inbox that receives form submissions
define('TO_NAME',    'Super Distribution');
