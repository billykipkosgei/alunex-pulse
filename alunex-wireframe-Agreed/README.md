# Alunex Project Management System - Wireframe Prototype

## Overview
This is a complete, navigable wireframe prototype for the Alunex Project Management System, designed specifically for aluminum and glass industry professionals.

## Features Included

### ✅ Core Features (All Pages Created)
1. **Login & Authentication** - Secure user login
2. **Dashboard** - Project overview with key metrics
3. **Time Tracking** - Timer and logs (Clockify integration)
4. **Task Management** - Kanban board (ClickUp/Trello integration)
5. **Team Chat** - Real-time messaging (Socket.io)
6. **File Sharing** - Google Drive integration
7. **Reports & Analytics** - Charts and exportable logs
8. **Video Calls** - Jitsi Meet integration
9. **Settings** - User profiles and API integrations

## How to View

### Option 1: Local Viewing (Recommended)
1. Extract all files from the ZIP
2. Open `index.html` in your web browser
3. Click "View Wireframe" or navigate to any page
4. All pages are fully linked and navigable

### Option 2: Start from Login
1. Open `login.html` directly
2. Click "Sign In" to view the dashboard
3. Use the sidebar to navigate between pages

## Design Specifications

### Color Scheme
- **Primary Blue**: #2563EB (Professional, trustworthy)
- **Success Green**: #10B981 (Completed tasks, positive metrics)
- **Warning Amber**: #F59E0B (In-progress items)
- **Neutral Gray**: #64748B (Secondary text)
- **Background**: #F8FAFC (Clean, light)

### Typography
- **Font Family**: Inter, Segoe UI, system fonts
- **Heading Sizes**: 28px (H1), 18px (H2)
- **Body Text**: 14px
- **Small Text**: 12-13px

### Layout
- **Navigation**: Fixed top navbar + left sidebar
- **Sidebar Width**: 260px
- **Content Padding**: 30px
- **Card Style**: White cards with subtle shadows
- **Border Radius**: 6-8px for consistency

## Technical Implementation Notes

### Frontend
- **Framework**: React.js or Vue.js
- **Styling**: Tailwind CSS or custom CSS
- **Icons**: Heroicons (SVG-based)
- **State Management**: Redux or Context API

### Backend
- **Server**: Node.js + Express
- **Real-time**: Socket.io for chat
- **Authentication**: JWT tokens
- **Database**: MongoDB or Firebase

### Integrations
1. **Clockify API** - Time tracking
2. **Google Drive API** - File storage
3. **ClickUp/Trello API** - Task management
4. **Jitsi Meet** - Video conferencing

## File Structure
```
wireframe/
├── index.html           # Landing/overview page
├── login.html           # Authentication page
├── dashboard.html       # Main dashboard
├── time-tracking.html   # Time tracking interface
├── tasks.html           # Kanban task board
├── chat.html            # Team messaging
├── files.html           # File management
├── reports.html         # Analytics and reports
├── video.html           # Video conferencing
├── settings.html        # User settings
├── styles.css           # Global stylesheet
└── README.md            # This file
```

## Navigation Flow
```
Login → Dashboard → [Any feature page]
                 ↓
           Sidebar Navigation
                 ↓
    All 8 main features accessible
```

## Key Features by Page

### Dashboard
- Real-time metrics (hours, tasks, team status)
- Recent task list
- Team activity overview
- Quick action buttons

### Time Tracking
- Active timer with project/task selection
- Today's time logs table
- Weekly summary visualization
- Export functionality

### Task Management
- Kanban board (To Do, In Progress, Completed)
- Task cards with progress bars
- Time logged per task
- Team member assignments
- WIP tracking

### Team Chat
- Channel list (projects + direct messages)
- Real-time message interface
- File attachment support
- Online status indicators

### File Sharing
- Grid view of files
- Upload functionality
- Recent activity log
- Google Drive integration note

### Reports & Analytics
- Date range selector
- Project/team member filters
- Visual charts (time by project, team performance)
- WIP summary metrics
- Export to PDF/Excel

### Video Calls
- Quick start options (new meeting, schedule, join)
- Active call interface with participants
- Video controls (mic, camera, screen share, record, end)
- Upcoming meetings list

### Settings
- User profile management
- API integration status
- Notification preferences
- Team member management

## Professional Design Elements

### Industry-Specific Considerations
- Clean, no-nonsense interface
- Quick access to frequently used features
- Mobile-responsive design (works on tablets for on-site use)
- Professional color scheme appropriate for construction/manufacturing
- Clear data visualization for time tracking and progress

### User Experience
- Intuitive navigation with clear sidebar menu
- Consistent layout across all pages
- Visual feedback (hover states, active states)
- Logical information hierarchy
- Minimal clicks to access features

## Next Steps

### For Review
1. Navigate through all pages
2. Check the layout and flow
3. Verify all features are present
4. Note any desired changes

### For Development
Once approved, I will:
1. Set up development environment
2. Implement authentication system
3. Integrate all APIs (Clockify, Google Drive, etc.)
4. Build backend with Node.js + Express
5. Implement real-time features (Socket.io)
6. Add database layer
7. Deploy to your hosting
8. Provide documentation

## Deliverables (Upon Approval)

### Phase 1 (Week 1-2) - $50
- User authentication system
- Dashboard with metrics
- Time tracking integration
- Task management integration
- Basic styling

### Phase 2 (Week 3) - $70
- Team chat (Socket.io)
- File sharing (Google Drive)
- Video calls (Jitsi Meet)
- Reports and analytics
- Settings and user management
- Full testing
- Deployment
- Documentation

## Support

After delivery, I provide:
- 1 week of post-launch bug fixes
- Deployment assistance
- User documentation
- Admin training guide

## Notes

- This wireframe uses **proper SVG icons** (no emojis) for a professional appearance
- All pages are **fully navigable** - click any sidebar item to see that page
- Design is **optimized for aluminum/glass industry** with appropriate color schemes and terminology
- The wireframe demonstrates the **complete user journey** from login to all features

## Contact

For any questions or feedback about this wireframe, please reach out via Fiverr messaging.

---

**Wireframe Created**: October 18, 2025  
**Project**: Alunex Custom Project Management System  
**Budget**: $120 USD  
**Timeline**: 2-3 weeks from approval
