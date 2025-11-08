# Alunex Project Management System - Comprehensive User Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [Tasks & Sub-Tasks](#tasks--sub-tasks)
5. [Time Tracking](#time-tracking)
6. [Departments & Budget Management](#departments--budget-management)
7. [Reports & Analytics](#reports--analytics)
8. [File Management](#file-management)
9. [Team Chat](#team-chat)
10. [Video Meetings](#video-meetings)
11. [Settings](#settings)
12. [Common Workflows](#common-workflows)
13. [How Everything Links Together](#how-everything-links-together)
14. [Frequently Asked Questions](#frequently-asked-questions)

---

## System Overview

### What is Alunex Project Management System?

Alunex is an all-in-one project management platform designed to help teams manage projects, track time, monitor budgets, and collaborate effectively. The system integrates multiple features into a single platform:

- **Project Management**: Create and track projects with detailed information
- **Task Management**: Break down projects into tasks and sub-tasks
- **Time Tracking**: Monitor time spent on projects and tasks
- **Budget Management**: Track department budgets and spending
- **Team Collaboration**: Chat, video meetings, and file sharing
- **Reports & Analytics**: Visualize project progress and budget utilization

### Key Features at a Glance

| Feature | Purpose | Main Use Case |
|---------|---------|---------------|
| 📊 Dashboard | Overview of all projects | Quick status check of all ongoing work |
| ✅ Tasks | Create and manage work items | Break down projects into actionable items |
| ⏱️ Time Tracking | Record hours worked | Track team productivity and billable hours |
| 🏢 Departments | Manage budgets | Control spending across departments |
| 📈 Reports | View analytics | Make data-driven decisions |
| 📁 Files | Store documents | Centralized file storage |
| 💬 Chat | Team communication | Real-time collaboration |
| 🎥 Video | Virtual meetings | Face-to-face team discussions |

---

## Getting Started

### Logging In

1. Navigate to the application URL
2. Enter your email and password
3. Click "Login"
4. You'll be taken to the Dashboard

### Navigation

The application has a sidebar on the left with all main sections:
- Dashboard (home page)
- Tasks
- Time Tracking
- Departments
- Department Analytics
- Reports
- Files
- Chat
- Video
- Settings

Click any item to navigate to that section.

### Getting Help

**NEW FEATURE!** Click the **question mark icon (?)** in the top right corner (next to your profile) to open the comprehensive help guide with:
- Detailed explanations of every feature
- Step-by-step instructions
- Common workflows
- FAQ section
- Searchable content

---

## Dashboard

### What You'll See

The Dashboard is your control center showing:

1. **Quick Stats Cards**
   - Total number of projects
   - Active projects
   - Completed tasks
   - Team members

2. **Project List**
   - All projects with their current status
   - Progress bars showing completion percentage
   - Key information (manager, dates, priority)
   - Quick action buttons (Edit, View)

3. **Project Status Indicators**
   - 🔵 **Planning**: Project is in planning phase
   - 🟢 **Active**: Currently being worked on
   - 🟡 **On Hold**: Temporarily paused
   - ✅ **Completed**: Successfully finished
   - ⛔ **Cancelled**: Project was cancelled

### Creating a New Project

1. Click **"New Project"** button (top right)
2. Fill in the project form:

   **Basic Information:**
   - **Name**: Give your project a clear title (e.g., "Website Redesign")
   - **Code**: Optional unique identifier (e.g., "WEB-2024-001")
   - **Description**: Detailed explanation of the project
   - **Status**: Choose current phase (default: Planning)
   - **Priority**: Set urgency (Low, Medium, High, Critical)

   **Dates:**
   - **Start Date**: When the project begins
   - **End Date**: Expected completion date

   **Team:**
   - **Manager**: Person responsible for the project
   - **Team Members**: People working on the project
   - **Client**: External client or stakeholder (optional)

   **Budget:**
   - **Allocated Budget**: Total budget for this project
   - **Currency**: Select currency (default: USD)
   - **Profit Margin**: Expected profit percentage

   **Location:**
   - **Country**: Project location
   - **Timezone**: For scheduling purposes

3. Click **"Create Project"**

### Editing a Project

1. Find the project in the list
2. Click **"Edit"** button
3. Update any fields
4. Click **"Update Project"**

### Understanding Progress

The progress bar shows overall project completion (0-100%). This can be:
- Manually updated by the project manager
- Automatically calculated from task completion (if set up)

---

## Tasks & Sub-Tasks

### Understanding the Task Hierarchy

Tasks are organized in a three-level structure:

```
PROJECT (Website Redesign)
│
├── TASK (Design Homepage)
│   ├── Sub-Task: Create wireframes
│   ├── Sub-Task: Design mockups
│   └── Sub-Task: Get client approval
│
├── TASK (Develop Frontend)
│   ├── Sub-Task: Set up React project
│   ├── Sub-Task: Implement navigation
│   └── Sub-Task: Add responsive design
│
└── TASK (Testing & Launch)
    ├── Sub-Task: QA testing
    ├── Sub-Task: Fix bugs
    └── Sub-Task: Deploy to production
```

### Creating a Task

1. Go to **Tasks** page from sidebar
2. Click **"Create Task"** button
3. Fill in the task form:

   **Task Details:**
   - **Title**: Clear, action-oriented name (e.g., "Design Homepage")
   - **Description**: Detailed explanation of what needs to be done
   - **Project**: Select which project this task belongs to
   - **Department**: Which department is responsible
   - **Priority**: How urgent (Low, Medium, High, Critical)
   - **Status**: Current state (Todo, In Progress, In Review, Done)

   **Assignment:**
   - **Assigned To**: Select one or more team members
     - You can assign multiple people to collaborate
     - Each person will see the task in their task list

   **Scheduling:**
   - **Due Date**: Deadline for completion
   - **Estimated Hours**: How long you think it will take
   - **Actual Hours**: Gets filled in as work progresses

4. Click **"Create Task"**

### Adding Sub-Tasks

Sub-tasks break down a large task into smaller, manageable pieces.

1. Click on a task to expand it
2. Click **"Add Sub-Task"** button
3. Enter sub-task details:
   - Title
   - Assigned to (one person)
   - Status (Todo, In Progress, Done)
   - Estimated Hours
   - Due Date
4. Click **"Save"**

### Task Status Workflow

Tasks move through these statuses:

1. **📝 Todo** → Not started yet
2. **🔄 In Progress** → Currently being worked on
3. **👀 In Review** → Completed, waiting for review/approval
4. **✅ Done** → Fully completed and approved

**How to change status:**
- Click on the task
- Select new status from dropdown
- Task automatically updates

### Understanding Task Progress

Task progress is **automatically calculated** based on sub-task completion:

- If you have 4 sub-tasks and 2 are done: **50% progress**
- If you have 10 sub-tasks and 7 are done: **70% progress**
- When all sub-tasks are done: **100% progress**

### Filtering & Searching Tasks

**Filter by Status:**
- Click status filter dropdown
- Select "In Progress" to see only active tasks
- Select "Done" to see completed tasks

**Filter by Priority:**
- Click priority filter
- Focus on "High" or "Critical" items

**Search by Name:**
- Use the search bar at top
- Type keywords to find specific tasks

**Filter by Project:**
- Select a project from dropdown
- See only tasks for that project

### Best Practices for Tasks

✅ **DO:**
- Use clear, action-oriented titles ("Design homepage", not "Homepage")
- Break large tasks into sub-tasks (aim for 3-10 sub-tasks per task)
- Assign tasks to specific people
- Set realistic due dates
- Update status regularly

❌ **DON'T:**
- Create tasks that are too vague
- Assign tasks to too many people (unless collaboration is needed)
- Leave tasks in "In Progress" for weeks
- Forget to add estimated hours

---

## Time Tracking

### Purpose of Time Tracking

Time tracking helps you:
- ✅ Understand how long tasks really take
- ✅ Improve future estimates
- ✅ Track billable hours for client billing
- ✅ Identify time-consuming activities
- ✅ Measure team productivity

### IMPORTANT: Time Tracking vs Budget Spend

⚠️ **KEY POINT:** Time tracking does NOT automatically update budget spend amounts.

- **Time Tracking** = Recording hours worked
- **Budget Spend** = Actual money spent (entered manually in Departments)

These are currently separate systems. Future versions may link them automatically.

### Method 1: Start/Stop Timer (Recommended)

This is the easiest way to track time in real-time.

1. Go to **Time Tracking** page
2. Click **"Start Tracking"** button
3. A modal appears - fill in:
   - **Project**: Select the project you're working on
   - **Task**: Optionally select a specific task (recommended)
   - **Description**: Briefly describe what you're doing
     - Example: "Implementing user authentication"
     - Example: "Fixing bug in payment form"
   - **Billable**: Check this box if the time should be charged to client
4. Click **"Start Timer"**
5. The timer starts running (you'll see a running timer on the page)
6. Work on your task
7. When done, click **"Stop"** button
8. The entry is saved automatically with the exact duration

**Active Timer Indicator:**
- While timer is running, you'll see: "⏱️ Timer Running: 00:15:32"
- You can navigate to other pages - timer keeps running
- Only one timer can run at a time

### Method 2: Manual Time Entry

Use this when you forgot to start the timer or need to log past work.

1. Click **"Add Manual Entry"** button
2. Fill in the form:
   - **Project**: Select project
   - **Task**: Select task (optional)
   - **Start Time**: When you started working
   - **End Time**: When you stopped working
   - **Description**: What you worked on
   - **Billable**: Check if chargeable to client
3. Duration is calculated automatically (End Time - Start Time)
4. Click **"Save Entry"**

### Viewing Your Time Entries

**Today's Entries:**
- All time logged today appears in the table
- Shows: Project, Task, Description, Duration, Billable status

**Weekly Summary:**
- See total hours tracked this week
- Broken down by:
  - Total hours
  - Billable hours
  - Non-billable hours

**Filtering:**
- **By Project**: See time spent on specific project
- **By Date Range**: View historical time entries
- **By User**: Managers can see team member time

### Editing Time Entries

1. Find the entry in the table
2. Click **"Edit"** button
3. Update any fields
4. Click **"Save"**

### Deleting Time Entries

1. Find the entry
2. Click **"Delete"** button
3. Confirm deletion
4. Entry is permanently removed

### Billable vs Non-Billable Time

**Billable Time:**
- Work that will be charged to the client
- Direct project work
- Client meetings
- Deliverable creation

**Non-Billable Time:**
- Internal meetings
- Administrative tasks
- Training
- Company events

**Why track both?**
- Accurately bill clients for billable hours
- Understand true project costs (including non-billable)
- Identify inefficiencies

### Time Tracking Best Practices

✅ **DO:**
- Start timer when you begin work
- Add descriptive notes about what you're doing
- Mark billable/non-billable correctly
- Track time daily (don't wait until end of week)
- Stop timer during breaks/lunch

❌ **DON'T:**
- Run timer while not actually working
- Forget to stop timer at end of day
- Track time in large chunks (e.g., "8 hours on project")
- Mix multiple tasks into one time entry

---

## Departments & Budget Management

### What are Departments?

Departments are organizational units within your company:
- Engineering
- Marketing
- Sales
- Operations
- Design
- etc.

Each department has:
- A department head (manager)
- Team members
- An allocated budget
- Spending tracked against that budget

### Creating a Department

1. Go to **Departments** page
2. Click **"Add Department"** button
3. Fill in the form:

   **Basic Info:**
   - **Department Name**: e.g., "Engineering"
   - **Description**: What this department does
   - **Department Head**: Manager responsible

   **Budget:**
   - **Allocated Budget**: Total budget for this department (e.g., $500,000)
   - **Spent**: Amount already spent (see note below)

4. Click **"Create Department"**

### Understanding Budget Fields

| Field | Meaning | How It's Set |
|-------|---------|--------------|
| **Allocated** | Total budget for the department | Set manually by admin |
| **Spent** | Amount used so far | **Entered manually by admin** |
| **Remaining** | Budget left to use | Auto-calculated: Allocated - Spent |
| **Utilization** | Percentage used | Auto-calculated: (Spent / Allocated) × 100 |

### How Budget "Spent" is Calculated

⚠️ **IMPORTANT:** The "Spent" amount is **100% MANUALLY ENTERED**

**What this means:**
- The system does NOT automatically calculate spend from time tracking
- You must manually update the "Spent" field
- You should calculate spend based on:
  - Employee salaries/hourly rates
  - Materials and supplies
  - Vendor payments
  - Overhead costs
  - Any other expenses

**Why manual?**
- More accurate (includes all costs, not just tracked time)
- Flexible for different cost calculation methods
- Doesn't require hourly rates in the system

### NEW FEATURE: Spend Documentation Upload

Because spend is manually entered, you can now provide **proof/breakdown** of how you calculated the spend!

#### How to Upload Spend Documentation

1. Find your department in the table
2. In the **Actions** column, look for the upload button:
   - **"📎 Upload"** (purple button) = No documentation yet
   - **"📄 Docs"** (green button) = Documentation already uploaded

3. Click the upload button
4. A modal opens with two options:

   **Option A: Upload Excel/Document File**
   - Click "Choose File"
   - Select your file:
     - ✅ Excel (.xlsx, .xls)
     - ✅ CSV (.csv)
     - ✅ PDF (.pdf)
     - ✅ Word (.doc, .docx)
   - Max file size: 100MB
   - File should contain spend breakdown (example below)

   **Option B: Provide a Link**
   - Enter URL to online document:
     - Google Sheets link
     - Dropbox link
     - OneDrive link
     - Any other accessible URL

   **Option C: Both!**
   - You can upload a file AND add a link
   - Provides maximum transparency

   **Optional: Add Notes**
   - Explain your calculation method
   - Note any assumptions
   - Add context

5. Click **"Save Documentation"**

#### What Happens After Upload

Once you upload documentation:
- Button changes to **"📄 Docs"** (green)
- **⬇️ Download** button appears (click to download the file)
- **🔗 Link** button appears (click to open external link in new tab)
- Anyone can view/download your documentation
- System tracks who uploaded it and when

#### Example: What to Include in Spend Documentation

Your Excel file might look like this:

| Expense Category | Description | Amount |
|------------------|-------------|--------|
| Salaries | 5 engineers × $10,000/month | $50,000 |
| Contractor | Web developer (40 hours × $150) | $6,000 |
| Software Licenses | GitHub, AWS, tools | $2,500 |
| Equipment | New laptops for 2 developers | $4,000 |
| Overhead | Office space, utilities (20% of salaries) | $10,000 |
| **TOTAL SPENT** | | **$72,500** |

#### Viewing Spend Documentation

**To view existing documentation:**
1. Look for green **"📄 Docs"** button
2. Click it to see upload modal with current docs
3. Click **⬇️ Download** to get the file
4. Click **🔗 Link** to open external document

**To update documentation:**
1. Click **"📄 Docs"** button
2. Upload new file or update link
3. Old file remains until you delete it
4. Click **"Save Documentation"**

**To delete documentation:**
1. Open the upload modal
2. Click **"Delete Documentation"** button (red)
3. Confirm deletion
4. File is permanently removed

### Budget Dashboard (Top of Page)

The top of the Departments page shows aggregated totals:

📊 **Total Budget**: $2,500,000 (sum of all department budgets)
💸 **Total Spent**: $1,800,000 (sum of all spending)
💰 **Remaining**: $700,000 (total budget - total spent)
📈 **Utilization**: 72% (total spent / total budget × 100)

### Budget Utilization Colors

The progress bars use color coding:

- **🔵 Blue (0-74%)**: Normal usage, under budget
- **🟠 Orange (75-100%)**: High usage, approaching budget limit
- **🔴 Red (>100%)**: Over budget! Immediate attention needed

### Editing Department Budget

1. Click **"Edit"** button for the department
2. Update the budget fields:
   - Change **Allocated** if budget increased/decreased
   - Update **Spent** with actual spending
3. **IMPORTANT:** After updating Spent, upload documentation!
4. Click **"Update Department"**

### Budget Management Workflow

**Recommended Monthly Process:**

1. **Calculate Actual Spend**
   - Gather all expenses for the month
   - Sum up: salaries, contractors, materials, overhead
   - Create Excel breakdown

2. **Update Department Budget**
   - Go to Departments page
   - Click "Edit" on department
   - Update "Spent" field with new total
   - Click "Update"

3. **Upload Documentation**
   - Click "📎 Upload" button
   - Upload your Excel breakdown file
   - Add notes explaining any unusual expenses
   - Click "Save Documentation"

4. **Review Budget Health**
   - Check utilization percentage
   - If over 85%, consider:
     - Requesting budget increase
     - Reducing spending
     - Reallocating from other departments

5. **Generate Reports**
   - Go to Reports page
   - View Budget Analysis Report
   - Share with leadership

---

## Reports & Analytics

### Available Reports

#### 1. Budget Analysis Report

**Purpose:** See budget vs spend across all departments

**What You'll See:**
- Total budget and total spend
- Remaining budget
- Overall utilization percentage
- Bar chart for each department showing:
  - Allocated budget (light bar)
  - Spent amount (colored bar)
  - Percentage used

**Color Coding:**
- 🔵 Blue: Under 75% (healthy)
- 🟠 Orange: 75-100% (watch closely)
- 🔴 Red: Over 100% (over budget!)

**How to Use:**
1. Go to Reports page
2. Select "Budget Analysis Report"
3. Review each department
4. Identify departments needing attention
5. Take action on over-budget departments

#### 2. Department Analytics

**Purpose:** Detailed breakdown of single department

**What You'll See:**
- Department overview
- Budget allocation and spending
- Team members assigned
- Projects assigned to department
- Spending trends over time

**How to Use:**
1. Go to Department Analytics page
2. Select department from dropdown
3. Review detailed metrics
4. Export or share with stakeholders

### Generating Reports

1. Navigate to desired report page
2. Report generates automatically
3. Use filters to customize:
   - Date range
   - Specific departments
   - Project filter
4. Take screenshot or use browser Print function to save as PDF

---

## File Management

### Purpose

Centralized storage for all project-related documents:
- Contracts and agreements
- Design files
- Technical documentation
- Meeting notes
- Presentations
- Any other project files

### Uploading Files

1. Go to **Files** page
2. Click **"Upload File"** button
3. A modal opens:
   - **Choose File**: Select from your computer
   - **Project** (optional): Link to a specific project
   - **Description**: What is this file?
   - **Tags**: Keywords for easy searching (e.g., "contract", "final", "v2")
4. Click **"Upload"**
5. File is uploaded and appears in the list

### Supported File Types

✅ **Documents:**
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xlsx, .xls)
- PowerPoint (.ppt, .pptx)
- Text (.txt)

✅ **Images:**
- JPG/JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- SVG (.svg)

✅ **Archives:**
- ZIP (.zip)
- RAR (.rar)

✅ **Others:**
- CSV (.csv)
- Most common file types

**Maximum File Size:** 100MB per file

### Finding Files

**Search by Name:**
- Use search bar at top
- Type file name or keywords

**Filter by Project:**
- Select project from dropdown
- See only files for that project

**Filter by Tags:**
- Click tag to see all files with that tag

**Sort:**
- By date (newest first)
- By name (A-Z)
- By size (largest first)

### Downloading Files

1. Find file in the list
2. Click file name or **"Download"** button
3. File downloads to your computer

### Deleting Files

⚠️ **Warning:** Deletion is permanent!

1. Find file in the list
2. Click **"Delete"** button
3. Confirm deletion
4. File is permanently removed

### Best Practices

✅ **DO:**
- Use descriptive file names ("Q3_Financial_Report_2024.pdf", not "report.pdf")
- Add tags for easy searching
- Link files to projects
- Add descriptions
- Keep files organized

❌ **DON'T:**
- Upload sensitive/confidential files without proper permissions
- Use vague file names
- Forget to add project association
- Upload files larger than 100MB

---

## Team Chat

### Purpose

Real-time communication with your team about projects, tasks, and general topics.

### Chat Features

- **Channels**: Organized discussion groups
- **Real-time messaging**: Instant delivery
- **File sharing**: Attach documents to messages
- **@mentions**: Tag specific people
- **Message history**: Searchable past conversations

### Using Chat

1. Go to **Chat** page from sidebar
2. **Select a Channel** from left panel:
   - **#general**: Company-wide announcements and discussions
   - **#project-[name]**: Project-specific discussions
   - **#department-[name]**: Department channels
3. Type your message in the text box at bottom
4. Press **Enter** or click **Send**
5. Message appears instantly for all channel members

### Creating Channels

1. Click **"New Channel"** button
2. Enter channel name (e.g., "website-redesign")
3. Add description
4. Select members to add
5. Click **"Create Channel"**

### Channel Best Practices

**Use specific channels for focused discussions:**
- Create a channel for each major project
- Use #general for company-wide stuff
- Create department channels for internal discussions

**Communication Guidelines:**
- Tag people with @name when you need their attention
- Keep messages professional
- Use threads for long discussions
- Don't spam channels with off-topic messages

### Message Features

**Editing Messages:**
1. Hover over your message
2. Click edit icon
3. Update text
4. Press Enter

**Deleting Messages:**
1. Hover over your message
2. Click delete icon
3. Confirm deletion

**Reactions:**
- Click emoji icon on any message
- Select emoji to react
- Quick way to acknowledge without replying

---

## Video Meetings

### Purpose

Conduct virtual face-to-face meetings with team members.

### Starting a Video Call

1. Go to **Video** page from sidebar
2. Click **"Start New Meeting"** button
3. Meeting room is created
4. Copy the meeting link
5. Share link with participants (via Chat or email)
6. Click **"Join Meeting"** to enter

### Joining a Meeting

1. Click the meeting link shared with you
2. Or go to Video page and enter meeting ID
3. Click **"Join"**
4. Allow camera/microphone access when prompted
5. You're in the call!

### Meeting Controls

**During a call, you can:**

- **🎤 Mute/Unmute**: Toggle your microphone
- **📹 Video On/Off**: Toggle your camera
- **🖥️ Share Screen**: Show your screen to others
- **💬 Chat**: Text chat during video call
- **👋 Leave Call**: Exit the meeting

### Meeting Best Practices

✅ **Before Meeting:**
- Test camera and microphone
- Join 2-3 minutes early
- Ensure good lighting
- Find quiet location

✅ **During Meeting:**
- Mute when not speaking
- Look at camera when talking
- Use screen share for presentations
- Take notes in Chat

✅ **After Meeting:**
- Share action items in project channel
- Update tasks based on decisions
- Save meeting notes to Files

---

## Settings

### User Settings

#### Profile Settings

1. Go to **Settings** page
2. Click **"Profile"** tab
3. Update your information:
   - **Name**: Your full name
   - **Email**: Contact email
   - **Avatar**: Upload profile picture
   - **Phone**: Contact number
   - **Department**: Your department
4. Click **"Save Changes"**

#### Password Change

1. Go to Settings → **Security** tab
2. Enter:
   - Current password
   - New password
   - Confirm new password
3. Click **"Update Password"**
4. You'll be logged out and need to log in again

#### Notification Settings

1. Go to Settings → **Notifications** tab
2. Configure what alerts you want to receive:
   - Email notifications
   - Browser notifications
   - Task assignments
   - @mentions in chat
   - Project updates
3. Click **"Save Preferences"**

### Admin Settings (Administrators Only)

#### User Management

**Adding New Users:**
1. Go to Settings → **Users** tab
2. Click **"Add User"**
3. Enter user details:
   - Name
   - Email
   - Role (Admin, Manager, Team Member)
   - Department
4. Click **"Create User"**
5. User receives invitation email

**Editing Users:**
1. Find user in list
2. Click **"Edit"**
3. Update details
4. Click **"Save"**

**Deactivating Users:**
1. Find user in list
2. Click **"Deactivate"**
3. Confirm
4. User can no longer log in (data is preserved)

#### Roles & Permissions

**Role Types:**

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to everything, can manage users |
| **Manager** | Can create projects, manage teams, view all reports |
| **Team Member** | Can view assigned tasks, track time, use chat |

---

## Common Workflows

### Workflow 1: Starting a New Project (Complete Process)

**Step 1: Create the Project**
1. Go to Dashboard
2. Click "New Project"
3. Fill in all details (name, dates, budget, team)
4. Assign a Project Manager
5. Add team members
6. Click "Create Project"

**Step 2: Set Up Department Budget**
1. Go to Departments page
2. Find relevant department (e.g., Engineering)
3. Click "Edit"
4. Ensure budget is allocated for this project
5. Click "Save"

**Step 3: Create Project Tasks**
1. Go to Tasks page
2. Click "Create Task"
3. Create main tasks for major milestones:
   - Example: "Requirements Gathering"
   - Example: "Design Phase"
   - Example: "Development"
   - Example: "Testing"
   - Example: "Launch"
4. For each task:
   - Set priority
   - Set due date
   - Assign to team members
   - Add estimated hours

**Step 4: Break Down into Sub-Tasks**
1. Click on each task to expand
2. Click "Add Sub-Task"
3. Create actionable sub-tasks:
   - Example for "Design Phase":
     - Create wireframes
     - Design mockups
     - Get client approval
     - Finalize design system
4. Assign each sub-task to specific person

**Step 5: Set Up Communication**
1. Go to Chat page
2. Create new channel: "#project-[name]"
3. Add all team members
4. Post kickoff message with:
   - Project overview
   - Key goals
   - Important links
   - Next steps

**Step 6: Upload Initial Documents**
1. Go to Files page
2. Upload project documents:
   - Requirements doc
   - Design brief
   - Contracts
   - Any reference materials
3. Tag with project name
4. Link to project

**Step 7: Schedule Kickoff Meeting**
1. Go to Video page
2. Create meeting link
3. Share in project channel
4. Hold kickoff meeting
5. Review project plan with team

---

### Workflow 2: Daily Work Routine (Team Member)

**Morning:**
1. **Check Tasks**
   - Go to Tasks page
   - Filter by "Assigned to Me"
   - Review what's due today
   - Prioritize your work

2. **Read Chat Updates**
   - Check project channels
   - Respond to @mentions
   - Note any blockers

3. **Start Time Tracking**
   - Go to Time Tracking
   - Click "Start Tracking"
   - Select current task
   - Begin work

**During Day:**
4. **Work on Tasks**
   - Complete sub-tasks
   - Mark sub-tasks as "Done" when finished
   - Update task status to "In Progress"

5. **Track Time Accurately**
   - Stop timer when taking breaks
   - Start new timer for different tasks
   - Add descriptions of work done

6. **Communicate Progress**
   - Post updates in project channel
   - Ask questions if blocked
   - Coordinate with teammates

**End of Day:**
7. **Stop Timers**
   - Make sure all timers are stopped
   - Review time entries
   - Correct any mistakes

8. **Update Task Status**
   - Mark completed items as "Done"
   - Move tasks to "In Review" if ready
   - Update progress notes

9. **Plan Tomorrow**
   - Look at tomorrow's tasks
   - Note any dependencies
   - Flag issues that need attention

---

### Workflow 3: Weekly Budget Review (Manager)

**Every Monday Morning:**

**Step 1: Review Time Tracked**
1. Go to Time Tracking page
2. Filter by last week
3. Review team's hours:
   - Total hours tracked
   - Hours per project
   - Billable vs non-billable

**Step 2: Calculate Department Spend**
1. Gather expense data:
   - Payroll for the week
   - Contractor payments
   - Tool/software costs
   - Any other expenses

2. Create Excel breakdown:
   - List each expense category
   - Sum totals
   - Calculate cumulative spend for month

**Step 3: Update Budget in System**
1. Go to Departments page
2. Click "Edit" on your department
3. Update "Spent" field with new total
4. Click "Save"

**Step 4: Upload Spend Documentation**
1. Click "📎 Upload" button
2. Upload your Excel file
3. Add notes: "Week of [date] - Regular payroll plus AWS overage"
4. Click "Save Documentation"

**Step 5: Review Budget Health**
1. Go to Reports page
2. View Budget Analysis Report
3. Check utilization percentage:
   - Under 75%? On track
   - 75-85%? Monitor closely
   - 85-95%? Prepare budget request
   - Over 95%? Immediate action needed

**Step 6: Take Action**
- If approaching budget limit:
  - Review large expenses
  - Identify cost savings
  - Prepare budget increase request
  - Communicate with finance team

**Step 7: Communicate to Team**
1. Post update in department channel
2. Share budget status
3. Highlight any concerns
4. Ask team for cost-saving ideas if needed

---

### Workflow 4: Task Completion Process

**When Starting a Task:**
1. Go to Tasks page
2. Find your task
3. Click to expand
4. Change status to **"In Progress"**
5. Start time tracking
6. Begin work

**During Work:**
7. Complete sub-tasks one by one
8. Mark each sub-task as "Done"
9. Task progress auto-updates
10. Post updates in project channel
11. Upload any work files to Files section

**When Finishing:**
12. Complete all sub-tasks
13. Stop time tracker
14. Review your work
15. Change task status to **"In Review"**
16. @mention project manager in chat
17. Explain what you've completed

**After Review:**
18. If approved:
    - Manager marks task as "Done"
    - Move to next task
19. If changes needed:
    - Manager provides feedback
    - You make adjustments
    - Request review again

---

## How Everything Links Together

### The Complete System Flow

Here's how all parts of the system work together:

```
1. CREATE PROJECT (Dashboard)
   ↓
2. ALLOCATE BUDGET (Departments)
   ↓
3. CREATE TASKS (Tasks Page)
   ↓
4. ASSIGN TO TEAM (Tasks Page)
   ↓
5. TRACK TIME (Time Tracking)
   ↓
6. UPDATE PROGRESS (Tasks Page)
   ↓
7. UPDATE SPEND (Departments + Documentation)
   ↓
8. REVIEW REPORTS (Reports Page)
   ↓
9. ADJUST AS NEEDED (Back to step 2 or 3)
```

### How Features Connect

**Dashboard → Projects → Tasks:**
- Projects are created in Dashboard
- Tasks belong to Projects
- Tasks break down Project work

**Tasks → Sub-Tasks → Time Tracking:**
- Tasks are broken into Sub-Tasks
- Time is tracked on Tasks
- Sub-Task completion updates Task progress

**Departments → Budget → Spend Documentation:**
- Departments have Budgets
- Spend is manually updated
- Documentation proves spend calculation

**Projects → Files → Chat:**
- Files can be linked to Projects
- Files can be shared in Chat
- Chat channels can be per-Project

**Reports → Departments → Projects:**
- Reports aggregate Department budgets
- Reports show Project status
- Reports help make decisions

### Data Flow Example

**Example: Engineering Department working on Website Redesign Project**

1. **Project Created**: "Website Redesign" ($100,000 budget, 3 months)
2. **Department**: Engineering department allocated $300,000 for quarter
3. **Tasks Created**:
   - Design Homepage (assigned to Designer)
   - Develop Frontend (assigned to 2 Developers)
   - Testing (assigned to QA Engineer)
4. **Sub-Tasks**: Each task broken into 5-8 sub-tasks
5. **Time Tracking**: Team tracks hours daily on their assigned tasks
6. **Progress**: As sub-tasks complete, task progress auto-updates
7. **Weekly Budget Update**:
   - Manager calculates weekly spend (payroll + costs)
   - Updates Department "Spent" field
   - Uploads Excel breakdown as documentation
8. **Monthly Report Review**:
   - Department at 65% budget utilization (healthy)
   - Website project 70% complete, on track
9. **Adjustments**: Based on reports, reallocate resources if needed

---

## Frequently Asked Questions

### General Questions

**Q: Who should I contact if I can't log in?**
A: Contact your system administrator or IT support team. They can reset your password or check your account status.

**Q: Can I use this on my phone?**
A: Yes! The system is responsive and works on mobile devices. However, some features like Time Tracking and complex forms work best on desktop/laptop.

**Q: How do I change my profile picture?**
A: Go to Settings → Profile → Upload Avatar. Choose an image and it will display next to your name throughout the system.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions). For best experience, use Chrome or Firefox.

---

### Budget & Spending Questions

**Q: How is the "Spent" amount calculated in Departments?**
A: The "Spent" amount is **manually entered** by administrators. It does NOT automatically calculate from time tracking. Here's why:

- **More Accurate**: Includes ALL costs (salaries, materials, overhead, etc.)
- **Flexible**: Accommodates different cost calculation methods
- **Transparent**: You upload documentation showing the breakdown

To update spend:
1. Calculate total expenses for the period
2. Go to Departments → Edit
3. Update "Spent" field
4. Upload Excel file showing breakdown
5. Click "Save"

**Q: Why doesn't time tracking automatically update budget spend?**
A: Time tracking and budget spending are separate because:

- **Time tracking** = Hours worked (useful for productivity, project management)
- **Budget spend** = Actual money spent (includes more than just time)

Budget spend includes:
- Salaries and contractor payments
- Software licenses and tools
- Equipment and hardware
- Office space and utilities
- Materials and supplies
- Vendor payments

Simply tracking hours doesn't capture all these costs. You need to manually calculate total spend.

**Future Enhancement**: A future version may include hourly rates per user, allowing automatic spend calculation from tracked time. But manual entry will likely always be an option for accuracy.

**Q: What should I include in my spend documentation Excel file?**
A: Your Excel file should show how you calculated the spend amount. Example structure:

| Category | Description | Calculation | Amount |
|----------|-------------|-------------|--------|
| Salaries | 5 engineers | 5 × $10,000/mo | $50,000 |
| Contractors | Freelance developer | 40 hrs × $150 | $6,000 |
| Software | AWS, GitHub, tools | Monthly subscriptions | $2,500 |
| Equipment | New laptops | 2 × $2,000 | $4,000 |
| Overhead | Office, utilities | 20% of salaries | $10,000 |
| **TOTAL** | | | **$72,500** |

**Q: How often should I update the spend amount?**
A: Recommended frequency:
- **Weekly**: For tight budget control
- **Bi-weekly**: Aligned with payroll cycles
- **Monthly**: Minimum recommended frequency

**Q: What if I go over budget?**
A: If a department exceeds its allocated budget (>100% utilization):

1. **Immediate Action**:
   - Review all expenses
   - Identify why over budget
   - Stop non-essential spending

2. **Document Everything**:
   - Create detailed report
   - Explain overage reasons
   - Show what was accomplished with funds

3. **Request Budget Increase**:
   - Present to finance/leadership
   - Justify additional funds
   - Show ROI or necessity

4. **Future Prevention**:
   - Track more closely
   - Review budget weekly
   - Set alerts at 80% utilization

**Q: Can I reallocate budget between departments?**
A: Yes, if you have admin permissions:

1. Go to Departments page
2. Click "Edit" on department reducing budget
3. Decrease "Allocated" amount
4. Click "Save"
5. Click "Edit" on department increasing budget
6. Increase "Allocated" amount
7. Click "Save"
8. Document the reallocation reason in chat/notes

**Q: What's the difference between Project Budget and Department Budget?**
A:
- **Project Budget**: Budget for a specific project (optional field, informational)
- **Department Budget**: Budget for entire department (all projects combined)

Department Budget is the primary budget tracking. Project budgets help allocate department funds across projects but don't directly affect department spend.

---

### Time Tracking Questions

**Q: Can I edit my time entries after submitting?**
A: Yes! Find the entry in your time log and click "Edit". Update any field and click "Save".

**Q: What if I forgot to start the timer?**
A: No problem! Use the "Add Manual Entry" feature:
1. Click "Add Manual Entry"
2. Enter start and end times
3. Select project and task
4. Add description
5. Click "Save"

The system calculates duration automatically.

**Q: Can I track time on multiple tasks simultaneously?**
A: No, you can only have one timer running at a time. This ensures accurate time tracking. If you need to switch tasks:
1. Stop current timer
2. Start new timer for new task

**Q: What happens if I forget to stop my timer?**
A: The timer keeps running! You'll need to:
1. Stop the timer
2. Edit the entry
3. Set correct end time
4. Save the corrected entry

**Q: Who can see my time entries?**
A: Visibility depends on role:
- **You**: See all your own entries
- **Project Manager**: See entries for their projects
- **Department Manager**: See entries for their department members
- **Admins**: See all time entries

**Q: Should I track bathroom breaks, lunch, etc.?**
A: No. Only track actual work time. Stop the timer when:
- Taking lunch break
- Going to personal appointments
- Running errands
- Any non-work activity

This ensures accurate billing and project tracking.

**Q: What's the difference between billable and non-billable time?**
A:
- **Billable**: Work that will be charged to client (direct project work, client meetings, deliverables)
- **Non-billable**: Work that won't be charged to client (internal meetings, training, admin tasks)

Mark entries correctly so invoices to clients are accurate.

---

### Task Questions

**Q: Can I assign a task to multiple people?**
A: Yes! When creating or editing a task, you can select multiple people in the "Assigned To" field. Each person will see the task in their task list and can collaborate.

Best Practice: If multiple people are assigned, break down into sub-tasks and assign each sub-task to one person. This provides clearer accountability.

**Q: How does task progress calculate?**
A: Task progress is **automatically calculated** based on sub-task completion:
- Formula: (Completed Sub-Tasks / Total Sub-Tasks) × 100
- Example: 3 out of 5 sub-tasks done = 60% progress

You cannot manually override this. To change progress, mark sub-tasks as done.

**Q: What if a task doesn't have sub-tasks?**
A: If a task has no sub-tasks, you can manually set progress (0-100%). However, it's recommended to create sub-tasks even for small tasks (helps with clarity and tracking).

**Q: Can I delete a task?**
A: Yes, but only admins can delete tasks. If you're not an admin:
1. Change task status to "Cancelled" (if available)
2. Or ask your manager/admin to delete it

**Q: What's the difference between "In Review" and "Done"?**
A:
- **In Review**: Work is completed by assignee, waiting for manager/client review
- **Done**: Work has been reviewed, approved, and fully completed

Workflow: Todo → In Progress → In Review → Done

**Q: Can I reopen a task that's marked as Done?**
A: Yes! Just change the status back to "In Progress". This might happen if:
- Bugs are found after completion
- Client requests changes
- New requirements emerge

---

### File Questions

**Q: How do I organize files?**
A: Use these strategies:
1. **Project Association**: Link files to projects
2. **Tags**: Add keywords like "contract", "final", "v2"
3. **Naming Convention**: Use descriptive names with dates
4. **Folders**: Currently not supported, but tags work as folders

Example naming: "2024-Q3-Engineering-Budget-Final-v2.xlsx"

**Q: Can I create folders?**
A: Not currently. Use **tags** and **project filters** to organize files. This provides flexible categorization (files can have multiple tags).

**Q: What happens to files if I delete a project?**
A: Files remain in the system even if the project is deleted. They're orphaned (no project association) but still accessible.

To find orphaned files:
1. Go to Files page
2. Filter by "No Project"

**Q: Can I upload files directly in Chat?**
A: Yes! In chat, click the attachment icon (📎) and select a file. It uploads to the Files section automatically and links in the chat message.

**Q: Is there a file size limit?**
A: Yes, maximum 100MB per file. For larger files:
1. Upload to cloud storage (Dropbox, Google Drive, etc.)
2. Share the link in Chat or add to project description

---

### Chat Questions

**Q: Can I send direct messages to individuals?**
A: This depends on your system configuration. Check if DM feature is enabled. If not, create a private channel with just two members.

**Q: Can I edit or delete messages?**
A: Yes! Hover over your message and click:
- Edit icon (✏️) to change the text
- Delete icon (🗑️) to remove it

Note: You can only edit/delete your own messages.

**Q: How do I know if someone read my message?**
A: Currently, there are no read receipts. Best practice: Ask for a reaction emoji (👍) or reply to confirm receipt for important messages.

**Q: Can I search old messages?**
A: Yes! Use the search bar in the chat interface. Search by:
- Keywords
- User name
- Date range
- Channel

**Q: How long are messages stored?**
A: Messages are stored indefinitely unless manually deleted. There's no automatic deletion.

**Q: Can I mute notifications for a channel?**
A: This depends on your system configuration. Check Settings → Notifications to manage channel-specific alerts.

---

### Video Questions

**Q: Do I need to install any software for video calls?**
A: No! Video meetings work in your web browser (Chrome, Firefox, Safari, Edge). No downloads required.

**Q: How many people can join a video call?**
A: This depends on your system configuration. Typically 10-50 participants. Check with your admin for exact limits.

**Q: Can I record meetings?**
A: Check if the recording feature is enabled in your system. If available, click the "Record" button during the call. Recording will be saved to Files section.

**Q: What if my camera/mic doesn't work?**
A: Troubleshooting steps:
1. Check browser permissions (allow camera/mic access)
2. Close other apps using camera/mic (Zoom, Skype, etc.)
3. Restart browser
4. Try different browser
5. Check system settings (Windows/Mac settings)
6. Contact IT support

**Q: Can I join a call from my phone?**
A: Yes, if your phone's browser supports it. iOS Safari and Android Chrome should work. However, desktop experience is better for features like screen sharing.

---

### Permissions & Access Questions

**Q: What can different user roles do?**
A:

**Admin**:
- Full access to everything
- Create/edit/delete users
- Manage all projects and departments
- Access all reports
- Configure system settings

**Manager**:
- Create and manage projects
- Create tasks and assign to team
- View team time tracking
- Access reports for their projects/departments
- Cannot manage users or system settings

**Team Member**:
- View assigned tasks
- Track own time
- Upload files
- Use chat and video
- View projects they're assigned to
- Cannot create projects or see other people's time

**Q: How do I request more permissions?**
A: Contact your manager or system administrator. They can upgrade your role if justified.

**Q: Can I see other people's time tracking?**
A: Depends on your role:
- **Admins**: See everyone's time
- **Managers**: See time for their projects/department
- **Team Members**: Only see their own time

---

### Technical Questions

**Q: What if I encounter a bug or error?**
A:
1. Take a screenshot of the error
2. Note what you were doing when it happened
3. Contact your system administrator with:
   - Screenshot
   - Description of actions
   - Browser and device info
   - Time it occurred

**Q: How do I report a feature request?**
A: Share your idea with your manager or admin. They can evaluate and request enhancements from the development team.

**Q: Is my data backed up?**
A: Yes! The system performs automatic backups regularly. Ask your admin about the specific backup schedule.

**Q: Can I export my data?**
A: Some data can be exported:
- Reports can be printed to PDF
- Time entries can be viewed and screenshotted
- Files can be downloaded

For bulk data export, contact your administrator.

**Q: What happens if the system goes down?**
A:
1. Try refreshing your browser
2. Check your internet connection
3. Check with teammates if they're also experiencing issues
4. Contact IT support
5. Wait for system to come back online (usually minutes, not hours)

---

## Getting Additional Help

### In-App Help Guide

Click the **question mark icon (?)** in the top right corner (next to your profile) to access the comprehensive help guide anytime. It includes:

- 📚 All sections of this guide
- 🔍 Searchable content
- 📋 Step-by-step instructions
- 💡 Tips and best practices
- ❓ FAQ section

### Contact Support

If you need additional help:

1. **First**: Check the in-app help guide (? icon)
2. **Second**: Ask your manager or team lead
3. **Third**: Contact your system administrator
4. **Last Resort**: Email technical support (ask admin for email)

### Training Resources

Ask your administrator about:
- Video tutorials
- Training sessions
- Onboarding materials
- User documentation

---

## Appendix: Quick Reference

### Common Shortcuts & Tips

**Navigation:**
- Use sidebar to jump between sections quickly
- Breadcrumbs at top show where you are
- Back button in browser works fine

**Time Tracking:**
- Start timer before you begin work (don't forget!)
- Stop timer during breaks
- Review your week on Fridays

**Budget Management:**
- Update spend weekly or bi-weekly
- Always upload documentation
- Review reports monthly

**Task Management:**
- Break large tasks into sub-tasks
- Update status regularly
- Communicate progress in chat

### Color Coding Guide

**Task Priorities:**
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

**Budget Utilization:**
- 🔵 Blue (0-74%): Healthy
- 🟠 Orange (75-100%): Watch closely
- 🔴 Red (>100%): Over budget

**Task Status:**
- ⚪ Todo
- 🔵 In Progress
- 🟡 In Review
- 🟢 Done

### Button Legend

| Button | Meaning |
|--------|---------|
| 📎 Upload | Add documentation |
| 📄 Docs | View documentation |
| ⬇️ | Download file |
| 🔗 | Open link |
| ✏️ Edit | Modify item |
| 🗑️ Delete | Remove item |
| ⏱️ | Time tracking |
| 👁️ View | See details |

---

## Conclusion

This comprehensive guide covers all major features and workflows in the Alunex Project Management System. Remember:

✅ **Use the in-app help** (? icon) for quick reference
✅ **Track time regularly** for accurate project data
✅ **Update budgets and upload documentation** for transparency
✅ **Communicate with your team** via chat and video
✅ **Keep tasks updated** so everyone knows progress
✅ **Ask questions** if you're unsure about anything

The system is designed to help you manage projects more effectively. Take time to explore features and find workflows that work best for your team!

**Need Help?** Click the **?** icon in the top right corner anytime!

---

**Document Version:** 1.0
**Last Updated:** [Current Date]
**For Questions:** Contact your system administrator
