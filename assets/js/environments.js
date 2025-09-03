/**
 * Environments Module - Sistema Agraria
 * Handles training environments functionality
 */

class EnvironmentsModule {
    constructor() {
        this.environments = [];
        this.currentEnvironment = null;
        this.isEditing = false;
        
        this.init();
    }
    
    init() {
        this.loadEnvironments();
        this.bindEvents();
        this.renderEnvironmentsTable();
    }
    
    bindEvents() {
        // Add environment button
        const addEnvironmentBtn = document.getElementById('addEnvironmentBtn');
        if (addEnvironmentBtn) {
            addEnvironmentBtn.addEventListener('click', () => this.showEnvironmentModal());
        }
        
        // Environment form submission
        const environmentForm = document.getElementById('environmentForm');
        if (environmentForm) {
            environmentForm.addEventListener('submit', (e) => this.handleEnvironmentSubmit(e));
        }
        
        // Modal close events
        const modal = document.getElementById('environmentModal');
        if (modal) {
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.closeEnvironmentModal());
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeEnvironmentModal();
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
    
    loadEnvironments() {
        const savedEnvironments = localStorage.getItem('sistemaAgraria_environments');
        if (savedEnvironments) {
            this.environments = JSON.parse(savedEnvironments);
        } else {
            // Initialize with default environments
            this.environments = [
                {
                    id: 1,
                    environmentName: 'Huerta Principal',
                    environmentType: 'vegetal',
                    responsibleTeacher: 'Prof. María González',
                    year: '3',
                    division: 'A',
                    group: 'Grupo 1',
                    observations: 'Huerta destinada al cultivo de hortalizas de estación',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 2,
                    environmentName: 'Vivero Escolar',
                    environmentType: 'vegetal',
                    responsibleTeacher: 'Prof. Carlos Rodríguez',
                    year: '2',
                    division: 'B',
                    group: 'Grupo 2',
                    observations: 'Espacio para la producción de plantines y plantas ornamentales',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 3,
                    environmentName: 'Granja Avícola',
                    environmentType: 'animal',
                    responsibleTeacher: 'Prof. Ana Martínez',
                    year: '4',
                    division: 'A',
                    group: 'Grupo 3',
                    observations: 'Cría y manejo de aves de corral',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveEnvironments();
        }
    }
    
    saveEnvironments() {
        localStorage.setItem('sistemaAgraria_environments', JSON.stringify(this.environments));
    }
    
    renderEnvironmentsTable() {
        const container = document.getElementById('environmentsTableContainer');
        if (!container) return;
        
        const tableData = this.environments.map(env => ({
            id: env.id,
            environmentName: env.environmentName,
            environmentType: this.getEnvironmentTypeLabel(env.environmentType),
            responsibleTeacher: env.responsibleTeacher,
            year: env.year + '°',
            division: env.division,
            group: env.group,
            observations: env.observations ? (env.observations.length > 50 ? env.observations.substring(0, 50) + '...' : env.observations) : '-'
        }));
        
        // Create table HTML directly
        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Profesor</th>
                            <th>Año</th>
                            <th>División</th>
                            <th>Grupo</th>
                            <th>Observaciones</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData.map(env => `
                            <tr>
                                <td><strong>${env.environmentName}</strong></td>
                                <td>
                                    <span class="badge ${this.getEnvironmentTypeBadge(env.environmentType)}">
                                        ${env.environmentType}
                                    </span>
                                </td>
                                <td>${env.responsibleTeacher}</td>
                                <td>${env.year}</td>
                                <td>${env.division}</td>
                                <td>${env.group}</td>
                                <td>${env.observations}</td>
                                <td>
                                    <div class="flex gap-2">
                                        <button class="btn btn-sm btn-primary" onclick="window.environmentsModule.editEnvironment(${env.id})" title="Editar">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="window.environmentsModule.deleteEnvironment(${env.id})" title="Eliminar">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
    }
    
    getEnvironmentTypeLabel(type) {
        const labels = {
            'animal': 'Animal',
            'vegetal': 'Vegetal',
            'otro': 'Otro'
        };
        return labels[type] || type;
    }
    
    getEnvironmentTypeBadge(type) {
        const badges = {
            'Animal': 'badge-warning',
            'Vegetal': 'badge-success',
            'Otro': 'badge-info'
        };
        return badges[type] || 'badge-secondary';
    }
    
    showEnvironmentModal(environment = null) {
        const modal = document.getElementById('environmentModal');
        const modalTitle = document.getElementById('environmentModalTitle');
        const form = document.getElementById('environmentForm');
        
        if (!modal || !modalTitle || !form) {
            console.error('Modal elements not found!');
            return;
        }
        
        this.isEditing = !!environment;
        this.currentEnvironment = environment;
        
        modalTitle.textContent = environment ? 'Editar Entorno Formativo' : 'Agregar Entorno Formativo';
        
        // Reset form
        form.reset();
        this.clearFormErrors();
        
        if (environment) {
            // Populate form with environment data
            Object.keys(environment).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = environment[key];
                }
            });
        }
        
        // Show modal with proper timing
        requestAnimationFrame(() => {
            modal.style.display = 'flex';
            modal.classList.add('show');
            modal.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = form.querySelector('input:not([type="hidden"])');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        });
    }
    
    closeEnvironmentModal() {
        const modal = document.getElementById('environmentModal');
        if (!modal) return;
        
        // Hide modal
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        this.currentEnvironment = null;
        this.isEditing = false;
    }
    
    handleEnvironmentSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const environmentData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            environmentData[key] = value;
        }
        
        // Validate form
        if (!this.validateEnvironmentForm(environmentData)) {
            return;
        }
        
        if (this.isEditing && this.currentEnvironment) {
            // Update existing environment
            environmentData.id = this.currentEnvironment.id;
            environmentData.createdAt = this.currentEnvironment.createdAt;
            environmentData.updatedAt = new Date().toISOString();
            
            const index = this.environments.findIndex(e => e.id === this.currentEnvironment.id);
            if (index !== -1) {
                this.environments[index] = environmentData;
            }
        } else {
            // Create new environment
            environmentData.id = this.generateEnvironmentId();
            environmentData.createdAt = new Date().toISOString();
            environmentData.updatedAt = new Date().toISOString();
            
            this.environments.push(environmentData);
        }
        
        this.saveEnvironments();
        this.renderEnvironmentsTable();
        this.closeEnvironmentModal();
        
        // Show success message
        if (window.Components && window.Components.Alert) {
            window.Components.Alert.show(
                this.isEditing ? 'Entorno actualizado exitosamente' : 'Entorno creado exitosamente',
                'success'
            );
        }
    }
    
    validateEnvironmentForm(environmentData) {
        this.clearFormErrors();
        let isValid = true;
        
        // Required fields validation
        const requiredFields = ['environmentName', 'environmentType', 'responsibleTeacher', 'year', 'division', 'group'];
        
        requiredFields.forEach(field => {
            if (!environmentData[field] || environmentData[field].trim() === '') {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            }
        });
        
        // Environment name uniqueness validation
        if (environmentData.environmentName) {
            const existingEnvironment = this.environments.find(e => 
                e.environmentName.toLowerCase() === environmentData.environmentName.toLowerCase() && 
                (!this.currentEnvironment || e.id !== this.currentEnvironment.id)
            );
            if (existingEnvironment) {
                this.showFieldError('environmentName', 'Ya existe un entorno con este nombre');
                isValid = false;
            }
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
        const form = document.getElementById('environmentForm');
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
    
    generateEnvironmentId() {
        return Math.max(...this.environments.map(e => e.id), 0) + 1;
    }
    
    editEnvironment(environmentId) {
        const environment = this.environments.find(e => e.id === environmentId);
        if (environment) {
            this.showEnvironmentModal(environment);
        }
    }
    
    deleteEnvironment(environmentId) {
        const environment = this.environments.find(e => e.id === environmentId);
        if (!environment) return;
        
        if (confirm(`¿Estás seguro de que deseas eliminar el entorno "${environment.environmentName}"?`)) {
            this.environments = this.environments.filter(e => e.id !== environmentId);
            this.saveEnvironments();
            this.renderEnvironmentsTable();
            
            if (window.Components && window.Components.Alert) {
                window.Components.Alert.show('Entorno eliminado exitosamente', 'success');
            }
        }
    }
    
    // Get environments for use in other modules
    getEnvironments() {
        return this.environments;
    }
    
    getEnvironmentsByType(type) {
        return this.environments.filter(e => e.environmentType === type);
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
    }
}

// Initialize module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication with fallback
    if (window.Auth) {
        if (!window.Auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }
    } else {
        console.log('Auth system not found, proceeding without authentication check');
    }
    
    // Initialize environments module
    window.environmentsModule = new EnvironmentsModule();
    window.environmentsModule.initializeUserInfo();
    
    // Initialize dropdowns
    if (window.Components && window.Components.Dropdown) {
        window.Components.Dropdown.initAll();
    }
});
