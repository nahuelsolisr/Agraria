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
        this.populateTeachersSelect();
        this.renderEnvironmentsTable();
        this.applyRoleRestrictions();
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
            // Migrate existing records to ensure responsibleId/responsibleName are set
            this.migrateEnvironmentsUsers();
            this.saveEnvironments();
        } else {
            // Initialize with default environments
            this.environments = [
                {
                    id: 1,
                    environmentName: 'Huerta Principal',
                    environmentType: 'vegetal',
                    responsibleId: 4,
                    responsibleName: 'María González',
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
                    responsibleId: 4,
                    responsibleName: 'María González',
                    responsibleTeacher: 'Prof. María González',
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
                    responsibleId: 3,
                    responsibleName: 'Ana Martínez',
                    responsibleTeacher: 'Prof. Ana Martínez',
                    year: '4',
                    division: 'A',
                    group: 'Grupo 3',
                    observations: 'Cría y manejo de aves de corral',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                
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
        
        // Filter by role
        let environmentsToRender = [...this.environments];
        const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
        if (currentUser) {
            // Professor: only environments of their type and assigned to them
            if (window.Auth.isProfesor()) {
                const tipo = window.Auth.getProfesorTipo();
                environmentsToRender = environmentsToRender.filter(e => {
                    const normalizeName = (s) => (s || '')
                        .toLowerCase()
                        .replace(/^\s*prof\.?\s*/i, '')
                        .trim();
                    const assignedToUser = (e.responsibleId && e.responsibleId === currentUser.id) ||
                        (e.responsibleTeacher && normalizeName(`${currentUser.firstName} ${currentUser.lastName}`) === normalizeName(e.responsibleTeacher)) ||
                        (e.responsibleName && normalizeName(`${currentUser.firstName} ${currentUser.lastName}`) === normalizeName(e.responsibleName));
                    return e.environmentType === tipo && assignedToUser;
                });
            }
        }
        
        const tableData = environmentsToRender.map(env => ({
            id: env.id,
            environmentName: env.environmentName,
            environmentType: this.getEnvironmentTypeLabel(env.environmentType),
            responsibleTeacher: env.responsibleName || env.responsibleTeacher,
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
                                        <button class="btn btn-sm btn-outline action-edit" onclick="window.environmentsModule.editEnvironment(${env.id})" title="Editar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button class="btn btn-sm btn-danger action-delete" onclick="window.environmentsModule.deleteEnvironment(${env.id})" title="Eliminar">
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
        
        // Apply role-based disable on actions
        const current = window.Auth ? window.Auth.getCurrentUser() : null;
        if (current && (window.Auth.isJefeArea() || window.Auth.isProfesor())) {
            const editButtons = container.querySelectorAll('.action-edit');
            const deleteButtons = container.querySelectorAll('.action-delete');
            editButtons.forEach(btn => { btn.disabled = true; btn.classList.add('btn-disabled'); });
            deleteButtons.forEach(btn => { btn.disabled = true; btn.classList.add('btn-disabled'); });
        }
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
        
        // Block create/edit for jefe_area and profesor
        if (window.Auth && (window.Auth.isJefeArea() || window.Auth.isProfesor())) {
            return; // silently ignore
        }
        
        this.isEditing = !!environment;
        this.currentEnvironment = environment;
        
        modalTitle.textContent = environment ? 'Editar Entorno Formativo' : 'Agregar Entorno Formativo';
        
        // Reset form
        form.reset();
        this.clearFormErrors();
        
        // Ensure teachers select is populated and filtered to current type
        this.populateTeachersSelect();
        const typeSelect = form.querySelector('#environmentType');
        const teacherSelect = form.querySelector('#responsibleTeacher');
        const filterTeachersByType = () => {
            if (!typeSelect || !teacherSelect) return;
            const tipo = typeSelect.value; // 'animal' | 'vegetal' | 'otro'
            for (const opt of teacherSelect.options) {
                if (!opt.value) continue; // skip placeholder
                const role = opt.dataset.role;
                const matches = (tipo === 'animal' && role === 'profesor_animal') || (tipo === 'vegetal' && role === 'profesor_vegetal');
                opt.style.display = matches ? '' : 'none';
            }
        };
        if (typeSelect) {
            typeSelect.removeEventListener('change', this._envTypeChangeHandler);
            this._envTypeChangeHandler = filterTeachersByType;
            typeSelect.addEventListener('change', this._envTypeChangeHandler);
        }
        
        if (environment) {
            // Populate form with environment data
            Object.keys(environment).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = environment[key];
                }
            });
            // If we have a responsibleId, set select accordingly
            const respSelect = form.querySelector('#responsibleTeacher');
            if (respSelect && environment.responsibleId) {
                respSelect.value = environment.responsibleId;
            }
            // After setting values, filter teacher options by type
            filterTeachersByType();
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
        
        // Map responsible teacher select to id and name
        const respSelect = form.querySelector('#responsibleTeacher');
        if (respSelect) {
            const selectedOption = respSelect.selectedOptions[0];
            environmentData.responsibleId = selectedOption ? parseInt(selectedOption.value) : null;
            environmentData.responsibleName = selectedOption ? selectedOption.textContent : '';
            // Keep legacy field for compatibility
            environmentData.responsibleTeacher = environmentData.responsibleName;
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
            currentUserRole.textContent =
                currentUser.role === 'administrador' ? 'Administrador' :
                currentUser.role === 'jefe_area' ? 'Jefe de Área' :
                currentUser.role === 'profesor_animal' ? 'Profesor - Animal' :
                currentUser.role === 'profesor_vegetal' ? 'Profesor - Vegetal' : currentUser.role;
        }
    }
    
    populateTeachersSelect() {
        const select = document.getElementById('responsibleTeacher');
        if (!select) return;
        // Clear options except first
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        try {
            const usersRaw = localStorage.getItem('sistemaAgraria_users');
            const users = usersRaw ? JSON.parse(usersRaw) : [];
            const teachers = users.filter(u => u.role === 'profesor_animal' || u.role === 'profesor_vegetal');
            teachers.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = `${t.firstName} ${t.lastName}`;
                opt.dataset.role = t.role;
                select.appendChild(opt);
            });
        } catch (e) { /* ignore */ }
    }
    
    applyRoleRestrictions() {
        const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
        if (!currentUser) return;
        const addBtn = document.getElementById('addEnvironmentBtn');
        // Jefe de Área: no access to entornos
        if (window.Auth.isJefeArea()) {
            window.location.href = 'dashboard.html';
            return;
        }
        // Profesor: can view limited, no create/edit/delete
        if (window.Auth.isProfesor()) {
            if (addBtn) { addBtn.disabled = true; addBtn.style.display = 'none'; }
        }
     }
    
    migrateEnvironmentsUsers() {
        try {
            const usersRaw = localStorage.getItem('sistemaAgraria_users');
            const users = usersRaw ? JSON.parse(usersRaw) : [];
            const normalizeName = (s) => (s || '')
                .toLowerCase()
                .replace(/^\s*prof\.?\s*/i, '')
                .trim();
            const findUserByName = (display) => {
                const normalized = normalizeName(display);
                return users.find(u => normalizeName(`${u.firstName} ${u.lastName}`) === normalized);
            };
            const findProfessorByType = (tipo) => {
                const role = tipo === 'animal' ? 'profesor_animal' : (tipo === 'vegetal' ? 'profesor_vegetal' : null);
                if (!role) return null;
                return users.find(u => u.role === role) || null;
            };
            let changed = false;
            this.environments.forEach(env => {
                if (!env.responsibleId) {
                    const candidate = findUserByName(env.responsibleName || env.responsibleTeacher);
                    if (candidate) {
                        env.responsibleId = candidate.id;
                        env.responsibleName = `${candidate.firstName} ${candidate.lastName}`;
                        // keep legacy field for UI
                        if (!env.responsibleTeacher) env.responsibleTeacher = env.responsibleName;
                        changed = true;
                    } else {
                        // Fallback: if this looks like a demo environment and no matching name is found,
                        // assign it to the first professor of the matching type (animal/vegetal)
                        const profByType = findProfessorByType(env.environmentType);
                        if (profByType) {
                            env.responsibleId = profByType.id;
                            env.responsibleName = `${profByType.firstName} ${profByType.lastName}`;
                            if (!env.responsibleTeacher) env.responsibleTeacher = env.responsibleName;
                            changed = true;
                        }
                    }
                }
            });
            if (changed) this.saveEnvironments();
        } catch (e) {
            // ignore migration errors
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
        // Professors can access but with restrictions; others ok
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
