/**
 * Activities Module - Sistema Agraria
 * Handles activity registration functionality
 */

class ActivitiesModule {
    constructor() {
        this.activities = [];
        this.environments = [];
        this.currentActivity = null;
        this.isEditing = false;
        
        this.init();
    }
    
    init() {
        this.loadEnvironments();
        this.loadActivities();
        this.bindEvents();
        this.populateEnvironments();
        this.renderActivitiesTable();
        this.setDefaultDateTime();
    }
    
    bindEvents() {
        // Activity form submission
        const activityForm = document.getElementById('activityForm');
        if (activityForm) {
            activityForm.addEventListener('submit', (e) => this.handleActivitySubmit(e));
        }
        
        // Edit activity form submission
        const editActivityForm = document.getElementById('editActivityForm');
        if (editActivityForm) {
            editActivityForm.addEventListener('submit', (e) => this.handleEditActivitySubmit(e));
        }
        
        // Environment selection change
        const environmentSelect = document.getElementById('environmentId');
        if (environmentSelect) {
            environmentSelect.addEventListener('change', (e) => this.handleEnvironmentChange(e));
        }
        
        // Clear form button
        const clearFormBtn = document.getElementById('clearFormBtn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => this.clearForm());
        }
        
        // Modal close events
        const modal = document.getElementById('editActivityModal');
        if (modal) {
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.closeEditModal());
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeEditModal();
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
        // Load environments from localStorage or get from environments module
        const savedEnvironments = localStorage.getItem('sistemaAgraria_environments');
        if (savedEnvironments) {
            this.environments = JSON.parse(savedEnvironments);
        } else if (window.environmentsModule) {
            this.environments = window.environmentsModule.getEnvironments();
        }
    }
    
    loadActivities() {
        const savedActivities = localStorage.getItem('sistemaAgraria_activities');
        if (savedActivities) {
            this.activities = JSON.parse(savedActivities);
        } else {
            // Initialize with sample activities
            this.activities = [
                {
                    id: 1,
                    environmentId: 1,
                    environmentName: 'Huerta Principal',
                    environmentType: 'vegetal',
                    responsibleTeacher: 'Prof. María González',
                    year: '3',
                    division: 'A',
                    group: 'Grupo 1',
                    activityDate: '2024-01-15',
                    activityTime: '08:00',
                    duration: 120,
                    activityTitle: 'Siembra de Tomates',
                    activityDescription: 'Preparación del terreno y siembra de semillas de tomate en almácigos. Los estudiantes aprendieron sobre la preparación del sustrato y las técnicas de siembra.',
                    observations: 'Excelente participación de los estudiantes',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 2,
                    environmentId: 3,
                    environmentName: 'Granja Avícola',
                    environmentType: 'animal',
                    responsibleTeacher: 'Prof. Ana Martínez',
                    year: '4',
                    division: 'A',
                    group: 'Grupo 3',
                    activityDate: '2024-01-16',
                    activityTime: '09:30',
                    duration: 90,
                    activityTitle: 'Alimentación y Cuidado de Gallinas',
                    activityDescription: 'Actividad práctica de alimentación de gallinas ponedoras. Se enseñó sobre tipos de alimento, horarios de alimentación y cuidados básicos.',
                    observations: 'Se observó mejora en la producción de huevos',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveActivities();
        }
    }
    
    saveActivities() {
        localStorage.setItem('sistemaAgraria_activities', JSON.stringify(this.activities));
    }
    
    populateEnvironments() {
        const environmentSelect = document.getElementById('environmentId');
        if (!environmentSelect) return;
        
        // Clear existing options except first
        environmentSelect.innerHTML = '<option value="">Seleccione un entorno</option>';
        
        this.environments.forEach(env => {
            const option = document.createElement('option');
            option.value = env.id;
            option.textContent = `${env.environmentName} (${this.getEnvironmentTypeLabel(env.environmentType)})`;
            environmentSelect.appendChild(option);
        });
    }
    
    handleEnvironmentChange(e) {
        const environmentId = parseInt(e.target.value);
        const environment = this.environments.find(env => env.id === environmentId);
        
        if (environment) {
            // Populate related fields
            document.getElementById('environmentType').innerHTML = `<option value="${environment.environmentType}">${this.getEnvironmentTypeLabel(environment.environmentType)}</option>`;
            document.getElementById('environmentType').value = environment.environmentType;
            document.getElementById('environmentType').disabled = false;
            
            document.getElementById('responsibleTeacher').value = environment.responsibleTeacher;
            
            document.getElementById('year').innerHTML = `<option value="${environment.year}">${environment.year}° Año</option>`;
            document.getElementById('year').value = environment.year;
            document.getElementById('year').disabled = false;
            
            document.getElementById('division').innerHTML = `<option value="${environment.division}">${environment.division}</option>`;
            document.getElementById('division').value = environment.division;
            document.getElementById('division').disabled = false;
            
            document.getElementById('group').value = environment.group;
        } else {
            // Reset fields
            document.getElementById('environmentType').innerHTML = '<option value="">Seleccione primero un entorno</option>';
            document.getElementById('environmentType').disabled = true;
            
            document.getElementById('responsibleTeacher').value = '';
            
            document.getElementById('year').innerHTML = '<option value="">Seleccione primero un entorno</option>';
            document.getElementById('year').disabled = true;
            
            document.getElementById('division').innerHTML = '<option value="">Seleccione primero un entorno</option>';
            document.getElementById('division').disabled = true;
            
            document.getElementById('group').value = '';
        }
    }
    
    setDefaultDateTime() {
        const today = new Date();
        const dateInput = document.getElementById('activityDate');
        const timeInput = document.getElementById('activityTime');
        
        if (dateInput) {
            dateInput.value = today.toISOString().split('T')[0];
        }
        
        if (timeInput) {
            const hours = today.getHours().toString().padStart(2, '0');
            const minutes = today.getMinutes().toString().padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }
    }
    
    handleActivitySubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const activityData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            activityData[key] = value;
        }
        
        // Validate form
        if (!this.validateActivityForm(activityData)) {
            return;
        }
        
        // Get environment details
        const environment = this.environments.find(env => env.id === parseInt(activityData.environmentId));
        if (environment) {
            activityData.environmentName = environment.environmentName;
        }
        
        // Create new activity
        activityData.id = this.generateActivityId();
        activityData.createdAt = new Date().toISOString();
        activityData.updatedAt = new Date().toISOString();
        
        this.activities.unshift(activityData); // Add to beginning for chronological order
        this.saveActivities();
        this.renderActivitiesTable();
        this.clearForm();
        
        // Show success message
        if (window.Components && window.Components.Alert) {
            window.Components.Alert.show('Actividad registrada exitosamente', 'success');
        }
        
        // Scroll to activities table
        document.getElementById('activitiesTableContainer').scrollIntoView({ behavior: 'smooth' });
    }
    
