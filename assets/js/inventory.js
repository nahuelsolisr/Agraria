/**
 * Inventory Module - Sistema Agraria
 * Handles inventory management, stock movements, and product tracking
 */

class InventoryModule {
    constructor() {
        this.products = [];
        this.movements = [];
        this.nextProductId = 1;
        this.nextMovementId = 1;
        
        this.init();
    }

    init() {
        this.initializeUserInfo();
        this.loadInventoryData();
        this.bindEvents();
        this.renderInventory();
        this.renderMovements();
        this.updateProductSelect();
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

    loadInventoryData() {
        // Load products from localStorage or use sample data
        const storedProducts = localStorage.getItem('inventory_products');
        if (storedProducts) {
            this.products = JSON.parse(storedProducts);
            this.nextProductId = Math.max(...this.products.map(p => p.id), 0) + 1;
        } else {
            // Sample inventory data
            this.products = [
                {
                    id: 1,
                    name: 'Semillas de Tomate',
                    category: 'semillas',
                    currentStock: 25,
                    minStock: 10,
                    unitPrice: 15.50,
                    unit: 'paquete'
                },
                {
                    id: 2,
                    name: 'Fertilizante Orgánico',
                    category: 'fertilizantes',
                    currentStock: 8,
                    minStock: 5,
                    unitPrice: 25.00,
                    unit: 'kg'
                },
                {
                    id: 3,
                    name: 'Herramientas de Jardín',
                    category: 'herramientas',
                    currentStock: 15,
                    minStock: 3,
                    unitPrice: 45.00,
                    unit: 'unidad'
                },
                {
                    id: 4,
                    name: 'Macetas de Barro',
                    category: 'macetas',
                    currentStock: 2,
                    minStock: 5,
                    unitPrice: 8.50,
                    unit: 'unidad'
                },
                {
                    id: 5,
                    name: 'Sustrato para Plantas',
                    category: 'sustratos',
                    currentStock: 12,
                    minStock: 8,
                    unitPrice: 12.00,
                    unit: 'kg'
                }
            ];
            this.nextProductId = 6;
            this.saveProducts();
        }

        // Load movements from localStorage or use sample data
        const storedMovements = localStorage.getItem('inventory_movements');
        if (storedMovements) {
            this.movements = JSON.parse(storedMovements);
            this.nextMovementId = Math.max(...this.movements.map(m => m.id), 0) + 1;
        } else {
            // Sample movement data
            this.movements = [
                {
                    id: 1,
                    productId: 1,
                    productName: 'Semillas de Tomate',
                    type: 'entrada',
                    quantity: 10,
                    reason: 'Compra inicial',
                    date: '2024-01-15',
                    user: 'Admin Usuario'
                },
                {
                    id: 2,
                    productId: 2,
                    productName: 'Fertilizante Orgánico',
                    type: 'salida',
                    quantity: 2,
                    reason: 'Venta',
                    date: '2024-01-14',
                    user: 'Admin Usuario'
                }
            ];
            this.nextMovementId = 3;
            this.saveMovements();
        }
    }

    bindEvents() {
        // Stock movement form
        const stockMovementForm = document.getElementById('stockMovementForm');
        if (stockMovementForm) {
            stockMovementForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStockMovement();
            });
        }

