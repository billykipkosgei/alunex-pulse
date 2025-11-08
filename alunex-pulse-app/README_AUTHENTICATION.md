# Alunex Pulse App - Authentication Guide

## Authentication Methods

The Alunex Pulse App supports three authentication methods:

### 1. Email/Password Authentication (Ready to Use)

Traditional authentication using email and password.

**Default Admin Credentials:**
- Email: `admin@alunex.com`
- Password: `admin123`

**Features:**
- Secure password hashing with bcrypt
- JWT token-based session management
- Remember me functionality
- Password reset capability (link placeholder)

### 2. Google OAuth (Production Ready)

Sign in with your Google account.

**Setup Required:**
- Follow the instructions in `OAUTH_SETUP_GUIDE.md`
- Configure Google Cloud Console
- Add credentials to backend `.env` file

**Features:**
- Single-click Google sign-in
- Automatic account creation on first login
- Secure OAuth 2.0 flow
- User profile sync (name, email, avatar)

### 3. Microsoft OAuth (Production Ready)

Sign in with your Microsoft account.

**Setup Required:**
- Follow the instructions in `OAUTH_SETUP_GUIDE.md`
- Configure Azure Active Directory
- Add credentials to backend `.env` file

**Features:**
- Single-click Microsoft sign-in
- Automatic account creation on first login
- Secure OAuth 2.0 flow
- Works with both personal and organizational Microsoft accounts

## Login Page Features

### Responsive Design
- **Desktop**: Google and Microsoft buttons displayed side-by-side
- **Mobile**: Buttons stack vertically for better usability
- **Scrollable**: Form adapts to small screens with proper centering

### User Experience
- Clear error messages for failed authentication
- Loading states during authentication
- Smooth OAuth redirect flow
- Automatic token handling

## Quick Start

### For Development

1. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the App:**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5001`

5. **Login:**
   - Use default admin credentials, OR
   - Set up OAuth following `OAUTH_SETUP_GUIDE.md`

### For Production

1. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Update all production URLs
   - Configure OAuth credentials (see `OAUTH_SETUP_GUIDE.md`)

2. **Database:**
   - Set up MongoDB Atlas or your preferred MongoDB hosting
   - Update `MONGODB_URI` in `.env`

3. **OAuth Configuration:**
   - Complete Google OAuth setup
   - Complete Microsoft OAuth setup
   - Update callback URLs to production endpoints

4. **Deploy:**
   - Deploy backend to your server (e.g., Render, Heroku, AWS)
   - Deploy frontend to your hosting (e.g., Vercel, Netlify)
   - Ensure CORS is properly configured

## Security Considerations

### Current Implementation

✅ **Implemented:**
- Password hashing with bcrypt
- JWT token authentication
- Secure OAuth 2.0 flows
- CORS configuration
- Environment variable protection
- Token expiration (7 days default)

### Recommended for Production

📝 **Additional Recommendations:**
1. Enable HTTPS/SSL certificates
2. Implement rate limiting on auth endpoints
3. Add CAPTCHA for login form (prevent bots)
4. Enable 2FA (Two-Factor Authentication)
5. Set up monitoring and logging
6. Implement refresh tokens
7. Add session management
8. Configure CSP (Content Security Policy)

## API Endpoints

### Authentication Endpoints

**POST** `/api/auth/login`
- Email/password login
- Returns JWT token and user data

**POST** `/api/auth/register`
- Create new account
- Requires admin authorization for role assignment

**GET** `/api/auth/me`
- Get current user data
- Requires authentication

**POST** `/api/auth/setup-admin`
- Create initial admin user
- Only works if no admin exists

**GET** `/api/auth/google`
- Initiates Google OAuth flow

**GET** `/api/auth/google/callback`
- Google OAuth callback endpoint

**GET** `/api/auth/microsoft`
- Initiates Microsoft OAuth flow

**GET** `/api/auth/microsoft/callback`
- Microsoft OAuth callback endpoint

## User Roles

The application supports four user roles:

1. **Admin** - Full system access
2. **Manager** - Department and team management
3. **Team Member** - Standard user access
4. **Client** - Limited access for external clients

## Troubleshooting

### Common Issues

**Issue:** "Invalid credentials" error
- **Solution:** Verify email and password are correct
- Check if user account is active

**Issue:** OAuth buttons don't work
- **Solution:**
  1. Verify backend is running
  2. Check OAuth credentials in `.env`
  3. See `OAUTH_SETUP_GUIDE.md` for setup

**Issue:** "Failed to load user data"
- **Solution:**
  1. Check MongoDB connection
  2. Verify JWT_SECRET is set
  3. Check backend logs

**Issue:** Login page too long on small screens
- **Solution:** Already fixed! The page is now scrollable and properly centered

### Getting Help

If you encounter issues:
1. Check the backend console logs
2. Check the browser console for errors
3. Verify `.env` configuration
4. Review `OAUTH_SETUP_GUIDE.md` for OAuth setup
5. Test with email/password login first

## Demo Credentials

For testing purposes, you can use:

**Admin Account:**
- Email: `admin@alunex.com`
- Password: `admin123`

**Note:** Change these credentials immediately in production!

## Development Notes

### Tech Stack
- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** Passport.js, JWT
- **OAuth:** passport-google-oauth20, passport-microsoft

### File Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js          # OAuth configuration
│   ├── controllers/
│   │   └── auth.controller.js   # Auth logic
│   ├── models/
│   │   └── User.model.js        # User schema (supports OAuth)
│   ├── routes/
│   │   └── auth.routes.js       # Auth routes + OAuth
│   └── server.js                # Main server file
├── .env                          # Environment config
└── package.json

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx            # Login page (OAuth integrated)
│   │   └── Login.css            # Responsive styles
│   └── context/
│       └── AuthContext.jsx      # Auth state management
└── package.json
```

## Next Steps

To make the app fully production-ready:

1. ✅ **Complete OAuth Setup** - Follow `OAUTH_SETUP_GUIDE.md`
2. 🔲 **Configure Production Environment** - Update all `.env` variables
3. 🔲 **Set Up Production Database** - MongoDB Atlas or equivalent
4. 🔲 **Enable HTTPS** - SSL certificates for both frontend and backend
5. 🔲 **Add Rate Limiting** - Protect against brute force attacks
6. 🔲 **Implement Monitoring** - Log authentication attempts
7. 🔲 **Set Up Email Service** - For password reset functionality
8. 🔲 **Add 2FA** - Optional but recommended for admin accounts

## Support

For issues or questions:
- Check existing documentation
- Review error logs
- Test with default credentials first
- Ensure all dependencies are installed
