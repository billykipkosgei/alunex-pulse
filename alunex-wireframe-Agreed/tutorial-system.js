// Interactive Tutorial & Help System
// This provides contextual help on any page

let currentStep = 0;
let tutorialActive = false;

// Tutorial steps for each page
const tutorials = {
    dashboard: [
        {
            element: '.logo',
            title: 'Welcome to Alunex PM',
            content: 'This is your project management dashboard. Let\'s take a quick tour of the main features!',
            position: 'bottom'
        },
        {
            element: 'select.form-control',
            title: 'Project Selector',
            content: 'Use this dropdown to filter the dashboard by specific projects. Select "All Projects" to see everything, or choose individual projects.',
            position: 'bottom'
        },
        {
            element: '.stats-grid',
            title: 'Key Metrics',
            content: 'These cards show your important metrics: hours logged, active tasks, team status, and project count. Updated in real-time!',
            position: 'bottom'
        },
        {
            element: '.sidebar',
            title: 'Navigation Menu',
            content: 'Use this sidebar to navigate between different features: Time Tracking, Tasks, Departments, Chat, Files, Reports, and more.',
            position: 'right'
        },
        {
            element: '.user-avatar',
            title: 'User Profile',
            content: 'Click here to access your profile settings, notifications, and logout options.',
            position: 'bottom'
        }
    ],
    'time-tracking': [
        {
            element: '.page-header',
            title: 'Time Tracking',
            content: 'Track time spent on projects and tasks. Integrated with Clockify for accurate time logging.',
            position: 'bottom'
        },
        {
            element: '[style*="font-size: 64px"]',
            title: 'Active Timer',
            content: 'This is your running timer. It shows hours:minutes:seconds. Click "Stop Timer" when you\'re done working.',
            position: 'bottom'
        },
        {
            element: 'select.form-control',
            title: 'Select Project',
            content: 'Choose which project you\'re working on. This helps track time per project.',
            position: 'bottom'
        },
        {
            element: 'input[placeholder*="What are you working"]',
            title: 'Task Description',
            content: 'Describe what you\'re working on. Be specific: "Aluminum Frame Installation - Building A"',
            position: 'bottom'
        }
    ],
    tasks: [
        {
            element: '.page-header',
            title: 'Task Management',
            content: 'Manage tasks using a Kanban board. Move tasks through stages: To Do → In Progress → Completed',
            position: 'bottom'
        },
        {
            element: '.kanban-board',
            title: 'Kanban Board',
            content: 'Tasks are organized in columns. Drag and drop tasks between columns to update their status.',
            position: 'top'
        },
        {
            element: '.kanban-card',
            title: 'Task Cards',
            content: 'Each card shows: task name, description, assigned person, due date, and time logged. Click to edit.',
            position: 'bottom'
        }
    ],
    departments: [
        {
            element: '.page-header',
            title: 'Departments & Budget Management',
            content: 'Manage department budgets, allocations, and track spending for your projects.',
            position: 'bottom'
        },
        {
            element: '.project-summary',
            title: 'Project Budget Overview',
            content: 'This shows your total project value, profit margin, working budget, and total spent. Set these values when creating a new project.',
            position: 'bottom'
        },
        {
            element: '.dept-card',
            title: 'Department Budget Cards',
            content: 'Each department has its own budget allocation. The progress bar shows how much of the budget has been spent.',
            position: 'bottom'
        },
        {
            element: '.dept-card.engineering',
            title: 'Engineering Department',
            content: 'Engineering handles: Design, Material Submittal, Structural Analysis, RFI, Material Take-off, Job Order, and Coordinates.',
            position: 'bottom'
        }
    ]
};

// Tooltip/hint content for specific elements
const hints = {
    '.sidebar-item': 'Click to navigate to different sections of the system',
    '.btn-primary': 'Primary action button - click to perform the main action',
    '.form-control': 'Input field - click to enter or select data',
    '.user-avatar': 'Your profile - click to access settings and logout',
    '.stats-grid': 'Real-time metrics updated as your team works',
    '.kanban-card': 'Drag to move between columns or click to edit details',
    '.dept-card': 'Click "View Details" to see department analytics and reports',
    'select': 'Dropdown menu - click to see available options'
};

// Show tooltip on hover
function initializeHints() {
    Object.keys(hints).forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                if (!tutorialActive) {
                    showQuickHint(e.target, hints[selector]);
                }
            });
            element.addEventListener('mouseleave', () => {
                removeQuickHint();
            });
        });
    });
}

