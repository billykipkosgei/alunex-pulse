// Page generation script for Alunex PM System
const fs = require('fs');
const path = require('path');

// Define all pages with their details
const pages = [
    // ESTIMATION
    { file: 'boq-pricing.html', title: 'BOQ & Pricing', section: 'ESTIMATION', description: 'Bill of Quantities and detailed pricing management' },
    { file: 'quote-progress.html', title: 'Quote Progress', section: 'ESTIMATION', description: 'Track progress of quotations and estimates' },
    { file: 'under-finalization.html', title: 'Under Finalization', section: 'ESTIMATION', description: 'Quotes and tenders pending final approval' },
    { file: 'awarded-lost.html', title: 'Awarded / Lost', section: 'ESTIMATION', description: 'Track awarded and lost tender opportunities' },

    // PROJECT SPACE
    { file: 'project-overview.html', title: 'Project Overview', section: 'PROJECT SPACE', description: 'Comprehensive project dashboard with country and timezone settings' },
    { file: 'engineering.html', title: 'Engineering', section: 'PROJECT SPACE', description: 'Engineering design and technical documentation' },
    { file: 'procurement.html', title: 'Procurement', section: 'PROJECT SPACE', description: 'Purchase orders, vendor management, and material procurement' },
    { file: 'fabrication.html', title: 'Fabrication', section: 'PROJECT SPACE', description: 'Fabrication planning, tracking, and quality control' },
    { file: 'logistics.html', title: 'Logistics', section: 'PROJECT SPACE', description: 'Shipping, transportation, and delivery management' },
    { file: 'installation.html', title: 'Installation', section: 'PROJECT SPACE', description: 'On-site installation progress and coordination' },
    { file: 'qa-qc.html', title: 'QA/QC', section: 'PROJECT SPACE', description: 'Quality assurance and quality control processes' },
    { file: 'hse-safety.html', title: 'HSE & Site Safety', section: 'PROJECT SPACE', description: 'Health, safety, and environment management' },
    { file: 'variations-claims.html', title: 'Variations & Claims', section: 'PROJECT SPACE', description: 'Contract variations, change orders, and claims management' },
    { file: 'closeout-snag.html', title: 'Close-Out & Snag', section: 'PROJECT SPACE', description: 'Project closeout activities and snag list management' },
    { file: 'documents-drawings.html', title: 'Documents & Drawings', section: 'PROJECT SPACE', description: 'Document management system for all project files' },
    { file: 'communication.html', title: 'Communication', section: 'PROJECT SPACE', description: 'Team chat, video calls, and RFI management' },

    // MONITORING & CONTROL
    { file: 'wbs-cbs.html', title: 'WBS & CBS Structure', section: 'MONITORING & CONTROL', description: 'Work Breakdown Structure and Cost Breakdown Structure' },
    { file: 'budget-tracking.html', title: 'Budget Tracking', section: 'MONITORING & CONTROL', description: 'Real-time budget monitoring and variance analysis' },
    { file: 'manhour-tracking.html', title: 'Man-Hour Tracking', section: 'MONITORING & CONTROL', description: 'Labor hours tracking and productivity analysis' },
    { file: 'earned-value.html', title: 'Earned Value Dashboard', section: 'MONITORING & CONTROL', description: 'Earned Value Management (EVM) analytics and reporting' },
    { file: 'cost-control.html', title: 'Cost Control (CPI/SPI)', section: 'MONITORING & CONTROL', description: 'Cost Performance Index and Schedule Performance Index monitoring' },
    { file: 'manpower-utilization.html', title: 'Manpower Utilization', section: 'MONITORING & CONTROL', description: 'Workforce allocation and utilization reporting' },

    // INVENTORY
    { file: 'material-tracking.html', title: 'Material Tracking', section: 'INVENTORY', description: 'Track material inventory, stock levels, and consumption' },
    { file: 'consumables.html', title: 'Consumables', section: 'INVENTORY', description: 'Manage consumable items and supplies' },
    { file: 'tools-equipment.html', title: 'Tools & Equipment', section: 'INVENTORY', description: 'Equipment inventory and maintenance tracking' },

    // ADMIN
    { file: 'users-roles.html', title: 'Users & Roles', section: 'ADMIN', description: 'User management and role-based access control' },
    { file: 'departments-capacity.html', title: 'Departments & Capacity', section: 'ADMIN', description: 'Department setup and capacity planning' },
    { file: 'rate-cards.html', title: 'Rate Cards', section: 'ADMIN', description: 'Hourly rates and pricing cards management' }
];

