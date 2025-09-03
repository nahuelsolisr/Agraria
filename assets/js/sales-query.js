/**
 * Sales Query Module - Sistema Agraria
 * Handles sales querying with advanced filters, results display, and export functionality
 */

class SalesQueryModule {
    constructor() {
        this.sales = [];
        this.filteredSales = [];
        this.currentSort = { field: 'date', direction: 'desc' };
        this.currentSale = null;
        
        this.init();
    }

    init() {
        this.initializeUserInfo();
        this.loadSalesData();
        this.loadProductsForFilter();
        this.bindEvents();
        this.setDefaultDateRange();
        this.performSearch(); // Load initial results
    }

    initializeUserInfo() {
        if (window.Auth && window.Auth.getCurrentUser) {
            const user = window.Auth.getCurrentUser();
            if (user) {
                const userNameElement = document.getElementById('currentUserName');
                if (userNameElement) {
                    userNameElement.textContent = user.nombre || user.username || 'Usuario';
                }

                // Show/hide admin sections based on role
                const adminSections = document.querySelectorAll('.admin-only');
                adminSections.forEach(section => {
                    if (user.rol === 'admin') {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
            }
        }
    }

    loadSalesData() {
        // Load sales from localStorage or use sample data
        const storedSales = localStorage.getItem('sales');
        if (storedSales) {
            this.sales = JSON.parse(storedSales);
        } else {
            // Sample sales data
            this.sales = [
                {
                    id: 1,
                    date: '2024-01-15',
                    customer: 'Juan Pérez',
                    seller: 'Admin Usuario',
                    products: [
                        { name: 'Semillas de Tomate', quantity: 2, price: 15.50, subtotal: 31.00 },
                        { name: 'Fertilizante Orgánico', quantity: 1, price: 25.00, subtotal: 25.00 }
                    ],
                    subtotal: 56.00,
                    tax: 11.76,
                    total: 67.76
                },
                {
                    id: 2,
                    date: '2024-01-14',
                    customer: 'María García',
                    seller: 'Admin Usuario',
                    products: [
                        { name: 'Herramientas de Jardín', quantity: 1, price: 45.00, subtotal: 45.00 }
                    ],
                    subtotal: 45.00,
                    tax: 9.45,
                    total: 54.45
                },
                {
                    id: 3,
                    date: '2024-01-13',
                    customer: 'Carlos López',
                    seller: 'Admin Usuario',
                    products: [
                        { name: 'Semillas de Lechuga', quantity: 3, price: 8.00, subtotal: 24.00 },
                        { name: 'Sustrato para Plantas', quantity: 2, price: 12.00, subtotal: 24.00 }
                    ],
                    subtotal: 48.00,
                    tax: 10.08,
                    total: 58.08
                },
                {
                    id: 4,
                    date: '2024-01-12',
                    customer: 'Ana Martínez',
                    seller: 'Admin Usuario',
                    products: [
                        { name: 'Macetas de Barro', quantity: 5, price: 8.50, subtotal: 42.50 }
                    ],
                    subtotal: 42.50,
                    tax: 8.93,
                    total: 51.43
                },
                {
                    id: 5,
                    date: '2024-01-11',
                    customer: 'Roberto Silva',
                    seller: 'Admin Usuario',
                    products: [
                        { name: 'Semillas de Tomate', quantity: 1, price: 15.50, subtotal: 15.50 },
                        { name: 'Regadera Metálica', quantity: 1, price: 18.00, subtotal: 18.00 }
                    ],
                    subtotal: 33.50,
                    tax: 7.04,
                    total: 40.54
                }
            ];
            localStorage.setItem('sales', JSON.stringify(this.sales));
        }
    }

    loadProductsForFilter() {
        // Get unique products from all sales
        const products = new Set();
        this.sales.forEach(sale => {
            sale.products.forEach(product => {
                products.add(product.name);
            });
        });

        const productFilter = document.getElementById('productFilter');
        if (productFilter) {
            // Clear existing options except the first one
            while (productFilter.children.length > 1) {
                productFilter.removeChild(productFilter.lastChild);
            }

            // Add product options
            Array.from(products).sort().forEach(product => {
                const option = document.createElement('option');
                option.value = product;
                option.textContent = product;
                productFilter.appendChild(option);
            });
        }
    }

    setDefaultDateRange() {
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        
        if (dateFrom && dateTo) {
            // Set default to last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
            dateTo.value = today.toISOString().split('T')[0];
        }
    }

    bindEvents() {
        // Search and filter events
        const searchBtn = document.getElementById('searchBtn');
        const clearBtn = document.getElementById('clearBtn');
        const exportBtn = document.getElementById('exportBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // Enter key search
        const filterInputs = document.querySelectorAll('#salesQueryForm input, #salesQueryForm select');
        filterInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });
        });

        // Table sorting
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.sort;
                this.sortResults(field);
            });
        });

        // Modal events
        const printDetailBtn = document.getElementById('printDetailBtn');
        if (printDetailBtn) {
            printDetailBtn.addEventListener('click', () => this.printSaleDetail());
        }

        // User menu and logout
        this.bindUserMenuEvents();
    }

    bindUserMenuEvents() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userMenuDropdown = document.getElementById('userMenuDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userMenuToggle && userMenuDropdown) {
            userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userMenuDropdown.classList.remove('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.Auth && window.Auth.logout) {
                    window.Auth.logout();
                }
            });
        }
    }

    performSearch() {
        const filters = this.getFilters();
        this.filteredSales = this.sales.filter(sale => this.matchesFilters(sale, filters));
        this.sortResults(this.currentSort.field, this.currentSort.direction);
        this.renderResults();
        this.updateResultsCount();
    }

    getFilters() {
        return {
            dateFrom: document.getElementById('dateFrom')?.value || '',
            dateTo: document.getElementById('dateTo')?.value || '',
            customer: document.getElementById('customerFilter')?.value.toLowerCase() || '',
            product: document.getElementById('productFilter')?.value || '',
            minAmount: parseFloat(document.getElementById('minAmount')?.value) || 0,
            maxAmount: parseFloat(document.getElementById('maxAmount')?.value) || Infinity
        };
    }

    matchesFilters(sale, filters) {
        // Date range filter
        if (filters.dateFrom && sale.date < filters.dateFrom) return false;
        if (filters.dateTo && sale.date > filters.dateTo) return false;

        // Customer filter
        if (filters.customer && !sale.customer.toLowerCase().includes(filters.customer)) return false;

        // Product filter
        if (filters.product) {
            const hasProduct = sale.products.some(product => product.name === filters.product);
            if (!hasProduct) return false;
        }

        // Amount range filter
        if (sale.total < filters.minAmount || sale.total > filters.maxAmount) return false;

        return true;
    }

    sortResults(field, direction = null) {
        if (direction === null) {
            // Toggle direction if same field, otherwise use ascending
            if (this.currentSort.field === field) {
                direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                direction = 'asc';
            }
        }

        this.currentSort = { field, direction };

        this.filteredSales.sort((a, b) => {
            let aValue, bValue;

            switch (field) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'customer':
                    aValue = a.customer.toLowerCase();
                    bValue = b.customer.toLowerCase();
                    break;
                case 'products':
                    aValue = a.products.length;
                    bValue = b.products.length;
                    break;
                case 'subtotal':
                    aValue = a.subtotal;
                    bValue = b.subtotal;
                    break;
                case 'tax':
                    aValue = a.tax;
                    bValue = b.tax;
                    break;
                case 'total':
                    aValue = a.total;
                    bValue = b.total;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.updateSortHeaders();
        this.renderResults();
    }

    updateSortHeaders() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            header.classList.remove('asc', 'desc');
            if (header.dataset.sort === this.currentSort.field) {
                header.classList.add(this.currentSort.direction);
            }
        });
    }

    renderResults() {
        const tableBody = document.getElementById('salesTableBody');
        const emptyState = document.getElementById('emptyState');
        const table = document.getElementById('salesTable');

        if (!tableBody) return;

        if (this.filteredSales.length === 0) {
            tableBody.innerHTML = '';
            if (table) table.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (table) table.style.display = 'table';
        if (emptyState) emptyState.style.display = 'none';

        tableBody.innerHTML = this.filteredSales.map(sale => this.renderSaleRow(sale)).join('');

        // Bind view detail events
        const viewButtons = tableBody.querySelectorAll('.view-sale-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const saleId = parseInt(e.target.closest('button').dataset.saleId);
                this.showSaleDetail(saleId);
            });
        });
    }

    renderSaleRow(sale) {
        const formattedDate = this.formatDate(sale.date);
        const productsList = sale.products.map(p => p.name).join(', ');
        const productsDisplay = productsList.length > 50 ? 
            productsList.substring(0, 50) + '...' : productsList;

        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${this.escapeHtml(sale.customer)}</td>
                <td title="${this.escapeHtml(productsList)}">${this.escapeHtml(productsDisplay)}</td>
                <td>$${sale.subtotal.toFixed(2)}</td>
                <td>$${sale.tax.toFixed(2)}</td>
                <td class="font-semibold">$${sale.total.toFixed(2)}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="btn btn-sm btn-outline view-sale-btn" 
                                data-sale-id="${sale.id}" title="Ver detalle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    showSaleDetail(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;

        this.currentSale = sale;

        // Populate modal with sale details
        document.getElementById('detailDate').textContent = this.formatDate(sale.date);
        document.getElementById('detailCustomer').textContent = sale.customer;
        document.getElementById('detailSeller').textContent = sale.seller;
        document.getElementById('detailSubtotal').textContent = `$${sale.subtotal.toFixed(2)}`;
        document.getElementById('detailTax').textContent = `$${sale.tax.toFixed(2)}`;
        document.getElementById('detailTotal').textContent = `$${sale.total.toFixed(2)}`;

        // Populate products table
        const productsTable = document.getElementById('detailProductsTable');
        if (productsTable) {
            productsTable.innerHTML = sale.products.map(product => `
                <tr>
                    <td>${this.escapeHtml(product.name)}</td>
                    <td>${product.quantity}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>$${product.subtotal.toFixed(2)}</td>
                </tr>
            `).join('');
        }

        // Show modal
        this.showModal('saleDetailModal');
    }

    printSaleDetail() {
        if (!this.currentSale) return;

        const sale = this.currentSale;
        const printContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">Sistema Agraria</h1>
                    <h2 style="margin: 10px 0;">Detalle de Venta</h2>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p><strong>Fecha:</strong> ${this.formatDate(sale.date)}</p>
                    <p><strong>Cliente:</strong> ${sale.customer}</p>
                    <p><strong>Vendedor:</strong> ${sale.seller}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Producto</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Cantidad</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Precio Unit.</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.products.map(product => `
                            <tr>
                                <td style="border: 1px solid #d1d5db; padding: 8px;">${product.name}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${product.quantity}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">$${product.price.toFixed(2)}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">$${product.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="text-align: right; margin-top: 20px;">
                    <p><strong>Subtotal: $${sale.subtotal.toFixed(2)}</strong></p>
                    <p><strong>IVA (21%): $${sale.tax.toFixed(2)}</strong></p>
                    <p style="font-size: 1.2em; color: #2563eb;"><strong>Total: $${sale.total.toFixed(2)}</strong></p>
                </div>
                
                <div style="text-align: center; margin-top: 40px; font-size: 0.9em; color: #6b7280;">
                    <p>Gracias por su compra</p>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Detalle de Venta - ${sale.customer}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    clearFilters() {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('customerFilter').value = '';
        document.getElementById('productFilter').value = '';
        document.getElementById('minAmount').value = '';
        document.getElementById('maxAmount').value = '';
        
        this.setDefaultDateRange();
        this.performSearch();
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            const count = this.filteredSales.length;
            countElement.textContent = `${count} venta${count !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''}`;
        }
    }

    exportToCSV() {
        if (this.filteredSales.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const headers = ['Fecha', 'Cliente', 'Vendedor', 'Productos', 'Subtotal', 'IVA', 'Total'];
        const csvContent = [
            headers.join(','),
            ...this.filteredSales.map(sale => [
                sale.date,
                `"${sale.customer}"`,
                `"${sale.seller}"`,
                `"${sale.products.map(p => `${p.name} (${p.quantity})`).join('; ')}"`,
                sale.subtotal.toFixed(2),
                sale.tax.toFixed(2),
                sale.total.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Use component system if available
            if (window.Components && window.Components.openModal) {
                window.Components.openModal(modal);
            }
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SalesQueryModule();
});
