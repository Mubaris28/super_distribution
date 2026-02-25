# Contact & Reseller Form Setup

## Why you didn't see success and didn't get the email

1. **Live Server (e.g. http://127.0.0.1:5500) does not run PHP**  
   It only serves HTML/CSS/JS. When the form submits, the request to `assets/php/contact-mail.php` is not executed as PHP, so no email is sent and the page never gets a proper JSON response, so no success message.

2. **You must run a PHP server locally** so that `contact-mail.php` and `reseller-mail.php` actually run.

---

## 1. Run the site with PHP (local testing)

In the project root folder (where `index.html` is), open a terminal and run:

```bash
php -S 127.0.0.1:8000
```

Then in the browser open:

- **http://127.0.0.1:8000/contact.html**

Fill and submit the form again. You should see the success message and (once Gmail is configured) receive the confirmation email.

---

## 2. Gmail App Password (so emails are actually sent)

The form uses Gmail SMTP. You must set an **App Password** (not your normal Gmail password).

1. Enable **2-Step Verification** on your Google account:  
   https://myaccount.google.com/security

2. Create an **App Password**:  
   https://myaccount.google.com/apppasswords  
   - App: **Mail**  
   - Device: **Other** → name it e.g. "Super Distribution"  
   - Copy the **16-character password** (no spaces).

3. Open **assets/php/mail-config.php** and replace the placeholder:

   ```php
   define('SMTP_PASS', 'xxxx xxxx xxxx xxxx');  // paste the 16 chars (spaces optional)
   ```

4. Save. Then submit the contact form again from **http://127.0.0.1:8000/contact.html**.

You should receive:
- The enquiry at **TO_EMAIL** (in mail-config.php, currently `orders@superdistribution.mu`)
- A confirmation email at the address you entered in the form (e.g. mubarismuhammed33@gmail.com)

---

## Summary

| Step | Action |
|------|--------|
| 1 | Run `php -S 127.0.0.1:8000` in the project folder |
| 2 | Use **http://127.0.0.1:8000/contact.html** (not port 5500) |
| 3 | Set **SMTP_PASS** in `assets/php/mail-config.php` with your Gmail App Password |

After that, the success message will show and emails will be sent.
