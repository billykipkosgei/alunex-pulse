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
                    popover: {
                        title: 'Welcome to Dashboard',
                        description: 'This is your command center where you can see all your projects at a glance. Let\'s explore the key features!',
                    }
                },
                {
                    element: '.project-selector-group',
                    popover: {
                        title: 'Project Filter',
                        description: 'Use this dropdown to filter dashboard data by specific projects. Select a project to see its stats, tasks, and team activity.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.stats-grid',
                    popover: {
                        title: 'Quick Statistics',
                        description: 'View key metrics at a glance: hours logged today, active tasks, team members online, and active projects.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.stats-grid .stat-card:first-child',
                    popover: {
                        title: 'Hours Logged Today',
                        description: 'See total hours logged today and how it compares to yesterday.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.card:has(.table)',
                    popover: {
                        title: 'Recent Tasks',
                        description: 'View your most recent tasks with their status, priority, and due dates.',
                        position: 'top'
                    }
                },
                {
                    element: '.team-activity-grid',
                    popover: {
                        title: 'Team Activity',
                        description: 'Monitor what your team members are currently working on and their hours logged today.',
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
                        title: 'Task Management',
                        description: 'Manage all your tasks using a Kanban board view. Let\'s explore the features!',
                    }
                },
                {
                    element: '.project-select',
                    popover: {
                        title: 'Filter by Project',
                        description: 'Select a project to view only tasks related to that project.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.btn-primary:has(svg)',
                    popover: {
                        title: 'Create New Task',
                        description: 'Click here to create a new task. You can assign it to team members, set priority, due date, and more.',
                        position: 'left'
                    }
                },
                {
                    element: '.kanban-board',
                    popover: {
                        title: 'Kanban Board',
                        description: 'Tasks are organized in three columns: TO DO, IN PROGRESS, and COMPLETED. Drag and drop tasks between columns to update their status.',
                        position: 'top'
                    }
                },
                {
                    element: '.kanban-column:first-child',
                    popover: {
                        title: 'TO DO Column',
                        description: 'Tasks that haven\'t been started yet appear here.',
                        position: 'right'
                    }
                },
                {
                    element: '.kanban-column:nth-child(2)',
                    popover: {
                        title: 'IN PROGRESS Column',
                        description: 'Tasks currently being worked on appear here.',
                        position: 'top'
                    }
                },
                {
                    element: '.kanban-column:last-child',
                    popover: {
                        title: 'COMPLETED Column',
                        description: 'Finished tasks appear here. You can review completed work and track progress.',
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
                    element: '.timer-container',
                    popover: {
                        title: 'Active Timer',
                        description: 'Start and stop timers to track time on projects and tasks in real-time.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.form-control:has(option)',
                    popover: {
                        title: 'Select Project',
                        description: 'Choose which project you\'re working on before starting the timer.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.btn-success',
                    popover: {
                        title: 'Start Timer',
                        description: 'Click to start tracking time for the selected project and task.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.time-log-actions',
                    popover: {
                        title: 'Export Time Logs',
                        description: 'Use the date picker to select a date, then click Export to download time logs as CSV.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.table',
                    popover: {
                        title: 'Time Entries',
                        description: 'View all your time entries with project, description, start/end times, and duration.',
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
                    element: '.budget-summary-grid',
                    popover: {
                        title: 'Budget Overview',
                        description: 'See total budget across all departments, total spent, remaining budget, and overall utilization percentage.',
                        position: 'bottom'
                    }
                },
                {
                    element: '.btn-primary',
                    popover: {
                        title: 'Create Department',
                        description: 'Click here to create a new department and assign a budget.',
                        position: 'left'
                    }
                },
                {
                    element: '.table',
                    popover: {
                        title: 'Departments Table',
                        description: 'View all departments with their allocated budgets, spent amounts, remaining budgets, and utilization percentages.',
                        position: 'top'
                    }
                },
                {
                    element: '.table tbody tr:first-child',
                    popover: {
                        title: 'Department Actions',
                        description: 'Each department has Edit, Upload Documentation, Download, and Delete buttons for management.',
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
                    element: '.channels-sidebar',
                    popover: {
                        title: 'Channels List',
                        description: 'Select a channel to view and participate in conversations. Channels can be project-specific or general.',
                        position: 'right'
                    }
                },
                {
                    element: '.chat-messages',
                    popover: {
                        title: 'Messages',
                        description: 'View all messages in the selected channel. Messages appear in real-time as team members send them.',
                        position: 'left'
                    }
                },
                {
                    element: '.message-input',
                    popover: {
                        title: 'Send Messages',
                        description: 'Type your message here and press Enter or click Send to share with the channel.',
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
                    element: '.btn-primary',
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
                    element: '.table',
                    popover: {
                        title: 'File List',
                        description: 'View all uploaded files with details like name, size, upload date, and associated project.',
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
