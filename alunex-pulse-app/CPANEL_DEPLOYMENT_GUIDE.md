# cPanel Deployment Guide for Frontend

## Your Production URLs

- **Frontend:** https://billyk.online/alunex-production
- **Backend:** https://alunex-pulse.onrender.com

## Pre-Deployment Steps

### 1. Build the Frontend

Before uploading to cPanel, you need to build the production version:

```bash
cd frontend
npm install
npm run build
```

This will create a `dist` folder with the production-ready files.

### 2. Verify Environment Variables

The frontend already has the correct production API URL configured in `.env.production`:

```
VITE_API_URL=https://alunex-pulse.onrender.com/api
```

This file is automatically used when you run `npm run build`.

## Uploading to cPanel

### Method 1: File Manager (Recommended for Small Updates)

1. **Log into cPanel**
2. **Open File Manager**
3. **Navigate to:** `public_html/alunex-production` (or your designated folder)
4. **Delete old files** (if updating)
5. **Upload the contents of the `dist` folder:**
   - Select all files inside `frontend/dist/`
   - Upload them to `public_html/alunex-production/`

   **Important:** Upload the FILES inside `dist`, not the `dist` folder itself

6. **Set Permissions:**
   - Folders: 755
   - Files: 644

### Method 2: FTP/SFTP (Better for Large Deployments)

1. **Connect via FTP client** (FileZilla, WinSCP, etc.)
   - Host: Your domain or cPanel FTP address
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Navigate to:** `public_html/alunex-production/`

3. **Upload contents:**
   - Upload all files from `frontend/dist/` folder
   - Overwrite existing files

### Method 3: Compress and Extract (Fastest for Initial Deploy)

1. **On your local machine:**
   ```bash
   cd frontend/dist
   zip -r dist.zip *
   ```

2. **In cPanel File Manager:**
   - Navigate to `public_html/alunex-production/`
   - Upload `dist.zip`
   - Right-click and select "Extract"
   - Delete the zip file after extraction

## .htaccess Configuration for React Router

Since you're using React Router, you need a `.htaccess` file to handle client-side routing:

**Create this file:** `public_html/alunex-production/.htaccess`

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

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Enable Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
</IfModule>
```

## Folder Structure on cPanel

Your cPanel folder structure should look like this:

```
public_html/
└── alunex-production/
    ├── .htaccess
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   ├── index-[hash].css
    │   └── [other assets]
    └── [other Vite build files]
```

## Testing After Deployment

1. **Access your app:** https://billyk.online/alunex-production
2. **Test login page:**
   - Check if the page loads correctly
   - Verify Google and Microsoft buttons are side-by-side
   - Test scrolling on mobile
3. **Test email/password login:**
   - Use: `admin@alunex.com` / `admin123`
   - Should redirect to dashboard
4. **Test OAuth (after setup):**
   - Click Google button
   - Should redirect to Google OAuth
   - After authentication, should return to dashboard

## Troubleshooting

### Issue: "404 Not Found" on page refresh
**Solution:** Make sure `.htaccess` file exists and mod_rewrite is enabled on your server

### Issue: Blank page or console errors
**Solution:**
1. Check browser console for errors
2. Verify API URL is correct in build
3. Check CORS settings on backend

### Issue: OAuth doesn't work
**Solution:**
1. Verify OAuth credentials in Render.com environment variables
2. Check callback URLs in Google/Microsoft consoles
3. See `OAUTH_PRODUCTION_SETUP.md` for detailed OAuth configuration

### Issue: Assets not loading (CSS/JS)
**Solution:**
1. Check file paths in cPanel
2. Verify base path in Vite config
3. Check file permissions (should be 644)

## Updating the Frontend

When you make changes:

1. **Make your changes** in the source code
2. **Build again:**
   ```bash
   cd frontend
   npm run build
   ```
3. **Upload new dist files** to cPanel
4. **Clear browser cache** to see changes

## Production Checklist

- [ ] Frontend built with production environment
- [ ] All files uploaded to cPanel
- [ ] `.htaccess` file configured
- [ ] File permissions set correctly
- [ ] Backend environment variables configured on Render.com
- [ ] OAuth credentials added to Render.com
- [ ] CORS configured on backend
- [ ] Test login with email/password
- [ ] Test OAuth login (after OAuth setup)
- [ ] Test all routes (refresh pages to test .htaccess)

## Important Notes

- Always test locally before deploying
- Keep a backup of your previous deployment
- The frontend uses the API URL from `.env.production` automatically
- Changes to environment variables require a rebuild
- Clear browser cache after deployment
