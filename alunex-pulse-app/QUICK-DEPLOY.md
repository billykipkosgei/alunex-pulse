# Quick Deploy Reference

## 🚀 One-Time Setup

### 1. MongoDB Atlas (5 minutes)
```
1. Create account at mongodb.com/cloud/atlas
2. Create FREE M0 cluster
3. Add database user (save username/password!)
4. Allow access from anywhere (0.0.0.0/0)
5. Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/alunex-pulse
```

### 2. Render.com Backend (10 minutes)
```
1. Push backend folder to GitHub
2. Create Web Service on render.com
3. Connect GitHub repo
4. Set environment variables:
   - MONGO_URI: (from step 1)
   - JWT_SECRET: (random string from randomkeygen.com)
   - FRONTEND_URL: https://yourdomain.com
   - NODE_ENV: production
5. Deploy! (wait 5-10 min)
6. Save backend URL: https://your-app.onrender.com
```

### 3. Frontend to cPanel (5 minutes)
```
1. Update frontend/.env.production with backend URL
2. Run: npm run build
3. Upload dist/* to cPanel public_html
4. Create .htaccess with React Router config
```

## 📝 Environment Variables Quick Reference

### Backend (Render.com)
```
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/alunex-pulse
JWT_SECRET=your_random_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=Alunex Pulse
VITE_ENV=production
```

## 🔧 Common Commands

### Build Frontend
```bash
cd frontend
npm run build
```

### Test Backend Locally
```bash
cd backend
npm run dev
```

### Test Production Backend
```bash
curl https://your-backend.onrender.com/api/health
```

## ⚡ Important URLs

- MongoDB Atlas: https://cloud.mongodb.com
- Render Dashboard: https://dashboard.render.com
- Frontend: https://yourdomain.com
- Backend: https://your-backend.onrender.com

## 🆘 Troubleshooting

### Backend won't start
- Check Render logs
- Verify MONGO_URI is correct
- Test health endpoint

### Frontend can't connect
- Check browser console
- Verify VITE_API_URL in .env.production
- Check CORS settings (FRONTEND_URL in backend)

### Database connection fails
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string format
- Check username/password

## 📦 What's Free?

✅ MongoDB Atlas: 512MB storage
✅ Render.com: 750 hours/month
✅ SSL/HTTPS: Automatic on Render
✅ Your cPanel: Already have it!

**Total Cost: $0/month**
