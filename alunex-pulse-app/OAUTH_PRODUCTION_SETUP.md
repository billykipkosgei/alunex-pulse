# OAuth Production Setup Guide

## Your Production URLs

- **Frontend:** https://billyk.online/alunex-production
- **Backend:** https://alunex-pulse.onrender.com

## Google OAuth Production Setup

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Go to: **APIs & Services** → **Credentials**

### Step 2: Configure OAuth Consent Screen (If Not Done)

1. Click **OAuth consent screen** in the sidebar
2. Select **External** user type
3. Fill in:
   - **App name:** Alunex Pulse
   - **User support email:** Your email
   - **App domain - Application home page:** `https://billyk.online/alunex-production`
   - **Authorized domains:** Add `billyk.online`
   - **Developer contact:** Your email
4. Click **Save and Continue**
5. Click **Back to Dashboard**

### Step 3: Create or Update OAuth Client ID

#### If Creating New:
1. Click **Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Name: `Alunex Pulse Production`

#### If Updating Existing:
1. Find your existing OAuth client
2. Click the edit icon (pencil)

### Step 4: Configure Authorized Origins and Redirect URIs

**Authorized JavaScript origins:**
```
https://billyk.online
```

**Authorized redirect URIs:**
```
https://alunex-pulse.onrender.com/api/auth/google/callback
```

### Step 5: Get Credentials

1. Click **Create** or **Save**
2. Copy the **Client ID**
3. Copy the **Client Secret**

### Step 6: Add to Render.com

1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Go to **Environment** tab
4. Add/Update these variables:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   GOOGLE_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/google/callback
   ```
5. Click **Save Changes**
6. Wait for automatic redeployment

---

## Microsoft OAuth Production Setup

### Step 1: Go to Azure Portal

1. Visit: https://portal.azure.com/
2. Search for **Azure Active Directory**
3. Click **App registrations** in the sidebar

### Step 2: Create or Update App Registration

#### If Creating New:
1. Click **New registration**
2. Fill in:
   - **Name:** Alunex Pulse Production
   - **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI:**
     - Type: **Web**
     - URL: `https://alunex-pulse.onrender.com/api/auth/microsoft/callback`
3. Click **Register**

#### If Updating Existing:
1. Find your app registration
2. Click on it to open

### Step 3: Configure Authentication

1. In your app, click **Authentication** in the sidebar
2. Under **Platform configurations** → **Web**:
   - **Redirect URIs:**
     ```
     https://alunex-pulse.onrender.com/api/auth/microsoft/callback
     ```
3. Under **Implicit grant and hybrid flows:** (Leave unchecked)
4. Click **Save**

### Step 4: Get Application (client) ID

1. Click **Overview** in the sidebar
2. Copy the **Application (client) ID**

### Step 5: Create Client Secret

