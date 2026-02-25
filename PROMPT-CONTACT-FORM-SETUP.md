# Contact Form Setup — Super Distribution

Use this guide to configure the contact and reseller forms for the Super Distribution website.

---

## 1. Overview

- **Contact form** (Contact Us page): `contact.html` → submits via AJAX to `assets/php/contact-mail.php`.
- **Reseller form** (Reseller Application page): `reseller-application.html` → submits via AJAX to `assets/php/reseller-mail.php`.
- Both scripts use **PHPMailer** (Composer) and **SMTP** (e.g. Gmail). They share `mail-config.php` and `security-config.php`.

---

## 2. Prerequisites

- **PHP** 7.4+ (or 8.x) with extensions: `openssl`, `mbstring`, `json`.
- **Composer** and installed dependencies: from project root run `composer install` (PHPMailer is in `vendor/`).
- **Web server**: Apache with `mod_rewrite` (for `.htaccess` 404 and optional HTTPS redirect). PHP must be enabled.

---

## 3. Mail configuration

Edit **`assets/php/mail-config.php`**:

| Constant    | Description |
|------------|-------------|
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` (STARTTLS) or `465` (SSL) |
| `SMTP_USER` | Your SMTP login (e.g. Gmail address) |
| `SMTP_PASS` | **App password** (for Gmail: [Google App Passwords](https://myaccount.google.com/apppasswords)) — do not use your normal password. |
| `FROM_EMAIL` | Sender address (often same as `SMTP_USER`) |
| `FROM_NAME`  | Sender name (e.g. `Super Distribution Website`) |
| `TO_EMAIL`   | Where contact/reseller submissions are sent |
| `TO_NAME`    | Recipient display name |

**Security:** Do not commit real `SMTP_PASS` to version control. Use a placeholder in the repo and set the real value on the server (e.g. env var or a local-only config include).

---

## 4. Security and rate limiting

Edit **`assets/php/security-config.php`**:

- **`ALLOWED_ORIGINS`** — Add your live and staging origins (e.g. `https://superdistribution.mu`, `https://www.superdistribution.mu`, `http://localhost`). Requests from other origins are rejected.
- **`MAX_SUBMISSIONS_PER_HOUR`** — Per-IP limit per hour (default `10`).
- **`MAX_SUBMISSIONS_PER_DAY`** — Per-IP limit per day (default `30`).
- **`DEBUG_MODE`** — Set to `true` only for local debugging; leave `false` in production.

Submissions are logged in **`assets/php/logs/submissions.log`**. Ensure this directory exists and is writable by the web server (e.g. `mkdir -p assets/php/logs && chmod 755 assets/php/logs`).

---

## 5. Endpoints and form fields

### Contact form — `POST assets/php/contact-mail.php`

| Field (name) | Required | Notes |
|--------------|----------|--------|
| `firstName`  | Yes      | |
| `lastName`   | Yes      | |
| `email`      | Yes      | Validated as email |
| `phone`      | No       | Phone / WhatsApp |
| `subject`    | Yes      | One of: `general`, `orders`, `products`, `partnership`, `other` |
| `message`    | Yes      | Plain text body |

Response: JSON `{ "success": true|false, "message": "..." }`.

### Reseller form — `POST assets/php/reseller-mail.php`

Uses fields for business name, contact name, email, phone, address, business type, etc. (see `reseller-application.html` and `reseller-mail.php`). Same JSON response format.

---

## 6. .htaccess (Apache)

The project includes a root **`.htaccess`** that:

- Sends non-existent requests to **`404.html`** (custom 404 page).
- Denies direct browser access to **`mail-config.php`** and **`security-config.php`** (so credentials are not readable via URL).
- Disables directory listing.
- Optional (commented): force HTTPS redirect; you can enable it when SSL is active.

Ensure **AllowOverride** allows `.htaccess` (e.g. `AllowOverride All` for the document root).

---

## 7. Quick checklist

- [ ] `composer install` run; `vendor/` present.
- [ ] `assets/php/mail-config.php`: SMTP settings and `TO_EMAIL` set; `SMTP_PASS` set securely (e.g. Gmail App Password).
- [ ] `assets/php/security-config.php`: `ALLOWED_ORIGINS` includes your site URL(s); rate limits and `DEBUG_MODE` set.
- [ ] `assets/php/logs/` exists and is writable.
- [ ] `.htaccess` in place; Apache `mod_rewrite` and PHP enabled.
- [ ] Test contact form and reseller form from the same origin (and over HTTPS in production).

---

## 8. Troubleshooting

- **403 / origin not allowed:** Add the exact origin (e.g. `https://superdistribution.mu`) to `ALLOWED_ORIGINS` in `security-config.php`.
- **429 Too many submissions:** Rate limit hit; wait or increase limits in `security-config.php` for testing.
- **500 / "autoload not found":** Run `composer install` from the project root.
- **Mail not sending:** Check SMTP host/port, TLS/SSL, and that `SMTP_PASS` is an app password (for Gmail). Check PHP error log and ensure `assets/php/logs/` is writable.

Use this file as the single reference for contact form setup and for prompts (e.g. “use PROMPT-CONTACT-FORM-SETUP.md for our website”) when configuring or debugging the forms.
