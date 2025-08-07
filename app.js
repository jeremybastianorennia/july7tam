// ZoomInfo Account Dashboard JavaScript with Advanced Features
class AccountDashboard {
    constructor() {
        this.accounts = [];
        this.filteredAccounts = [];
        this.currentSort = { column: null, direction: 'asc' };
        this.searchTimeout = null;
        this.isAuthenticated = false;
        this.selectedAssignedTo = [];
        this.selectedSegmentation = [];
        this.currentTheme = localStorage.getItem('dashboardTheme') || 'auto';
        
        // Pagination state
        this.currentPage = 1;
        this.itemsPerPage = 25; // Show 25 accounts per page
        this.totalPages = 1;
        
        // Account comparison state
        this.selectedForComparison = [];
        this.maxComparisons = 3;
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupLoginEventListeners();
        this.addCustomStyles();
        this.initializeTheme();
    }

    // Initialize theme system
    initializeTheme() {
        this.applyTheme(this.currentTheme);
    }

    // Apply theme to document
    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('dashboardTheme', theme);
        
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.setAttribute('data-color-scheme', 'light');
        } else {
            document.documentElement.removeAttribute('data-color-scheme');
        }
    }

    // Add custom styles for all enhanced features
    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Theme toggle styles */
            .theme-toggle {
                position: relative;
                background: var(--color-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-full);
                padding: var(--space-4);
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: var(--space-8);
                font-size: var(--font-size-sm);
            }
            
            .theme-toggle:hover {
                background: var(--color-secondary-hover);
            }
            
            .theme-icon {
                font-size: var(--font-size-base);
                transition: transform 0.2s ease;
            }
            
            .theme-toggle:hover .theme-icon {
                transform: scale(1.1);
            }

            /* Overview cards */
            .overview-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: var(--space-16);
                margin-bottom: var(--space-32);
            }
            
            .overview-card {
                background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg-1) 100%);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                padding: var(--space-20);
                text-align: center;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .overview-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }
            
            .overview-card h3 {
                font-size: var(--font-size-lg);
                margin-bottom: var(--space-8);
                color: var(--color-text);
            }
            
            .overview-card .metric {
                font-size: var(--font-size-3xl);
                font-weight: var(--font-weight-bold);
                color: var(--color-primary);
                margin-bottom: var(--space-4);
                display: block;
            }
            
            .overview-card .subtitle {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
            }

            /* Search autocomplete */
            .search-container {
                position: relative;
                width: 100%;
            }
            
            .autocomplete-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-top: none;
                border-radius: 0 0 var(--radius-base) var(--radius-base);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .autocomplete-item {
                padding: var(--space-12);
                cursor: pointer;
                transition: background-color 0.15s ease;
                font-size: var(--font-size-sm);
                border-bottom: 1px solid var(--color-border);
            }
            
            .autocomplete-item:last-child {
                border-bottom: none;
            }
            
            .autocomplete-item:hover,
            .autocomplete-item.selected {
                background: var(--color-secondary);
            }
            
            .autocomplete-item .category {
                font-size: var(--font-size-xs);
                color: var(--color-text-secondary);
                margin-left: var(--space-8);
            }

            /* Export button */
            .export-button {
                display: inline-flex;
                align-items: center;
                gap: var(--space-8);
            }
            
            .export-button .icon {
                font-size: var(--font-size-base);
            }

            /* Header improvements */
            .header-controls {
                display: flex;
                align-items: center;
                gap: var(--space-16);
                margin-top: var(--space-16);
            }

            /* Pagination styles */
            .pagination-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: var(--space-16);
                padding: var(--space-16) 0;
                border-top: 1px solid var(--color-border);
            }
            
            .pagination {
                display: flex;
                align-items: center;
                gap: var(--space-4);
            }
            
            .pagination-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: var(--space-8) var(--space-12);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-base);
                background: var(--color-surface);
                color: var(--color-text);
                font-size: var(--font-size-sm);
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                min-width: 40px;
                height: 40px;
            }
            
            .pagination-button:hover:not(:disabled) {
                background: var(--color-secondary);
                border-color: var(--color-primary);
                color: var(--color-primary);
            }
            
            .pagination-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: var(--color-secondary);
            }
            
            .pagination-button.active {
                background: var(--color-primary);
                color: var(--color-btn-primary-text);
                border-color: var(--color-primary);
            }
            
            .pagination-button.active:hover {
                background: var(--color-primary-hover);
                border-color: var(--color-primary-hover);
                color: var(--color-btn-primary-text);
            }
            
            .pagination-info {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
            }
            
            .page-size-selector {
                display: flex;
                align-items: center;
                gap: var(--space-8);
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
            }
            
            .page-size-selector select {
                padding: var(--space-4) var(--space-8);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-sm);
                background: var(--color-surface);
                color: var(--color-text);
                font-size: var(--font-size-sm);
            }
            
            .pagination-ellipsis {
                padding: var(--space-8) var(--space-4);
                color: var(--color-text-secondary);
                user-select: none;
            }

            /* Smooth page transitions - Fix login positioning */
            #loginScreen {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 9999 !important;
                background: var(--color-background) !important;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                           opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            #loginScreen.hidden {
                display: none !important;
            }
            
            .login-container {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                height: 100% !important;
            }
            
            #dashboardContainer {
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                           opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                transform-origin: center center;
            }
            
            .slide-out-left {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .slide-in-right {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .slide-in-active {
                transform: translateX(0);
                opacity: 1;
            }
            
            /* Enhanced table row hover effects */
            .data-table tbody tr {
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                cursor: pointer;
                position: relative;
            }
            
            .data-table tbody tr:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(var(--color-primary-rgb, 33, 128, 141), 0.1);
                background-color: var(--color-bg-1);
                border-radius: var(--radius-sm);
            }
            
            .data-table tbody tr:active {
                transform: translateY(0);
                transition-duration: 0.1s;
            }
            
            /* Enhanced score bar animations */
            .score-fill {
                transition: box-shadow 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .score-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255, 255, 255, 0.2), 
                    transparent);
                animation: shimmer 2s ease-in-out;
                animation-delay: 0.5s;
            }
            
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .score-bar {
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            /* Salesforce button styling */
            .salesforce-button {
                display: inline-flex;
                align-items: center;
                gap: var(--space-8);
                padding: var(--space-12) var(--space-16);
                background: linear-gradient(135deg, #1589ee 0%, #0e7ae4 100%);
                color: white !important;
                text-decoration: none !important;
                border-radius: var(--radius-base);
                font-weight: var(--font-weight-medium);
                font-size: var(--font-size-sm);
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 2px 4px rgba(21, 137, 238, 0.2);
                border: none;
                cursor: pointer;
            }
            
            .salesforce-button:hover {
                background: linear-gradient(135deg, #0e7ae4 0%, #0c6bd1 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(21, 137, 238, 0.3);
                color: white !important;
            }
            
            .salesforce-button:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(21, 137, 238, 0.2);
            }
            
            .salesforce-icon {
                font-size: var(--font-size-base);
            }
            
            .external-icon {
                font-size: var(--font-size-xs);
                opacity: 0.8;
            }
            
            /* Toast notification styles */
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: var(--space-16) var(--space-20);
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-base);
                box-shadow: var(--shadow-lg);
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 10000;
                max-width: 300px;
                font-size: var(--font-size-sm);
            }
            
            .toast--show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast--success {
                border-left: 4px solid var(--color-success);
            }
            
            .toast--error {
                border-left: 4px solid var(--color-error);
            }
            
            .toast--info {
                border-left: 4px solid var(--color-info);
            }
            
            /* Loading state improvements */
            .loading-indicator {
                display: flex;
                align-items: center;
                gap: var(--space-8);
                color: var(--color-primary);
                font-size: var(--font-size-sm);
            }
            
            .loading-indicator::before {
                content: '';
                width: 16px;
                height: 16px;
                border: 2px solid var(--color-primary);
                border-top: 2px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Pulse effect for new data */
            .table-row-new {
                animation: pulse 0.6s ease-in-out;
            }
            
            @keyframes pulse {
                0% { background-color: rgba(var(--color-success-rgb, 33, 128, 141), 0.1); }
                50% { background-color: rgba(var(--color-success-rgb, 33, 128, 141), 0.2); }
                100% { background-color: transparent; }
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .overview-cards {
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-12);
                }
                
                .overview-card {
                    padding: var(--space-16);
                }
                
                .overview-card .metric {
                    font-size: var(--font-size-2xl);
                }
                
                .header-controls {
                    flex-direction: column;
                    gap: var(--space-12);
                }
                
                .pagination-container {
                    flex-direction: column;
                    gap: var(--space-12);
                    text-align: center;
                }
                
                .pagination {
                    justify-content: center;
                }
                
                .pagination-button {
                    padding: var(--space-6) var(--space-10);
                    font-size: var(--font-size-xs);
                }
                
                .empty-state {
                    padding: var(--space-24) var(--space-16);
                }
                
                .empty-illustration {
                    font-size: 3rem;
                }
                
                .empty-title {
                    font-size: var(--font-size-xl);
                }
            }
            
            /* Fun Empty State Styles */
            .empty-state {
                text-align: center;
                padding: var(--space-32) var(--space-16);
                color: var(--color-text-secondary);
                background: linear-gradient(135deg, var(--color-bg-1) 0%, var(--color-bg-2) 100%);
                border-radius: var(--radius-lg);
                margin: var(--space-16);
                border: 2px dashed rgba(var(--color-primary-rgb, 33, 128, 141), 0.2);
            }
            
            .empty-illustration {
                font-size: 4rem;
                margin-bottom: var(--space-16);
                animation: bounce 2s ease-in-out infinite;
                display: block;
            }
            
            .empty-title {
                font-size: var(--font-size-2xl);
                font-weight: var(--font-weight-semibold);
                margin-bottom: var(--space-8);
                color: var(--color-text);
            }
            
            .empty-subtitle {
                font-size: var(--font-size-base);
                margin-bottom: var(--space-16);
                line-height: 1.6;
            }
            
            .empty-suggestions {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-base);
                padding: var(--space-16);
                margin: var(--space-16) auto 0;
                max-width: 400px;
                text-align: left;
            }
            
            .empty-suggestions h4 {
                margin: 0 0 var(--space-8) 0;
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-medium);
                color: var(--color-text);
            }
            
            .empty-suggestions ul {
                margin: 0;
                padding-left: var(--space-16);
                font-size: var(--font-size-sm);
                line-height: 1.5;
            }
            
            .empty-suggestions li {
                margin-bottom: var(--space-4);
            }
            
            .clear-filters-btn {
                display: inline-flex;
                align-items: center;
                gap: var(--space-8);
                margin-top: var(--space-16);
                padding: var(--space-8) var(--space-16);
                background: var(--color-primary);
                color: var(--color-btn-primary-text);
                border: none;
                border-radius: var(--radius-base);
                cursor: pointer;
                text-decoration: none;
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-medium);
                transition: all 0.2s ease;
            }
            
            .clear-filters-btn:hover {
                background: var(--color-primary-hover);
                transform: translateY(-1px);
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
            
            /* Account Comparison Styles */
            .comparison-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: var(--color-primary);
            }
            
            .comparison-button {
                position: fixed;
                bottom: var(--space-24);
                right: var(--space-24);
                background: var(--color-primary);
                color: var(--color-btn-primary-text);
                border: none;
                border-radius: var(--radius-full);
                padding: var(--space-16) var(--space-24);
                box-shadow: 0 4px 12px rgba(var(--color-primary-rgb, 33, 128, 141), 0.3);
                cursor: pointer;
                font-weight: var(--font-weight-medium);
                font-size: var(--font-size-base);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: var(--space-8);
                transform: translateY(100px);
                opacity: 0;
            }
            
            .comparison-button.visible {
                transform: translateY(0);
                opacity: 1;
            }
            
            .comparison-button:hover {
                background: var(--color-primary-hover);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(var(--color-primary-rgb, 33, 128, 141), 0.4);
            }
            
            .comparison-count {
                background: rgba(255, 255, 255, 0.2);
                border-radius: var(--radius-full);
                padding: var(--space-2) var(--space-8);
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-bold);
            }
            
            /* Comparison Modal */
            .comparison-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .comparison-modal.visible {
                opacity: 1;
                visibility: visible;
            }
            
            .comparison-content {
                background: var(--color-surface);
                border-radius: var(--radius-lg);
                max-width: 95vw;
                max-height: 90vh;
                overflow: auto;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--color-border);
            }
            
            .comparison-header {
                padding: var(--space-24);
                border-bottom: 1px solid var(--color-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--color-bg-1);
            }
            
            .comparison-title {
                font-size: var(--font-size-2xl);
                font-weight: var(--font-weight-semibold);
                color: var(--color-text);
                margin: 0;
            }
            
            .comparison-actions {
                display: flex;
                gap: var(--space-8);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: var(--font-size-xl);
                cursor: pointer;
                color: var(--color-text-secondary);
                padding: var(--space-4);
                border-radius: var(--radius-sm);
                transition: all 0.2s ease;
            }
            
            .modal-close:hover {
                background: var(--color-secondary);
                color: var(--color-text);
            }
            
            .comparison-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: var(--space-16);
                padding: var(--space-24);
            }
            
            .comparison-card {
                background: var(--color-background);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                overflow: hidden;
                position: relative;
            }
            
            .comparison-card.winner {
                border-color: var(--color-success);
                box-shadow: 0 0 0 2px rgba(var(--color-success-rgb, 33, 128, 141), 0.1);
            }
            
            .comparison-card-header {
                padding: var(--space-16);
                background: var(--color-bg-1);
                border-bottom: 1px solid var(--color-border);
                position: relative;
            }
            
            .winner-badge {
                position: absolute;
                top: var(--space-8);
                right: var(--space-8);
                background: var(--color-success);
                color: white;
                padding: var(--space-4) var(--space-8);
                border-radius: var(--radius-full);
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-bold);
            }
            
            .company-name {
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-semibold);
                margin-bottom: var(--space-4);
                color: var(--color-text);
            }
            
            .company-subtitle {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
            }
            
            .comparison-metrics {
                padding: var(--space-16);
            }
            
            .metric-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-8) 0;
                border-bottom: 1px solid var(--color-border);
            }
            
            .metric-row:last-child {
                border-bottom: none;
            }
            
            .metric-label {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
                font-weight: var(--font-weight-medium);
            }
            
            .metric-value {
                font-size: var(--font-size-base);
                font-weight: var(--font-weight-semibold);
                color: var(--color-text);
                display: flex;
                align-items: center;
                gap: var(--space-4);
            }
            
            .metric-value.highest {
                color: var(--color-success);
            }
            
            .metric-value.lowest {
                color: var(--color-error);
                opacity: 0.7;
            }
            
            .metric-bar {
                width: 60px;
                height: 6px;
                background: var(--color-secondary);
                border-radius: var(--radius-full);
                overflow: hidden;
                margin-left: var(--space-8);
            }
            
            .metric-bar-fill {
                height: 100%;
                background: var(--color-primary);
                transition: width 0.5s ease;
            }
            
            .metric-bar-fill.highest {
                background: var(--color-success);
            }
            
            .card-actions {
                padding: var(--space-16);
                border-top: 1px solid var(--color-border);
                display: flex;
                gap: var(--space-8);
                flex-wrap: wrap;
            }
            
            .card-action {
                padding: var(--space-6) var(--space-12);
                background: var(--color-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-sm);
                color: var(--color-text);
                text-decoration: none;
                font-size: var(--font-size-xs);
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .card-action:hover {
                background: var(--color-secondary-hover);
                color: var(--color-primary);
            }
            
            .insights-section {
                margin: var(--space-24);
                padding: var(--space-16);
                background: var(--color-bg-2);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
            }
            
            .insights-title {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-semibold);
                margin-bottom: var(--space-12);
                color: var(--color-text);
                display: flex;
                align-items: center;
                gap: var(--space-8);
            }
            
            .insight-item {
                margin-bottom: var(--space-8);
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
                line-height: 1.5;
            }
            
            .insight-item:last-child {
                margin-bottom: 0;
            }
            
            /* Mobile responsiveness for comparison */
            @media (max-width: 768px) {
                .comparison-content {
                    max-width: 100vw;
                    max-height: 100vh;
                    border-radius: 0;
                }
                
                .comparison-grid {
                    grid-template-columns: 1fr;
                    padding: var(--space-16);
                }
                
                .comparison-header {
                    padding: var(--space-16);
                }
                
                .comparison-title {
                    font-size: var(--font-size-xl);
                }
                
                .comparison-button {
                    bottom: var(--space-16);
                    right: var(--space-16);
                    padding: var(--space-12) var(--space-16);
                    font-size: var(--font-size-sm);
                }
                
                .card-actions {
                    flex-direction: column;
                }
                
                .card-action {
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Create dashboard overview cards
    createOverviewCards() {
        const overviewSection = document.createElement('section');
        overviewSection.className = 'overview-section';
        overviewSection.innerHTML = `
            <h2>Dashboard Overview</h2>
            <div class="overview-cards" id="overviewCards">
                <div class="overview-card">
                    <h3>Total Accounts</h3>
                    <span class="metric" id="totalAccounts">0</span>
                    <span class="subtitle">in current view</span>
                </div>
                <div class="overview-card">
                    <h3>Avg Prospect Score</h3>
                    <span class="metric" id="avgProspectScore">0</span>
                    <span class="subtitle">out of 100</span>
                </div>
            </div>
        `;
        
        // Insert before the tab container
        const tabContainer = document.querySelector('.tab-container');
        if (tabContainer) {
            tabContainer.parentNode.insertBefore(overviewSection, tabContainer);
        }
    }

    // Update overview cards with current data
    updateOverviewCards() {
        if (!this.filteredAccounts.length) return;

        // Total accounts
        document.getElementById('totalAccounts').textContent = this.filteredAccounts.length;

        // Average prospect score
        const avgScore = Math.round(
            this.filteredAccounts.reduce((sum, acc) => sum + acc['Prospect Score'], 0) / this.filteredAccounts.length
        );
        document.getElementById('avgProspectScore').textContent = avgScore;
    }

    // Add theme toggle to header
    addThemeToggle() {
        const header = document.querySelector('.header .container');
        if (header) {
            const controls = document.createElement('div');
            controls.className = 'header-controls';
            controls.innerHTML = `
                <button class="theme-toggle" id="themeToggle">
                    <span class="theme-icon">🌓</span>
                    <span class="theme-text">Theme</span>
                </button>
            `;
            header.appendChild(controls);

            // Add event listener
            document.getElementById('themeToggle').addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    // Toggle between themes
    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        
        this.applyTheme(nextTheme);
        this.updateThemeToggleText();
        this.showToast(`Switched to ${nextTheme} theme`, 'info');
    }

    // Update theme toggle button text
    updateThemeToggleText() {
        const themeText = document.querySelector('.theme-text');
        if (themeText) {
            const icons = { auto: '🌓', light: '☀️', dark: '🌙' };
            const names = { auto: 'Auto', light: 'Light', dark: 'Dark' };
            
            document.querySelector('.theme-icon').textContent = icons[this.currentTheme];
            themeText.textContent = names[this.currentTheme];
        }
    }

    // Setup search autocomplete
    setupSearchAutocomplete() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        // Wrap search input in container
        const container = document.createElement('div');
        container.className = 'search-container';
        searchInput.parentNode.insertBefore(container, searchInput);
        container.appendChild(searchInput);

        // Create autocomplete dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown hidden';
        dropdown.id = 'autocompleteDropdown';
        container.appendChild(dropdown);

        // Build suggestions from data
        this.searchSuggestions = [
            ...new Set([
                ...this.accounts.map(acc => ({ value: acc['Company Name'], category: 'Company' })),
                ...this.accounts.map(acc => ({ value: acc['Assigned To'], category: 'Team Member' })),
                ...this.accounts.map(acc => ({ value: acc.Country, category: 'Country' })),
                ...this.accounts.map(acc => ({ value: acc.Segmentation, category: 'Segment' })),
                ...this.accounts.map(acc => ({ value: acc['Account Type'], category: 'Type' }))
            ].map(item => JSON.stringify(item)))
        ].map(item => JSON.parse(item));

        let selectedIndex = -1;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                dropdown.classList.add('hidden');
                return;
            }

            const matches = this.searchSuggestions
                .filter(item => item.value.toLowerCase().includes(query))
                .slice(0, 8);

            if (matches.length === 0) {
                dropdown.classList.add('hidden');
                return;
            }

            dropdown.innerHTML = matches.map((item, index) => `
                <div class="autocomplete-item" data-index="${index}" data-value="${item.value}">
                    ${item.value}
                    <span class="category">${item.category}</span>
                </div>
            `).join('');

            dropdown.classList.remove('hidden');
            selectedIndex = -1;

            // Add click handlers
            dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.dataset.value;
                    dropdown.classList.add('hidden');
                    this.applyFilters();
                });
            });
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            const items = dropdown.querySelectorAll('.autocomplete-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                this.updateAutocompleteSelection(items, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                this.updateAutocompleteSelection(items, selectedIndex);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                searchInput.value = items[selectedIndex].dataset.value;
                dropdown.classList.add('hidden');
                this.applyFilters();
            } else if (e.key === 'Escape') {
                dropdown.classList.add('hidden');
                selectedIndex = -1;
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    updateAutocompleteSelection(items, selectedIndex) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }

    // Create pagination controls
    createPaginationControls() {
        const tableContainer = document.querySelector('.table-container');
        if (!tableContainer) return;

        // Remove existing pagination
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }

        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        paginationContainer.innerHTML = `
            <div class="page-size-selector">
                <span>Show</span>
                <select id="pageSizeSelect">
                    <option value="10" ${this.itemsPerPage === 10 ? 'selected' : ''}>10</option>
                    <option value="25" ${this.itemsPerPage === 25 ? 'selected' : ''}>25</option>
                    <option value="50" ${this.itemsPerPage === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${this.itemsPerPage === 100 ? 'selected' : ''}>100</option>
                </select>
                <span>per page</span>
            </div>
            
            <div class="pagination" id="paginationControls">
                <!-- Pagination buttons will be inserted here -->
            </div>
            
            <div class="pagination-info" id="paginationInfo">
                <!-- Pagination info will be inserted here -->
            </div>
        `;

        tableContainer.appendChild(paginationContainer);

        // Add event listener for page size change
        document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1; // Reset to first page
            this.updatePagination();
            this.renderCurrentPage();
            this.showToast(`Changed to ${this.itemsPerPage} items per page`, 'info');
        });

        this.updatePagination();
    }

    // Update pagination controls
    updatePagination() {
        this.totalPages = Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
        
        // Ensure current page is valid
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }

        this.renderPaginationButtons();
        this.updatePaginationInfo();
    }

    // Render pagination buttons
    renderPaginationButtons() {
        const container = document.getElementById('paginationControls');
        if (!container) return;

        const buttons = [];

        // Previous button
        buttons.push(`
            <button class="pagination-button" ${this.currentPage === 1 ? 'disabled' : ''} 
                    data-page="${this.currentPage - 1}">
                ‹ Previous
            </button>
        `);

        // Calculate which page numbers to show
        const pagesToShow = this.getPageNumbers();
        
        pagesToShow.forEach(pageNum => {
            if (pageNum === '...') {
                buttons.push('<span class="pagination-ellipsis">...</span>');
            } else {
                buttons.push(`
                    <button class="pagination-button ${pageNum === this.currentPage ? 'active' : ''}" 
                            data-page="${pageNum}">
                        ${pageNum}
                    </button>
                `);
            }
        });

        // Next button
        buttons.push(`
            <button class="pagination-button" ${this.currentPage === this.totalPages || this.totalPages === 0 ? 'disabled' : ''} 
                    data-page="${this.currentPage + 1}">
                Next ›
            </button>
        `);

        container.innerHTML = buttons.join('');

        // Add event listeners to pagination buttons
        container.querySelectorAll('.pagination-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page) && !e.target.disabled) {
                    this.goToPage(page);
                }
            });
        });
    }

    // Calculate which page numbers to display
    getPageNumbers() {
        const pages = [];
        const total = this.totalPages;
        const current = this.currentPage;

        if (total <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (current <= 4) {
                // Near the beginning
                for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total);
            } else if (current >= total - 3) {
                // Near the end
                pages.push('...');
                for (let i = total - 4; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle
                pages.push('...');
                for (let i = current - 1; i <= current + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total);
            }
        }

        return pages;
    }

    // Update pagination info text
    updatePaginationInfo() {
        const container = document.getElementById('paginationInfo');
        if (!container) return;

        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredAccounts.length);
        const totalItems = this.filteredAccounts.length;

        if (totalItems === 0) {
            container.textContent = 'No accounts to display';
        } else {
            container.textContent = `Showing ${startItem}-${endItem} of ${totalItems} accounts`;
        }
    }

    // Navigate to specific page
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages) return;
        
        this.currentPage = pageNumber;
        this.renderCurrentPage();
        this.updatePagination();
        
        // Smooth scroll to top of table
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Render only the current page of data
    renderCurrentPage() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        if (this.filteredAccounts.length === 0) {
            // Fun empty state with random illustrations
            const emptyStates = [
                {
                    emoji: '🕵️‍♀️',
                    title: 'No Accounts Found!',
                    subtitle: 'Our detective searched everywhere but came up empty-handed.'
                },
                {
                    emoji: '🦄',
                    title: 'Oops! Nothing Here!',
                    subtitle: 'Looks like these accounts are as rare as unicorns.'
                },
                {
                    emoji: '🎯',
                    title: 'No Bulls-Eye!',
                    subtitle: 'Your filters are precise, but no accounts hit the target.'
                },
                {
                    emoji: '🔍',
                    title: 'Search Came Up Empty!',
                    subtitle: 'Even our magnifying glass couldn\'t find matching accounts.'
                },
                {
                    emoji: '🎪',
                    title: 'No Show Today!',
                    subtitle: 'The accounts you\'re looking for seem to have left the circus.'
                }
            ];
            
            const randomState = emptyStates[Math.floor(Math.random() * emptyStates.length)];
            
            tbody.innerHTML = `
                <tr>
                    <td colspan="13" style="padding: 0; border: none;">
                        <div class="empty-state">
                            <span class="empty-illustration">${randomState.emoji}</span>
                            <h3 class="empty-title">${randomState.title}</h3>
                            <p class="empty-subtitle">${randomState.subtitle}</p>
                            
                            <div class="empty-suggestions">
                                <h4>💡 Try these suggestions:</h4>
                                <ul>
                                    <li>Clear some filters to see more results</li>
                                    <li>Check your spelling in the search box</li>
                                    <li>Try a broader search term</li>
                                    <li>Adjust your score or employee ranges</li>
                                </ul>
                            </div>
                            
                            <button class="clear-filters-btn" onclick="dashboard.clearFilters()">
                                🧹 Clear All Filters
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Calculate which accounts to show
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageAccounts = this.filteredAccounts.slice(startIndex, endIndex);

        tbody.innerHTML = pageAccounts.map((account, index) => {
            const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
            const isSelected = this.selectedForComparison.includes(globalIndex);
            
            return `
            <tr class="table-row-interactive">
                <td>
                    <input type="checkbox" 
                           class="comparison-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onchange="dashboard.toggleAccountComparison(${globalIndex})"
                           ${this.selectedForComparison.length >= this.maxComparisons && !isSelected ? 'disabled' : ''}>
                </td>
                <td><strong>${account['Company Name']}</strong></td>
                <td>${account['Assigned To']}</td>
                <td><span class="status-badge ${account['Account Type'].toLowerCase()}">${account['Account Type']}</span></td>
                <td><strong>${account['Prospect Score']}</strong></td>
                <td>${Array.isArray(account['Account Notes']) ? account['Account Notes'].join(', ') : account['Account Notes']}</td>
                <td>${account['Drop Notes']}</td>
                <td class="link-cell"><a href="http://${account.Website}" target="_blank">${account.Website}</a></td>
                <td class="${this.getRevenueClass(account['Revenue Estimate'])}">${account['Revenue Estimate']}</td>
                <td>${account.Employees.toLocaleString()}</td>
                <td>${account['Head Office']}</td>
                <td>${account.Country}</td>
                <td>${account.Segmentation}</td>
            </tr>
        `;
        }).join('');

        // Add pulse animation to new results
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            setTimeout(() => {
                row.classList.add('table-row-new');
                setTimeout(() => row.classList.remove('table-row-new'), 600);
            }, index * 30); // Faster animation for pagination
        });
    }

    // Export to CSV functionality
    exportToCSV() {
        if (!this.filteredAccounts.length) {
            this.showToast('No data to export', 'error');
            return;
        }

        // Define columns to export
        const columns = [
            'Company Name', 'Assigned To', 'Account Type', 'Prospect Score',
            'Website', 'Revenue Estimate', 'Employees', 'Head Office', 
            'Country', 'Segmentation', 'Drop Notes'
        ];

        // Create CSV content
        const csvContent = [
            columns.join(','), // Header row
            ...this.filteredAccounts.map(account => 
                columns.map(col => {
                    let value = account[col];
                    if (Array.isArray(value)) value = value.join('; ');
                    // Escape commas and quotes
                    value = String(value).replace(/"/g, '""');
                    return `"${value}"`;
                }).join(',')
            )
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `accounts_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast(`Exported ${this.filteredAccounts.length} accounts to CSV`, 'success');
    }

    // Add export button to results section
    addExportButton() {
        const resultsHeader = document.querySelector('.results-header');
        if (resultsHeader) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn--outline export-button';
            exportBtn.innerHTML = `
                <span class="icon">📊</span>
                Export CSV
            `;
            exportBtn.addEventListener('click', () => this.exportToCSV());
            resultsHeader.appendChild(exportBtn);
        }
    }

    // Toast notification system
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div style="font-weight: var(--font-weight-medium); margin-bottom: var(--space-4);">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} ${type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
            <div>${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger show animation
        requestAnimationFrame(() => {
            toast.classList.add('toast--show');
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('toast--show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    checkAuthentication() {
        // Check if user is already authenticated (stored in session)
        const isLoggedIn = sessionStorage.getItem('dashboardAuth') === 'true';
        if (isLoggedIn) {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        if (dashboardContainer && !dashboardContainer.classList.contains('hidden')) {
            // Animate dashboard out
            dashboardContainer.classList.add('slide-out-left');
            setTimeout(() => {
                dashboardContainer.classList.add('hidden');
                dashboardContainer.classList.remove('slide-out-left');
            }, 400);
        }
        
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
            loginScreen.classList.add('slide-in-right');
            
            requestAnimationFrame(() => {
                loginScreen.classList.remove('slide-in-right');
                loginScreen.classList.add('slide-in-active');
            });
        }
    }

    setupLoginEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    handleLogin() {
        const passwordField = document.getElementById('passwordField');
        const password = passwordField.value;
        const correctPassword = 'flames'; // In production, this should be handled server-side

        if (password === correctPassword) {
            sessionStorage.setItem('dashboardAuth', 'true');
            this.isAuthenticated = true;
            this.showToast('Welcome to ZoomInfo Dashboard!', 'success');
            this.showDashboard();
        } else {
            const errorDiv = document.getElementById('loginError');
            errorDiv.classList.remove('hidden');
            passwordField.value = '';
            passwordField.focus();
            
            this.showToast('Incorrect password. Please try again.', 'error');

            // Hide error after 3 seconds
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 3000);
        }
    }

    showDashboard() {
        const loginScreen = document.getElementById('loginScreen');
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        // Animate login screen out
        if (loginScreen && !loginScreen.classList.contains('hidden')) {
            loginScreen.classList.add('slide-out-left');
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                loginScreen.classList.remove('slide-out-left', 'slide-in-active');
            }, 400);
        }
        
        // Animate dashboard in
        if (dashboardContainer) {
            dashboardContainer.classList.remove('hidden');
            dashboardContainer.classList.add('slide-in-right');
            
            requestAnimationFrame(() => {
                dashboardContainer.classList.remove('slide-in-right');
                dashboardContainer.classList.add('slide-in-active');
            });
        }

        // Initialize dashboard functionality
        this.loadData();
        this.setupEventListeners();
        this.setupTabNavigation();
        this.setupMultiSelectFilters();
        this.populateFilters();
        this.populateAccountSelector();
        
        // Add new features
        this.createOverviewCards();
        this.addThemeToggle();
        this.addExportButton();
        this.createComparisonButton();
        this.updateThemeToggleText();
        
        // Show all accounts initially
        setTimeout(() => {
            this.setupSearchAutocomplete();
            this.applyFilters();
        }, 500); // Delay to let transition complete
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const tabName = button.getAttribute('data-tab');
                const targetTab = document.getElementById(tabName + 'Tab');
                if (targetTab) {
                    targetTab.classList.add('active');
                    this.showToast(`Switched to ${tabName === 'accounts' ? 'Account Search' : 'Account Details'}`, 'info');
                }
            });
        });
    }

    setupMultiSelectFilters() {
        // Setup Assigned To multi-select
        this.setupMultiSelect('assignedTo', (values) => {
            this.selectedAssignedTo = values;
            this.applyFilters();
        });

        // Setup Segmentation multi-select
        this.setupMultiSelect('segmentation', (values) => {
            this.selectedSegmentation = values;
            this.applyFilters();
        });
    }

    setupMultiSelect(filterId, callback) {
        const display = document.getElementById(filterId + 'Display');
        const dropdown = document.getElementById(filterId + 'Dropdown');
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

        // Toggle dropdown
        display.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
            display.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!display.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
                display.classList.remove('active');
            }
        });

        // Handle checkbox changes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateMultiSelectDisplay(filterId);
                const selectedValues = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                callback(selectedValues);
            });
        });
    }

    updateMultiSelectDisplay(filterId) {
        const display = document.getElementById(filterId + 'Display');
        const dropdown = document.getElementById(filterId + 'Dropdown');
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');

        // Clear current display
        const selectedContainer = display.querySelector('.selected-items');
        const placeholder = display.querySelector('.placeholder');

        if (!selectedContainer) {
            // Create selected items container if it doesn't exist
            const newSelectedContainer = document.createElement('div');
            newSelectedContainer.className = 'selected-items';
            display.insertBefore(newSelectedContainer, display.querySelector('.dropdown-arrow'));
        }

        const container = display.querySelector('.selected-items');
        container.innerHTML = '';

        if (checkboxes.length === 0) {
            // Show placeholder
            if (placeholder) {
                placeholder.style.display = 'inline';
            }
        } else {
            // Hide placeholder and show selected items
            if (placeholder) {
                placeholder.style.display = 'none';
            }

            checkboxes.forEach(checkbox => {
                const tag = document.createElement('span');
                tag.className = 'selected-tag';
                tag.innerHTML = `
                    ${checkbox.value}
                    <span class="remove-tag" data-value="${checkbox.value}">×</span>
                `;

                // Handle tag removal
                tag.querySelector('.remove-tag').addEventListener('click', (e) => {
                    e.stopPropagation();
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change'));
                });

                container.appendChild(tag);
            });
        }
    }

    loadData() {
        try {
            this.accounts = accountsData;
            console.log(`Loaded ${this.accounts.length} accounts`);
            this.showToast(`Successfully loaded ${this.accounts.length} accounts`, 'success');
        } catch (error) {
            console.error('Error loading data:', error);
            this.accounts = [];
            this.showToast('Failed to load account data', 'error');
        }
    }

    setupEventListeners() {
        // Search input with enhanced feedback
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applyFilters();
                    if (e.target.value.length > 2) {
                        this.showToast(`Searching for "${e.target.value}"...`, 'info');
                    }
                }, 300);
            });
        }

        // Other filter controls
        const filterControls = [
            'accountTypeFilter', 'countryFilter', 
            'minScore', 'maxScore', 'minEmployees', 'maxEmployees'
        ];

        filterControls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
                if (element.type === 'number') {
                    element.addEventListener('input', () => {
                        clearTimeout(this.searchTimeout);
                        this.searchTimeout = setTimeout(() => {
                            this.applyFilters();
                        }, 500);
                    });
                }
            }
        });

        // Filter action buttons
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.clearFilters();
            this.showToast('All filters cleared', 'info');
        });
        
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
            this.showToast('Filters applied', 'success');
        });

        // Table sorting with feedback
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                const column = e.target.getAttribute('data-column');
                this.sortTable(column);
                this.showToast(`Sorted by ${column}`, 'info');
            });
        });

        // Account selector for details
        document.getElementById('accountSelector')?.addEventListener('change', (e) => {
            if (e.target.value) {
                const accountName = this.accounts[e.target.value]['Company Name'];
                this.showAccountDetails(e.target.value);
                this.showToast(`Viewing details for ${accountName}`, 'info');
            }
        });

        // Add row click handlers for better interaction
        this.setupTableRowInteractions();
    }

    setupTableRowInteractions() {
        // We'll add this after the table is rendered
        document.addEventListener('click', (e) => {
            const row = e.target.closest('.data-table tbody tr');
            if (row) {
                // Add a subtle click effect
                row.style.transform = 'translateY(1px)';
                setTimeout(() => {
                    row.style.transform = '';
                }, 100);
            }
        });
    }

    populateFilters() {
        // Populate country filter
        const countries = [...new Set(this.accounts.map(account => account.Country))].sort();
        const countryFilter = document.getElementById('countryFilter');
        if (countryFilter) {
            countryFilter.innerHTML = '<option value="">All Countries</option>';
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countryFilter.appendChild(option);
            });
        }
    }

    populateAccountSelector() {
        const selector = document.getElementById('accountSelector');
        if (selector) {
            selector.innerHTML = '<option value="">Choose an account...</option>';
            this.accounts
                .sort((a, b) => a['Company Name'].localeCompare(b['Company Name']))
                .forEach((account, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${account['Company Name']} (${account['Assigned To']})`;
                    selector.appendChild(option);
                });
        }
    }

    clearFilters() {
        // Clear text inputs
        document.getElementById('searchInput').value = '';
        document.getElementById('minScore').value = '';
        document.getElementById('maxScore').value = '';
        document.getElementById('minEmployees').value = '';
        document.getElementById('maxEmployees').value = '';

        // Clear dropdowns
        document.getElementById('accountTypeFilter').value = '';
        document.getElementById('countryFilter').value = '';

        // Clear multi-select filters
        this.clearMultiSelect('assignedTo');
        this.clearMultiSelect('segmentation');

        // Clear internal state
        this.selectedAssignedTo = [];
        this.selectedSegmentation = [];

        // Apply filters to show all results
        this.applyFilters();
    }

    clearMultiSelect(filterId) {
        const dropdown = document.getElementById(filterId + 'Dropdown');
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        this.updateMultiSelectDisplay(filterId);
    }

    applyFilters() {
        this.showLoadingIndicator(true);

        // Get filter values
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const accountType = document.getElementById('accountTypeFilter').value;
        const country = document.getElementById('countryFilter').value;
        const minScore = parseInt(document.getElementById('minScore').value) || 0;
        const maxScore = parseInt(document.getElementById('maxScore').value) || 100;
        const minEmployees = parseInt(document.getElementById('minEmployees').value) || 0;
        const maxEmployees = parseInt(document.getElementById('maxEmployees').value) || Infinity;

        // Apply filters
        this.filteredAccounts = this.accounts.filter(account => {
            // Search filter
            if (searchTerm) {
                const searchFields = [
                    account['Company Name'],
                    account.Website,
                    account['Account Notes'].join(' '),
                    account['Drop Notes']
                ].join(' ').toLowerCase();

                if (!searchFields.includes(searchTerm)) return false;
            }

            // Account type filter
            if (accountType && account['Account Type'] !== accountType) return false;

            // Assigned to filter (multi-select)
            if (this.selectedAssignedTo.length > 0 && !this.selectedAssignedTo.includes(account['Assigned To'])) {
                return false;
            }

            // Segmentation filter (multi-select)
            if (this.selectedSegmentation.length > 0 && !this.selectedSegmentation.includes(account.Segmentation)) {
                return false;
            }

            // Country filter
            if (country && account.Country !== country) return false;

            // Prospect score filter
            if (account['Prospect Score'] < minScore || account['Prospect Score'] > maxScore) return false;

            // Employee count filter
            if (account.Employees < minEmployees || account.Employees > maxEmployees) return false;

            return true;
        });

        // Simulate loading delay for better UX
        setTimeout(() => {
            this.updateTable();
            this.updateResultsCount();
            this.updateOverviewCards();
            this.showLoadingIndicator(false);
        }, 200);
    }

    showLoadingIndicator(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.classList.toggle('hidden', !show);
        }
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            const count = this.filteredAccounts.length;
            countElement.textContent = `${count} account${count !== 1 ? 's' : ''} found`;
        }
    }

    updateTable() {
        // Reset to first page when applying new filters
        this.currentPage = 1;
        
        // Create pagination controls if they don't exist
        if (!document.querySelector('.pagination-container')) {
            this.createPaginationControls();
        }
        
        // Update pagination and render current page
        this.updatePagination();
        this.renderCurrentPage();
    }

    getRevenueClass(revenue) {
        if (revenue.includes('$10 mil') || revenue.includes('$25 mil')) return 'revenue-low';
        if (revenue.includes('$50 mil') || revenue.includes('$100 mil')) return 'revenue-medium';
        return 'revenue-high';
    }

    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        this.filteredAccounts.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            // Handle different data types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        // Stay on current page after sorting, but re-render
        this.renderCurrentPage();
        this.updateSortIndicators();
    }

    updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.getAttribute('data-column') === this.currentSort.column) {
                header.classList.add(`sort-${this.currentSort.direction}`);
            }
        });
    }

    showAccountDetails(accountIndex) {
        const detailsContent = document.getElementById('accountDetailsContent');

        if (accountIndex === '') {
            detailsContent.classList.add('hidden');
            return;
        }

        const account = this.accounts[accountIndex];
        if (!account) return;

        // Update scoring metrics with staggered animation
        setTimeout(() => {
            this.updateScoreBar('prospectScoreBar', 'prospectScoreValue', account['Prospect Score'], 100);
        }, 100);
        
        setTimeout(() => {
            this.updateScoreBar('activityScoreBar', 'activityScoreValue', account.Activity, 10);
        }, 300);
        
        setTimeout(() => {
            this.updateScoreBar('generationScoreBar', 'generationScoreValue', account.Generation, 10);
        }, 500);

        // Update account information
        document.getElementById('companyDetails').innerHTML = `
            <strong>${account['Company Name']}</strong><br>
            ${account.Segmentation} • ${account['Account Type']}<br>
            ${account['Head Office']}, ${account.Country}
        `;

        document.getElementById('contactInfo').innerHTML = `
            Website: <a href="http://${account.Website}" target="_blank">${account.Website}</a><br>
            LinkedIn: <a href="${account['LinkedIn URL']}" target="_blank">View Profile</a><br>
            Assigned to: ${account['Assigned To']}
        `;

        document.getElementById('businessMetrics').innerHTML = `
            Revenue: ${account['Revenue Estimate']}<br>
            Employees: ${account.Employees.toLocaleString()}<br>
            Notes: ${Array.isArray(account['Account Notes']) ? account['Account Notes'].join(', ') : account['Account Notes']}
        `;

        // Create Salesforce button link
        const salesforceContainer = document.getElementById('salesforceId');
        const salesforceUrl = `https://orennia.lightning.force.com/lightning/r/Account/${account.SalesforceID}/view`;
        salesforceContainer.innerHTML = `
            <a href="${salesforceUrl}" target="_blank" class="salesforce-button">
                <span class="salesforce-icon">🚀</span>
                View in Salesforce
                <span class="external-icon">↗</span>
            </a>
        `;

        detailsContent.classList.remove('hidden');
    }

    // Smooth animation for score bars
    animateScoreBar(barElement, valueElement, targetPercentage, targetValue) {
        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();
        
        // Easing function for smooth animation
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            
            // Animate bar width
            const currentWidth = easedProgress * targetPercentage;
            barElement.style.width = `${currentWidth}%`;
            
            // Animate number counting
            const currentValue = Math.round(easedProgress * targetValue);
            valueElement.textContent = currentValue;
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final values are exact
                barElement.style.width = `${targetPercentage}%`;
                valueElement.textContent = targetValue;
                
                // Add a subtle pulse effect when complete
                barElement.style.boxShadow = '0 0 10px rgba(var(--color-primary-rgb, 33, 128, 141), 0.4)';
                setTimeout(() => {
                    barElement.style.boxShadow = '';
                }, 600);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateScoreBar(barId, valueId, score, maxValue) {
        const bar = document.getElementById(barId);
        const valueSpan = document.getElementById(valueId);

        if (bar && valueSpan) {
            const percentage = (score / maxValue) * 100;
            
            // Reset bar to start animation from 0
            bar.style.width = '0%';
            valueSpan.textContent = '0';
            
            // Animate both the bar width and number counting
            this.animateScoreBar(bar, valueSpan, percentage, score);
        }
    }

    // Account Comparison Methods
    createComparisonButton() {
        // Create floating comparison button
        const comparisonBtn = document.createElement('button');
        comparisonBtn.className = 'comparison-button';
        comparisonBtn.id = 'comparisonButton';
        comparisonBtn.innerHTML = `
            ⚖️ Compare Selected 
            <span class="comparison-count" id="comparisonCount">0</span>
        `;
        comparisonBtn.addEventListener('click', () => this.openComparison());
        document.body.appendChild(comparisonBtn);

        // Create comparison modal
        const modal = document.createElement('div');
        modal.className = 'comparison-modal';
        modal.id = 'comparisonModal';
        modal.innerHTML = `
            <div class="comparison-content">
                <div class="comparison-header">
                    <h2 class="comparison-title">Account Comparison</h2>
                    <div class="comparison-actions">
                        <button class="btn btn--outline btn--sm" onclick="dashboard.exportComparison()">
                            📊 Export
                        </button>
                        <button class="modal-close" onclick="dashboard.closeComparison()">×</button>
                    </div>
                </div>
                <div id="comparisonBody">
                    <!-- Comparison content will be inserted here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeComparison();
            }
        });
    }

    toggleAccountComparison(accountIndex) {
        const index = this.selectedForComparison.indexOf(accountIndex);
        
        if (index === -1) {
            // Add to comparison if not already selected and under limit
            if (this.selectedForComparison.length < this.maxComparisons) {
                this.selectedForComparison.push(accountIndex);
                this.showToast(`Added ${this.filteredAccounts[accountIndex]['Company Name']} to comparison`, 'success');
            }
        } else {
            // Remove from comparison
            this.selectedForComparison.splice(index, 1);
            this.showToast(`Removed ${this.filteredAccounts[accountIndex]['Company Name']} from comparison`, 'info');
        }
        
        this.updateComparisonButton();
        this.renderCurrentPage(); // Re-render to update checkboxes
    }

    updateComparisonButton() {
        const button = document.getElementById('comparisonButton');
        const count = document.getElementById('comparisonCount');
        
        if (button && count) {
            count.textContent = this.selectedForComparison.length;
            
            if (this.selectedForComparison.length >= 2) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        }
    }

    openComparison() {
        if (this.selectedForComparison.length < 2) {
            this.showToast('Please select at least 2 accounts to compare', 'error');
            return;
        }

        const modal = document.getElementById('comparisonModal');
        const body = document.getElementById('comparisonBody');
        
        body.innerHTML = this.renderComparisonView();
        modal.classList.add('visible');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeComparison() {
        const modal = document.getElementById('comparisonModal');
        modal.classList.remove('visible');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    renderComparisonView() {
        const selectedAccounts = this.selectedForComparison.map(index => this.filteredAccounts[index]);
        const insights = this.generateInsights(selectedAccounts);
        
        return `
            <div class="comparison-grid">
                ${selectedAccounts.map((account, index) => this.renderComparisonCard(account, index, selectedAccounts)).join('')}
            </div>
            <div class="insights-section">
                <h3 class="insights-title">💡 Smart Insights</h3>
                ${insights.map(insight => `<div class="insight-item">${insight}</div>`).join('')}
            </div>
        `;
    }

    renderComparisonCard(account, index, allAccounts) {
        const isWinner = this.determineWinner(account, allAccounts);
        const metrics = this.getComparisonMetrics(account, allAccounts);
        
        return `
            <div class="comparison-card ${isWinner ? 'winner' : ''}">
                ${isWinner ? '<div class="winner-badge">🏆 Top Pick</div>' : ''}
                
                <div class="comparison-card-header">
                    <div class="company-name">${account['Company Name']}</div>
                    <div class="company-subtitle">
                        ${account.Segmentation} • ${account['Account Type']} • ${account.Country}
                    </div>
                </div>
                
                <div class="comparison-metrics">
                    ${metrics.map(metric => `
                        <div class="metric-row">
                            <span class="metric-label">${metric.label}</span>
                            <div class="metric-value ${metric.highlight}">
                                ${metric.value}
                                ${metric.showBar ? `
                                    <div class="metric-bar">
                                        <div class="metric-bar-fill ${metric.highlight}" style="width: ${metric.percentage}%"></div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="card-actions">
                    <button class="card-action" onclick="dashboard.viewAccountDetails(${this.selectedForComparison[index]})">
                        👁️ View Details
                    </button>
                    <a href="https://orennia.lightning.force.com/lightning/r/Account/${account.SalesforceID}/view" 
                       target="_blank" class="card-action">
                        🚀 Salesforce
                    </a>
                    <button class="card-action" onclick="dashboard.removeFromComparison(${this.selectedForComparison[index]})">
                        🗑️ Remove
                    </button>
                </div>
            </div>
        `;
    }

    getComparisonMetrics(account, allAccounts) {
        const scores = allAccounts.map(acc => acc['Prospect Score']);
        const employees = allAccounts.map(acc => acc.Employees);
        const revenues = allAccounts.map(acc => this.getRevenueNumeric(acc['Revenue Estimate']));
        
        const maxScore = Math.max(...scores);
        const maxEmployees = Math.max(...employees);
        const maxRevenue = Math.max(...revenues);
        
        const minScore = Math.min(...scores);
        const minEmployees = Math.min(...employees);
        const minRevenue = Math.min(...revenues);
        
        return [
            {
                label: 'Prospect Score',
                value: account['Prospect Score'],
                highlight: account['Prospect Score'] === maxScore ? 'highest' : 
                          account['Prospect Score'] === minScore ? 'lowest' : '',
                showBar: true,
                percentage: (account['Prospect Score'] / maxScore) * 100
            },
            {
                label: 'Revenue',
                value: account['Revenue Estimate'],
                highlight: this.getRevenueNumeric(account['Revenue Estimate']) === maxRevenue ? 'highest' : 
                          this.getRevenueNumeric(account['Revenue Estimate']) === minRevenue ? 'lowest' : '',
                showBar: true,
                percentage: (this.getRevenueNumeric(account['Revenue Estimate']) / maxRevenue) * 100
            },
            {
                label: 'Employees',
                value: account.Employees.toLocaleString(),
                highlight: account.Employees === maxEmployees ? 'highest' : 
                          account.Employees === minEmployees ? 'lowest' : '',
                showBar: true,
                percentage: (account.Employees / maxEmployees) * 100
            },
            {
                label: 'Assigned To',
                value: account['Assigned To'],
                highlight: '',
                showBar: false
            },
            {
                label: 'Activity Level',
                value: `${account.Activity}/10`,
                highlight: '',
                showBar: false
            },
            {
                label: 'Head Office',
                value: account['Head Office'],
                highlight: '',
                showBar: false
            }
        ];
    }

    getRevenueNumeric(revenueString) {
        // Convert revenue string to number for comparison
        if (revenueString.includes('$10 mil')) return 17.5;
        if (revenueString.includes('$25 mil')) return 37.5;
        if (revenueString.includes('$50 mil')) return 75;
        if (revenueString.includes('$100 mil')) return 175;
        if (revenueString.includes('$250 mil')) return 375;
        return 0;
    }

    determineWinner(account, allAccounts) {
        // Simple scoring algorithm - highest prospect score wins
        const scores = allAccounts.map(acc => acc['Prospect Score']);
        const maxScore = Math.max(...scores);
        return account['Prospect Score'] === maxScore;
    }

    generateInsights(accounts) {
        const insights = [];
        
        // Find highest prospect score
        const scores = accounts.map(acc => ({ name: acc['Company Name'], score: acc['Prospect Score'] }));
        const highest = scores.reduce((prev, current) => prev.score > current.score ? prev : current);
        insights.push(`🎯 <strong>${highest.name}</strong> has the highest prospect score (${highest.score})`);
        
        // Find largest company
        const employees = accounts.map(acc => ({ name: acc['Company Name'], employees: acc.Employees }));
        const largest = employees.reduce((prev, current) => prev.employees > current.employees ? prev : current);
        insights.push(`🏢 <strong>${largest.name}</strong> is the largest company (${largest.employees.toLocaleString()} employees)`);
        
        // Find highest revenue
        const revenues = accounts.map(acc => ({ 
            name: acc['Company Name'], 
            revenue: acc['Revenue Estimate'],
            numeric: this.getRevenueNumeric(acc['Revenue Estimate'])
        }));
        const richest = revenues.reduce((prev, current) => prev.numeric > current.numeric ? prev : current);
        insights.push(`💰 <strong>${richest.name}</strong> offers the largest revenue opportunity (${richest.revenue})`);
        
        // Recommendation
        if (highest.name === richest.name) {
            insights.push(`🚀 <strong>Recommendation:</strong> Focus on ${highest.name} - highest score AND revenue potential`);
        } else {
            insights.push(`🚀 <strong>Recommendation:</strong> Consider ${highest.name} for quick wins, ${richest.name} for long-term value`);
        }
        
        return insights;
    }

    removeFromComparison(accountIndex) {
        const index = this.selectedForComparison.indexOf(accountIndex);
        if (index !== -1) {
            const accountName = this.filteredAccounts[accountIndex]['Company Name'];
            this.selectedForComparison.splice(index, 1);
            this.showToast(`Removed ${accountName} from comparison`, 'info');
            
            // Update button and re-render comparison if modal is open
            this.updateComparisonButton();
            
            const modal = document.getElementById('comparisonModal');
            if (modal.classList.contains('visible')) {
                if (this.selectedForComparison.length >= 2) {
                    document.getElementById('comparisonBody').innerHTML = this.renderComparisonView();
                } else {
                    this.closeComparison();
                    this.showToast('Comparison closed - need at least 2 accounts', 'info');
                }
            }
            
            // Re-render table to update checkboxes
            this.renderCurrentPage();
        }
    }

    viewAccountDetails(accountIndex) {
        // Switch to details tab and show account
        const detailsTab = document.querySelector('[data-tab="details"]');
        const accountSelector = document.getElementById('accountSelector');
        
        if (detailsTab && accountSelector) {
            // Click details tab
            detailsTab.click();
            
            // Set account selector
            accountSelector.value = accountIndex;
            accountSelector.dispatchEvent(new Event('change'));
            
            // Close comparison modal
            this.closeComparison();
            
            this.showToast(`Viewing details for ${this.filteredAccounts[accountIndex]['Company Name']}`, 'info');
        }
    }

    exportComparison() {
        if (this.selectedForComparison.length < 2) {
            this.showToast('No comparison to export', 'error');
            return;
        }

        const selectedAccounts = this.selectedForComparison.map(index => this.filteredAccounts[index]);
        
        // Define columns for comparison export
        const columns = [
            'Company Name', 'Assigned To', 'Account Type', 'Prospect Score',
            'Revenue Estimate', 'Employees', 'Head Office', 'Country', 
            'Segmentation', 'Activity', 'Generation'
        ];

        // Create CSV content
        const csvContent = [
            columns.join(','), // Header row
            ...selectedAccounts.map(account => 
                columns.map(col => {
                    let value = account[col];
                    if (Array.isArray(value)) value = value.join('; ');
                    value = String(value).replace(/"/g, '""');
                    return `"${value}"`;
                }).join(',')
            )
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `account_comparison_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast(`Exported comparison of ${selectedAccounts.length} accounts`, 'success');
    }
}

// Initialize the dashboard when DOM is loaded
let dashboard; // Global reference for empty state button
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AccountDashboard();
});
