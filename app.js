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
                <div class="overview-card">
                    <h3>Top Performer</h3>
                    <span class="metric" id="topPerformer">-</span>
                    <span class="subtitle">by account count</span>
                </div>
                <div class="overview-card">
                    <h3>Revenue Pipeline</h3>
                    <span class="metric" id="revenuePipeline">$0M</span>
                    <span class="subtitle">estimated total</span>
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

        // Top performer by account count
        const assigneeCounts = {};
        this.filteredAccounts.forEach(acc => {
            assigneeCounts[acc['Assigned To']] = (assigneeCounts[acc['Assigned To']] || 0) + 1;
        });
        const topPerformer = Object.keys(assigneeCounts).reduce((a, b) => 
            assigneeCounts[a] > assigneeCounts[b] ? a : b
        );
        document.getElementById('topPerformer').textContent = topPerformer;

        // Revenue pipeline (simplified calculation)
        const totalRevenue = this.filteredAccounts.reduce((sum, acc) => {
            const revenue = acc['Revenue Estimate'];
            let value = 0;
            if (revenue.includes('$10 mil')) value = 17.5; // midpoint of 10-25
            else if (revenue.includes('$25 mil')) value = 37.5; // midpoint of 25-50
            else if (revenue.includes('$50 mil')) value = 75; // midpoint of 50-100
            else if (revenue.includes('$100 mil')) value = 175; // midpoint of 100-250
            else if (revenue.includes('$250 mil')) value = 375; // midpoint of 250-500
            return sum + value;
        }, 0);
        document.getElementById('revenuePipeline').textContent = `$${Math.round(totalRevenue)}M`;
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
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: var(--space-32); color: var(--color-text-secondary);">
                        No accounts match your current filters
                    </td>
                </tr>
            `;
            return;
        }

        // Calculate which accounts to show
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageAccounts = this.filteredAccounts.slice(startIndex, endIndex);

        tbody.innerHTML = pageAccounts.map(account => `
            <tr class="table-row-interactive">
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
        `).join('');

        // Add pulse animation to new results
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            setTimeout(() => {
                row.classList.add('table-row-new');
                setTimeout(() => row.classList.remove('table-row-new'), 600);
            }, index * 30); // Faster animation for pagination
        });
    }
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
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AccountDashboard();
});
