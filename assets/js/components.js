// ===== COMPONENT SYSTEM =====
class ComponentSystem {
    constructor() {
        this.components = new Map();
        this.init();
    }

    init() {
        // Initialize all components on DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initModals();
            this.initDropdowns();
            this.initTables();
            this.initForms();
            this.initSidebar();
        });
    }

    // ===== MODAL COMPONENT =====
    initModals() {
        // Close modal when clicking backdrop or close button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // ===== DROPDOWN COMPONENT =====
    initDropdowns() {
        document.addEventListener('click', (e) => {
            const dropdownToggle = e.target.closest('.dropdown-toggle');
            
            if (dropdownToggle) {
                e.preventDefault();
                const dropdown = dropdownToggle.closest('.dropdown');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-menu.show').forEach(otherMenu => {
                    if (otherMenu !== menu) {
                        otherMenu.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                menu.classList.toggle('show');
            } else {
                // Close all dropdowns when clicking outside
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }

    // ===== TABLE COMPONENT =====
    initTables() {
        // Add sorting functionality to tables
        document.querySelectorAll('.table-sortable th[data-sort]').forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                this.sortTable(header);
            });
        });
    }

    sortTable(header) {
        const table = header.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const column = header.dataset.sort;
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        const isAscending = !header.classList.contains('sort-asc');

        // Remove existing sort classes
        header.parentNode.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });

        // Add new sort class
        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            // Try to parse as numbers
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? aNum - bNum : bNum - aNum;
            }
            
            // String comparison
            return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });

        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
    }

    // ===== FORM COMPONENT =====
    initForms() {
        // Add form validation
        document.querySelectorAll('form[data-validate]').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Real-time validation
            form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        const errorElement = document.getElementById(fieldName + 'Error');
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Ingrese un email válido';
            }
        }

        // Password validation
        if (field.type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            }
        }

        // Confirm password validation
        if (field.dataset.confirm) {
            const originalField = document.getElementById(field.dataset.confirm);
            if (originalField && value !== originalField.value) {
                isValid = false;
                errorMessage = 'Las contraseñas no coinciden';
            }
        }

        // Update field appearance
        field.classList.toggle('is-invalid', !isValid);
        
        // Show/hide error message
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.toggle('show', !isValid);
        }

        return isValid;
    }

    // ===== ALERT COMPONENT =====
    showAlert(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alertContainer') || this.createAlertContainer();
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button type="button" class="alert-close" onclick="this.parentElement.remove()">×</button>
        `;

        alertContainer.appendChild(alert);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, duration);
        }

        return alert;
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    // ===== LOADING COMPONENT =====
    showLoading() {
        const overlay = document.getElementById('loadingOverlay') || this.createLoadingOverlay();
        overlay.classList.add('show');
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(overlay);
        return overlay;
    }

    // ===== PAGINATION COMPONENT =====
    createPagination(container, totalItems, itemsPerPage, currentPage, onPageChange) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const pagination = document.createElement('nav');
        pagination.innerHTML = `
            <ul class="pagination">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
                </li>
                ${this.generatePageNumbers(totalPages, currentPage)}
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}">Siguiente</a>
                </li>
            </ul>
        `;

        // Add click handlers
        pagination.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link') && !e.target.parentElement.classList.contains('disabled')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== currentPage) {
                    onPageChange(page);
                }
            }
        });

        container.innerHTML = '';
        container.appendChild(pagination);
    }

    generatePageNumbers(totalPages, currentPage) {
        let pages = '';
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        return pages;
    }

    // ===== SIDEBAR COMPONENT =====
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
        
        // Desktop sidebar toggle
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar?.classList.toggle('collapsed');
            });
        }
        
        // Mobile sidebar toggle
        if (mobileSidebarToggle) {
            mobileSidebarToggle.addEventListener('click', () => {
                sidebar?.classList.toggle('show');
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar?.classList.contains('show')) {
                if (!sidebar.contains(e.target) && !mobileSidebarToggle?.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar?.classList.remove('show');
            }
        });
    }

    // ===== UTILITY METHODS =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    formatDate(date, format = 'dd/mm/yyyy') {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        switch (format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            case 'mm/dd/yyyy':
                return `${month}/${day}/${year}`;
            default:
                return d.toLocaleDateString();
        }
    }

    formatCurrency(amount, currency = 'ARS') {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // ===== DATA TABLE COMPONENT =====
    createDataTable(container, data, columns, options = {}) {
        const {
            sortable = true,
            searchable = true,
            pagination = true,
            itemsPerPage = 10
        } = options;

        let currentPage = 1;
        let filteredData = [...data];
        let sortColumn = null;
        let sortDirection = 'asc';

        const render = () => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = pagination ? filteredData.slice(startIndex, endIndex) : filteredData;

            let html = `
                ${searchable ? `
                    <div class="mb-4">
                        <input type="text" class="form-control" placeholder="Buscar..." id="tableSearch">
                    </div>
                ` : ''}
                <div class="table-container">
                    <table class="table ${sortable ? 'table-sortable' : ''}">
                        <thead>
                            <tr>
                                ${columns.map(col => `
                                    <th ${sortable ? `data-sort="${col.key}" style="cursor: pointer;"` : ''}>
                                        ${col.title}
                                        ${sortable ? '<span class="sort-indicator"></span>' : ''}
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${pageData.map(row => `
                                <tr>
                                    ${columns.map(col => `
                                        <td>${col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${pagination ? `<div id="paginationContainer"></div>` : ''}
            `;

            container.innerHTML = html;

            // Add search functionality
            if (searchable) {
                const searchInput = container.querySelector('#tableSearch');
                searchInput.addEventListener('input', this.debounce((e) => {
                    const query = e.target.value.toLowerCase();
                    filteredData = data.filter(row => 
                        columns.some(col => 
                            String(row[col.key]).toLowerCase().includes(query)
                        )
                    );
                    currentPage = 1;
                    render();
                }, 300));
            }

            // Add sorting functionality
            if (sortable) {
                container.querySelectorAll('th[data-sort]').forEach(header => {
                    header.addEventListener('click', () => {
                        const column = header.dataset.sort;
                        if (sortColumn === column) {
                            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                        } else {
                            sortColumn = column;
                            sortDirection = 'asc';
                        }

                        filteredData.sort((a, b) => {
                            const aVal = a[column];
                            const bVal = b[column];
                            const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                            return sortDirection === 'asc' ? result : -result;
                        });

                        render();
                    });
                });
            }

            // Add pagination
            if (pagination && filteredData.length > itemsPerPage) {
                const paginationContainer = container.querySelector('#paginationContainer');
                this.createPagination(
                    paginationContainer,
                    filteredData.length,
                    itemsPerPage,
                    currentPage,
                    (page) => {
                        currentPage = page;
                        render();
                    }
                );
            }
        };

        render();
        return { render, getData: () => filteredData };
    }
}

// Initialize component system
const components = new ComponentSystem();

// Export for use in other modules
window.Components = components;