    validateActivityForm(activityData) {
        this.clearFormErrors();
        let isValid = true;
        
        // Required fields validation
        const requiredFields = [
            'environmentId', 'environmentType', 'responsibleTeacher', 'year', 
            'division', 'group', 'activityDate', 'activityTime', 'duration',
            'activityTitle', 'activityDescription'
        ];
        
        requiredFields.forEach(field => {
            if (!activityData[field] || activityData[field].toString().trim() === '') {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            }
        });
        
        // Date validation (not in the future beyond today)
        if (activityData.activityDate) {
            const activityDate = new Date(activityData.activityDate);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            
            if (activityDate > today) {
                this.showFieldError('activityDate', 'La fecha no puede ser futura');
                isValid = false;
            }
        }
        
        // Duration validation
        if (activityData.duration) {
            const duration = parseInt(activityData.duration);
            if (duration < 15 || duration > 480) {
                this.showFieldError('duration', 'La duración debe estar entre 15 y 480 minutos');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    renderActivitiesTable() {
        const container = document.getElementById('activitiesTableContainer');
        if (!container) return;
        
        if (this.activities.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No hay actividades registradas</p>';
            return;
        }
        
        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Fecha/Hora</th>
                            <th>Entorno</th>
                            <th>Tipo</th>
                            <th>Título</th>
                            <th>Profesor</th>
                            <th>Curso</th>
                            <th>Duración</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.activities.map(activity => `
                            <tr>
                                <td>
                                    <div class="text-sm">
                                        <div class="font-medium">${this.formatDate(activity.activityDate)}</div>
                                        <div class="text-secondary">${activity.activityTime}</div>
                                    </div>
                                </td>
                                <td><strong>${activity.environmentName}</strong></td>
                                <td>
                                    <span class="badge ${this.getEnvironmentTypeBadge(activity.environmentType)}">
                                        ${this.getEnvironmentTypeLabel(activity.environmentType)}
                                    </span>
                                </td>
                                <td>
                                    <div class="text-sm">
                                        <div class="font-medium">${activity.activityTitle}</div>
                                        <div class="text-secondary">${activity.activityDescription.length > 60 ? activity.activityDescription.substring(0, 60) + '...' : activity.activityDescription}</div>
                                    </div>
                                </td>
                                <td>${activity.responsibleTeacher}</td>
                                <td>${activity.year}° ${activity.division} - ${activity.group}</td>
                                <td>${activity.duration} min</td>
                                <td>
                                    <div class="flex gap-2">
                                        <button class="btn btn-sm btn-outline" onclick="window.activitiesModule.editActivity(${activity.id})" title="Editar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="window.activitiesModule.deleteActivity(${activity.id})" title="Eliminar">
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
    }
    
    editActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        this.currentActivity = activity;
        this.isEditing = true;
        
        // Populate edit form
        document.getElementById('editActivityDate').value = activity.activityDate;
        document.getElementById('editActivityTime').value = activity.activityTime;
        document.getElementById('editDuration').value = activity.duration;
        document.getElementById('editActivityTitle').value = activity.activityTitle;
        document.getElementById('editActivityDescription').value = activity.activityDescription;
        document.getElementById('editObservations').value = activity.observations || '';
        document.getElementById('editActivityId').value = activity.id;
        
        // Show modal
        this.showEditModal();
    }
    
    deleteActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        if (confirm(`¿Estás seguro de que deseas eliminar la actividad "${activity.activityTitle}"?`)) {
            this.activities = this.activities.filter(a => a.id !== activityId);
            this.saveActivities();
            this.renderActivitiesTable();
            
            if (window.Components && window.Components.Alert) {
                window.Components.Alert.show('Actividad eliminada exitosamente', 'success');
            }
        }
    }
    
    handleEditActivitySubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const activityData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            activityData[key] = value;
        }
        
        if (!this.currentActivity) return;
        
        // Update activity
        const index = this.activities.findIndex(a => a.id === this.currentActivity.id);
        if (index !== -1) {
            this.activities[index] = {
                ...this.currentActivity,
                ...activityData,
                id: this.currentActivity.id,
                updatedAt: new Date().toISOString()
            };
            
            this.saveActivities();
            this.renderActivitiesTable();
            this.closeEditModal();
            
            if (window.Components && window.Components.Alert) {
                window.Components.Alert.show('Actividad actualizada exitosamente', 'success');
            }
        }
    }
    
    showEditModal() {
        const modal = document.getElementById('editActivityModal');
        if (!modal) return;
        
        requestAnimationFrame(() => {
            modal.style.display = 'flex';
            modal.classList.add('show');
            modal.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
        });
    }
    
    closeEditModal() {
        const modal = document.getElementById('editActivityModal');
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        this.currentActivity = null;
        this.isEditing = false;
    }
    
    clearForm() {
        const form = document.getElementById('activityForm');
        if (!form) return;
        
        form.reset();
        this.clearFormErrors();
        this.setDefaultDateTime();
        
        // Reset dependent fields
        document.getElementById('environmentType').innerHTML = '<option value="">Seleccione primero un entorno</option>';
        document.getElementById('environmentType').disabled = true;
        document.getElementById('responsibleTeacher').value = '';
        document.getElementById('year').innerHTML = '<option value="">Seleccione primero un entorno</option>';
        document.getElementById('year').disabled = true;
        document.getElementById('division').innerHTML = '<option value="">Seleccione primero un entorno</option>';
        document.getElementById('division').disabled = true;
        document.getElementById('group').value = '';
    }
    
    // Utility methods
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
            'animal': 'badge-warning',
            'vegetal': 'badge-success',
            'otro': 'badge-info'
        };
        return badges[type] || 'badge-secondary';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    generateActivityId() {
        return Math.max(...this.activities.map(a => a.id), 0) + 1;
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
        const form = document.getElementById('activityForm');
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
    
    // Get activities for use in other modules
    getActivities() {
        return this.activities;
    }
    
    getActivitiesByEnvironment(environmentId) {
        return this.activities.filter(a => a.environmentId === environmentId);
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
    }
    
    // Initialize activities module
    window.activitiesModule = new ActivitiesModule();
    window.activitiesModule.initializeUserInfo();
    
    // Initialize dropdowns
    if (window.Components && window.Components.Dropdown) {
        window.Components.Dropdown.initAll();
    }
});
