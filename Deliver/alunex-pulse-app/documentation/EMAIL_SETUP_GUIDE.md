# Email Setup Guide for Alunex Project Management

This guide explains how to set up email functionality for sending user invitations and notifications in the Alunex Project Management System.

## Overview

The application supports two email delivery methods:
1. **Resend** (Recommended) - Modern transactional email API
2. **SMTP** (Fallback) - Traditional email server

**Why Resend is Recommended:**
- Works reliably with cloud hosting providers (Render, Vercel, etc.)
- No SMTP port blocking issues
- Free tier: 3,000 emails/month, 100 emails/day
- Simple API integration
- No credit card required for signup
- Better deliverability rates

---

## Option 1: Resend Setup (Recommended)

### Step 1: Create a Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with your email address
3. Verify your email address
4. Log in to the Resend dashboard

### Step 2: Get Your API Key

1. In the Resend dashboard, navigate to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Alunex Production")
4. Select permissions: **Sending access**
5. Click **Add**
6. **Copy the API key** (it starts with `re_`) - you won't be able to see it again!

### Step 3: Configure Environment Variables

#### For Render.com (Production):

1. Go to your Render dashboard: [https://dashboard.render.com/](https://dashboard.render.com/)
2. Select your `alunex-pulse` backend service
3. Go to the **Environment** tab
4. Add the following environment variables:

```
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=onboarding@resend.dev
FROM_NAME=Alunex Project Management
```

5. Click **Save Changes** (this will trigger an automatic redeploy)

#### For Local Development:

Update `alunex-pulse-app/backend/.env`:

```env
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=onboarding@resend.dev
FROM_NAME=Alunex Project Management
```

### Step 4: (Optional) Add Your Custom Domain

To send emails from your own domain (e.g., `admin@billyk.online`):

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `billyk.online`
4. Resend will provide DNS records (SPF, DKIM, DMARC)
5. Add these DNS records in your cPanel or domain registrar:

**Example DNS Records:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [value provided by Resend]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@billyk.online
```

6. Wait for DNS propagation (usually 5-30 minutes)
7. Verify the domain in Resend dashboard
8. Update environment variable:
```
FROM_EMAIL=admin@billyk.online
```

---

## Option 2: SMTP Setup (Fallback)

**Note:** SMTP may not work on cloud hosting providers like Render due to port blocking. Use Resend instead.

### Step 1: Get SMTP Credentials from cPanel

1. Log in to your cPanel
2. Go to **Email Accounts**
3. Find your email account (e.g., `admin@billyk.online`)
4. Click **Connect Devices**
5. Copy the following information:
   - **SMTP Server** (e.g., `premium194.web-hosting.com`)
   - **SMTP Port** (use `587` for TLS or `465` for SSL)
   - **Username** (your full email address)
   - **Password** (your email password)

### Step 2: Configure Environment Variables

Add to your environment (Render.com or `.env` file):

```env
SMTP_HOST=premium194.web-hosting.com
SMTP_PORT=587
SMTP_USER=admin@billyk.online
SMTP_PASS=your_email_password_here
```

**Important:** If using SMTP, remove or comment out `RESEND_API_KEY` to use SMTP as the primary method.

---

## Testing Email Setup

### 1. Check Configuration

After deploying, visit this debug endpoint:
```
https://alunex-pulse.onrender.com/api/debug/smtp-env
```

You should see:
```json
{
  "hasSmtpHost": true,
  "hasSmtpPort": true,
  "hasSmtpUser": true,
  "hasSmtpPass": true,
  "smtpHost": "premium194.web-hosting.com",
  "smtpPort": "587",
  "smtpUser": "admin@billyk.online",
  "frontendUrl": "https://billyk.online/alunex-production"
}
```

### 2. Test Invitation Email

1. Log in as an admin user
2. Go to **Settings** → **Team** tab
3. Click **Invite Member**
4. Fill in the details and submit
5. Check the Render logs for:
   - Success: `Invitation email sent via Resend: [message-id]`
   - Error: Check the error message in logs

### 3. Verify Email Delivery

- Check the recipient's inbox (and spam folder)
- The email should have:
  - Subject: "Welcome to Alunex Project Management"
  - Professional HTML design with gradient header
  - Login credentials (email and temporary password)
  - Login button linking to your frontend

---

## Email Templates

The system sends the following emails:

### 1. User Invitation Email
- **Trigger:** Admin invites a new team member
- **Contains:** Welcome message, login credentials, login link
- **Template:** Professional HTML with branded header

### 2. Password Reset Email (Future)
- **Trigger:** User requests password reset
- **Contains:** Password reset link
- **Template:** Professional HTML with branded header

---

## Troubleshooting

### Problem: "Connection timeout" error in Render logs

**Solution:**
- Your hosting provider is blocking SMTP ports
- Switch to Resend (recommended)

### Problem: Email not received

**Check:**
1. Spam/junk folder
2. Email address is correct
3. Resend API key is valid
4. Check Resend dashboard for delivery status

### Problem: "No email service configured" message

**Solution:**
- Ensure `RESEND_API_KEY` is set in environment variables
- Redeploy after adding environment variables

### Problem: Emails sent from wrong address

**Solution:**
- Update `FROM_EMAIL` environment variable
- If using custom domain, ensure it's verified in Resend

### Problem: Rate limiting

**Solution:**
- Resend free tier: 100 emails/day, 3,000/month
- Upgrade to paid plan if needed
- For development, use test mode in Resend

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes* | - | Resend API key (starts with `re_`) |
| `FROM_EMAIL` | No | `onboarding@resend.dev` | Sender email address |
| `FROM_NAME` | No | `Alunex Project Management` | Sender name |
| `FRONTEND_URL` | Yes | - | Your frontend URL for links in emails |
| `SMTP_HOST` | No** | - | SMTP server hostname |
| `SMTP_PORT` | No** | `587` | SMTP port (587 or 465) |
| `SMTP_USER` | No** | - | SMTP username (email address) |
| `SMTP_PASS` | No** | - | SMTP password |

\* Required if using Resend
\*\* Required if using SMTP fallback

---

## Migration from SMTP to Resend

If you previously configured SMTP and want to switch to Resend:

1. Sign up for Resend and get API key
2. Add `RESEND_API_KEY` to environment variables
3. Keep SMTP variables for fallback (optional)
4. Redeploy your application
5. Test with a user invitation

The system will automatically prefer Resend over SMTP if both are configured.

---

## Production Checklist

Before going live:

- [ ] Resend account created and verified
- [ ] API key generated and stored securely
- [ ] Environment variables added to Render
- [ ] Custom domain added and verified (optional)
- [ ] Test email sent successfully
- [ ] Email appears professional and links work
- [ ] Spam score is good (check with mail-tester.com)

---

## Support Resources

- **Resend Documentation:** [https://resend.com/docs](https://resend.com/docs)
- **Resend Dashboard:** [https://resend.com/emails](https://resend.com/emails)
- **Email Deliverability Guide:** [https://resend.com/docs/knowledge-base/deliverability](https://resend.com/docs/knowledge-base/deliverability)

---

## Security Notes

- Never commit `.env` files with real credentials to Git
- Use environment variables for all sensitive data
- Rotate API keys periodically
- Use custom domain for better deliverability
- Monitor email sending logs in Resend dashboard
- Set up DMARC policy for your domain

---

## Quick Start Summary

**Fastest way to get emails working (5 minutes):**

1. Sign up at [resend.com/signup](https://resend.com/signup)
2. Create API key
3. Add to Render environment variables:
   ```
   RESEND_API_KEY=re_your_key_here
   FROM_EMAIL=onboarding@resend.dev
   FROM_NAME=Alunex Project Management
   ```
4. Save and wait for redeploy
5. Test by inviting a user

That's it! Your invitation emails will now be delivered reliably.
