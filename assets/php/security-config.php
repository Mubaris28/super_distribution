<?php
/**
 * Security & rate limiting config for Contact and Reseller forms.
 * Loaded by contact-mail.php and reseller-mail.php after mail-config.php.
 */

if (!defined('ALLOWED_ORIGINS')) {
    define('ALLOWED_ORIGINS', [
        'https://superdistribution.mu',
        'https://www.superdistribution.mu',
        'http://superdistribution.mu',
        'http://www.superdistribution.mu',
        'http://localhost',
        'http://127.0.0.1',
    ]);
}

if (!defined('MAX_SUBMISSIONS_PER_HOUR')) {
    define('MAX_SUBMISSIONS_PER_HOUR', 10);
}

if (!defined('MAX_SUBMISSIONS_PER_DAY')) {
    define('MAX_SUBMISSIONS_PER_DAY', 30);
}

if (!defined('DEBUG_MODE')) {
    define('DEBUG_MODE', false);
}
