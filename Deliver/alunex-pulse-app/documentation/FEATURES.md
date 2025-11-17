# Alunex Pulse - Features Documentation

Complete guide to all features and functionality in the Alunex Pulse application.

---

## Table of Contents
1. [Authentication & User Management](#authentication--user-management)
2. [Dashboard](#dashboard)
3. [Project Management](#project-management)
4. [Task Management](#task-management)
5. [Team Collaboration](#team-collaboration)
6. [Communication](#communication)
7. [Reporting & Analytics](#reporting--analytics)
8. [Settings & Preferences](#settings--preferences)
9. [Additional Features](#additional-features)

---

## Authentication & User Management

### User Registration

**Location**: `/register`

**Features**:
- Full name input validation
- Email validation (must be valid email format)
- Password requirements:
  - Minimum 6 characters
  - Must match confirmation password
- **Password Visibility Toggle** ✨ NEW
  - Eye icon to show/hide password
  - Separate toggle for password and confirm password fields
  - Enhances user experience and reduces typos
- Real-time validation feedback
- Error message display
- OAuth quick registration (Google & Microsoft)

**How to Use**:
1. Navigate to registration page
2. Enter your full name
3. Enter valid email address
4. Create password (min 6 characters)
5. Click eye icon to verify password is correct
6. Confirm password
7. Click "Sign Up" or use OAuth providers

**Security**:
- Passwords are hashed with bcrypt
- Email uniqueness validation
- Protected against common vulnerabilities

---

### User Login

**Location**: `/login`

**Features**:
- Email/password authentication
- **Password Visibility Toggle** ✨ NEW
  - Click eye icon to show/hide password
  - Helps verify credentials before submission
  - Accessible with screen readers
- "Remember Me" option
- OAuth login (Google & Microsoft)
- Forgot password link
- Session management with JWT
- Auto-redirect to dashboard on success

**How to Use**:
1. Enter your email
2. Enter password
3. (Optional) Click eye icon to verify password
4. (Optional) Check "Remember Me"
5. Click "Sign In"

**Alternative**: Click Google or Microsoft button for OAuth login

---

### OAuth Integration

**Supported Providers**:
- Google
- Microsoft

**Features**:
- One-click authentication
- No password required
- Secure authorization flow
- Automatic account creation
- Profile data import (name, email)

**How it Works**:
1. Click OAuth provider button
2. Redirected to provider's login page
3. Grant permissions
4. Redirected back to application
5. Automatically logged in

**Security**:
- OAuth 2.0 protocol
- Secure callback handling
- No password storage needed

---

### Password Management

**Features**:
- Password visibility toggle on all password fields
- Secure password reset flow
- Email verification for reset
- Strong password requirements
- Password change in settings

---

## Dashboard

**Location**: `/dashboard` (default after login)

### Overview Section

**Features**:
- Welcome message with user name
- Quick stats overview:
  - Total projects
  - Active tasks
  - Team members
  - Upcoming deadlines
- Recent activity feed
- Quick action buttons

### Navigation

**Features**:
- Sidebar navigation to all sections
- Top navbar with user menu
- Search functionality
- Notifications dropdown
- Theme toggle (light/dark mode)

---

## Project Management

### Create Project

**Features**:
- Project name and description
- Start and end dates
- Project status selection
- Team member assignment
- Project category/tags
- File attachments
- Custom fields

**How to Use**:
1. Click "New Project" button
2. Fill in project details
3. Assign team members
4. Set timeline
5. Click "Create Project"

### Project Dashboard

**Features**:
- Project overview
- Progress visualization
- Task breakdown
- Team members list
- Recent updates
- Quick actions (edit, delete, archive)

### Project Timeline

**Features**:
- Gantt chart view
- Milestone tracking
- Dependency visualization
- Drag-and-drop scheduling
- Timeline zoom controls

### Project Settings

**Features**:
- Edit project details
- Manage team access
- Set permissions
- Archive/delete project
- Export project data

---

## Task Management

### Create Task

**Features**:
- Task title and description
- Priority levels (Low, Medium, High, Critical)
- Assignee selection
- Due date picker
- Status selection (Todo, In Progress, Review, Done)
- Tags and labels
- Checklist items
- File attachments
- Comments section

**How to Use**:
1. Navigate to project
2. Click "Add Task"
3. Fill task details
4. Assign to team member
5. Set due date and priority
6. Click "Create Task"

### Task Board (Kanban)

**Features**:
- Drag-and-drop cards
- Column customization
- Swim lanes
- Quick edit on cards
- Filter and search
- Card color coding by priority

### Task List View

**Features**:
- Sortable columns
- Bulk actions
- Quick filters
- Inline editing
- Export to Excel/CSV

### Task Details

**Features**:
- Full description editor
- Activity log
- Comments and mentions
- File attachments
- Subtasks/checklist
- Time tracking
- Status updates
- Assignment history

---

## Team Collaboration

### Team Members

**Features**:
- Add/remove members
- Role assignment (Admin, Manager, Member)
- Permission management
- Member profiles
- Activity tracking
- Workload view

### Permissions & Roles

**Role Types**:

1. **Admin**
   - Full system access
   - User management
   - Organization settings
   - Billing management

2. **Manager**
   - Project creation
   - Team management
   - Reports access
   - Task assignment

3. **Member**
   - View projects
   - Complete assigned tasks
   - Comment and collaborate
   - Upload files

### Mentions & Notifications

**Features**:
- @mention team members in comments
- Real-time notifications
- Email notifications
- Notification preferences
- Mark as read/unread

---

## Communication

### Real-time Chat

**Features**:
- Team chat channels
- Direct messages
- File sharing in chat
- Message search
- Message history
- Online/offline status
- Typing indicators
- Read receipts

**How to Use**:
1. Click "Chat" in sidebar
2. Select channel or team member
3. Type message
4. Press Enter to send
5. Upload files with attachment icon

**Technology**:
- Powered by Socket.IO
- Instant message delivery
- Works across multiple devices

### Project Comments

**Features**:
- Comment on tasks
- Reply threads
- Edit/delete own comments
- @mentions
- File attachments
- Emoji reactions
- Comment history

### Activity Feed

**Features**:
- Real-time updates
- Filter by activity type
- User-specific filters
- Date range selection
- Export activity log

---

## Reporting & Analytics

### Project Reports

**Features**:
- Project progress reports
- Task completion statistics
- Team performance metrics
- Time tracking reports
- Custom date ranges
- Visual charts and graphs

### Export Options

**PDF Export**:
- Professional formatting
- Company branding
- Charts and tables
- Summary sections
- Download or email

**Excel Export**:
- Detailed data sheets
- Multiple worksheets
- Formulas included
- Formatted tables
- Filter-ready data

**How to Generate Report**:
1. Navigate to Reports section
2. Select report type
3. Choose date range
4. Apply filters
5. Click "Generate Report"
6. Choose export format (PDF/Excel)
7. Download file

### Dashboard Analytics

**Features**:
- Visual dashboards
- Interactive charts
- Real-time data
- Customizable widgets
- Key performance indicators (KPIs)

**Available Metrics**:
- Projects completed vs in-progress
- Task completion rate
- Team productivity
- Overdue tasks
- Upcoming deadlines
- Resource allocation

---

## Settings & Preferences

### User Profile

**Features**:
- Update name and email
- Change password
- Profile picture upload
- Bio/description
- Contact information
- Social links

### Preferences

**Features**:
- **Dark Mode Toggle** ✨
  - Switch between light and dark themes
  - Persists across sessions
  - Easy on eyes for long work sessions
- Language selection
- Timezone settings
- Date format preferences
- Notification settings
- Email frequency

**How to Enable Dark Mode**:
1. Click user menu (top right)
2. Go to "Settings" or "Preferences"
3. Toggle "Dark Mode" switch
4. Theme changes immediately
5. Preference saved automatically

### Organization Settings

**Features**:
- Organization name and details
- Logo upload
- Color scheme customization
- Branding settings
- Team management
- Billing information

### Notification Settings

**Preferences**:
- Email notifications on/off
- Push notifications
- Notification frequency
- Activity types to notify
- Quiet hours
- Digest emails

---

## Additional Features

### File Management

**Features**:
- Upload files to projects/tasks
- Supported formats: Documents, Images, PDFs, etc.
- File preview
- Download files
- Delete files
- File version history
- Storage quota display

**Limits**:
- Maximum file size: 5MB (configurable)
- Supported types: All common formats

### Search Functionality

**Features**:
- Global search
- Search across:
  - Projects
  - Tasks
  - Comments
  - Files
  - Team members
- Advanced filters
- Search history
- Quick results dropdown

### Data Export

**What Can Be Exported**:
- All projects
- Task lists
- Team data
- Activity logs
- Reports

**Export Formats**:
- PDF for reports
- Excel for data
- CSV for compatibility
- JSON for developers

### Keyboard Shortcuts

**Available Shortcuts**:
- `Ctrl+K` - Quick search
- `Ctrl+N` - New project/task
- `Ctrl+/` - Show shortcuts
- `Esc` - Close modals
- More shortcuts available in-app

### Responsive Design

**Features**:
- Mobile-friendly interface
- Tablet optimization
- Desktop full experience
- Touch-friendly controls
- Adaptive layouts

**Supported Devices**:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)

### Accessibility

**Features**:
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus indicators
- Alt text on images
- Semantic HTML

### Security Features

**Implemented**:
- JWT authentication
- Password hashing (bcrypt)
- HTTPS/SSL support
- CORS protection
- Rate limiting
- Input validation
- XSS protection
- CSRF tokens
- Secure session management

---

## Recent Updates

### Latest Features (v1.0)

1. **Password Visibility Toggle** ✨
   - Eye icons on all password fields
   - Toggle between hidden and visible password
   - Improves user experience
   - Reduces password entry errors

2. **Dark Mode Support**
   - Full dark theme
   - Smooth transitions
   - Consistent across all pages
   - Persistent preference

3. **Multi-tenant Architecture**
   - Organization-based separation
   - Data isolation
   - Custom branding per org
   - Scalable design

4. **Enhanced Email System**
   - Improved error handling
   - Better debugging
   - Multiple provider support
   - Template customization

5. **Report Download**
   - PDF generation
   - Excel exports
   - Custom templates
   - Scheduled reports

### Recent Bug Fixes & Improvements

1. **Dashboard Project Filtering** (Nov 2025)
   - Fixed project filtering for stats display
   - Corrected task filtering by selected project
   - Improved team activity filtering
   - More accurate project-specific data

2. **Time Tracking Enhancement** (Nov 2025)
   - Fixed task dropdown to show all project tasks
   - No longer limited to only assigned tasks
   - Better task selection experience
   - Improved time entry workflow

3. **Email System Improvements** (Nov 2025)
   - Enhanced error handling and debugging
   - Integrated Resend API for reliable delivery
   - Better email configuration options
   - Improved SMTP support with flexible port handling

4. **Registration Fix** (Nov 2025)
   - Resolved 500 error during registration
   - Made Organization owner field optional
   - Smoother signup process
   - Better error messages

5. **Dark Mode Improvements** (Nov 2025)
   - Fixed PDF download styling in dark mode
   - Improved contrast and readability
   - Better dark mode consistency across components
   - Smooth theme transitions

---

## Feature Comparison

| Feature | Free Plan | Pro Plan | Enterprise |
|---------|-----------|----------|------------|
| Projects | 5 | Unlimited | Unlimited |
| Users | 10 | 50 | Unlimited |
| Storage | 1GB | 100GB | Unlimited |
| OAuth | ✓ | ✓ | ✓ |
| Dark Mode | ✓ | ✓ | ✓ |
| Reports | Basic | Advanced | Custom |
| Support | Community | Priority | Dedicated |
| API Access | - | ✓ | ✓ |
| SSO | - | - | ✓ |

---

## Upcoming Features

### Planned for Future Releases

- Calendar integration (Google Calendar, Outlook)
- Advanced time tracking
- Invoicing and billing
- Custom workflows
- Automation rules
- Mobile apps (iOS/Android)
- API webhooks
- Advanced permissions
- Two-factor authentication
- Video conferencing integration
- Custom fields builder
- Template library

---

## Tips & Best Practices

### For Managers

1. **Set clear deadlines** on all tasks
2. **Use priorities** to highlight important work
3. **Regular status updates** keep team aligned
4. **Review reports weekly** to track progress
5. **Enable dark mode** for late-night planning

### For Team Members

1. **Update task status** regularly
2. **Use comments** for questions and updates
3. **Toggle password visibility** when logging in to avoid typos
4. **@Mention** relevant team members
5. **Attach files** directly to tasks for easy access

### For Admins

1. **Configure OAuth** for easier logins
2. **Set up email notifications** properly
3. **Regular backups** of critical data
4. **Monitor user activity** for security
5. **Customize branding** for professional look

---

## Getting Help

### In-App Help

- Help icon in navigation
- Tooltips on hover
- Contextual hints
- User guide links

### Support Resources

- Documentation (this file)
- Setup guide
- Deployment guide
- Video tutorials (if available)
- Contact support

---

**Enjoy using Alunex Pulse! 🚀**

For questions about specific features, refer to the relevant section above or contact support.
