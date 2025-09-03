/**
 * Sales Module - Sistema Agraria
 * Handles sales registration functionality
 */

class SalesModule {
    constructor() {
        this.sales = [];
        this.products = [];
        this.currentSaleItems = [];
        this.currentSale = null;
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.bindEvents();
        this.populateProducts();
        this.renderRecentSales();
        this.setDefaultDate();
        this.initializeUserInfo();
    }
    
    loadData() {
        // Load sales from localStorage
        const savedSales = localStorage.getItem('sistemaAgraria_sales');
        if (savedSales) {
            this.sales = JSON.parse(savedSales);
        }
        
        // Load products from localStorage or initialize with sample data
        const savedProducts = localStorage.getItem('sistemaAgraria_products');
        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
        } else {
            // Initialize with sample products
            this.products = [
                { id: 1, name: 'Tomates', unit: 'kg', defaultPrice: 150.00, category: 'Hortalizas' },
                { id: 2, name: 'Lechugas', unit: 'unidad', defaultPrice: 80.00, category: 'Hortalizas' },
                { id: 3, name: 'Zanahorias', unit: 'kg', defaultPrice: 120.00, category: 'Hortalizas' },
                { id: 4, name: 'Huevos', unit: 'docena', defaultPrice: 200.00, category: 'Avícola' },
                { id: 5, name: 'Pollo', unit: 'kg', defaultPrice: 350.00, category: 'Avícola' },
                { id: 6, name: 'Miel', unit: 'kg', defaultPrice: 800.00, category: 'Apícola' },
                { id: 7, name: 'Queso', unit: 'kg', defaultPrice: 450.00, category: 'Lácteos' },
                { id: 8, name: 'Leche', unit: 'litro', defaultPrice: 85.00, category: 'Lácteos' },
                { id: 9, name: 'Acelga', unit: 'atado', defaultPrice: 60.00, category: 'Hortalizas' },
                { id: 10, name: 'Apio', unit: 'kg', defaultPrice: 90.00, category: 'Hortalizas' }
            ];
            this.saveProducts();
        }
    }
    
    saveData() {
        localStorage.setItem('sistemaAgraria_sales', JSON.stringify(this.sales));
    }
    
    saveProducts() {
        localStorage.setItem('sistemaAgraria_products', JSON.stringify(this.products));
    }
    
    bindEvents() {
        // Sale form submission
        const saleForm = document.getElementById('saleForm');
        if (saleForm) {
            saleForm.addEventListener('submit', (e) => this.handleSaleSubmit(e));
        }
        
        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.addProductToSale());
        }
        
        // Product selection change
        const productSelect = document.getElementById('productSelect');
        if (productSelect) {
            productSelect.addEventListener('change', (e) => this.handleProductChange(e));
        }
        
        // Clear sale button
        const clearSaleBtn = document.getElementById('clearSaleBtn');
        if (clearSaleBtn) {
            clearSaleBtn.addEventListener('click', () => this.clearSale());
        }
        
        // Print receipt button
        const printReceiptBtn = document.getElementById('printReceiptBtn');
        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () => this.printReceipt());
        }
        
        // Modal close events
        const modal = document.getElementById('receiptModal');
        if (modal) {
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.closeReceiptModal());
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeReceiptModal();
                }
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.Auth) {
                    window.Auth.logout();
                }
            });
        }
        
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('sidebar-open');
                }
            });
        }
    }
    
    populateProducts() {
        const productSelect = document.getElementById('productSelect');
        if (!productSelect) return;
        
        // Clear existing options except first
        productSelect.innerHTML = '<option value="">Seleccione un producto</option>';
        
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.unit}) - $${product.defaultPrice.toFixed(2)}`;
            option.dataset.price = product.defaultPrice;
            option.dataset.unit = product.unit;
            productSelect.appendChild(option);
        });
    }
    
    handleProductChange(e) {
        const selectedOption = e.target.selectedOptions[0];
        const priceInput = document.getElementById('productPrice');
        
        if (selectedOption && selectedOption.dataset.price) {
            priceInput.value = selectedOption.dataset.price;
        } else {
            priceInput.value = '';
        }
        
        // Clear quantity
        document.getElementById('productQuantity').value = '';
    }
    
    addProductToSale() {
        const productSelect = document.getElementById('productSelect');
        const quantityInput = document.getElementById('productQuantity');
        const priceInput = document.getElementById('productPrice');
        
        const productId = parseInt(productSelect.value);
        const quantity = parseFloat(quantityInput.value);
        const price = parseFloat(priceInput.value);
        
        // Validation
        if (!productId) {
            alert('Seleccione un producto');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            alert('Ingrese una cantidad válida');
            quantityInput.focus();
            return;
        }
        
        if (!price || price <= 0) {
            alert('Ingrese un precio válido');
            priceInput.focus();
            return;
        }
        
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // Check if product already exists in sale
        const existingItemIndex = this.currentSaleItems.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
            // Update existing item
            this.currentSaleItems[existingItemIndex].quantity += quantity;
            this.currentSaleItems[existingItemIndex].unitPrice = price;
            this.currentSaleItems[existingItemIndex].subtotal = this.currentSaleItems[existingItemIndex].quantity * price;
        } else {
            // Add new item
            this.currentSaleItems.push({
                productId: productId,
                productName: product.name,
                unit: product.unit,
                quantity: quantity,
                unitPrice: price,
                subtotal: quantity * price
            });
        }
        
        this.renderProductsTable();
        this.updateSaleSummary();
        this.clearProductInputs();
    }
    
    removeProductFromSale(index) {
        this.currentSaleItems.splice(index, 1);
        this.renderProductsTable();
        this.updateSaleSummary();
    }
    
    renderProductsTable() {
        const container = document.getElementById('productsTableContainer');
        if (!container) return;
        
        if (this.currentSaleItems.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No hay productos agregados</p>';
            return;
        }
        
        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.currentSaleItems.map((item, index) => `
                            <tr>
                                <td><strong>${item.productName}</strong></td>
                                <td>${item.quantity} ${item.unit}</td>
                                <td>$${item.unitPrice.toFixed(2)}</td>
                                <td>$${item.subtotal.toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-sm btn-danger" onclick="window.salesModule.removeProductFromSale(${index})" title="Eliminar">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = tableHTML;
    }
    
    updateSaleSummary() {
        const subtotal = this.currentSaleItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * 0.21; // 21% IVA
        const total = subtotal + tax;
        
        document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    }
    
    clearProductInputs() {
        document.getElementById('productSelect').value = '';
        document.getElementById('productQuantity').value = '';
        document.getElementById('productPrice').value = '';
    }
    
    setDefaultDate() {
        const today = new Date();
        const dateInput = document.getElementById('saleDate');
        if (dateInput) {
            dateInput.value = today.toISOString().split('T')[0];
        }
    }
    
    handleSaleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const saleData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            saleData[key] = value;
        }
        
        // Validate form
        if (!this.validateSaleForm(saleData)) {
            return;
        }
        
        // Validate products
        if (this.currentSaleItems.length === 0) {
            alert('Debe agregar al menos un producto a la venta');
            return;
        }
        
        // Calculate totals
        const subtotal = this.currentSaleItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * 0.21;
        const total = subtotal + tax;
        
        // Create sale object
        const sale = {
            id: this.generateSaleId(),
            ...saleData,
            items: [...this.currentSaleItems],
            subtotal: subtotal,
            tax: tax,
            total: total,
            createdAt: new Date().toISOString(),
            createdBy: window.Auth ? window.Auth.getCurrentUser()?.username : 'unknown'
        };
        
        // Save sale
        this.sales.unshift(sale);
        this.saveData();
        
        // Show receipt
        this.showReceipt(sale);
        
        // Clear form
        this.clearSale();
        
        // Update recent sales
        this.renderRecentSales();
        
        // Show success message
        if (window.Components && window.Components.Alert) {
            window.Components.Alert.show('Venta registrada exitosamente', 'success');
        }
    }
    
    validateSaleForm(saleData) {
        this.clearFormErrors();
        let isValid = true;
        
        // Required fields validation
        const requiredFields = ['saleDate', 'customerName', 'paymentMethod'];
        
        requiredFields.forEach(field => {
            if (!saleData[field] || saleData[field].toString().trim() === '') {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            }
        });
        
        // Date validation (not in the future)
        if (saleData.saleDate) {
            const saleDate = new Date(saleData.saleDate);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            
            if (saleDate > today) {
                this.showFieldError('saleDate', 'La fecha no puede ser futura');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    showReceipt(sale) {
        const receiptContent = document.getElementById('receiptContent');
        if (!receiptContent) return;
        
        const receiptHTML = `
            <div class="receipt-header">
                <h3>Sistema Agraria</h3>
                <p>Comprobante de Venta</p>
                <p><strong>N° ${sale.id.toString().padStart(6, '0')}</strong></p>
                <hr>
            </div>
            
            <div class="receipt-info">
                <div class="receipt-row">
                    <span>Fecha:</span>
                    <span>${this.formatDate(sale.saleDate)}</span>
                </div>
                <div class="receipt-row">
                    <span>Cliente:</span>
                    <span>${sale.customerName}</span>
                </div>
                ${sale.customerPhone ? `
                    <div class="receipt-row">
                        <span>Teléfono:</span>
                        <span>${sale.customerPhone}</span>
                    </div>
                ` : ''}
                <div class="receipt-row">
                    <span>Método de Pago:</span>
                    <span>${this.getPaymentMethodLabel(sale.paymentMethod)}</span>
                </div>
                <hr>
            </div>
            
            <div class="receipt-items">
                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>Precio</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.quantity} ${item.unit}</td>
                                <td>$${item.unitPrice.toFixed(2)}</td>
                                <td>$${item.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <hr>
            </div>
            
            <div class="receipt-totals">
                <div class="receipt-row">
                    <span>Subtotal:</span>
                    <span>$${sale.subtotal.toFixed(2)}</span>
                </div>
                <div class="receipt-row">
                    <span>IVA (21%):</span>
                    <span>$${sale.tax.toFixed(2)}</span>
                </div>
                <div class="receipt-row total-row">
                    <span><strong>Total:</strong></span>
                    <span><strong>$${sale.total.toFixed(2)}</strong></span>
                </div>
            </div>
            
            <div class="receipt-footer">
                <hr>
                <p>¡Gracias por su compra!</p>
                <p class="text-sm">Atendido por: ${sale.createdBy}</p>
            </div>
        `;
        
        receiptContent.innerHTML = receiptHTML;
        this.currentSale = sale;
        this.showReceiptModal();
    }
    
    showReceiptModal() {
        const modal = document.getElementById('receiptModal');
        if (!modal) return;
        
        requestAnimationFrame(() => {
            modal.style.display = 'flex';
            modal.classList.add('show');
            modal.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
        });
    }
    
    closeReceiptModal() {
        const modal = document.getElementById('receiptModal');
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        this.currentSale = null;
    }
    
    printReceipt() {
        const receiptContent = document.getElementById('receiptContent');
        if (!receiptContent) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprobante de Venta</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .receipt-header h3 { margin: 0; font-size: 18px; }
                    .receipt-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .receipt-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    .receipt-table th, .receipt-table td { border: 1px solid #ddd; padding: 5px; text-align: left; }
                    .receipt-table th { background-color: #f5f5f5; }
                    .total-row { font-weight: bold; font-size: 14px; }
                    .receipt-footer { text-align: center; margin-top: 20px; }
                    hr { border: none; border-top: 1px solid #ddd; margin: 10px 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${receiptContent.innerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
    
    clearSale() {
        const form = document.getElementById('saleForm');
        if (form) {
            form.reset();
        }
        
        this.currentSaleItems = [];
        this.clearFormErrors();
        this.setDefaultDate();
        this.renderProductsTable();
        this.updateSaleSummary();
        this.clearProductInputs();
    }
    
    renderRecentSales() {
        const container = document.getElementById('recentSalesContainer');
        if (!container) return;
        
        if (this.sales.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No hay ventas registradas</p>';
            return;
        }
        
        // Show last 10 sales
        const recentSales = this.sales.slice(0, 10);
        
        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>N° Venta</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Método Pago</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentSales.map(sale => `
                            <tr>
                                <td><strong>${sale.id.toString().padStart(6, '0')}</strong></td>
                                <td>${this.formatDate(sale.saleDate)}</td>
                                <td>${sale.customerName}</td>
                                <td>${this.getPaymentMethodLabel(sale.paymentMethod)}</td>
                                <td><strong>$${sale.total.toFixed(2)}</strong></td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="window.salesModule.viewSaleReceipt(${sale.id})" title="Ver Comprobante">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = tableHTML;
    }
    
    viewSaleReceipt(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (sale) {
            this.showReceipt(sale);
        }
    }
    
    // Utility methods
    generateSaleId() {
        return Math.max(...this.sales.map(s => s.id), 0) + 1;
    }
    
    getPaymentMethodLabel(method) {
        const labels = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta',
            'transferencia': 'Transferencia',
            'cheque': 'Cheque'
        };
        return labels[method] || method;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        const fieldElement = document.querySelector(`[name="${fieldName}"]`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (fieldElement) {
            fieldElement.classList.add('error');
        }
    }
    
    clearFormErrors() {
        const form = document.getElementById('saleForm');
        if (!form) return;
        
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        const fieldElements = form.querySelectorAll('.form-control');
        fieldElements.forEach(el => {
            el.classList.remove('error');
        });
    }
    
    // Get sales data for use in other modules
    getSales() {
        return this.sales;
    }
    
    getProducts() {
        return this.products;
    }
    
    // Initialize current user info in header
    initializeUserInfo() {
        const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
        if (!currentUser) return;
        
        const userInitials = document.getElementById('userInitials');
        const currentUserName = document.getElementById('currentUserName');
        const currentUserRole = document.getElementById('currentUserRole');
        
        if (userInitials) {
            const initials = (currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0)).toUpperCase();
            userInitials.textContent = initials;
        }
        
        if (currentUserName) {
            currentUserName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        }
        
        if (currentUserRole) {
            currentUserRole.textContent = currentUser.role === 'administrador' ? 'Administrador' : 'Usuario Estándar';
        }
        
        // Show/hide admin navigation
        const adminNav = document.getElementById('adminOnlyNav');
        if (adminNav && currentUser.role === 'administrador') {
            adminNav.style.display = 'block';
        }
    }
}

// Initialize module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (window.Auth) {
        if (!window.Auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Initialize sales module
    window.salesModule = new SalesModule();
    
    // Initialize dropdowns
    if (window.Components && window.Components.Dropdown) {
        window.Components.Dropdown.initAll();
    }
});
