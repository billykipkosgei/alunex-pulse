# Alunex Pulse - Production Deployment Guide

This guide will help you deploy Alunex Pulse to production using:
- **Backend**: Render.com (Free)
- **Database**: MongoDB Atlas (Free)
- **Frontend**: cPanel/Namecheap hosting

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new FREE cluster (M0 Sandbox)
4. Choose a cloud provider and region closest to your users

### Step 2: Configure Database Access
1. In MongoDB Atlas dashboard, go to **Database Access**
2. Click **Add New Database User**
3. Create a username and password (SAVE THESE!)
4. Set privileges to **"Read and write to any database"**

### Step 3: Configure Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Confirm

### Step 4: Get Connection String
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your database user password
5. Add `/alunex-pulse` at the end: `mongodb+srv://username:password@cluster.mongodb.net/alunex-pulse`
6. **SAVE THIS STRING!** You'll need it for Render.com

---

## Part 2: Backend Deployment (Render.com)

### Step 1: Prepare GitHub Repository
1. Create a new repository on GitHub (e.g., `alunex-pulse-backend`)
2. Push only the **backend** folder:
```bash
cd alunex-pulse-app/backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/YOUR_USERNAME/alunex-pulse-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render.com
1. Go to https://render.com and sign up (free)
2. Click **New +** → **Web Service**
3. Connect your GitHub account
4. Select your backend repository
5. Configure the service:
   - **Name**: alunex-pulse-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Set Environment Variables
In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | production |
| `PORT` | 5001 |
| `MONGO_URI` | (Your MongoDB Atlas connection string from Part 1) |
| `JWT_SECRET` | (Generate a random string, e.g., use https://randomkeygen.com/) |
| `JWT_EXPIRE` | 7d |
| `FRONTEND_URL` | (Your cPanel domain, e.g., https://yourdomain.com) |

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Once done, you'll get a URL like: `https://alunex-pulse-backend.onrender.com`
4. **SAVE THIS URL!** You'll need it for the frontend

### Step 5: Test Backend
Visit: `https://your-backend-url.onrender.com/api/health`

You should see: `{"status":"OK","message":"Server is running"}`

---

## Part 3: Frontend Deployment (cPanel)

### Step 1: Update Production Environment Variables
1. Open `frontend/.env.production`
2. Update `VITE_API_URL` with your Render.com backend URL:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Step 2: Build Frontend for Production
```bash
cd alunex-pulse-app/frontend
npm run build
```

This creates a `dist` folder with optimized production files.

### Step 3: Upload to cPanel
1. Log in to your cPanel
2. Go to **File Manager**
3. Navigate to `public_html` (or your domain's root folder)
4. Delete any existing files (or create a new folder for this app)
5. Upload ALL files from the `dist` folder to `public_html`

### Step 4: Configure .htaccess for React Router
Create a `.htaccess` file in your `public_html` folder with this content:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Part 4: Final Steps

### Update CORS in Backend (if needed)
If you have CORS issues, update the `FRONTEND_URL` environment variable in Render.com to match your exact domain.

### Create First Admin User
1. Visit your deployed frontend
2. Register the first user
3. Go to MongoDB Atlas → Browse Collections → users
4. Find your user and change `role` from `"team_member"` to `"admin"`
5. Log out and log back in

---

## Important Notes

### Render.com Free Tier Limitations
- Backend will spin down after 15 minutes of inactivity
- First request after spindown takes 30-60 seconds (cold start)
- 750 hours/month free (enough for one service)

### MongoDB Atlas Free Tier
- 512 MB storage
- Enough for thousands of users
- Can upgrade anytime

### SSL/HTTPS
- Render.com provides free HTTPS automatically
- Configure SSL in cPanel for your domain

---

## Troubleshooting

### Backend Issues
- Check logs in Render.com dashboard
- Verify environment variables are set correctly
- Test health endpoint: `/api/health`

### Frontend Issues
- Check browser console for errors
- Verify `VITE_API_URL` is correct in `.env.production`
- Check .htaccess file is uploaded

### Database Issues
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Test connection from Render logs

---

## Production URLs

After deployment, save these URLs:

- **Frontend**: https://yourdomain.com
- **Backend**: https://your-backend-url.onrender.com
- **Database**: (MongoDB Atlas dashboard)

---

## Support

For issues or questions, refer to:
- Render.com docs: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com/
- Vite deployment: https://vitejs.dev/guide/static-deploy.html