// Show quick hint tooltip
function showQuickHint(element, text) {
    const existing = document.querySelector('.quick-hint');
    if (existing) existing.remove();
    
    const hint = document.createElement('div');
    hint.className = 'quick-hint';
    hint.innerHTML = `
        <div style="
            position: absolute;
            background: #1e293b;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            z-index: 10000;
            max-width: 200px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            pointer-events: none;
        ">
            <div style="display: flex; align-items: center; gap: 6px;">
                <svg style="width: 14px; height: 14px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${text}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(hint);
    
    const rect = element.getBoundingClientRect();
    const hintElement = hint.firstElementChild;
    hintElement.style.top = (rect.bottom + 8) + 'px';
    hintElement.style.left = (rect.left + rect.width / 2) + 'px';
    hintElement.style.transform = 'translateX(-50%)';
}

// Remove quick hint
function removeQuickHint() {
    const hint = document.querySelector('.quick-hint');
    if (hint) hint.remove();
}

// Start guided tour
function startGuidedTour() {
    const page = getCurrentPage();
    const steps = tutorials[page];
    
    if (!steps) {
        alert('No tutorial available for this page yet.');
        return;
    }
    
    tutorialActive = true;
    currentStep = 0;
    showTutorialStep(steps[currentStep]);
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('time-tracking')) return 'time-tracking';
    if (path.includes('tasks')) return 'tasks';
    if (path.includes('departments')) return 'departments';
    return 'dashboard';
}

// Show tutorial step
function showTutorialStep(step) {
    // Check if element exists BEFORE removing overlay
    const element = document.querySelector(step.element);
    if (!element) {
        console.error('Tutorial element not found:', step.element);
        // Skip to next step instead of closing tutorial
        const page = getCurrentPage();
        const steps = tutorials[page];
        currentStep++;
        if (currentStep >= steps.length) {
            endTutorial();
        } else {
            showTutorialStep(steps[currentStep]);
        }
        return;
    }

    // Remove existing tutorial overlay AFTER confirming element exists
    const existing = document.querySelector('.tutorial-overlay');
    if (existing) existing.remove();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <style>
            .tutorial-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                pointer-events: none;
            }
            .tutorial-highlight {
                position: absolute;
                border: 3px solid #2563eb;
                border-radius: 8px;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(37, 99, 235, 0.5);
                pointer-events: none;
                z-index: 10000;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(37, 99, 235, 0.5); }
                50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(37, 99, 235, 0.8); }
            }
            .tutorial-tooltip {
                position: absolute;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                max-width: 350px;
                z-index: 10001;
                pointer-events: auto;
            }
            .tutorial-tooltip h3 {
                margin: 0 0 8px 0;
                color: #1e293b;
                font-size: 18px;
            }
            .tutorial-tooltip p {
                margin: 0 0 16px 0;
                color: #64748b;
                font-size: 14px;
                line-height: 1.6;
            }
            .tutorial-buttons {
                display: flex;
                gap: 8px;
                justify-content: space-between;
                align-items: center;
            }
            .tutorial-progress {
                font-size: 12px;
                color: #94a3b8;
            }
        </style>
    `;
    
    document.body.appendChild(overlay);
    
    // Highlight element
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.className = 'tutorial-highlight';
    highlight.style.top = (rect.top - 5) + 'px';
    highlight.style.left = (rect.left - 5) + 'px';
    highlight.style.width = (rect.width + 10) + 'px';
    highlight.style.height = (rect.height + 10) + 'px';
    overlay.appendChild(highlight);
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    
    const page = getCurrentPage();
    const totalSteps = tutorials[page].length;
    
    tooltip.innerHTML = `
        <h3>${step.title}</h3>
        <p>${step.content}</p>
        <div class="tutorial-buttons">
            <span class="tutorial-progress">Step ${currentStep + 1} of ${totalSteps}</span>
            <div style="display: flex; gap: 8px;">
                <button onclick="skipTutorial()" style="padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Skip</button>
                ${currentStep > 0 ? '<button onclick="previousStep()" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Back</button>' : ''}
                <button onclick="nextStep()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
                    ${currentStep < totalSteps - 1 ? 'Next' : 'Finish'}
                </button>
            </div>
        </div>
    `;
    
    overlay.appendChild(tooltip);
    
    // Position tooltip
    const tooltipRect = tooltip.getBoundingClientRect();
    if (step.position === 'bottom') {
        tooltip.style.top = (rect.bottom + 20) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
    } else if (step.position === 'right') {
        tooltip.style.top = (rect.top) + 'px';
        tooltip.style.left = (rect.right + 20) + 'px';
    } else if (step.position === 'top') {
        tooltip.style.top = (rect.top - tooltipRect.height - 20) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
    }
}

