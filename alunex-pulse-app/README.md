# Alunex Pulse - Project Management System

A comprehensive time tracking and project management system designed specifically for the aluminum & glass industry.

## Features

- User authentication with JWT
- Time tracking with Clockify integration
- Task management with Kanban boards
- Department & budget management
- Real-time team chat (Socket.io)
- File sharing with Google Drive integration
- Video calls with Jitsi Meet
- Reports & analytics
- Multi-user roles (Admin, Manager, Team Member, Client)
- Multi-country & timezone support

## Tech Stack

### Frontend
- React 18 + Vite
- React Router for navigation
- Axios for API calls
- Socket.io-client for real-time chat
- CSS3 with CSS variables

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.io for real-time features
- Bcrypt for password hashing

## Color Scheme

The application uses the exact colors from the approved wireframe:

- **Primary Blue:** #2563eb
- **Background:** #f8fafc
- **Text Dark:** #1e293b
- **Success Green:** #10b981
- **Warning Orange:** #f59e0b
- **Danger Red:** #dc2626

## Project Structure

```
alunex-pulse-app/
├── backend/           # Node.js Express backend
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth & validation
│   │   ├── models/    # Mongoose models
│   │   ├── routes/    # API routes
│   │   └── server.js  # Main server file
│   └── package.json
│
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/   # React context (Auth)
│   │   ├── pages/     # Page components
│   │   ├── services/  # API services
│   │   ├── utils/     # Helper functions
│   │   ├── App.jsx    # Main app component
│   │   └── index.css  # Global styles
│   └── package.json
│
├── PROJECT-STATUS.md  # Detailed project status
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (free tier)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
CLOCKIFY_API_KEY=your_clockify_api_key
GOOGLE_DRIVE_API_KEY=your_google_drive_api_key
CLICKUP_API_KEY=your_clickup_api_key
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `GET /api/departments/:id` - Get single department
- `PUT /api/departments/:id` - Update department

## User Roles

1. **Admin** - Full access to all features
2. **Manager** - Project and team management
3. **Team Member** - Task and time tracking
4. **Client** - View-only access to assigned projects

## Database Models

### User
- Name, email, password (hashed)
- Role (admin, manager, team_member, client)
- Department reference
- Timezone & country
- Theme preferences

### Project
- Name, description, status, priority
- Budget (allocated, spent, currency)
- Profit margin
- Start/end dates
- Manager, team members, client
- Progress percentage

### Task
- Title, description
- Project reference
- Status (todo, in_progress, completed, blocked)
- Assigned users, department
- Due date, estimated/actual hours
- Progress percentage
- Attachments & comments

### Department
- Name, description
- Department head
- Team members
- Budget (allocated, spent)
- Categories for tasks

## Deployment

### Frontend (cPanel)
1. Build the production version:
```bash
cd frontend
npm run build
```

2. Upload the `dist` folder contents to your cPanel public_html directory

### Backend (Render.com)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env`

### Database (MongoDB Atlas)
1. Create a free cluster
2. Add database user
3. Whitelist IP addresses
4. Get connection string
5. Add to backend `.env` file

## Features by Page

### Dashboard
- Overview statistics
- Active projects selector
- Recent tasks list
- Team activity feed

### Time Tracking
- Live timer
- Time logs table
- Weekly summary
- Clockify integration

### Task Management
- Kanban board (drag & drop)
- Task filtering
- Progress tracking
- WIP calculation

### Departments
- Budget allocation
- Team assignments
- Performance metrics
- Category management

### Team Chat
- Real-time messaging
- Channel/room system
- Typing indicators
- File attachments

### File Sharing
- File upload
- Google Drive integration
- Link-only saving
- Activity history

### Reports
- Time by project charts
- Team performance graphs
- Budget utilization
- Export to PDF/Excel

### Video Calls
- Jitsi Meet integration
- Screen sharing
- Meeting recording
- Participant management

### Settings
- User profile
- Team management
- API integrations
- Notification preferences

## Support

For issues or questions, please contact the development team.

## License

Proprietary - Alunex Project Management System

---

**Version:** 1.0.0
**Last Updated:** 2025-11-01
