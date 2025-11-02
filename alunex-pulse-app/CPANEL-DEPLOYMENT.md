# Frontend Deployment to cPanel - Final Step

## 🎉 Your Backend is Live!
**Backend URL:** https://alunex-pulse.onrender.com

---

## 📦 Files Ready for Upload

The production build is ready in:
```
frontend/dist/
```

All files in this folder need to be uploaded to your cPanel.

---

## 🚀 Upload to cPanel - Step by Step

### Step 1: Login to cPanel
1. Go to your Namecheap hosting cPanel
2. Open **File Manager**

### Step 2: Navigate to Your Folder
1. Go to `public_html`
2. Find or create the `alunex-production` folder
3. Open the `alunex-production` folder

### Step 3: Upload Files
1. Click **"Upload"** button (top menu)
2. Select **ALL files** from `frontend/dist/` folder:
   - `index.html`
   - `.htaccess` (important!)
   - `assets` folder (contains CSS and JS)
3. Wait for upload to complete

**Important:** Make sure `.htaccess` is uploaded! It handles React Router routing.

### Step 4: Set Permissions (if needed)
1. Right-click on each file
2. Set permissions to **644** for files
3. Set permissions to **755** for folders

---

## 🌐 Your App URLs

After upload, your app will be available at:
```
https://llyk.online/alunex-production
```

---

## 🧪 Testing Your Deployment

### 1. Visit Your Site
Open: https://llyk.online/alunex-production

### 2. Test Login
Try to login or register a new user

### 3. Check Browser Console
Press F12 and check for any errors in the Console tab

### 4. Test Features
- Dashboard
- Team Chat
- Tasks
- Time Tracking
- Settings

---

## 🔧 If Something Doesn't Work

### Can't Login / API Errors
**Check CORS settings in Render:**
1. Go to Render.com dashboard
2. Click on your backend service
3. Go to Environment
4. Make sure `FRONTEND_URL` is: `https://llyk.online`

### 404 Errors on Page Refresh
**Problem:** `.htaccess` not uploaded or not working

**Solution:**
1. Make sure `.htaccess` is in the root of `alunex-production` folder
2. Check if your server supports `.htaccess` (most do)
3. Content should be:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /alunex-production/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /alunex-production/index.html [L]
</IfModule>
```

### White Screen / Nothing Loads
1. Check browser console for errors
2. Make sure all files in `assets` folder uploaded correctly
3. Clear browser cache and try again

---

## 👤 Create First Admin User

### After First Login:
1. Register the first user through the app
2. Go to MongoDB Atlas dashboard
3. Browse Collections → `alunex-pulse` database → `users` collection
4. Find your user document
5. Edit the document and change:
   ```
   "role": "team_member"  →  "role": "admin"
   ```
6. Save
7. Logout and login again

Now you're an admin and can invite other users!

---

## 📊 Architecture Summary

```
Users → https://llyk.online/alunex-production (Frontend - cPanel)
            ↓
        https://alunex-pulse.onrender.com (Backend - Render.com)
            ↓
        MongoDB Atlas (Database - Cloud)
```

---

## 🎯 Costs

- Backend (Render.com): **FREE** ✅
- Database (MongoDB Atlas): **FREE** ✅
- Frontend (Your cPanel): **Already Paid** ✅

**Total Additional Cost: $0/month**

---

## 🆘 Support

If you need help:
1. Check browser console (F12)
2. Check Render logs (Render.com dashboard)
3. Check MongoDB Atlas connection

---

## ✅ Final Checklist

- [ ] Backend deployed to Render.com
- [ ] MongoDB Atlas connected
- [ ] Frontend built for production
- [ ] All files uploaded to cPanel
- [ ] `.htaccess` file uploaded
- [ ] Site accessible at https://llyk.online/alunex-production
- [ ] Can login/register
- [ ] First admin user created
- [ ] Team features working

---

Congratulations! Your Alunex Pulse app is now LIVE! 🎉
