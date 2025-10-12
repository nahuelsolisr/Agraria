/**
 * Users Module - Sistema Agraria
 * Handles user administration functionality
 */

class UsersModule {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.isEditing = false;
        
        this.init();
    }
    
    init() {
        this.loadUsers();
        this.bindEvents();
        this.renderUsersTable();
    }
    
    bindEvents() {
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showUserModal());
        }
        
        // User form submission
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleUserSubmit(e));
        }
        
        // Modal close events
        const modal = document.getElementById('userModal');
        if (modal) {
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.closeUserModal());
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeUserModal();
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
    
    loadUsers() {
        const savedUsers = localStorage.getItem('sistemaAgraria_users');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        } else {
            // Initialize with default users if none exist
            this.users = [
                {
                    id: 1,
                    lastName: 'Sistema',
                    firstName: 'Administrador',
                    document: '12345678',
                    email: 'admin@sistemaagraria.com',
                    address: 'Dirección Principal 123',
                    locality: 'Buenos Aires',
                    party: 'CABA',
                    postalCode: '1000',
                    phone: '+54 11 1234-5678',
                    altPhone: '',
                    username: 'admin',
                    password: 'admin123',
                    role: 'administrador',
                    active: true,
                    securityQuestion: '¿Cuál es tu color favorito?',
                    securityAnswer: 'azul',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 2,
                    lastName: 'Área',
                    firstName: 'Jefe',
                    document: '23456789',
                    email: 'jefe.area@sistemaagraria.com',
                    address: '',
                    locality: 'Buenos Aires',
                    party: 'Buenos Aires',
                    postalCode: '1900',
                    phone: '',
                    altPhone: '',
                    username: 'jefe',
                    password: 'jefe123',
                    role: 'jefe_area',
                    active: true,
                    securityQuestion: '¿Cuál es el nombre de tu primera mascota?',
                    securityAnswer: 'firulais',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 3,
                    lastName: 'Martínez',
                    firstName: 'Ana',
                    document: '34567890',
                    email: 'prof.animal@sistemaagraria.com',
                    address: '',
                    locality: 'Buenos Aires',
                    party: 'Buenos Aires',
                    postalCode: '1900',
                    phone: '',
                    altPhone: '',
                    username: 'prof.animal',
                    password: 'prof123',
                    role: 'profesor_animal',
                    active: true,
                    securityQuestion: '¿Cuál es tu color favorito?',
                    securityAnswer: 'azul',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 4,
                    lastName: 'González',
                    firstName: 'María',
                    document: '45678901',
                    email: 'prof.vegetal@sistemaagraria.com',
                    address: '',
                    locality: 'Buenos Aires',
                    party: 'Buenos Aires',
                    postalCode: '1900',
                    phone: '',
                    altPhone: '',
                    username: 'prof.vegetal',
                    password: 'prof123',
                    role: 'profesor_vegetal',
                    active: true,
                    securityQuestion: '¿Cuál es tu comida favorita?',
                    securityAnswer: 'milanesa',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveUsers();
        }
    }
    
    saveUsers() {
        localStorage.setItem('sistemaAgraria_users', JSON.stringify(this.users));
    }
    
    renderUsersTable() {
        const container = document.getElementById('usersTableContainer');
        if (!container) return;
        
        const tableData = this.users.map(user => ({
            id: user.id,
            lastName: user.lastName,
            firstName: user.firstName,
            document: user.document,
            email: user.email,
            username: user.username,
            role: (user.role === 'administrador'
                ? 'Administrador'
                : user.role === 'jefe_area'
                    ? 'Jefe de Área'
                    : user.role === 'profesor_animal'
                        ? 'Profesor - Animal'
                        : user.role === 'profesor_vegetal'
                            ? 'Profesor - Vegetal'
                            : user.role),
            active: user.active,
            phone: user.phone || '-',
            createdAt: user.createdAt
        }));
        
        // Create table HTML directly if DataTable component is not available
        if (!window.Components || !window.Components.DataTable) {
            const tableHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Apellido</th>
                                <th>Nombre</th>
                                <th>Documento</th>
                                <th>Email</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Teléfono</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableData.map(user => `
                                <tr>
                                    <td>${user.lastName}</td>
                                    <td>${user.firstName}</td>
                                    <td>${user.document}</td>
                                    <td>${user.email}</td>
                                    <td>${user.username}</td>
                                    <td>${user.role}</td>
                                    <td>
                                        <span class="badge ${user.active ? 'badge-success' : 'badge-danger'}">
                                            ${user.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>${user.phone}</td>
                                    <td>
                                        <div class="flex gap-2">
                                            <button class="btn btn-sm btn-outline" onclick="window.usersModule.editUser (${user.id})" title="Editar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="window.usersModule.deleteUser (${user.id})" title="Eliminar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3,6 5,6 21,6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            container.innerHTML = tableHTML;
            return;
        }
        
        const columns = [
            { key: 'lastName', label: 'Apellido', sortable: true },
            { key: 'firstName', label: 'Nombre', sortable: true },
            { key: 'document', label: 'Documento', sortable: true },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'username', label: 'Usuario', sortable: true },
            { key: 'role', label: 'Rol', sortable: true },
            { 
                key: 'active', 
                label: 'Estado', 
                sortable: true,
                render: (value) => `<span class="badge ${value ? 'badge-success' : 'badge-danger'}">${value ? 'Activo' : 'Inactivo'}</span>`
            },
            { key: 'phone', label: 'Teléfono', sortable: false },
            {
                key: 'actions',
                label: 'Acciones',
                sortable: false,
                render: (value, row) => `
                    <div class="flex gap-2">
                        <button class="btn btn-sm btn-primary" onclick="window.usersModule.editUser(${row.id})" title="Editar">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.usersModule.deleteUser(${row.id})" title="Eliminar">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                `
            }
        ];
        
        const dataTable = new window.Components.DataTable(container, {
            data: tableData,
            columns: columns,
            searchable: true,
            pagination: true,
            pageSize: 10,
            emptyMessage: 'No hay usuarios registrados'
        });
    }
    
    showUserModal(user = null) {
        console.log('showUserModal called with user:', user);
        
        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');
        
        console.log('Modal elements found:', { modal, modalTitle, form });
        
        if (!modal || !modalTitle || !form) {
            console.error('Modal elements not found!', { modal, modalTitle, form });
            return;
        }
        
        this.isEditing = !!user;
        this.currentUser = user;
        
        modalTitle.textContent = user ? 'Editar Usuario' : 'Agregar Usuario';
        console.log('Modal title set to:', modalTitle.textContent);
        
        // Reset form
        form.reset();
        this.clearFormErrors();

        // Handle professor type field visibility
        const roleSelect = form.querySelector('#role');
        const professorTypeGroup = document.getElementById('professorTypeGroup');
        const professorTypeSelect = form.querySelector('#professorType');
        const toggleProfessorType = () => {
            if (!roleSelect) return;
            const isProfessor = roleSelect.value === 'profesor';
            if (professorTypeGroup) {
                professorTypeGroup.style.display = isProfessor ? 'block' : 'none';
            }
            if (professorTypeSelect) {
                professorTypeSelect.required = isProfessor;
                if (!isProfessor) {
                    professorTypeSelect.value = '';
                }
            }
        };
        if (roleSelect) {
            roleSelect.removeEventListener('change', this._roleChangeHandler);
            this._roleChangeHandler = toggleProfessorType;
            roleSelect.addEventListener('change', this._roleChangeHandler);
        }
        
        if (user) {
            // Populate form with user data
            Object.keys(user).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = user[key];
                    } else {
                        field.value = user[key];
                    }
                }
            });

            // Adjust role/professorType for editing if user is a professor
            if (roleSelect && professorTypeSelect) {
                if (user.role === 'profesor_animal' || user.role === 'profesor_vegetal') {
                    roleSelect.value = 'profesor';
                    professorTypeSelect.value = (user.role === 'profesor_animal') ? 'animal' : 'vegetal';
                }
            }

            // Don't require password for editing
            const passwordField = form.querySelector('[name="password"]');
            if (passwordField) {
                passwordField.required = false;
                passwordField.placeholder = 'Dejar vacío para mantener contraseña actual';
            }
        } else {
            // Require password for new users
            const passwordField = form.querySelector('[name="password"]');
            if (passwordField) {
                passwordField.required = true;
                passwordField.placeholder = '';
            }
        }

        // Ensure professor type visibility is correct after prefill
        toggleProfessorType();
        
        console.log('About to show modal...');
        
        // Show modal using multiple methods to ensure it works
        modal.style.display = 'flex';
        modal.classList.add('show');
        modal.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        console.log('Modal classes after showing:', modal.classList.toString());
        console.log('Modal display style:', modal.style.display);
        
        // Try using Components system if available
        if (window.Components && window.Components.openModal) {
            console.log('Using Components.openModal');
            window.Components.openModal('userModal');
        }
        
        console.log('Modal should now be visible');
    }
    
    closeUserModal() {
        const modal = document.getElementById('userModal');
        if (!modal) return;
        // Hide modal and restore scroll
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
        // Reset state
        this.currentUser = null;
        this.isEditing = false;
    }
    
    handleUserSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const userData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            userData[key] = value;
        }

        // Map role when 'Profesor' is selected
        const roleSelect = form.querySelector('#role');
        const professorTypeSelect = form.querySelector('#professorType');
        if (roleSelect && roleSelect.value === 'profesor') {
            const pType = professorTypeSelect ? professorTypeSelect.value : '';
            if (!pType) {
                // Show error and stop
                this.showFieldError('professorType', 'Seleccione el tipo de profesor');
                return;
            }
            userData.role = (pType === 'animal') ? 'profesor_animal' : 'profesor_vegetal';
        }
        
        // Validate form
        if (!this.validateUserForm(userData)) {
            return;
        }
        
        // Process user data
        userData.active = userData.active === 'true';
        
        if (this.isEditing && this.currentUser) {
            // Update existing user
            userData.id = this.currentUser.id;
            userData.createdAt = this.currentUser.createdAt;
            userData.updatedAt = new Date().toISOString();
            
            // Keep existing password if not provided
            if (!userData.password) {
                userData.password = this.currentUser.password;
            }
            
            const index = this.users.findIndex(u => u.id === this.currentUser.id);
            if (index !== -1) {
                this.users[index] = userData;
            }
        } else {
            // Create new user
            userData.id = this.generateUserId();
            userData.createdAt = new Date().toISOString();
            userData.updatedAt = new Date().toISOString();
            
            this.users.push(userData);
        }
        
        this.saveUsers();
        this.renderUsersTable();
        this.closeUserModal();
        
        // Show success message
        if (window.Components && window.Components.Alert) {
            window.Components.Alert.show(
                this.isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
                'success'
            );
        }
    }
    
    validateUserForm(userData) {
        this.clearFormErrors();
        let isValid = true;
        
        // Required fields validation
        const requiredFields = ['lastName', 'firstName', 'document', 'email', 'username', 'role', 'securityQuestion', 'securityAnswer'];
        
        if (!this.isEditing) {
            requiredFields.push('password');
        }
        
        requiredFields.forEach(field => {
            if (!userData[field] || userData[field].trim() === '') {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            }
        });
        
        // Email validation
        if (userData.email && !this.isValidEmail(userData.email)) {
            this.showFieldError('email', 'Ingrese un email válido');
            isValid = false;
        }
        
        // Username uniqueness validation
        if (userData.username) {
            const existingUser = this.users.find(u => 
                u.username === userData.username && 
                (!this.currentUser || u.id !== this.currentUser.id)
            );
            if (existingUser) {
                this.showFieldError('username', 'Este nombre de usuario ya existe');
                isValid = false;
            }
        }
        
        // Document uniqueness validation
        if (userData.document) {
            const existingUser = this.users.find(u => 
                u.document === userData.document && 
                (!this.currentUser || u.id !== this.currentUser.id)
            );
            if (existingUser) {
                this.showFieldError('document', 'Este documento ya está registrado');
                isValid = false;
            }
        }
        
        // Email uniqueness validation
        if (userData.email) {
            const existingUser = this.users.find(u => 
                u.email === userData.email && 
                (!this.currentUser || u.id !== this.currentUser.id)
            );
            if (existingUser) {
                this.showFieldError('email', 'Este email ya está registrado');
                isValid = false;
            }
        }
        
        // Password validation (only for new users or when password is provided)
        if (userData.password && userData.password.length < 6) {
            this.showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }
        
        return isValid;
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
        const form = document.getElementById('userForm');
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
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    generateUserId() {
        return Math.max(...this.users.map(u => u.id), 0) + 1;
    }
    
    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.showUserModal(user);
        }
    }
    
    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        // Prevent deleting the current logged-in user
        const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
        if (currentUser && currentUser.id === userId) {
            if (window.Components && window.Components.Alert) {
                window.Components.Alert.show('No puedes eliminar tu propio usuario', 'error');
            }
            return;
        }
        
        if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.firstName} ${user.lastName}"?`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveUsers();
            this.renderUsersTable();
            
            if (window.Components && window.Components.Alert) {
                window.Components.Alert.show('Usuario eliminado exitosamente', 'success');
            }
        }
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
            currentUserRole.textContent =
                currentUser.role === 'administrador' ? 'Administrador' :
                currentUser.role === 'jefe_area' ? 'Jefe de Área' :
                currentUser.role === 'profesor_animal' ? 'Profesor - Animal' :
                currentUser.role === 'profesor_vegetal' ? 'Profesor - Vegetal' : currentUser.role;
        }
    }
}

// Initialize module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking authentication...');
    console.log('window.Auth:', window.Auth);
    
    // Check authentication with fallback
    if (window.Auth) {
        console.log('Auth system found');
        if (!window.Auth.isAuthenticated()) {
            console.log('User not authenticated, redirecting...');
            window.location.href = 'index.html';
            return;
        }
        
        // Check if user has admin role
        const currentUser = window.Auth.getCurrentUser();
        console.log('Current user:', currentUser);
        
        if (!currentUser || currentUser.role !== 'administrador') {
            console.log('User is not admin, redirecting to dashboard...');
            window.location.href = 'dashboard.html';
            return;
        }
    } else {
        console.log('Auth system not found, proceeding without authentication check');
    }
    
    console.log('Initializing users module...');
    // Initialize users module
    window.usersModule = new UsersModule();
    window.usersModule.initializeUserInfo();
    
    // Initialize dropdowns
    if (window.Components && window.Components.Dropdown) {
        window.Components.Dropdown.initAll();
    }
    
    console.log('Users module initialized successfully');
});
