# Render.com Environment Variables Configuration

## Backend Environment Variables for Render.com

Go to your Render.com dashboard > Your Service > Environment tab and add these variables:

### Required Variables

```
PORT=5001
NODE_ENV=production
```

### MongoDB Configuration
```
MONGODB_URI=mongodb+srv://alunex_admin:testingpassword123@alunex-pulse-cluster.qfn9arq.mongodb.net/alunex-pulse?retryWrites=true&w=majority&appName=alunex-pulse-cluster
```

**Note:** Update the MongoDB URI if you changed the password or cluster name.

### JWT Configuration
```
JWT_SECRET=AlunexPulse2024$SecureJWT#Key!ProjectManagement@System9876RandomString
JWT_EXPIRE=7d
```

**IMPORTANT:** Use a strong, unique JWT secret in production!

### Frontend URL (for CORS)
```
FRONTEND_URL=https://billyk.online/alunex-production
```

### Socket.io Configuration
```
SOCKET_IO_CORS_ORIGIN=https://billyk.online/alunex-production
```

### OAuth Configuration - Google

**Get credentials from:** https://console.cloud.google.com/apis/credentials

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/google/callback
```

**Important OAuth Setup Steps:**

1. In Google Cloud Console, add these to your OAuth client:
   - **Authorized JavaScript origins:**
     - `https://billyk.online`
   - **Authorized redirect URIs:**
     - `https://alunex-pulse.onrender.com/api/auth/google/callback`

### OAuth Configuration - Microsoft

**Get credentials from:** https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

```
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
MICROSOFT_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/microsoft/callback
```

**Important OAuth Setup Steps:**

1. In Azure Portal > Your App Registration > Authentication:
   - Add **Redirect URI:** `https://alunex-pulse.onrender.com/api/auth/microsoft/callback`
   - Platform type: Web

### Optional Integration Keys
```
CLOCKIFY_API_KEY=
GOOGLE_DRIVE_API_KEY=
CLICKUP_API_KEY=
```

## Quick Copy-Paste Format for Render.com

Copy these and paste them into Render.com environment variables (one per line):

```
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb+srv://alunex_admin:testingpassword123@alunex-pulse-cluster.qfn9arq.mongodb.net/alunex-pulse?retryWrites=true&w=majority&appName=alunex-pulse-cluster
JWT_SECRET=AlunexPulse2024$SecureJWT#Key!ProjectManagement@System9876RandomString
JWT_EXPIRE=7d
FRONTEND_URL=https://billyk.online/alunex-production
SOCKET_IO_CORS_ORIGIN=https://billyk.online/alunex-production
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/google/callback
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
MICROSOFT_CALLBACK_URL=https://alunex-pulse.onrender.com/api/auth/microsoft/callback
CLOCKIFY_API_KEY=
GOOGLE_DRIVE_API_KEY=
CLICKUP_API_KEY=
```

## After Setting Environment Variables

1. Click "Save Changes" in Render.com
2. Render will automatically redeploy your service
3. Wait for deployment to complete
4. Test the backend health endpoint: `https://alunex-pulse.onrender.com/api/health`

## Important Notes

- Render.com automatically uses the PORT environment variable
- Make sure to keep your OAuth secrets secure
- Never commit the actual secrets to GitHub
- The free tier on Render spins down after inactivity - first request may be slow
