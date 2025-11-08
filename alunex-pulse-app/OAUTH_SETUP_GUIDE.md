# OAuth Setup Guide for Alunex Pulse App

This guide will help you configure Google and Microsoft OAuth authentication for the Alunex Pulse App.

## Overview

The application now supports three authentication methods:
1. **Email/Password** - Traditional login (already working)
2. **Google OAuth** - Sign in with Google
3. **Microsoft OAuth** - Sign in with Microsoft

## Prerequisites

Before setting up OAuth, ensure you have:
- A Google Cloud Platform account (for Google OAuth)
- An Azure account (for Microsoft OAuth)
- Access to the backend `.env` file

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Click on "APIs & Services" > "Credentials"

### Step 2: Configure OAuth Consent Screen

1. Click on "OAuth consent screen" in the left sidebar
2. Select "External" user type and click "Create"
3. Fill in the required information:
   - **App name**: Alunex Pulse App
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. Add scopes (optional for now) and click "Save and Continue"
6. Click "Back to Dashboard"

### Step 3: Create OAuth Credentials

1. Click on "Credentials" in the left sidebar
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: Alunex Pulse Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - Your production frontend URL (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:5001/api/auth/google/callback` (development)
     - Your production backend URL + `/api/auth/google/callback` (e.g., `https://api.yourdomain.com/api/auth/google/callback`)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 4: Update Backend .env File

Open `backend/.env` and update:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

For production, update the callback URL to match your production backend URL.

## Microsoft OAuth Setup

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"

### Step 2: Configure Application

1. Fill in the application details:
   - **Name**: Alunex Pulse App
   - **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: Select "Web" and enter:
     - `http://localhost:5001/api/auth/microsoft/callback` (development)
     - Your production backend URL + `/api/auth/microsoft/callback` (for production)
2. Click "Register"

### Step 3: Create Client Secret

1. In your app registration, go to "Certificates & secrets"
2. Click "New client secret"
3. Add a description (e.g., "Alunex Pulse Production")
4. Select an expiration period
5. Click "Add"
6. **Important**: Copy the client secret value immediately (it won't be shown again)

### Step 4: Configure API Permissions

1. Go to "API permissions" in your app registration
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `User.Read`
   - `email`
   - `profile`
6. Click "Add permissions"
7. Click "Grant admin consent" (if you have admin rights)

### Step 5: Update Backend .env File

Copy the Application (client) ID from the "Overview" page and update `backend/.env`:

```env
MICROSOFT_CLIENT_ID=your_application_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
MICROSOFT_CALLBACK_URL=http://localhost:5001/api/auth/microsoft/callback
```

For production, update the callback URL to match your production backend URL.

## Production Deployment Checklist

When deploying to production, make sure to:

### Backend (.env)

1. Update `FRONTEND_URL` to your production frontend URL
2. Update `GOOGLE_CALLBACK_URL` to your production backend URL + `/api/auth/google/callback`
3. Update `MICROSOFT_CALLBACK_URL` to your production backend URL + `/api/auth/microsoft/callback`
4. Ensure `NODE_ENV=production`

Example production configuration:

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
MICROSOFT_CALLBACK_URL=https://api.yourdomain.com/api/auth/microsoft/callback
```

### Google Cloud Console

1. Add your production frontend URL to "Authorized JavaScript origins"
2. Add your production callback URL to "Authorized redirect URIs"

### Azure Portal

1. Add your production callback URL to "Redirect URIs" in your app registration
2. Update the "Web" platform settings if needed

## Testing OAuth

### Local Testing

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend server: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Click "Google" or "Microsoft" button
5. Complete the OAuth flow
6. You should be redirected to the dashboard

### Troubleshooting

**"Redirect URI mismatch" error**
- Ensure the redirect URI in your OAuth provider matches exactly with the one in your `.env` file
- Check that the protocol (http/https) and port numbers match

**"Invalid client" error**
- Verify that your Client ID and Client Secret are correct in the `.env` file
- Make sure you copied the entire secret without extra spaces

**OAuth button doesn't redirect**
- Check that the backend server is running
- Verify the API_URL in the frontend is correct
- Check browser console for errors

**"Failed to load user data" after OAuth**
- Ensure the JWT_SECRET is set in the backend `.env`
- Verify MongoDB is running and connected
- Check backend logs for errors

## Security Notes

1. **Never commit** `.env` files to version control
2. Use strong, unique client secrets
3. Regularly rotate client secrets
4. Enable HTTPS in production
5. Monitor OAuth activity in Google/Azure dashboards
6. Implement rate limiting for authentication endpoints (recommended for production)

## Support

If you encounter any issues:
1. Check the backend server logs
2. Check the browser console for frontend errors
3. Verify all OAuth credentials are correct
4. Ensure MongoDB is running
5. Test with a simple email/password login first to isolate OAuth issues

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Passport.js Documentation](http://www.passportjs.org/docs/)
