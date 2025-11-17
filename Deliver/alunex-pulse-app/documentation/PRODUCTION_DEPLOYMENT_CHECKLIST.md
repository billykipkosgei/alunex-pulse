# Production Deployment Checklist

## Your Production Setup

- **Frontend:** https://billyk.online/alunex-production (cPanel)
- **Backend:** https://alunex-pulse.onrender.com (Render.com)
- **Database:** MongoDB Atlas

---

## Phase 1: Backend Deployment (Render.com)

### 1.1 Environment Variables
- [ ] Log into Render.com dashboard
- [ ] Go to your service → **Environment** tab
- [ ] Copy all variables from `RENDER_ENV_VARIABLES.md`
- [ ] Set the following (minimum required):
  - [ ] `PORT=5001`
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI=mongodb+srv://...` (your MongoDB connection string)
  - [ ] `JWT_SECRET=` (strong secret key)
  - [ ] `JWT_EXPIRE=7d`
  - [ ] `FRONTEND_URL=https://billyk.online/alunex-production`
  - [ ] `SOCKET_IO_CORS_ORIGIN=https://billyk.online/alunex-production`
- [ ] Click **Save Changes**
- [ ] Wait for automatic redeployment

### 1.2 Verify Backend
- [ ] Check deployment status in Render.com
- [ ] Test health endpoint: https://alunex-pulse.onrender.com/api/health
- [ ] Should return: `{"status":"OK","message":"Server is running"}`
- [ ] Check Render logs for any errors

### 1.3 Database Connection
- [ ] Verify MongoDB Atlas is accessible
- [ ] Check that database user has correct permissions
- [ ] Whitelist Render.com IPs (or allow all: 0.0.0.0/0)
- [ ] Test database connection from Render logs

---

## Phase 2: Frontend Deployment (cPanel)

### 2.1 Build Frontend
On your local machine:
```bash
cd frontend
npm install
npm run build
```

- [ ] Build completes without errors
- [ ] `dist` folder is created
- [ ] Check that `dist` folder contains:
  - [ ] `index.html`
  - [ ] `assets` folder with JS/CSS files
  - [ ] `.htaccess` file (if you added it)

### 2.2 Upload to cPanel
- [ ] Log into cPanel
- [ ] Open File Manager
- [ ] Navigate to `public_html/alunex-production/`
- [ ] **Option A:** Upload all files from `dist` folder
  - [ ] Select all files inside `dist/`
  - [ ] Upload via File Manager
- [ ] **Option B:** Use FTP/SFTP client
  - [ ] Connect to your server
  - [ ] Upload all files from `dist/` to `/public_html/alunex-production/`
- [ ] **Option C:** Upload as ZIP
  - [ ] Create ZIP of dist contents
  - [ ] Upload ZIP to cPanel
  - [ ] Extract in File Manager
  - [ ] Delete ZIP file

### 2.3 Configure .htaccess
- [ ] Create `.htaccess` file in `public_html/alunex-production/`
- [ ] Copy content from `CPANEL_DEPLOYMENT_GUIDE.md`
- [ ] Save file
- [ ] Set permissions: 644

### 2.4 Verify Frontend
- [ ] Visit: https://billyk.online/alunex-production
- [ ] Login page loads correctly
- [ ] Google and Microsoft buttons are side-by-side
- [ ] Form is centered and scrollable
- [ ] Check browser console for errors (should be none)

---

## Phase 3: Test Email/Password Authentication

### 3.1 Test Login
- [ ] Go to: https://billyk.online/alunex-production/login
- [ ] Enter email: `admin@alunex.com`
- [ ] Enter password: `admin123`
- [ ] Click **Sign In**
- [ ] Should redirect to dashboard
- [ ] User info should display correctly

### 3.2 Test Navigation
- [ ] Click through different pages
- [ ] Refresh page (test .htaccess routing)
- [ ] All pages should load correctly
- [ ] No 404 errors on refresh

### 3.3 Test Logout
- [ ] Click logout
- [ ] Should redirect to login page
- [ ] Try accessing dashboard without login
- [ ] Should redirect back to login

---

## Phase 4: OAuth Setup (Optional but Recommended)

### 4.1 Google OAuth Setup
Follow steps in `OAUTH_PRODUCTION_SETUP.md`:
- [ ] Create/update Google Cloud project
- [ ] Configure OAuth consent screen
- [ ] Add authorized origins: `https://billyk.online`
- [ ] Add redirect URI: `https://alunex-pulse.onrender.com/api/auth/google/callback`
- [ ] Copy Client ID and Client Secret
- [ ] Add to Render.com environment variables:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/google/callback`
- [ ] Save and wait for redeployment

### 4.2 Microsoft OAuth Setup
Follow steps in `OAUTH_PRODUCTION_SETUP.md`:
- [ ] Create/update Azure app registration
- [ ] Configure authentication redirect URI: `https://alunex-pulse.onrender.com/api/auth/microsoft/callback`
- [ ] Create client secret
- [ ] Copy Application (client) ID and secret
- [ ] Add to Render.com environment variables:
  - [ ] `MICROSOFT_CLIENT_ID`
  - [ ] `MICROSOFT_CLIENT_SECRET`
  - [ ] `MICROSOFT_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/microsoft/callback`