1. Click **Certificates & secrets** in the sidebar
2. Under **Client secrets**, click **New client secret**
3. Add description: `Production Secret`
4. Select expiration: `24 months` (or your preference)
5. Click **Add**
6. **IMPORTANT:** Copy the **Value** immediately (you won't see it again!)

### Step 6: Configure API Permissions

1. Click **API permissions** in the sidebar
2. Verify these permissions exist:
   - **Microsoft Graph:**
     - `User.Read` (Delegated)
     - `email` (Delegated)
     - `profile` (Delegated)
3. If missing, click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
4. If you have admin access, click **Grant admin consent**

### Step 7: Add to Render.com

1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Go to **Environment** tab
4. Add/Update these variables:
   ```
   MICROSOFT_CLIENT_ID=your_application_client_id_here
   MICROSOFT_CLIENT_SECRET=your_client_secret_value_here
   MICROSOFT_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/microsoft/callback
   ```
5. Click **Save Changes**
6. Wait for automatic redeployment

---

## Testing OAuth in Production

### Step 1: Access Your App

Go to: https://billyk.online/alunex-production

### Step 2: Test Google OAuth

1. Click the **Google** button
2. You should be redirected to Google login
3. Sign in with your Google account
4. Grant permissions
5. You should be redirected back to: `https://billyk.online/alunex-production/login?token=...`
6. Then automatically to the dashboard

### Step 3: Test Microsoft OAuth

1. Click the **Microsoft** button
2. You should be redirected to Microsoft login
3. Sign in with your Microsoft account
4. Grant permissions
5. You should be redirected back to: `https://billyk.online/alunex-production/login?token=...`
6. Then automatically to the dashboard

---

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- **Cause:** Redirect URI doesn't match exactly
- **Solution:**
  1. Check Google Console → Credentials → Your OAuth Client
  2. Verify redirect URI is exactly: `https://alunex-pulse.onrender.com/api/auth/google/callback`
  3. No trailing slash, correct protocol (https)

**Error: "access_denied"**
- **Cause:** User denied permission or app not verified
- **Solution:**
  1. Try again and grant permissions
  2. Check OAuth consent screen configuration

**Error: "invalid_client"**
- **Cause:** Wrong Client ID or Client Secret
- **Solution:**
  1. Re-copy credentials from Google Console
  2. Update in Render.com environment variables
  3. Redeploy

### Microsoft OAuth Issues

**Error: "AADSTS50011: redirect_uri_mismatch"**
- **Cause:** Redirect URI doesn't match
- **Solution:**
  1. Check Azure Portal → App Registration → Authentication
  2. Verify redirect URI is exactly: `https://alunex-pulse.onrender.com/api/auth/microsoft/callback`

**Error: "AADSTS65005: Invalid client"**
- **Cause:** Wrong Application ID or Client Secret
- **Solution:**
  1. Verify Application (client) ID from Overview page
  2. Create new client secret if old one expired
  3. Update in Render.com

**Error: "AADSTS65001: consent_required"**
- **Cause:** User needs to consent to permissions
- **Solution:**
  1. Check API Permissions are configured
  2. Grant admin consent if available
  3. User needs to accept permissions on first login

### General Issues

**OAuth button does nothing**
- Check browser console for errors
- Verify backend is running: https://alunex-pulse.onrender.com/api/health
- Check that OAuth environment variables are set in Render.com

**"Failed to load user data" after OAuth**
- Check Render.com logs for backend errors
- Verify MongoDB connection
- Check JWT_SECRET is set

**Redirects to wrong URL**
- Verify FRONTEND_URL in Render.com is: `https://billyk.online/alunex-production`
- Check that .env.production was used for frontend build

---

## Security Checklist

- [ ] OAuth credentials are set as environment variables (not in code)
- [ ] Client secrets are kept secure
- [ ] HTTPS is enabled (both frontend and backend)
- [ ] Authorized domains are configured correctly
- [ ] Redirect URIs are exact matches (no wildcards)
- [ ] OAuth consent screen is configured
- [ ] API permissions are minimal and necessary
- [ ] Environment variables are not committed to Git

---

## Quick Reference

### Google OAuth URLs to Configure:
- **Authorized JavaScript origins:** `https://billyk.online`
- **Redirect URI:** `https://alunex-pulse.onrender.com/api/auth/google/callback`

### Microsoft OAuth URLs to Configure:
- **Redirect URI:** `https://alunex-pulse.onrender.com/api/auth/microsoft/callback`

### Render.com Environment Variables:
```
FRONTEND_URL=https://billyk.online/alunex-production
GOOGLE_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/google/callback
MICROSOFT_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/microsoft/callback
```

### OAuth Provider Dashboards:
- **Google:** https://console.cloud.google.com/apis/credentials
- **Microsoft:** https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
- **Render:** https://dashboard.render.com/

---

## Support

If you need help:
1. Check the Render.com logs for backend errors
2. Check browser console for frontend errors
3. Verify all URLs match exactly (including https://)
4. Test email/password login first to isolate OAuth issues
5. Check that all environment variables are saved in Render.com
