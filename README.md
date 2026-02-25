# PHPMailer Contact Form Setup Guide

## Overview
This setup implements a secure contact form using PHPMailer for the Flash Groups website. The system includes rate limiting, security checks, and professional email formatting.

## Files Created
- `php/config.php` - Email configuration and settings
- `php/contact-handler.php` - Main form handler using PHPMailer
- `php/SecurityUtil.php` - Security and rate limiting utilities

## Setup Instructions

### 1. Configure Email Settings
Edit `php/config.php` and update the following settings:

```php
// SMTP Server Settings (example for Gmail)
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'your-email@gmail.com');
define('MAIL_PASSWORD', 'your-app-password'); // Use App Password for Gmail
define('MAIL_ENCRYPTION', 'tls');

// Email Addresses
define('FROM_EMAIL', 'your-email@gmail.com');
define('TO_EMAIL', 'info@flashgroups.com'); // Where emails should be sent
```

### 2. Common Email Provider Settings

#### Gmail
```php
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_ENCRYPTION', 'tls');
```
**Important**: Use App Passwords, not your regular Gmail password.

#### Outlook/Hotmail
```php
define('MAIL_HOST', 'smtp-mail.outlook.com');
define('MAIL_PORT', 587);
define('MAIL_ENCRYPTION', 'tls');
```

#### Yahoo Mail
```php
define('MAIL_HOST', 'smtp.mail.yahoo.com');
define('MAIL_PORT', 587);
define('MAIL_ENCRYPTION', 'tls');
```

#### Custom SMTP Server
```php
define('MAIL_HOST', 'mail.yourdomain.com');
define('MAIL_PORT', 587); // or 465 for SSL
define('MAIL_ENCRYPTION', 'tls'); // or 'ssl'
```

### 3. Security Configuration
Update the allowed origins in `config.php`:

```php
define('ALLOWED_ORIGINS', [
    'https://flashgroups.com',
    'https://www.flashgroups.com',
    'http://localhost', // Remove in production
    'http://127.0.0.1'  // Remove in production
]);
```

### 4. File Permissions
Ensure the following permissions:
```bash
chmod 755 php/
chmod 644 php/*.php
chmod 755 php/logs/ (will be created automatically)
chmod 644 php/logs/*.log (will be created automatically)
```

### 5. Testing

#### Enable Debug Mode
Set `DEBUG_MODE` to `true` in `config.php` for troubleshooting:
```php
define('DEBUG_MODE', true);
```

#### Test the Form
1. Fill out the contact form on your website
2. Check browser's Developer Tools → Network tab for any errors
3. Verify email delivery
4. Check error logs if issues occur

### 6. Production Deployment

#### Security Checklist
- [ ] Set `DEBUG_MODE` to `false`
- [ ] Remove localhost/127.0.0.1 from `ALLOWED_ORIGINS`
- [ ] Use strong, unique email passwords
- [ ] Ensure HTTPS is enabled on your website
- [ ] Test rate limiting functionality

#### Optional Enhancements
- Set up email logging/monitoring
- Configure backup email addresses
- Implement additional spam protection (CAPTCHA)
- Set up email templates customization

## Troubleshooting

### Common Issues

#### "SMTP Error: Could not authenticate"
- Check username/password
- For Gmail, ensure App Passwords are enabled
- Verify 2FA settings if applicable

#### "SMTP connect() failed"
- Check MAIL_HOST and MAIL_PORT settings
- Verify firewall/hosting restrictions
- Try different encryption settings (tls/ssl)

#### "Rate limit exceeded"
- Check `php/logs/submissions.log`
- Adjust rate limiting in config.php if needed
- Clear logs if testing: `rm php/logs/submissions.log`

#### Form not submitting
- Check browser console for JavaScript errors
- Verify `contact-handler.php` is accessible
- Check server error logs

### Debug Information
When `DEBUG_MODE` is enabled, check:
- PHP error logs
- Browser developer console
- Network requests in browser tools

## Security Features
- Rate limiting (5 submissions/hour, 20/day per IP)
- Input sanitization and validation
- CSRF protection via origin checking
- XSS prevention
- Secure email handling
- Automatic log cleanup (7 days retention)

## File Structure
```
php/
├── config.php              # Email configuration
├── contact-handler.php     # Main form handler
├── SecurityUtil.php        # Security utilities
└── logs/                   # Auto-created logs directory
    └── submissions.log     # Rate limiting logs
```

## Support
If you encounter issues:
1. Enable DEBUG_MODE
2. Check error logs
3. Verify email provider settings
4. Test with a simple email first