- [ ] Save and wait for redeployment

### 4.3 Test Google OAuth
- [ ] Go to login page
- [ ] Click **Google** button
- [ ] Should redirect to Google login
- [ ] Sign in with Google account
- [ ] Grant permissions
- [ ] Should redirect back to app
- [ ] Should be logged in and on dashboard
- [ ] Check user profile displays Google info

### 4.4 Test Microsoft OAuth
- [ ] Go to login page
- [ ] Click **Microsoft** button
- [ ] Should redirect to Microsoft login
- [ ] Sign in with Microsoft account
- [ ] Grant permissions
- [ ] Should redirect back to app
- [ ] Should be logged in and on dashboard
- [ ] Check user profile displays Microsoft info

---

## Phase 5: Final Production Checks

### 5.1 Security
- [ ] HTTPS is enabled (both frontend and backend)
- [ ] OAuth credentials are in environment variables (not in code)
- [ ] `.env` files are NOT committed to Git
- [ ] Strong JWT secret is set
- [ ] MongoDB password is secure

### 5.2 Performance
- [ ] Frontend assets are compressed (check .htaccess)
- [ ] Images are optimized
- [ ] CSS and JS are minified (done by Vite build)
- [ ] Check page load times

### 5.3 Functionality
- [ ] All pages load correctly
- [ ] Login works (email/password)
- [ ] OAuth works (if configured)
- [ ] Dashboard displays data
- [ ] Navigation works
- [ ] Chat functionality works
- [ ] File uploads work
- [ ] Time tracking works
- [ ] Task management works

### 5.4 Mobile Testing
- [ ] Test on mobile browser
- [ ] Login page is responsive
- [ ] OAuth buttons are accessible
- [ ] Form is scrollable
- [ ] All features work on mobile

### 5.5 Browser Compatibility
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] No console errors

---

## Phase 6: Monitoring & Maintenance

### 6.1 Set Up Monitoring
- [ ] Monitor Render.com logs regularly
- [ ] Check MongoDB Atlas metrics
- [ ] Monitor OAuth usage in Google/Azure dashboards

### 6.2 Backups
- [ ] Set up MongoDB Atlas backups
- [ ] Keep a local backup of cPanel files
- [ ] Document all configuration

### 6.3 Updates
- [ ] Plan for regular updates
- [ ] Test updates locally first
- [ ] Keep dependencies up to date

---

## Troubleshooting Guide

### Backend Issues

**Backend not responding:**
1. Check Render.com deployment status
2. View Render logs for errors
3. Verify environment variables are set
4. Check MongoDB connection

**CORS errors:**
1. Verify `FRONTEND_URL` in Render environment
2. Check CORS configuration in backend code
3. Ensure frontend URL matches exactly

### Frontend Issues

**Blank page:**
1. Check browser console for errors
2. Verify build was successful
3. Check that all files uploaded correctly
4. Verify API URL in build

**404 on page refresh:**
1. Check `.htaccess` exists
2. Verify `.htaccess` content is correct
3. Check mod_rewrite is enabled on server

**Assets not loading:**
1. Check file paths in cPanel
2. Verify file permissions (644 for files, 755 for folders)
3. Check base path in vite.config.js

### OAuth Issues

**Redirect URI mismatch:**
1. Verify exact URLs in OAuth provider consoles
2. Check callback URLs in Render environment
3. Ensure protocol is https://

**Invalid client:**
1. Re-copy OAuth credentials
2. Update in Render environment variables
3. Save and redeploy

---

## Quick Reference

### Important URLs
- **Frontend:** https://billyk.online/alunex-production
- **Backend:** https://alunex-pulse.onrender.com
- **Health Check:** https://alunex-pulse.onrender.com/api/health
- **Render Dashboard:** https://dashboard.render.com/
- **Google Console:** https://console.cloud.google.com/
- **Azure Portal:** https://portal.azure.com/

### Default Credentials
- **Email:** admin@alunex.com
- **Password:** admin123
- **⚠️ Change in production!**

### Support Files
- `RENDER_ENV_VARIABLES.md` - Backend environment setup
- `CPANEL_DEPLOYMENT_GUIDE.md` - Frontend deployment
- `OAUTH_PRODUCTION_SETUP.md` - OAuth configuration
- `README_AUTHENTICATION.md` - Authentication overview

---

## Completion Status

Mark when fully deployed:

- [ ] Backend deployed to Render.com
- [ ] Frontend deployed to cPanel
- [ ] Email/password login working
- [ ] Google OAuth configured and working (optional)
- [ ] Microsoft OAuth configured and working (optional)
- [ ] All functionality tested
- [ ] Mobile responsive tested
- [ ] Production ready! 🚀

---

## Next Steps After Deployment

1. Change default admin password
2. Create additional user accounts
3. Set up regular backups
4. Monitor performance
5. Gather user feedback
6. Plan future enhancements

**Congratulations on deploying Alunex Pulse App!**