        // Add product button and form
        const addProductBtn = document.getElementById('addProductBtn');
        const addProductForm = document.getElementById('addProductForm');

        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showModal('addProductModal');
            });
        }

        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProduct();
            });
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

    handleStockMovement() {
        const movementType = document.getElementById('movementType').value;
        const productId = parseInt(document.getElementById('productSelect').value);
        const quantity = parseInt(document.getElementById('quantity').value);
        const reason = document.getElementById('reason').value;

        if (!movementType || !productId || !quantity || !reason) {
            alert('Por favor complete todos los campos');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            alert('Producto no encontrado');
            return;
        }

        // Validate stock for outgoing movements
        if (movementType === 'salida' && quantity > product.currentStock) {
            alert('No hay suficiente stock disponible');
            return;
        }

        // Update product stock
        switch (movementType) {
            case 'entrada':
                product.currentStock += quantity;
                break;
            case 'salida':
                product.currentStock -= quantity;
                break;
            case 'ajuste':
                product.currentStock = quantity;
                break;
        }

        // Create movement record
        const movement = {
            id: this.nextMovementId++,
            productId: product.id,
            productName: product.name,
            type: movementType,
            quantity: quantity,
            reason: reason,
            date: new Date().toISOString().split('T')[0],
            user: this.getCurrentUserName()
        };

        this.movements.unshift(movement);

        // Save data
        this.saveProducts();
        this.saveMovements();

        // Update UI
        this.renderInventory();
        this.renderMovements();

        // Reset form
        document.getElementById('stockMovementForm').reset();

        // Show success message
        this.showAlert('Movimiento registrado exitosamente', 'success');
    }

    handleAddProduct() {
        const name = document.getElementById('productName').value;
        const category = document.getElementById('productCategory').value;
        const initialStock = parseInt(document.getElementById('initialStock').value);
        const minStock = parseInt(document.getElementById('minStock').value);
        const unitPrice = parseFloat(document.getElementById('unitPrice').value);
        const unit = document.getElementById('unit').value;

        if (!name || !category || !unit || unitPrice < 0) {
            alert('Por favor complete todos los campos correctamente');
            return;
        }

        // Check if product already exists
        if (this.products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Ya existe un producto con ese nombre');
            return;
        }

        const product = {
            id: this.nextProductId++,
            name: name,
            category: category,
            currentStock: initialStock,
            minStock: minStock,
            unitPrice: unitPrice,
            unit: unit
        };

        this.products.push(product);

        // Create initial stock movement if stock > 0
        if (initialStock > 0) {
            const movement = {
                id: this.nextMovementId++,
                productId: product.id,
                productName: product.name,
                type: 'entrada',
                quantity: initialStock,
                reason: 'Stock inicial',
                date: new Date().toISOString().split('T')[0],
                user: this.getCurrentUserName()
            };
            this.movements.unshift(movement);
        }

        // Save data
        this.saveProducts();
        this.saveMovements();

        // Update UI
        this.renderInventory();
        this.renderMovements();
        this.updateProductSelect();

        // Close modal and reset form
        this.closeModal('addProductModal');
        document.getElementById('addProductForm').reset();

        this.showAlert('Producto agregado exitosamente', 'success');
    }

    renderInventory() {
        const tableBody = document.getElementById('inventoryTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = this.products.map(product => this.renderProductRow(product)).join('');

        // Bind edit/delete events
        const editButtons = tableBody.querySelectorAll('.edit-product-btn');
        const deleteButtons = tableBody.querySelectorAll('.delete-product-btn');

        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.productId);
                this.editProduct(productId);
            });
        });

        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.productId);
                this.deleteProduct(productId);
            });
        });
    }

    renderProductRow(product) {
        const stockStatus = this.getStockStatus(product);
        const categoryName = this.getCategoryName(product.category);

        return `
            <tr>
                <td>${this.escapeHtml(product.name)}</td>
                <td>${categoryName}</td>
                <td>${product.currentStock} ${product.unit}</td>
                <td>${product.minStock} ${product.unit}</td>
                <td>$${product.unitPrice.toFixed(2)}</td>
                <td>
                    <span class="status-indicator">
                        <span class="status-dot ${stockStatus.class}"></span>
                        ${stockStatus.text}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="btn btn-sm btn-outline edit-product-btn" 
                                data-product-id="${product.id}" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger delete-product-btn" 
                                data-product-id="${product.id}" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderMovements() {
        const tableBody = document.getElementById('movementsTableBody');
        if (!tableBody) return;

        const recentMovements = this.movements.slice(0, 20); // Show last 20 movements
        tableBody.innerHTML = recentMovements.map(movement => this.renderMovementRow(movement)).join('');
    }

    renderMovementRow(movement) {
        const typeClass = {
            'entrada': 'success',
            'salida': 'danger',
            'ajuste': 'warning'
        };

        const typeText = {
            'entrada': 'Entrada',
            'salida': 'Salida',
            'ajuste': 'Ajuste'
        };

        return `
            <tr>
                <td>${this.formatDate(movement.date)}</td>
                <td>${this.escapeHtml(movement.productName)}</td>
                <td>
                    <span class="badge bg-${typeClass[movement.type]}">
                        ${typeText[movement.type]}
                    </span>
                </td>
                <td>${movement.quantity}</td>
                <td>${this.escapeHtml(movement.reason)}</td>
                <td>${this.escapeHtml(movement.user)}</td>
            </tr>
        `;
    }

    updateProductSelect() {
        const productSelect = document.getElementById('productSelect');
        if (!productSelect) return;

        // Clear existing options except the first one
        while (productSelect.children.length > 1) {
            productSelect.removeChild(productSelect.lastChild);
        }

        // Add product options
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (Stock: ${product.currentStock})`;
            productSelect.appendChild(option);
        });
    }

    getStockStatus(product) {
        if (product.currentStock === 0) {
            return { class: 'danger', text: 'Sin Stock' };
        } else if (product.currentStock <= product.minStock) {
            return { class: 'warning', text: 'Stock Bajo' };
        } else {
            return { class: 'success', text: 'Stock OK' };
        }
    }

    getCategoryName(category) {
        const categories = {
            'semillas': 'Semillas',
            'fertilizantes': 'Fertilizantes',
            'herramientas': 'Herramientas',
            'macetas': 'Macetas y Contenedores',
            'sustratos': 'Sustratos',
            'otros': 'Otros'
        };
        return categories[category] || category;
    }

    editProduct(productId) {
        // This would open an edit modal - simplified for now
        const product = this.products.find(p => p.id === productId);
        if (product) {
            const newPrice = prompt(`Nuevo precio para ${product.name}:`, product.unitPrice);
            if (newPrice !== null && !isNaN(newPrice) && newPrice > 0) {
                product.unitPrice = parseFloat(newPrice);
                this.saveProducts();
                this.renderInventory();
                this.showAlert('Precio actualizado exitosamente', 'success');
            }
        }
    }

    deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.renderInventory();
            this.updateProductSelect();
            this.showAlert('Producto eliminado exitosamente', 'success');
        }
    }

    saveProducts() {
        localStorage.setItem('inventory_products', JSON.stringify(this.products));
    }

    saveMovements() {
        localStorage.setItem('inventory_movements', JSON.stringify(this.movements));
    }

    getCurrentUserName() {
        if (window.Auth && window.Auth.getCurrentUser) {
            const user = window.Auth.getCurrentUser();
            return user ? (user.nombre || user.username || 'Usuario') : 'Usuario';
        }
        return 'Usuario';
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

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            // Use component system if available
            if (window.Components && window.Components.closeModal) {
                window.Components.closeModal(modal);
            }
        }
    }

    showAlert(message, type = 'info') {
        // Simple alert for now - could be enhanced with a toast system
        alert(message);
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
    new InventoryModule();
});
