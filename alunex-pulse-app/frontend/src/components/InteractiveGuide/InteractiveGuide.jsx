import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./InteractiveGuide.css";

const InteractiveGuide = {
    // Dashboard Tour
    startDashboardTour: () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    element: '.dashboard',
                    popover: {
                        title: 'Welcome to Dashboard',
                        description: 'This is your command center where you can see all your projects at a glance.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.create-project-btn',
                    popover: {
                        title: 'Create New Project',
                        description: 'Click here to create a new project. You can add project details, assign team members, and set budgets.',
                        position: 'left'
                    }
                },
                {
                    element: '.project-card',
                    popover: {
                        title: 'Project Cards',
                        description: 'Each card shows project information including status, progress, budget, and team members.',
                        position: 'top'
                    }
                },
                {
                    element: '.project-status',
                    popover: {
                        title: 'Project Status',
                        description: 'Status indicators show whether a project is Planning, Active, On Hold, Completed, or Cancelled.',
                        position: 'top'
                    }
                },
                {
                    element: '.progress-bar',
                    popover: {
                        title: 'Progress Tracking',
                        description: 'Visual progress bars show how much of the project is completed (0-100%).',
                        position: 'top'
                    }
                }
            ],
            onDestroyStarted: () => {
                driverObj.destroy();
            }
        });
        driverObj.drive();
    },

    // Tasks Tour
    startTasksTour: () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    popover: {
                        title: 'Tasks Management',
                        description: 'This page helps you manage all your tasks and sub-tasks. Let\'s explore the features!',
                    }
                },
                {
                    element: '.create-task-btn',
                    popover: {
                        title: 'Create a Task',
                        description: 'Click here to create a new task. You can assign it to a project, set priority, due date, and assign team members.',
                        position: 'left'
                    }
                },
                {
                    element: '.filter-section',
                    popover: {
                        title: 'Filter Tasks',
                        description: 'Use these filters to view tasks by status (Todo, In Progress, In Review, Done) or priority level.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.search-bar',
                    popover: {
                        title: 'Search Tasks',
                        description: 'Quickly find tasks by typing keywords in the search bar.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.task-item',
                    popover: {
                        title: 'Task Details',
                        description: 'Each task shows title, description, assigned members, status, priority, and progress.',
                        position: 'top'
                    }
                },
                {
                    element: '.subtask-section',
                    popover: {
                        title: 'Sub-Tasks',
                        description: 'Break down complex tasks into smaller sub-tasks. Progress is automatically calculated based on sub-task completion.',
                        position: 'top'
                    }
                },
                {
                    element: '.add-subtask-btn',
                    popover: {
                        title: 'Add Sub-Task',
                        description: 'Click here to add a sub-task to break down the work into manageable pieces.',
                        position: 'left'
                    }
                }
            ],
            onDestroyStarted: () => {
                driverObj.destroy();
            }
        });
        driverObj.drive();
    },

    // Time Tracking Tour
    startTimeTrackingTour: () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    popover: {
                        title: 'Time Tracking',
                        description: 'Track time spent on projects and tasks to monitor productivity and costs.',
                    }
                },
                {
                    element: '.start-timer-btn',
                    popover: {
                        title: 'Start Timer',
                        description: 'Click here to start tracking time. Select a project and task, then start the timer.',
                        position: 'left'
                    }
                },
                {
                    element: '.manual-entry-btn',
                    popover: {
                        title: 'Manual Entry',
                        description: 'Add time entries manually by specifying start and end times.',
                        position: 'left'
                    }
                },
                {
                    element: '.time-entry-list',
                    popover: {
                        title: 'Time Entries',
                        description: 'View all your time entries here. You can see what you worked on, for how long, and whether it\'s billable.',
                        position: 'top'
                    }
                },
                {
                    element: '.billable-toggle',
                    popover: {
                        title: 'Billable Hours',
                        description: 'Mark time as billable if it should be charged to a client.',
                        position: 'top'
                    }
                },
                {
                    element: '.time-summary',
                    popover: {
                        title: 'Time Summary',
                        description: 'See total hours tracked today, this week, and by project.',
                        position: 'bottom'
                    }
                }
            ],
            onDestroyStarted: () => {
                driverObj.destroy();
            }
        });
        driverObj.drive();
    },

    // Departments Tour
    startDepartmentsTour: () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    popover: {
                        title: 'Departments & Budget',
                        description: 'Manage department budgets and track spending. Let\'s see how it works!',
                    }
                },
                {
                    element: '.budget-dashboard',
                    popover: {
                        title: 'Budget Overview',
                        description: 'This shows total budget across all departments, total spent, and remaining budget.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.add-department-btn',
                    popover: {
                        title: 'Create Department',
                        description: 'Click here to create a new department. You\'ll assign a budget and track spending.',
                        position: 'left'
                    }
                },
                {
                    element: '.department-table',
                    popover: {
                        title: 'Departments Table',
                        description: 'View all departments with their allocated budgets, spent amounts, and utilization percentages.',
                        position: 'top'
                    }
                },
                {
                    element: '.edit-department-btn',
                    popover: {
                        title: 'Edit Department',
                        description: 'Click the edit button to update department details, budget, or spending.',
                        position: 'left'
                    }
                },
                {
                    element: '.upload-docs-btn',
                    popover: {
                        title: 'Upload Documentation',
                        description: 'IMPORTANT: Upload spend breakdown files (Excel) or links (Google Sheets) to document how the spent amount was calculated.',
                        position: 'left'
                    }
                },
                {
                    element: '.budget-utilization',
                    popover: {
                        title: 'Budget Utilization',
                        description: 'Color-coded bars show budget usage: Red = over budget (&gt;100%), Orange = high usage (75-100%), Blue = normal usage (&lt;75%).',
                        position: 'top'
                    }
                }
            ],
            onDestroyStarted: () => {
                driverObj.destroy();
            }
        });
        driverObj.drive();
    },

    // Chat Tour
    startChatTour: () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    popover: {
                        title: 'Team Chat',
                        description: 'Communicate with your team in real-time. Let\'s explore the chat features!',
                    }
                },
                {
                    element: '.channel-list',
                    popover: {
                        title: 'Channels',
                        description: 'Select a channel to view and participate in conversations. Channels can be project-specific or general.',
                        position: 'right'
                    }
                },
                {
                    element: '.create-channel-btn',
                    popover: {
                        title: 'Create Channel',
                        description: 'Click here to create a new channel for team discussions.',
                        position: 'right'
                    }
                },
                {
                    element: '.chat-messages',
                    popover: {
                        title: 'Messages',
                        description: 'View all messages in the selected channel. Messages appear in real-time.',
                        position: 'left'
                    }
                },
                {
                    element: '.message-input',
                    popover: {
                        title: 'Send Messages',
                        description: 'Type your message here and press Enter or click Send.',
                        position: 'top'
                    }
                },
                {
                    element: '.attach-file-btn',
                    popover: {
                        title: 'Share Files',
                        description: 'Attach files to your messages to share with team members.',
                        position: 'top'
                    }
                }
            ],
            onDestroyStarted: () => {
                driverObj.destroy();
            }
        });
        driverObj.drive();
    },

    // Files Tour
    startFilesTour: () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    popover: {
                        title: 'File Management',
                        description: 'Store and manage all your project documents in one place.',
                    }
                },
                {
                    element: '.upload-file-btn',
                    popover: {
                        title: 'Upload Files',
                        description: 'Click here to upload documents, images, or other files to the system.',
                        position: 'left'
                    }
                },
                {
                    element: '.file-filters',
                    popover: {
                        title: 'Filter Files',
                        description: 'Filter files by project or use the search bar to find specific documents.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.file-list',
                    popover: {
                        title: 'File List',
                        description: 'View all uploaded files with details like name, size, upload date, and associated project.',
                        position: 'top'
                    }
                },
                {
                    element: '.download-file-btn',
                    popover: {
                        title: 'Download Files',
                        description: 'Click the download button to get a copy of the file.',
                        position: 'left'
                    }
                }
            ],
            onDestroyStarted: () => {
                driverObj.destroy();
            }
        });
        driverObj.drive();
    },

    // General Tour (Quick overview of navigation)
    startGeneralTour: () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    popover: {
                        title: 'Welcome to Alunex Project Management',
                        description: 'Let\'s take a quick tour to help you get started! Click Next to continue.',
                    }
                },
                {
                    element: '.sidebar',
                    popover: {
                        title: 'Navigation Sidebar',
                        description: 'Use this sidebar to navigate between different sections: Dashboard, Tasks, Time Tracking, Departments, Chat, Files, and more.',
                        position: 'right'
                    }
                },
                {
                    element: '.navbar',
                    popover: {
                        title: 'Top Navigation',
                        description: 'The top bar shows your profile, notifications, and the help button.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.help-btn',
                    popover: {
                        title: 'Help & Guides',
                        description: 'Click here anytime to access help documentation or start an interactive guide for any section.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.dashboard-link',
                    popover: {
                        title: 'Dashboard',
                        description: 'Your control center - view all projects, recent activity, and quick stats.',
                        position: 'right'
                    }
                },
                {
                    element: '.tasks-link',
                    popover: {
                        title: 'Tasks',
                        description: 'Create and manage tasks and sub-tasks, assign team members, and track progress.',
                        position: 'right'
                    }
                },
                {
                    element: '.time-tracking-link',
                    popover: {
                        title: 'Time Tracking',
                        description: 'Track time spent on projects and tasks using timers or manual entries.',
                        position: 'right'
                    }
                },
                {
                    element: '.departments-link',
                    popover: {
                        title: 'Departments',
                        description: 'Manage department budgets, track spending, and upload spend documentation.',
                        position: 'right'
                    }
                },
                {
                    popover: {
                        title: 'You\'re All Set!',
                        description: 'You can start a specific guide for any page from the Help menu. Click Done to finish this tour.',
                    }
                }
            ],
            onDestroyStarted: () => {
                driverObj.destroy();
            }
        });
        driverObj.drive();
    }
};

export default InteractiveGuide;
