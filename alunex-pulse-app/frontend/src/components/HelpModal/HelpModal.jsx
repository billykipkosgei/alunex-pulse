import { useState } from 'react';
import './HelpModal.css';
import InteractiveGuide from '../InteractiveGuide/InteractiveGuide';

const HelpModal = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    const handleStartTour = (tourType) => {
        onClose(); // Close the help modal first
        setTimeout(() => {
            // Start the tour after modal is closed
            switch(tourType) {
                case 'general':
                    InteractiveGuide.startGeneralTour();
                    break;
                case 'dashboard':
                    InteractiveGuide.startDashboardTour();
                    break;
                case 'tasks':
                    InteractiveGuide.startTasksTour();
                    break;
                case 'timeTracking':
                    InteractiveGuide.startTimeTrackingTour();
                    break;
                case 'departments':
                    InteractiveGuide.startDepartmentsTour();
                    break;
                case 'chat':
                    InteractiveGuide.startChatTour();
                    break;
                case 'files':
                    InteractiveGuide.startFilesTour();
                    break;
                default:
                    InteractiveGuide.startGeneralTour();
            }
        }, 300);
    };

    if (!isOpen) return null;

    const helpSections = {
        overview: {
            title: 'System Overview',
            icon: '🏠',
            content: (
                <div className="help-content">
                    <h2>Welcome to Alunex Project Management System</h2>
                    <p>This system helps you manage projects, tasks, time tracking, budgets, and team collaboration all in one place.</p>

                    <button className="start-tour-btn" onClick={() => handleStartTour('general')}>
                        🎯 Start Interactive Guide
                    </button>

                    <h3>Main Components:</h3>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <span className="feature-icon">📊</span>
                            <h4>Dashboard</h4>
                            <p>Overview of all projects, tasks, and team activity</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">✅</span>
                            <h4>Tasks</h4>
                            <p>Create and manage tasks with subtasks and assignments</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">⏱️</span>
                            <h4>Time Tracking</h4>
                            <p>Track time spent on projects and tasks</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🏢</span>
                            <h4>Departments</h4>
                            <p>Manage department budgets and spending</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">💬</span>
                            <h4>Chat</h4>
                            <p>Team communication and collaboration</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">📁</span>
                            <h4>Files</h4>
                            <p>Upload and manage project documents</p>
                        </div>
                    </div>

                    <h3>How Everything Links Together:</h3>
                    <div className="workflow-diagram">
                        <p><strong>1. Projects</strong> → Created and managed in Dashboard</p>
                        <p><strong>2. Departments</strong> → Assigned budgets and linked to projects</p>
                        <p><strong>3. Tasks</strong> → Created under projects, assigned to team members</p>
                        <p><strong>4. Sub-Tasks</strong> → Break down tasks into smaller pieces</p>
                        <p><strong>5. Time Tracking</strong> → Track hours on tasks and projects</p>
                        <p><strong>6. Budget Documentation</strong> → Upload spend breakdown files</p>
                        <p><strong>7. Reports</strong> → View analytics and budget reports</p>
                        <p><strong>8. Files</strong> → Attach documents to projects</p>
                        <p><strong>9. Chat</strong> → Discuss projects and tasks with team</p>
                    </div>
                </div>
            )
        },
        dashboard: {
            title: 'Dashboard',
            icon: '📊',
            content: (
                <div className="help-content">
                    <h2>Dashboard - Your Control Center</h2>

                    <button className="start-tour-btn" onClick={() => handleStartTour('dashboard')}>
                        🎯 Start Dashboard Guide
                    </button>

                    <h3>What You'll See:</h3>
                    <ul>
                        <li><strong>Project Overview Cards:</strong> Quick stats on all your projects</li>
                        <li><strong>Active Projects List:</strong> All ongoing projects with progress bars</li>
                        <li><strong>Recent Activity:</strong> Latest updates from your team</li>
                        <li><strong>Quick Stats:</strong> Total projects, tasks completed, team members</li>
                    </ul>

                    <h3>How to Use:</h3>
                    <ol>
                        <li><strong>View Projects:</strong> See all projects with status (Planning, Active, On Hold, Completed, Cancelled)</li>
                        <li><strong>Create New Project:</strong> Click "New Project" button in top right</li>
                        <li><strong>Edit Project:</strong> Click "Edit" button on any project card</li>
                        <li><strong>Monitor Progress:</strong> Progress bars show completion percentage</li>
                    </ol>

                    <h3>Project Fields Explained:</h3>
                    <ul>
                        <li><strong>Name:</strong> Project title</li>
                        <li><strong>Code:</strong> Unique identifier (optional)</li>
                        <li><strong>Status:</strong> Current phase of the project</li>
                        <li><strong>Priority:</strong> Low, Medium, High, or Critical</li>
                        <li><strong>Manager:</strong> Person responsible for the project</li>
                        <li><strong>Team:</strong> Members assigned to this project</li>
                        <li><strong>Client:</strong> External client or stakeholder</li>
                        <li><strong>Budget:</strong> Allocated amount and spent amount</li>
                        <li><strong>Dates:</strong> Start and end dates for planning</li>
                        <li><strong>Progress:</strong> 0-100% completion</li>
                    </ul>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Keep project status updated so team members know what's active!
                    </div>
                </div>
            )
        },
        tasks: {
            title: 'Tasks & Sub-Tasks',
            icon: '✅',
            content: (
                <div className="help-content">
                    <h2>Tasks & Sub-Tasks Management</h2>

                    <button className="start-tour-btn" onClick={() => handleStartTour('tasks')}>
                        🎯 Start Tasks Guide
                    </button>

                    <h3>Understanding the Task System:</h3>
                    <p>Tasks are organized in a hierarchy:</p>
                    <div className="hierarchy-box">
                        <p><strong>Project</strong> (Main container)</p>
                        <p>└─ <strong>Task</strong> (Major work item)</p>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;└─ <strong>Sub-Task</strong> (Smaller actionable items)</p>
                    </div>

                    <h3>Creating Tasks:</h3>
                    <ol>
                        <li>Go to the <strong>Tasks</strong> page from the sidebar</li>
                        <li>Click <strong>"Create Task"</strong> button</li>
                        <li>Fill in the details:
                            <ul>
                                <li><strong>Title:</strong> Clear name for the task</li>
                                <li><strong>Description:</strong> Details about what needs to be done</li>
                                <li><strong>Project:</strong> Which project this belongs to</li>
                                <li><strong>Department:</strong> Which department is responsible</li>
                                <li><strong>Assigned To:</strong> Team members responsible (can select multiple)</li>
                                <li><strong>Priority:</strong> Urgency level</li>
                                <li><strong>Status:</strong> Todo, In Progress, In Review, or Done</li>
                                <li><strong>Due Date:</strong> Deadline for completion</li>
                                <li><strong>Estimated Hours:</strong> How long you think it will take</li>
                            </ul>
                        </li>
                        <li>Click <strong>"Create Task"</strong></li>
                    </ol>

                    <h3>Adding Sub-Tasks:</h3>
                    <ol>
                        <li>Click on a task to expand it</li>
                        <li>Click <strong>"Add Sub-Task"</strong> button</li>
                        <li>Enter sub-task details (title, assigned person, due date)</li>
                        <li>Sub-tasks help break down complex work into manageable pieces</li>
                    </ol>

                    <h3>Task Statuses:</h3>
                    <ul>
                        <li><strong>📝 Todo:</strong> Not started yet</li>
                        <li><strong>🔄 In Progress:</strong> Currently being worked on</li>
                        <li><strong>👀 In Review:</strong> Completed, waiting for review/approval</li>
                        <li><strong>✅ Done:</strong> Fully completed and approved</li>
                    </ul>

                    <h3>Filtering & Searching:</h3>
                    <ul>
                        <li>Use <strong>Status Filter</strong> to see tasks by their status</li>
                        <li>Use <strong>Priority Filter</strong> to see high-priority items</li>
                        <li>Use <strong>Search Bar</strong> to find specific tasks by name</li>
                    </ul>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Task progress auto-calculates based on sub-task completion!
                    </div>
                </div>
            )
        },
        timeTracking: {
            title: 'Time Tracking',
            icon: '⏱️',
            content: (
                <div className="help-content">
                    <h2>Time Tracking System</h2>

                    <button className="start-tour-btn" onClick={() => handleStartTour('timeTracking')}>
                        🎯 Start Time Tracking Guide
                    </button>

                    <h3>Purpose:</h3>
                    <p>Track how much time you and your team spend on different projects and tasks. This helps with:</p>
                    <ul>
                        <li>Understanding project costs</li>
                        <li>Estimating future work better</li>
                        <li>Seeing where time is being spent</li>
                        <li>Billing clients accurately</li>
                    </ul>

                    <h3>How to Track Time:</h3>

                    <h4>Method 1: Start/Stop Timer</h4>
                    <ol>
                        <li>Go to <strong>Time Tracking</strong> page</li>
                        <li>Click <strong>"Start Tracking"</strong></li>
                        <li>Select the <strong>Project</strong> and optionally a <strong>Task</strong></li>
                        <li>Add a <strong>Description</strong> of what you're working on</li>
                        <li>Check <strong>"Billable"</strong> if this time should be charged to client</li>
                        <li>Click <strong>"Start Timer"</strong></li>
                        <li>Work on your task</li>
                        <li>When done, click <strong>"Stop"</strong></li>
                    </ol>

                    <h4>Method 2: Manual Entry</h4>
                    <ol>
                        <li>Click <strong>"Add Manual Entry"</strong></li>
                        <li>Select Project and Task</li>
                        <li>Enter Start Time and End Time</li>
                        <li>System calculates duration automatically</li>
                        <li>Click <strong>"Save Entry"</strong></li>
                    </ol>

                    <h3>Viewing Time Entries:</h3>
                    <ul>
                        <li><strong>Today's Entries:</strong> See all time tracked today</li>
                        <li><strong>Weekly Summary:</strong> Total hours tracked this week</li>
                        <li><strong>By Project:</strong> Filter to see time per project</li>
                        <li><strong>Billable vs Non-Billable:</strong> Separate tracking for billing</li>
                    </ul>

                    <h3>Important Notes:</h3>
                    <div className="warning-box">
                        <p><strong>⚠️ Current Limitation:</strong> Time tracking does NOT automatically update budget spend amounts. Budget spend must be entered manually in the Departments section.</p>
                        <p>Future versions may include automatic cost calculation based on hourly rates.</p>
                    </div>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Track time regularly for accurate project reporting!
                    </div>
                </div>
            )
        },
        departments: {
            title: 'Departments & Budget',
            icon: '🏢',
            content: (
                <div className="help-content">
                    <h2>Departments & Budget Management</h2>

                    <button className="start-tour-btn" onClick={() => handleStartTour('departments')}>
                        🎯 Start Departments Guide
                    </button>

                    <h3>What are Departments?</h3>
                    <p>Departments are organizational units (like Engineering, Marketing, Sales) that have their own budgets and team members.</p>

                    <h3>Creating Departments:</h3>
                    <ol>
                        <li>Go to <strong>Departments</strong> page</li>
                        <li>Click <strong>"Add Department"</strong></li>
                        <li>Enter:
                            <ul>
                                <li><strong>Department Name:</strong> e.g., "Engineering"</li>
                                <li><strong>Description:</strong> What this department does</li>
                                <li><strong>Department Head:</strong> Manager responsible</li>
                                <li><strong>Allocated Budget:</strong> Total budget for this department</li>
                                <li><strong>Spent:</strong> Amount already spent (manual entry)</li>
                            </ul>
                        </li>
                        <li>Click <strong>"Create Department"</strong></li>
                    </ol>

                    <h3>Budget Tracking:</h3>
                    <ul>
                        <li><strong>Allocated:</strong> Total budget assigned</li>
                        <li><strong>Spent:</strong> Amount used (entered manually)</li>
                        <li><strong>Remaining:</strong> Auto-calculated (Allocated - Spent)</li>
                        <li><strong>Utilization:</strong> Percentage used (Spent / Allocated × 100)</li>
                    </ul>

                    <h3>NEW FEATURE: Spend Documentation</h3>
                    <p>Because spend is manually entered, you can now upload documentation showing how the amount was calculated!</p>

                    <ol>
                        <li>Find the department in the table</li>
                        <li>Click the <strong>"📎 Upload"</strong> button in the Actions column</li>
                        <li>You can:
                            <ul>
                                <li><strong>Upload Excel File:</strong> Detailed spend breakdown (labor, materials, overhead)</li>
                                <li><strong>Add Link:</strong> Google Sheets, Dropbox, or any online document</li>
                                <li><strong>Add Notes:</strong> Explain how spend was calculated</li>
                            </ul>
                        </li>
                        <li>Click <strong>"Save Documentation"</strong></li>
                    </ol>

                    <p>After uploading:</p>
                    <ul>
                        <li>Button changes to <strong>"📄 Docs"</strong> (green)</li>
                        <li><strong>⬇️ Download</strong> button appears to get the file</li>
                        <li><strong>🔗 Link</strong> button opens external links</li>
                        <li>Delete button to remove documentation</li>
                    </ul>

                    <h3>Budget Dashboard:</h3>
                    <p>Top of the page shows totals across all departments:</p>
                    <ul>
                        <li><strong>Total Budget:</strong> Sum of all department budgets</li>
                        <li><strong>Total Spent:</strong> Sum of all spending</li>
                        <li><strong>Remaining:</strong> What's left overall</li>
                        <li><strong>Utilization:</strong> Overall percentage used</li>
                    </ul>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Always upload documentation when you update the spent amount for transparency!
                    </div>
                </div>
            )
        },
        reports: {
            title: 'Reports & Analytics',
            icon: '📈',
            content: (
                <div className="help-content">
                    <h2>Reports & Analytics</h2>

                    <h3>Available Reports:</h3>

                    <h4>1. Budget Analysis Report</h4>
                    <ul>
                        <li>Shows budget vs spend for all departments</li>
                        <li>Displays utilization percentages</li>
                        <li>Helps identify over-budget departments</li>
                        <li>Red bars indicate over-budget (&gt;100%)</li>
                        <li>Orange bars indicate high usage (75-100%)</li>
                        <li>Blue bars indicate normal usage (&lt;75%)</li>
                    </ul>

                    <h4>2. Department Analytics</h4>
                    <ul>
                        <li>Detailed breakdown per department</li>
                        <li>Budget allocation and spending trends</li>
                        <li>Team member assignments</li>
                    </ul>

                    <h3>How to Use Reports:</h3>
                    <ol>
                        <li>Go to <strong>Reports</strong> page</li>
                        <li>Select the report type you want</li>
                        <li>Review the data and charts</li>
                        <li>Use insights to make budget decisions</li>
                    </ol>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Review reports weekly to stay on top of budgets!
                    </div>
                </div>
            )
        },
        files: {
            title: 'File Management',
            icon: '📁',
            content: (
                <div className="help-content">
                    <h2>File Management System</h2>

                    <button className="start-tour-btn" onClick={() => handleStartTour('files')}>
                        🎯 Start Files Guide
                    </button>

                    <h3>Purpose:</h3>
                    <p>Store and manage all project-related documents in one place.</p>

                    <h3>Uploading Files:</h3>
                    <ol>
                        <li>Go to <strong>Files</strong> page</li>
                        <li>Click <strong>"Upload File"</strong></li>
                        <li>Select file from your computer</li>
                        <li>Choose which <strong>Project</strong> it belongs to (optional)</li>
                        <li>Add <strong>Description</strong> and <strong>Tags</strong> for easy searching</li>
                        <li>Click <strong>"Upload"</strong></li>
                    </ol>

                    <h3>File Types Supported:</h3>
                    <ul>
                        <li>Documents: PDF, Word, Excel</li>
                        <li>Images: JPG, PNG, GIF</li>
                        <li>Archives: ZIP, RAR</li>
                        <li>Maximum size: 100MB per file</li>
                    </ul>

                    <h3>Finding Files:</h3>
                    <ul>
                        <li><strong>Filter by Project:</strong> See only files for specific projects</li>
                        <li><strong>Search:</strong> Find files by name or description</li>
                        <li><strong>Sort:</strong> By date, name, or size</li>
                    </ul>

                    <h3>Downloading & Deleting:</h3>
                    <ul>
                        <li>Click file name or <strong>Download</strong> button to get file</li>
                        <li>Click <strong>Delete</strong> to remove (be careful!)</li>
                    </ul>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Use tags like "contract", "design", "final" to organize files!
                    </div>
                </div>
            )
        },
        chat: {
            title: 'Team Chat',
            icon: '💬',
            content: (
                <div className="help-content">
                    <h2>Team Chat & Communication</h2>

                    <button className="start-tour-btn" onClick={() => handleStartTour('chat')}>
                        🎯 Start Chat Guide
                    </button>

                    <h3>Purpose:</h3>
                    <p>Real-time communication with your team about projects and tasks.</p>

                    <h3>Chat Features:</h3>
                    <ul>
                        <li><strong>Channels:</strong> Organized discussion groups</li>
                        <li><strong>Direct Messages:</strong> One-on-one conversations</li>
                        <li><strong>Project Channels:</strong> Discuss specific projects</li>
                        <li><strong>File Sharing:</strong> Share documents in chat</li>
                    </ul>

                    <h3>Using Chat:</h3>
                    <ol>
                        <li>Select a <strong>Channel</strong> from the left sidebar</li>
                        <li>Type your message in the text box at bottom</li>
                        <li>Press <strong>Enter</strong> or click <strong>Send</strong></li>
                        <li>Messages appear instantly for all channel members</li>
                    </ol>

                    <h3>Best Practices:</h3>
                    <ul>
                        <li>Use project-specific channels for project discussions</li>
                        <li>Use general channel for company-wide announcements</li>
                        <li>Tag people with @name to get their attention</li>
                        <li>Keep conversations professional and on-topic</li>
                    </ul>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Create channels for each major project!
                    </div>
                </div>
            )
        },
        video: {
            title: 'Video Meetings',
            icon: '🎥',
            content: (
                <div className="help-content">
                    <h2>Video Meetings</h2>

                    <h3>Purpose:</h3>
                    <p>Conduct virtual meetings with your team members.</p>

                    <h3>Starting a Video Call:</h3>
                    <ol>
                        <li>Go to <strong>Video</strong> page</li>
                        <li>Click <strong>"Start New Meeting"</strong></li>
                        <li>Share the meeting link with participants</li>
                        <li>Click <strong>"Join"</strong> to enter the call</li>
                    </ol>

                    <h3>Meeting Controls:</h3>
                    <ul>
                        <li><strong>Mute/Unmute:</strong> Control your microphone</li>
                        <li><strong>Video On/Off:</strong> Control your camera</li>
                        <li><strong>Screen Share:</strong> Share your screen with others</li>
                        <li><strong>Leave Call:</strong> Exit the meeting</li>
                    </ul>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Test your camera and mic before important meetings!
                    </div>
                </div>
            )
        },
        settings: {
            title: 'Settings',
            icon: '⚙️',
            content: (
                <div className="help-content">
                    <h2>Settings & Configuration</h2>

                    <h3>User Settings:</h3>
                    <ul>
                        <li><strong>Profile:</strong> Update your name, email, avatar</li>
                        <li><strong>Password:</strong> Change your password</li>
                        <li><strong>Notifications:</strong> Control what alerts you receive</li>
                        <li><strong>Theme:</strong> Light or dark mode preferences</li>
                    </ul>

                    <h3>Admin Settings (Admin Only):</h3>
                    <ul>
                        <li><strong>User Management:</strong> Add, edit, or remove users</li>
                        <li><strong>Roles & Permissions:</strong> Control who can access what</li>
                        <li><strong>System Settings:</strong> Configure system-wide options</li>
                    </ul>

                    <div className="tip-box">
                        <strong>💡 Tip:</strong> Keep your profile updated so team members can identify you!
                    </div>
                </div>
            )
        },
        workflows: {
            title: 'Common Workflows',
            icon: '🔄',
            content: (
                <div className="help-content">
                    <h2>Common Workflows</h2>

                    <h3>Workflow 1: Starting a New Project</h3>
                    <ol>
                        <li><strong>Dashboard:</strong> Click "New Project", fill in details</li>
                        <li><strong>Departments:</strong> Allocate budget to relevant department</li>
                        <li><strong>Tasks:</strong> Create tasks for project milestones</li>
                        <li><strong>Tasks:</strong> Break down tasks into sub-tasks</li>
                        <li><strong>Tasks:</strong> Assign tasks to team members</li>
                        <li><strong>Chat:</strong> Create project channel for discussion</li>
                        <li><strong>Files:</strong> Upload project documents</li>
                    </ol>

                    <h3>Workflow 2: Tracking Project Progress</h3>
                    <ol>
                        <li><strong>Time Tracking:</strong> Team members track time on tasks</li>
                        <li><strong>Tasks:</strong> Update task statuses as work completes</li>
                        <li><strong>Tasks:</strong> Mark sub-tasks as done</li>
                        <li><strong>Dashboard:</strong> Monitor overall project progress</li>
                        <li><strong>Reports:</strong> Review budget and time reports</li>
                    </ol>

                    <h3>Workflow 3: Managing Department Budget</h3>
                    <ol>
                        <li><strong>Departments:</strong> Set allocated budget</li>
                        <li><strong>Time Tracking:</strong> Team tracks hours</li>
                        <li><strong>Departments:</strong> Manually update spent amount</li>
                        <li><strong>Departments:</strong> Upload spend documentation (Excel/link)</li>
                        <li><strong>Reports:</strong> Review Budget Analysis Report</li>
                        <li><strong>Departments:</strong> Adjust budgets if needed</li>
                    </ol>

                    <h3>Workflow 4: Team Collaboration</h3>
                    <ol>
                        <li><strong>Tasks:</strong> Assign task to team member</li>
                        <li><strong>Chat:</strong> Discuss task in project channel</li>
                        <li><strong>Files:</strong> Share necessary documents</li>
                        <li><strong>Video:</strong> Hold meeting if needed</li>
                        <li><strong>Tasks:</strong> Update progress and complete</li>
                    </ol>
                </div>
            )
        },
        faq: {
            title: 'FAQ',
            icon: '❓',
            content: (
                <div className="help-content">
                    <h2>Frequently Asked Questions</h2>

                    <h3>Q: How is the "Spent" amount calculated in Departments?</h3>
                    <p><strong>A:</strong> The spent amount is <strong>manually entered</strong> by administrators. It does NOT automatically calculate from time tracking. You should upload documentation (Excel file or link) showing how you calculated the spend amount.</p>

                    <h3>Q: Does time tracking automatically update budget spend?</h3>
                    <p><strong>A:</strong> No, currently time tracking and budget tracking are separate. Time tracking shows hours worked, but you must manually enter the spent amount in the Departments section. Future versions may include automatic calculation.</p>

                    <h3>Q: Can I assign a task to multiple people?</h3>
                    <p><strong>A:</strong> Yes! When creating a task, you can select multiple team members in the "Assigned To" field. Each person will see the task in their task list.</p>

                    <h3>Q: How do sub-tasks affect main task progress?</h3>
                    <p><strong>A:</strong> Task progress is automatically calculated based on sub-task completion. If you have 4 sub-tasks and 2 are done, the task shows 50% progress.</p>

                    <h3>Q: What file types can I upload?</h3>
                    <p><strong>A:</strong> You can upload most common file types including documents (PDF, Word, Excel), images (JPG, PNG), and archives (ZIP). Maximum file size is 100MB.</p>

                    <h3>Q: Can I delete a project?</h3>
                    <p><strong>A:</strong> Projects can be marked as "Cancelled" status. Only admins can delete projects permanently. Contact your system administrator if needed.</p>

                    <h3>Q: How do I know if I'm over budget?</h3>
                    <p><strong>A:</strong> Go to Reports → Budget Analysis Report. Departments with red bars are over budget (&gt;100% utilization). Orange bars indicate high usage (75-100%).</p>

                    <h3>Q: Can I export reports?</h3>
                    <p><strong>A:</strong> Currently, reports are view-only in the web interface. You can take screenshots or use your browser's print function to save as PDF.</p>

                    <h3>Q: Who can see my time tracking?</h3>
                    <p><strong>A:</strong> Team members can see their own time entries. Managers and admins can see time entries for their projects and team members.</p>

                    <h3>Q: How do I get help or report a bug?</h3>
                    <p><strong>A:</strong> Contact your system administrator or email support. They can assist with technical issues or feature requests.</p>
                </div>
            )
        }
    };

    const sectionList = [
        { id: 'overview', icon: '🏠', label: 'System Overview' },
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'tasks', icon: '✅', label: 'Tasks & Sub-Tasks' },
        { id: 'timeTracking', icon: '⏱️', label: 'Time Tracking' },
        { id: 'departments', icon: '🏢', label: 'Departments & Budget' },
        { id: 'reports', icon: '📈', label: 'Reports' },
        { id: 'files', icon: '📁', label: 'Files' },
        { id: 'chat', icon: '💬', label: 'Chat' },
        { id: 'video', icon: '🎥', label: 'Video' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
        { id: 'workflows', icon: '🔄', label: 'Common Workflows' },
        { id: 'faq', icon: '❓', label: 'FAQ' }
    ];

    const filteredSections = searchQuery
        ? sectionList.filter(section =>
            section.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : sectionList;

    return (
        <div className="help-modal-overlay" onClick={onClose}>
            <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                <div className="help-modal-header">
                    <h2>📚 Help & Documentation</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="help-modal-body">
                    <div className="help-sidebar">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search help topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <nav className="help-nav">
                            {filteredSections.map(section => (
                                <button
                                    key={section.id}
                                    className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <span className="nav-icon">{section.icon}</span>
                                    <span className="nav-label">{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="help-main-content">
                        {helpSections[activeSection].content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
