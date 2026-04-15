<?php
/**
 * Shared SMTP config — used by contact-mail.php and reseller-mail.php
 *
 * Two recipient inboxes:
 * - TO_EMAIL: contact, enquiries, general messages
 * - TO_EMAIL_ORDERS: business / wholesale orders (contact form subject "Wholesale / Bulk Order")
 *
 * HOW TO SET UP (one-time):
 * 1. Enable 2-Step Verification on your Google account.
 * 2. Generate a Gmail App Password; paste in SMTP_PASS below.
 */
define('SMTP_HOST',  'smtp.gmail.com');
define('SMTP_PORT',  587);                              // 587 = STARTTLS
define('SMTP_USER',  'superdistributionltd@gmail.com');  // Gmail address sending the mail
define('SMTP_PASS',  'frml hxyi jbiw splg');            // Gmail App Password (16 chars)
define('FROM_EMAIL', 'superdistributionltd@gmail.com'); // must match SMTP_USER for Gmail
define('FROM_NAME',  'Super Distribution Website');

// Enquiries, contact, general messages
define('TO_EMAIL',   'superdistributionltd@gmail.com');
define('TO_NAME',    'Super Distribution');

// Business / wholesale orders (used when contact form subject is "Wholesale / Bulk Order")
define('TO_EMAIL_ORDERS',   'order.superdistribution@gmail.com');
define('TO_NAME_ORDERS',    'Super Distribution (Orders)');
