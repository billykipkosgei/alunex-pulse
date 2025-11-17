# Alunex Pulse - Project Management Application

## 🎯 Project Overview

**Alunex Pulse** is a comprehensive project management application designed to streamline team collaboration, task management, and project tracking. Built with modern web technologies, it offers a powerful yet intuitive interface for managing projects efficiently.

---

## 📦 Delivery Package Contents

This delivery package includes:

```
alunex-pulse-app/
├── backend/                     # Node.js/Express backend server
├── frontend/                    # React frontend application
├── documentation/              # Complete project documentation
│   ├── SETUP_GUIDE.md         # Step-by-step setup instructions
│   ├── DEPLOYMENT_GUIDE.md    # Production deployment guide
│   ├── FEATURES.md            # Detailed features documentation
│   └── API_REFERENCE.md       # Backend API documentation
├── .env.example (backend)     # Environment variables template
├── .env.example (frontend)    # Frontend environment template
└── README.md                  # This file
```

---

## ✨ Key Features

### 🔐 Authentication & Security
- **User Registration & Login** with email/password
- **OAuth Integration** (Google & Microsoft)
- **Password Visibility Toggle** - NEW! Eye icon to show/hide passwords
- **JWT-based** authentication
- **Secure password hashing** with bcrypt

### 📊 Project Management
- **Dashboard** with real-time project overview
- **Task Management** - Create, assign, and track tasks
- **Team Collaboration** - Multi-user support
- **Project Timeline** tracking
- **Status Updates** and progress monitoring

### 💬 Communication
- **Real-time Chat** using Socket.IO
- **Team Messaging**
- **Project Comments**
- **Notifications**

### 📈 Reporting & Analytics
- **Project Reports** generation
- **PDF Export** functionality
- **Excel Export** capabilities
- **Performance Metrics**
- **Data Visualization**

### 🎨 User Experience
- **Dark Mode Support** - Toggle between light/dark themes
- **Responsive Design** - Works on all devices
- **Intuitive UI** - Clean, modern interface
- **Accessibility Features**

### 🏢 Organization Management
- **Multi-tenant Architecture**
- **Organization Settings**
- **User Roles & Permissions**
- **Team Management**

---

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern UI framework
- **Vite 7.1.7** - Fast build tool
- **React Router DOM 7.9.5** - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **jsPDF** - PDF generation
- **XLSX** - Excel file handling
- **Driver.js** - User onboarding/tours

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **MongoDB (Mongoose 8.19.2)** - Database
- **Socket.IO 4.8.1** - WebSocket server
- **Passport.js** - OAuth authentication
- **JWT** - Token-based auth
- **Nodemailer** - Email service
- **Resend** - Modern email API
- **Multer** - File upload handling

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ and npm
- **MongoDB** database (local or cloud)
- **Git** (for version control)

### Installation Steps

1. **Extract the project files** to your desired location

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with backend API URL
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

For detailed setup instructions, see **[SETUP_GUIDE.md](documentation/SETUP_GUIDE.md)**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **SETUP_GUIDE.md** | Complete installation and configuration guide |
| **DEPLOYMENT_GUIDE.md** | Production deployment instructions (cPanel, Render, etc.) |
| **FEATURES.md** | Detailed feature descriptions and usage |
| **API_REFERENCE.md** | Backend API endpoints documentation |

---

## 🔑 Environment Configuration

### Backend Environment Variables
Required variables (see `.env.example`):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `MICROSOFT_CLIENT_ID` & `MICROSOFT_CLIENT_SECRET` - For Microsoft OAuth
- Email service configuration (Nodemailer or Resend)

### Frontend Environment Variables
Required variables:
- `VITE_API_URL` - Backend API URL

---

## 🆕 Recent Updates

### Password Visibility Toggle (Latest)
- Added eye icon to password fields in Login and Registration forms
- Users can now toggle password visibility
- Separate toggle for password and confirm password fields
- Accessible with proper ARIA labels
- Smooth animations and hover effects

### Other Recent Features
- Multi-tenant organization support
- Dark mode implementation
- Email error handling improvements
- Report download functionality
- OAuth production setup

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
├── .env.example
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # React Context (State)
│   ├── services/       # API services
│   ├── utils/          # Utilities
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── .env.example
└── package.json
```

---

## 🧪 Testing

### Run Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build
# Outputs to: frontend/dist/

# Backend
# No build needed - runs directly with Node.js
```

---

## 🌐 Deployment

The application can be deployed to various platforms:

- **cPanel** - Traditional web hosting
- **Render** - Modern cloud platform
- **Heroku** - Platform as a Service
- **DigitalOcean** - VPS hosting
- **AWS** - Scalable cloud infrastructure

See **[DEPLOYMENT_GUIDE.md](documentation/DEPLOYMENT_GUIDE.md)** for platform-specific instructions.

---

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Configured for allowed origins
- **Input Validation** - express-validator for request validation
- **SQL Injection Prevention** - MongoDB parameterized queries
- **XSS Protection** - React built-in escaping
- **Environment Variables** - Sensitive data in .env files

---

## 📧 Support & Maintenance

### Common Issues
1. **MongoDB Connection Errors**
   - Check MongoDB URI in `.env`
   - Ensure MongoDB service is running
   - Verify network connectivity

2. **OAuth Not Working**
   - Verify client IDs and secrets
   - Check redirect URLs in provider console
   - Ensure frontend/backend URLs are correct

3. **CORS Errors**
   - Update `FRONTEND_URL` in backend `.env`
   - Check allowed origins in backend config

### Getting Help
- Review documentation files
- Check error logs in terminal/console
- Verify environment variables
- Ensure all dependencies are installed

---

## 📝 License

This project is delivered as a complete package for your use.

---

## 🎉 Thank You!

Thank you for choosing my services on Fiverr! This project has been carefully developed with attention to detail, security, and user experience.

### Delivery Checklist
- ✅ Complete source code (frontend & backend)
- ✅ Comprehensive documentation
- ✅ Setup and deployment guides
- ✅ Environment configuration examples
- ✅ Latest features implemented (password toggle)
- ✅ Production-ready build
- ✅ Security best practices implemented

If you have any questions or need assistance with setup, please don't hesitate to reach out!

---

**Developed with ❤️ for efficient project management**
