// ZoomInfo Account Dashboard JavaScript with Enhanced UX
class AccountDashboard {
    constructor() {
        this.accounts = [];
        this.filteredAccounts = [];
        this.currentSort = { column: null, direction: 'asc' };
        this.searchTimeout = null;
        this.isAuthenticated = false;
        this.selectedAssignedTo = [];
        this.selectedSegmentation = [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupLoginEventListeners();
        this.addCustomStyles(); // Add our enhanced styles
    }

    // Add custom styles for smooth transitions and interactive effects
    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Smooth page transitions */
            .login-container {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 9999 !important;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                           opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
        `;
        document.head.appendChild(style);
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
        
        // Show all accounts initially
        setTimeout(() => {
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

        tbody.innerHTML = this.filteredAccounts.map(account => `
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
            }, index * 50);
        });
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

        this.updateTable();
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

        // Update scoring metrics
        this.updateScoreBar('prospectScoreBar', 'prospectScoreValue', account['Prospect Score'], 100);
        this.updateScoreBar('activityScoreBar', 'activityScoreValue', account.Activity, 10);
        this.updateScoreBar('generationScoreBar', 'generationScoreValue', account.Generation, 10);

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

        document.getElementById('salesforceId').textContent = account.SalesforceID;

        detailsContent.classList.remove('hidden');
    }

    updateScoreBar(barId, valueId, score, maxValue) {
        const bar = document.getElementById(barId);
        const valueSpan = document.getElementById(valueId);

        if (bar && valueSpan) {
            const percentage = (score / maxValue) * 100;
            bar.style.width = `${percentage}%`;
            valueSpan.textContent = score;

            // Add animation class
            bar.classList.add('animate');
            setTimeout(() => bar.classList.remove('animate'), 1000);
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AccountDashboard();
});