// Sidebar HTML template
const getSidebarHTML = (activePage) => {
    const isActive = (page) => page === activePage ? 'active' : '';

    return `        <aside class="sidebar">
            <!-- MAIN SECTION -->
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span>MAIN</span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
                <div class="sidebar-section-content">
                    <a href="dashboard.html" class="sidebar-item ${isActive('dashboard.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span>Dashboard</span>
                    </a>
                </div>
            </div>

            <!-- ESTIMATION SECTION -->
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span>ESTIMATION</span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
                <div class="sidebar-section-content">
                    <a href="tender-list.html" class="sidebar-item ${isActive('tender-list.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span>Tender List</span>
                    </a>
                    <a href="boq-pricing.html" class="sidebar-item ${isActive('boq-pricing.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        <span>BOQ & Pricing</span>
                    </a>
                    <a href="quote-progress.html" class="sidebar-item ${isActive('quote-progress.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <span>Quote Progress</span>
                    </a>
                    <a href="under-finalization.html" class="sidebar-item ${isActive('under-finalization.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Under Finalization</span>
                    </a>
                    <a href="awarded-lost.html" class="sidebar-item ${isActive('awarded-lost.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Awarded / Lost</span>
                    </a>
                </div>
            </div>

            <!-- PROJECT SPACE SECTION -->
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span>PROJECT SPACE</span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
                <div class="sidebar-section-content">
                    <a href="project-overview.html" class="sidebar-item ${isActive('project-overview.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                        </svg>
                        <span>Project Overview</span>
                    </a>
                    <a href="engineering.html" class="sidebar-item ${isActive('engineering.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                        </svg>
                        <span>Engineering</span>
                    </a>
                    <a href="procurement.html" class="sidebar-item ${isActive('procurement.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <span>Procurement</span>
                    </a>
                    <a href="fabrication.html" class="sidebar-item ${isActive('fabrication.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                        <span>Fabrication</span>
                    </a>
                    <a href="logistics.html" class="sidebar-item ${isActive('logistics.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                        </svg>
                        <span>Logistics</span>
                    </a>
                    <a href="installation.html" class="sidebar-item ${isActive('installation.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span>Installation</span>
                    </a>
                    <a href="qa-qc.html" class="sidebar-item ${isActive('qa-qc.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        <span>QA/QC</span>
                    </a>
                    <a href="hse-safety.html" class="sidebar-item ${isActive('hse-safety.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <span>HSE & Site Safety</span>
                    </a>
                    <a href="variations-claims.html" class="sidebar-item ${isActive('variations-claims.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                        <span>Variations & Claims</span>
                    </a>
                    <a href="closeout-snag.html" class="sidebar-item ${isActive('closeout-snag.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                        <span>Close-Out & Snag</span>
                    </a>
                    <a href="documents-drawings.html" class="sidebar-item ${isActive('documents-drawings.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                        </svg>
                        <span>Documents & Drawings</span>
                    </a>
                    <a href="communication.html" class="sidebar-item ${isActive('communication.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <span>Communication</span>
                    </a>
                </div>
            </div>

            <!-- MONITORING & CONTROL SECTION -->
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span>MONITORING & CONTROL</span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
                <div class="sidebar-section-content">
                    <a href="wbs-cbs.html" class="sidebar-item ${isActive('wbs-cbs.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"/>
                        </svg>
                        <span>WBS & CBS Structure</span>
                    </a>
                    <a href="budget-tracking.html" class="sidebar-item ${isActive('budget-tracking.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Budget Tracking</span>
                    </a>
                    <a href="manhour-tracking.html" class="sidebar-item ${isActive('manhour-tracking.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Man-Hour Tracking</span>
                    </a>
                    <a href="earned-value.html" class="sidebar-item ${isActive('earned-value.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                        <span>Earned Value Dashboard</span>
                    </a>
                    <a href="cost-control.html" class="sidebar-item ${isActive('cost-control.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <span>Cost Control (CPI/SPI)</span>
                    </a>
                    <a href="manpower-utilization.html" class="sidebar-item ${isActive('manpower-utilization.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <span>Manpower Utilization</span>
                    </a>
                </div>
            </div>

            <!-- INVENTORY SECTION -->
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span>INVENTORY</span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
                <div class="sidebar-section-content">
                    <a href="material-tracking.html" class="sidebar-item ${isActive('material-tracking.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                        <span>Material Tracking</span>
                    </a>
                    <a href="consumables.html" class="sidebar-item ${isActive('consumables.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                        </svg>
                        <span>Consumables</span>
                    </a>
                    <a href="tools-equipment.html" class="sidebar-item ${isActive('tools-equipment.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        </svg>
                        <span>Tools & Equipment</span>
                    </a>
                </div>
            </div>

            <!-- ADMIN SECTION -->
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span>ADMIN</span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
                <div class="sidebar-section-content">
                    <a href="users-roles.html" class="sidebar-item ${isActive('users-roles.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                        <span>Users & Roles</span>
                    </a>
                    <a href="departments-capacity.html" class="sidebar-item ${isActive('departments-capacity.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span>Departments & Capacity</span>
                    </a>
                    <a href="rate-cards.html" class="sidebar-item ${isActive('rate-cards.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span>Rate Cards</span>
                    </a>
                    <a href="settings.html" class="sidebar-item ${isActive('settings.html')}">
                        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>Settings</span>
                    </a>
                </div>
            </div>
        </aside>`;
};

// Generate HTML template for each page
const generatePage = (pageInfo) => {
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageInfo.title} - Alunex PM</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="logo">
            <div class="logo-icon">A</div>
            <span>Alunex Project Management</span>
        </div>
        <div class="user-info">
            <button class="btn btn-secondary" onclick="showHelpMenu(event)" title="Help & Tutorials" style="padding: 8px 12px;">
                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </button>
            <div class="user-avatar">JM</div>
            <button class="btn btn-secondary" onclick="window.location.href='login.html'">Logout</button>
        </div>
    </nav>

    <div class="layout">
${getSidebarHTML(pageInfo.file)}

        <main class="main-content">
            <div class="page-header">
                <h1>${pageInfo.title}</h1>
                <p>${pageInfo.description}</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>${pageInfo.section} - ${pageInfo.title}</h2>
                    <button class="btn btn-primary">+ Add New</button>
                </div>
                <p style="color: #64748b; padding: 20px 0;">
                    This module is part of the ${pageInfo.section} section. Content and functionality will be implemented based on project requirements.
                </p>
            </div>
        </main>
    </div>

    <script src="sidebar.js"></script>
</body>
</html>`;

    return content;
};

// Generate all pages
console.log('Generating pages...\n');

pages.forEach(pageInfo => {
    const htmlContent = generatePage(pageInfo);
    fs.writeFileSync(path.join(__dirname, pageInfo.file), htmlContent, 'utf8');
    console.log(`✓ Created: ${pageInfo.file}`);
});

console.log(`\n✓ Successfully created ${pages.length} pages!`);
