# Alunex Pulse - Deployment Guide

This guide covers deploying the Alunex Pulse application to production environments.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build for Production](#build-for-production)
3. [Deployment Options](#deployment-options)
4. [cPanel Deployment](#cpanel-deployment)
5. [Render Deployment](#render-deployment)
6. [Heroku Deployment](#heroku-deployment)
7. [DigitalOcean/VPS Deployment](#digitalocean-vps-deployment)
8. [Environment Configuration](#environment-configuration)
9. [Post-Deployment](#post-deployment)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain only
- [ ] Review and update security headers
- [ ] Remove console.log statements
- [ ] Enable rate limiting
- [ ] Set secure cookie flags

### Database
- [ ] Use production MongoDB instance (not localhost)
- [ ] Enable database authentication
- [ ] Set up database backups
- [ ] Create database indexes for performance
- [ ] Whitelist only necessary IPs

### OAuth
- [ ] Update Google OAuth redirect URIs with production URL
- [ ] Update Microsoft OAuth redirect URIs
- [ ] Test OAuth flows in production environment

### Email
- [ ] Configure production email service
- [ ] Verify email domain (for Resend or custom SMTP)
- [ ] Test email delivery

### Environment Variables
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Update all callback URLs

---

## Build for Production

### Frontend Build

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Update environment variables**:
   Create/edit `.env.production`:
   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Output location**:
   - Built files will be in `frontend/dist/`
   - This contains optimized, minified production code

5. **Test the build locally** (optional):
   ```bash
   npm run preview
   ```

### Backend Preparation

The backend doesn't require building, but ensure:

1. **Dependencies are listed** in `package.json`
2. **Environment variables** are configured
3. **Remove dev dependencies** from production:
   ```bash
   npm install --production
   ```

---

## Deployment Options

### Comparison Matrix

| Platform | Best For | Difficulty | Cost | Auto-Deploy |
|----------|----------|------------|------|-------------|
| **cPanel** | Shared hosting | Medium | Low | Manual |
| **Render** | Full-stack apps | Easy | Free tier | Yes |
| **Heroku** | Quick deployment | Easy | Free tier | Yes |
| **DigitalOcean** | Full control | Hard | $5/mo | Manual |
| **AWS** | Enterprise scale | Hard | Pay-as-go | Yes |
| **Vercel** | Frontend only | Easy | Free tier | Yes |
| **Netlify** | Frontend only | Easy | Free tier | Yes |

---

## cPanel Deployment

### Prerequisites
- cPanel hosting account
- Node.js support enabled
- SSH access (recommended)
- Domain/subdomain configured

### Step 1: Prepare Files

1. **Build frontend** (see above)
2. **Create deployment package**:
   ```bash
   # From project root
   zip -r alunex-pulse.zip backend/ frontend/dist/
   ```

### Step 2: Upload to cPanel

1. **Login to cPanel**
2. **Navigate to File Manager**
3. **Create directory**:
   - `/home/username/alunex-pulse`
4. **Upload** `alunex-pulse.zip`
5. **Extract** the zip file

### Step 3: Setup Backend

1. **Open Terminal** in cPanel
2. **Navigate to backend**:
   ```bash
   cd ~/alunex-pulse/backend
   ```
3. **Install dependencies**:
   ```bash
   npm install --production
   ```
4. **Create .env file**:
   ```bash
   nano .env
   ```
   Add production environment variables

### Step 4: Setup Node.js Application

1. **In cPanel**, go to "Setup Node.js App"
2. **Create Application**:
   - Node.js version: 16+ or latest
   - Application mode: Production
   - Application root: `alunex-pulse/backend`
   - Application URL: `https://yourdomain.com`
   - Application startup file: `src/server.js`
3. **Set environment variables** in the interface
4. **Start** the application

### Step 5: Configure Frontend

1. **In cPanel File Manager**:
   - Navigate to `public_html` (or your domain's document root)
   - Copy files from `frontend/dist/` to `public_html/`

2. **Configure .htaccess** for React Router:
   Create `public_html/.htaccess`:
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

### Step 6: SSL Certificate

1. **In cPanel**, go to "SSL/TLS Status"
2. **Enable AutoSSL** or install Let's Encrypt
3. **Force HTTPS**:
   Add to `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

---

## Render Deployment

Render is recommended for easy full-stack deployment with free tier.

### Step 1: Prepare Repository

1. **Push code to GitHub/GitLab**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/alunex-pulse.git
   git push -u origin main
   ```

### Step 2: Deploy Backend

1. **Go to** [Render Dashboard](https://dashboard.render.com/)
2. **Click** "New +" → "Web Service"
3. **Connect** your GitHub repository
4. **Configure**:
   - Name: `alunex-pulse-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free (or paid)

5. **Add Environment Variables**:
   - Click "Environment" tab
   - Add all variables from `.env`
   - Ensure `NODE_ENV=production`

6. **Deploy**

### Step 3: Deploy Frontend

**Option A: Static Site (Recommended)**

1. **New** → "Static Site"
2. **Connect repository**
3. **Configure**:
   - Name: `alunex-pulse-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

4. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`

5. **Deploy**

**Option B: Same Web Service**
- Deploy frontend from same service
- Serve static files from Express

### Step 4: Database

1. **Use MongoDB Atlas** (recommended)
   - OR create Render PostgreSQL if switching databases

2. **Update MONGODB_URI** in backend environment variables

### Step 5: Custom Domain (Optional)

1. **In frontend settings** → "Custom Domain"
2. **Add your domain**
3. **Update DNS records** as instructed
4. **SSL** is automatic

---

## Heroku Deployment

### Step 1: Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

### Step 2: Prepare Application

Create `Procfile` in backend directory:
```
web: node src/server.js
```

### Step 3: Deploy Backend

```bash
cd backend
heroku create alunex-pulse-backend
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a alunex-pulse-backend
git push heroku main
```

### Step 4: Configure Environment Variables

```bash
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com
# ... add all other variables
```

### Step 5: Deploy Frontend

```bash
cd frontend
# Update VITE_API_URL in code or use build script
npm run build

# Use heroku-buildpack-static
heroku create alunex-pulse-frontend
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
git init
git add .
git commit -m "Deploy frontend"
git push heroku main
```

Create `static.json` in frontend:
```json
{
  "root": "dist/",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

---

## DigitalOcean VPS Deployment

### Step 1: Create Droplet

1. **Sign up** at DigitalOcean
2. **Create Droplet**:
   - Ubuntu 22.04 LTS
   - Basic plan ($6/mo or higher)
   - Choose datacenter region
   - Add SSH key

### Step 2: Initial Server Setup

```bash
# SSH into server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Create new user
adduser alunex
usermod -aG sudo alunex
su - alunex
```

### Step 3: Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 4: Install MongoDB

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 5: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 6: Deploy Application

```bash
# Clone or upload your code
cd /var/www
sudo mkdir alunex-pulse
sudo chown alunex:alunex alunex-pulse
cd alunex-pulse

# Upload via git
git clone https://github.com/yourusername/alunex-pulse.git .

# Or upload via SCP from local machine:
# scp -r alunex-pulse-app alunex@your_server_ip:/var/www/alunex-pulse

# Install backend dependencies
cd backend
npm install --production

# Create .env file
nano .env
# Add all environment variables

# Build frontend
cd ../frontend
npm install
npm run build
```

### Step 7: Setup PM2 (Process Manager)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /var/www/alunex-pulse/backend
pm2 start src/server.js --name alunex-backend

# Save PM2 configuration
pm2 save
pm2 startup
# Run the command that PM2 outputs
```

### Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/alunex-pulse
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    root /var/www/alunex-pulse/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket for Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/alunex-pulse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

---

## Environment Configuration

### Production Environment Variables

**Backend (.env)**:
```env
# Server
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/alunex-pulse

# JWT
JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=https://yourdomain.com

# OAuth
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-production-microsoft-secret
MICROSOFT_CALLBACK_URL=https://api.yourdomain.com/api/auth/microsoft/callback

# Email
RESEND_API_KEY=re_your_production_api_key
# OR
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-email-password
```

**Frontend (.env.production)**:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Post-Deployment

### 1. Test Functionality

- [ ] User registration
- [ ] User login (email/password)
- [ ] OAuth login (Google & Microsoft)
- [ ] Password reset
- [ ] Dashboard loads
- [ ] Projects can be created
- [ ] Tasks can be added
- [ ] Real-time chat works
- [ ] File uploads work
- [ ] Reports generate correctly
- [ ] Dark mode toggle works
- [ ] Password visibility toggle works
- [ ] Emails are sent

### 2. Performance Testing

```bash
# Use tools like:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
```

### 3. Security Scan

```bash
# Check for vulnerabilities
npm audit

# Update packages
npm update
```

### 4. Setup Monitoring

**Recommended tools:**
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Plausible
- **Server monitoring**: Datadog, New Relic

---

## Monitoring & Maintenance

### Daily Tasks
- Check application uptime
- Review error logs
- Monitor server resources

### Weekly Tasks
- Review user feedback
- Check backup integrity
- Update dependencies

### Monthly Tasks
- Security audit
- Performance optimization
- Database cleanup
- Update documentation

### Logs Management

**Backend logs** (PM2):
```bash
pm2 logs alunex-backend
pm2 logs alunex-backend --lines 100
```

**Nginx logs**:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backups

**MongoDB Atlas**:
- Automatic backups enabled by default
- Configure backup schedule in Atlas dashboard

**Self-hosted MongoDB**:
```bash
# Create backup
mongodump --uri="mongodb://localhost/alunex-pulse" --out=/backups/alunex-$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost/alunex-pulse" /backups/alunex-20240101
```

**Automated backups** (cron job):
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * mongodump --uri="mongodb://localhost/alunex-pulse" --out=/backups/alunex-$(date +\%Y\%m\%d)
```

---

## Troubleshooting Production Issues

### Application Not Starting

Check logs:
```bash
pm2 logs
# or
heroku logs --tail
```

Common issues:
- Environment variables not set
- Port already in use
- Database connection failed

### 502 Bad Gateway (Nginx)

```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues

- Verify MongoDB is running
- Check IP whitelist (MongoDB Atlas)
- Verify connection string
- Check network connectivity

### OAuth Not Working

- Verify redirect URIs match exactly
- Check environment variables
- Ensure HTTPS is enabled
- Clear browser cookies

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Deploy multiple backend instances
- Use Redis for session storage
- Implement message queue (Bull, RabbitMQ)

### Database Scaling
- MongoDB Atlas auto-scaling
- Read replicas
- Sharding for large datasets
- Database indexing

### CDN for Frontend
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

---

## Rollback Strategy

### Quick Rollback

**Render/Heroku**:
- Use platform rollback feature
- Previous deployments are saved

**VPS with PM2**:
```bash
# Keep previous version
cd /var/www
cp -r alunex-pulse alunex-pulse-backup-$(date +%Y%m%d)

# Rollback
pm2 stop alunex-backend
rm -rf alunex-pulse
mv alunex-pulse-backup-20240101 alunex-pulse
pm2 start alunex-backend
```

---

**Deployment Complete! 🚀**

Your application is now live and ready for users!
