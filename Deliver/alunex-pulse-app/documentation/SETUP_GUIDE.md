# Alunex Pulse - Complete Setup Guide

This guide will walk you through setting up the Alunex Pulse application from scratch on your local machine or server.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [OAuth Configuration](#oauth-configuration)
6. [Email Configuration](#email-configuration)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16.x or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v5.x or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR use MongoDB Atlas (cloud): [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation
```bash
node --version    # Should show v16.x or higher
npm --version     # Should show 7.x or higher
mongo --version   # If using local MongoDB
```

---

## Database Setup

### Option 1: Local MongoDB

1. **Install MongoDB** on your machine
2. **Start MongoDB service**:

   **Windows:**
   ```bash
   # Open Command Prompt as Administrator
   net start MongoDB
   ```

   **macOS/Linux:**
   ```bash
   sudo systemctl start mongod
   # OR
   brew services start mongodb-community
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongo
   # You should see MongoDB shell
   ```

4. **Create database** (optional - will be auto-created):
   ```bash
   use alunex-pulse
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a free cluster**:
   - Choose your cloud provider
   - Select region closest to you
   - Choose M0 (free tier)
3. **Create database user**:
   - Database Access → Add New User
   - Set username & password
   - Save credentials securely
4. **Whitelist IP address**:
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` for development (allow from anywhere)
   - For production, add specific IPs
5. **Get connection string**:
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/alunex-pulse?retryWrites=true&w=majority`

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd alunex-pulse-app/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- passport (Google & Microsoft OAuth)
- nodemailer
- socket.io
- And more...

### Step 3: Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Open `.env` in a text editor and configure the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/alunex-pulse
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alunex-pulse

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Microsoft OAuth (Optional - for Microsoft login)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/auth/microsoft/callback

# Email Configuration (Choose one)
# Option 1: Standard SMTP (Gmail, etc.)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Option 2: Resend (Modern email API)
RESEND_API_KEY=re_your_resend_api_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Step 5: Generate JWT Secret

For JWT_SECRET, generate a secure random string:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Or use online generator:** [RandomKeygen](https://randomkeygen.com/)

### Step 6: Start Backend Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

Open a NEW terminal window (keep backend running):
```bash
cd alunex-pulse-app/frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- React 19
- Vite
- React Router
- Axios
- Socket.IO client
- jsPDF, XLSX (for exports)
- And more...

### Step 3: Create Environment File
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Open `.env` and set:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

**Important Notes:**
- For local development: `http://localhost:5000/api`
- For production: Your actual backend URL
- Vite requires `VITE_` prefix for environment variables

### Step 5: Start Development Server
```bash
npm run dev
```

You should see:
```
  VITE v7.1.12  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the login page!

---

## OAuth Configuration

### Google OAuth Setup

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Create a new project**:
   - Click "Select a project" → "New Project"
   - Name: "Alunex Pulse"
   - Click "Create"

3. **Enable Google+ API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Alunex Pulse Web"

5. **Configure OAuth consent screen**:
   - User Type: External
   - App name: "Alunex Pulse"
   - Support email: Your email
   - Developer contact: Your email

6. **Add Authorized URLs**:

   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5000
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```

7. **Copy Credentials**:
   - Copy "Client ID" → paste in `.env` as `GOOGLE_CLIENT_ID`
   - Copy "Client Secret" → paste in `.env` as `GOOGLE_CLIENT_SECRET`

8. **Restart backend** to apply changes

### Microsoft OAuth Setup

1. **Go to Azure Portal**:
   - Visit: https://portal.azure.com/

2. **Register Application**:
   - Navigate to "Azure Active Directory"
   - Click "App registrations" → "New registration"
   - Name: "Alunex Pulse"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI:
     - Type: Web
     - URL: `http://localhost:5000/api/auth/microsoft/callback`
   - Click "Register"

3. **Copy Application (client) ID**:
   - From the Overview page, copy "Application (client) ID"
   - Paste in `.env` as `MICROSOFT_CLIENT_ID`

4. **Create Client Secret**:
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: "Alunex Pulse Secret"
   - Expires: Choose duration (24 months recommended)
   - Click "Add"
   - **COPY THE VALUE IMMEDIATELY** (shown only once)
   - Paste in `.env` as `MICROSOFT_CLIENT_SECRET`

5. **Configure API Permissions**:
   - Go to "API permissions"
   - Add permissions: Microsoft Graph → Delegated
   - Select: `User.Read`, `email`, `profile`, `openid`
   - Click "Grant admin consent"

6. **Restart backend** to apply changes

---

## Email Configuration

### Option 1: Gmail SMTP

1. **Enable 2-Factor Authentication** on your Gmail account:
   - https://myaccount.google.com/security

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter: "Alunex Pulse"
   - Click "Generate"
   - **Copy the 16-character password**

3. **Update .env**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

### Option 2: Resend (Recommended)

1. **Sign up** at [Resend](https://resend.com/)
2. **Verify your domain** (or use their test domain)
3. **Create API Key**:
   - Dashboard → API Keys → Create API Key
   - Name: "Alunex Pulse"
   - Permission: "Sending access"
   - Click "Create"
   - **Copy the API key**

4. **Update .env**:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

---

## Testing the Application

### 1. Test User Registration

1. Navigate to: `http://localhost:5173/register`
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: testpass123
   - Confirm Password: testpass123
3. Click "Sign Up"
4. **Test Password Toggle**: Click the eye icon to show/hide password
5. You should be redirected to the dashboard

### 2. Test User Login

1. Log out (if logged in)
2. Navigate to: `http://localhost:5173/login`
3. Enter credentials:
   - Email: test@example.com
   - Password: testpass123
4. **Test Password Toggle**: Click the eye icon
5. Click "Sign In"
6. You should see the dashboard

### 3. Test OAuth Login

1. Click "Google" or "Microsoft" button
2. Select/login with your account
3. Grant permissions
4. You should be redirected to dashboard

### 4. Test Dark Mode

1. In the dashboard, look for theme toggle
2. Click to switch between light/dark mode
3. Settings should persist across page reloads

### 5. Test Real-time Features

1. Open application in two browser windows
2. Login as different users
3. Send messages in chat
4. Verify real-time updates

---

## Troubleshooting

### Backend Won't Start

**Error: MongoDB connection failed**
```
Solution:
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check network connectivity
- For Atlas: Verify IP whitelist
```

**Error: Port 5000 already in use**
```
Solution:
- Change PORT in .env to 5001 or any free port
- Update VITE_API_URL in frontend .env accordingly
```

**Error: Module not found**
```
Solution:
- Delete node_modules folder
- Run: npm install
```

### Frontend Won't Start

**Error: Cannot connect to backend**
```
Solution:
- Ensure backend is running
- Check VITE_API_URL in .env
- Verify no firewall blocking localhost
```

**Error: Blank white screen**
```
Solution:
- Check browser console for errors
- Clear browser cache
- Restart dev server
```

### OAuth Not Working

**Google OAuth fails**
```
Solution:
- Verify client ID and secret
- Check redirect URI matches exactly
- Ensure Google+ API is enabled
- Check OAuth consent screen is configured
```

**Microsoft OAuth fails**
```
Solution:
- Verify application ID and secret
- Check redirect URI in Azure portal
- Ensure API permissions are granted
- Try clearing browser cookies
```

### Email Not Sending

**Gmail SMTP fails**
```
Solution:
- Verify 2FA is enabled
- Check app password is correct (16 chars, no spaces)
- Ensure EMAIL_HOST is smtp.gmail.com
- Check EMAIL_PORT is 587
```

**Resend fails**
```
Solution:
- Verify API key is correct
- Check domain is verified
- Ensure API key has sending permissions
```

### Password Toggle Not Working

**Eye icon not visible**
```
Solution:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if CSS loaded properly
- Verify latest code is deployed
```

### Database Issues

**Users not saving**
```
Solution:
- Check MongoDB connection
- Verify database name in URI
- Check backend logs for errors
- Ensure proper schema validation
```

---

## Next Steps

After successful setup:

1. ✅ **Create test users** and explore features
2. ✅ **Review** [FEATURES.md](FEATURES.md) for functionality guide
3. ✅ **Configure** organization settings
4. ✅ **Set up** email templates
5. ✅ **Customize** branding (logo, colors)
6. ✅ **Read** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) when ready for production

---

## Development Tips

### Hot Reload
- Both backend (with nodemon) and frontend (with Vite) support hot reload
- Changes are reflected automatically
- No need to restart servers

### Debugging
- Backend: Check terminal logs
- Frontend: Check browser console (F12)
- Network issues: Check Network tab in DevTools

### Code Organization
- Backend: Follow MVC pattern (Models, Controllers, Routes)
- Frontend: Component-based architecture
- Keep components small and reusable

---

## Support

If you encounter issues not covered here:

1. Check error messages carefully
2. Review relevant documentation
3. Verify environment variables
4. Check that all services are running
5. Review logs for detailed error information

---

**Setup Complete! 🎉**

Your Alunex Pulse application should now be running successfully on your local machine.