// Next step
function nextStep() {
    const page = getCurrentPage();
    const steps = tutorials[page];
    
    currentStep++;
    if (currentStep >= steps.length) {
        endTutorial();
    } else {
        showTutorialStep(steps[currentStep]);
    }
}

// Previous step
function previousStep() {
    const page = getCurrentPage();
    const steps = tutorials[page];
    
    if (currentStep > 0) {
        currentStep--;
        showTutorialStep(steps[currentStep]);
    }
}

// Skip tutorial
function skipTutorial() {
    if (confirm('Are you sure you want to skip this tutorial?')) {
        endTutorial();
    }
}

// End tutorial
function endTutorial() {
    tutorialActive = false;
    currentStep = 0;
    const overlay = document.querySelector('.tutorial-overlay');
    if (overlay) overlay.remove();
}

// Toggle help mode
function toggleHelp() {
    const helpActive = document.body.classList.toggle('help-mode-active');
    
    if (helpActive) {
        // Show help mode notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #2563eb;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            z-index: 9998;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Help Mode Active</div>
                    <div style="font-size: 13px; opacity: 0.9;">Hover over elements to see helpful tooltips</div>
                </div>
                <button onclick="toggleHelp()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 8px;">Close</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Start showing hints
        initializeHints();
    } else {
        // Remove notification
        const notifications = document.querySelectorAll('[style*="position: fixed"]');
        notifications.forEach(n => {
            if (n.textContent.includes('Help Mode')) n.remove();
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tutorial system loaded');
    
    // Add help menu to help button
    const helpButton = document.querySelector('[onclick="toggleHelp()"]');
    if (helpButton) {
        helpButton.onclick = (e) => {
            e.preventDefault();
            showHelpMenu(e);
        };
    }
});

// Show help menu
function showHelpMenu(event) {
    // Remove existing menu
    const existing = document.querySelector('.help-menu');
    if (existing) {
        existing.remove();
        return;
    }
    
    const menu = document.createElement('div');
    menu.className = 'help-menu';
    menu.style.cssText = `
        position: fixed;
        top: 60px;
        right: 100px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 8px;
        z-index: 9999;
        min-width: 250px;
    `;
    
    menu.innerHTML = `
        <style>
            .help-menu-item {
                padding: 12px 16px;
                cursor: pointer;
                border-radius: 6px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: background 0.2s;
            }
            .help-menu-item:hover {
                background: #f8fafc;
            }
            .help-menu-item svg {
                width: 20px;
                height: 20px;
                color: #2563eb;
            }
        </style>
        <div class="help-menu-item" onclick="startGuidedTour(); document.querySelector('.help-menu').remove();">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <div>
                <div style="font-weight: 600; font-size: 14px; color: #1e293b;">Start Guided Tour</div>
                <div style="font-size: 12px; color: #64748b;">Interactive walkthrough</div>
            </div>
        </div>
        <div class="help-menu-item" onclick="toggleHelp(); document.querySelector('.help-menu').remove();">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <div>
                <div style="font-weight: 600; font-size: 14px; color: #1e293b;">Show Tooltips</div>
                <div style="font-size: 12px; color: #64748b;">Hover hints for all elements</div>
            </div>
        </div>
        <div class="help-menu-item" onclick="window.location.href='help.html'">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <div>
                <div style="font-weight: 600; font-size: 14px; color: #1e293b;">Help Center</div>
                <div style="font-size: 12px; color: #64748b;">Articles, videos, and FAQs</div>
            </div>
        </div>
        <div style="border-top: 1px solid #e2e8f0; margin: 8px 0;"></div>
        <div class="help-menu-item" onclick="alert('Keyboard shortcuts:\\n\\n• Ctrl+K: Quick search\\n• Ctrl+H: Toggle help mode\\n• Ctrl+T: Start tour'); document.querySelector('.help-menu').remove();">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div>
                <div style="font-weight: 600; font-size: 14px; color: #1e293b;">Keyboard Shortcuts</div>
                <div style="font-size: 12px; color: #64748b;">View all shortcuts</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !event.target.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}
