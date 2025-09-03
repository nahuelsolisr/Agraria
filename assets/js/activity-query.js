/**
 * Activity Query Module - Sistema Agraria
 * Handles activity search and filtering functionality
 */

class ActivityQueryModule {
    constructor() {
        this.activities = [];
        this.environments = [];
        this.filteredActivities = [];
        this.currentFilters = {};
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.bindEvents();
        this.populateFilterOptions();
        this.initializeUserInfo();
    }
    
    loadData() {
        // Load activities from localStorage
        const savedActivities = localStorage.getItem('sistemaAgraria_activities');
        if (savedActivities) {
            this.activities = JSON.parse(savedActivities);
        }
        
        // Load environments from localStorage
        const savedEnvironments = localStorage.getItem('sistemaAgraria_environments');
        if (savedEnvironments) {
            this.environments = JSON.parse(savedEnvironments);
        }
    }
    
    bindEvents() {
        // Filter form submission
        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => this.handleFilterSubmit(e));
        }
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }
        
        // Modal close events
        const modal = document.getElementById('activityDetailModal');
        if (modal) {
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.closeDetailModal());
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeDetailModal();
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
    
    populateFilterOptions() {
        this.populateEnvironmentFilter();
        this.populateTeacherFilter();
    }
    
    populateEnvironmentFilter() {
        const environmentSelect = document.getElementById('filterEnvironment');
        if (!environmentSelect) return;
        
        // Clear existing options except first
        environmentSelect.innerHTML = '<option value="">Todos los entornos</option>';
        
        this.environments.forEach(env => {
            const option = document.createElement('option');
            option.value = env.id;
            option.textContent = `${env.environmentName} (${this.getEnvironmentTypeLabel(env.environmentType)})`;
            environmentSelect.appendChild(option);
        });
    }
    
    populateTeacherFilter() {
        const teacherSelect = document.getElementById('filterTeacher');
        if (!teacherSelect) return;
        
        // Get unique teachers from activities
        const teachers = [...new Set(this.activities.map(activity => activity.responsibleTeacher))];
        
        // Clear existing options except first
        teacherSelect.innerHTML = '<option value="">Todos los profesores</option>';
        
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher;
            option.textContent = teacher;
            teacherSelect.appendChild(option);
        });
    }
    
    handleFilterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const filters = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                filters[key] = value.trim();
            }
        }
        
        this.currentFilters = filters;
        this.applyFilters();
        this.renderResults();
    }
    
    applyFilters() {
        this.filteredActivities = this.activities.filter(activity => {
            // Environment filter
            if (this.currentFilters.filterEnvironment && 
                activity.environmentId !== parseInt(this.currentFilters.filterEnvironment)) {
                return false;
            }
            
            // Type filter
            if (this.currentFilters.filterType && 
                activity.environmentType !== this.currentFilters.filterType) {
                return false;
            }
            
            // Teacher filter
            if (this.currentFilters.filterTeacher && 
                activity.responsibleTeacher !== this.currentFilters.filterTeacher) {
                return false;
            }
            
            // Year filter
            if (this.currentFilters.filterYear && 
                activity.year !== this.currentFilters.filterYear) {
                return false;
            }
            
            // Division filter
            if (this.currentFilters.filterDivision && 
                activity.division !== this.currentFilters.filterDivision) {
                return false;
            }
            
            // Group filter
            if (this.currentFilters.filterGroup && 
                !activity.group.toLowerCase().includes(this.currentFilters.filterGroup.toLowerCase())) {
                return false;
            }
            
            // Date range filter
            if (this.currentFilters.filterDateFrom) {
                const activityDate = new Date(activity.activityDate);
                const fromDate = new Date(this.currentFilters.filterDateFrom);
                if (activityDate < fromDate) {
                    return false;
                }
            }
            
            if (this.currentFilters.filterDateTo) {
                const activityDate = new Date(activity.activityDate);
                const toDate = new Date(this.currentFilters.filterDateTo);
                if (activityDate > toDate) {
                    return false;
                }
            }
            
            // Title filter
            if (this.currentFilters.filterTitle && 
                !activity.activityTitle.toLowerCase().includes(this.currentFilters.filterTitle.toLowerCase())) {
                return false;
            }
            
            // Description filter
            if (this.currentFilters.filterDescription && 
                !activity.activityDescription.toLowerCase().includes(this.currentFilters.filterDescription.toLowerCase())) {
                return false;
            }
            
            return true;
        });
        
        // Sort by date (most recent first)
        this.filteredActivities.sort((a, b) => {
            const dateA = new Date(a.activityDate + ' ' + a.activityTime);
            const dateB = new Date(b.activityDate + ' ' + b.activityTime);
            return dateB - dateA;
        });
    }
    
    renderResults() {
        const container = document.getElementById('resultsTableContainer');
        const countElement = document.getElementById('resultsCount');
        
        if (!container) return;
        
        // Update count
        if (countElement) {
            const count = this.filteredActivities.length;
            countElement.textContent = `${count} actividad${count !== 1 ? 'es' : ''} encontrada${count !== 1 ? 's' : ''}`;
        }
        
        if (this.filteredActivities.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No se encontraron actividades con los filtros aplicados</p>';
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
                        ${this.filteredActivities.map(activity => `
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
                                    <button class="btn btn-sm btn-info" onclick="window.activityQueryModule.viewActivityDetail(${activity.id})" title="Ver Detalle">
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
    
    viewActivityDetail(activityId) {
        const activity = this.filteredActivities.find(a => a.id === activityId);
        if (!activity) return;
        
        const detailContent = document.getElementById('activityDetailContent');
        if (!detailContent) return;
        
        detailContent.innerHTML = `
            <div class="activity-detail">
                <div class="detail-grid">
                    <div class="detail-section">
                        <h5 class="detail-title">Información General</h5>
                        <div class="detail-row">
                            <span class="detail-label">Título:</span>
                            <span class="detail-value">${activity.activityTitle}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha:</span>
                            <span class="detail-value">${this.formatDate(activity.activityDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Hora:</span>
                            <span class="detail-value">${activity.activityTime}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Duración:</span>
                            <span class="detail-value">${activity.duration} minutos</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5 class="detail-title">Entorno y Participantes</h5>
                        <div class="detail-row">
                            <span class="detail-label">Entorno:</span>
                            <span class="detail-value">${activity.environmentName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Tipo:</span>
                            <span class="detail-value">
                                <span class="badge ${this.getEnvironmentTypeBadge(activity.environmentType)}">
                                    ${this.getEnvironmentTypeLabel(activity.environmentType)}
                                </span>
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Profesor Responsable:</span>
                            <span class="detail-value">${activity.responsibleTeacher}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Curso:</span>
                            <span class="detail-value">${activity.year}° Año - División ${activity.division}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Grupo:</span>
                            <span class="detail-value">${activity.group}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section mt-4">
                    <h5 class="detail-title">Descripción</h5>
                    <div class="detail-description">
                        ${activity.activityDescription}
                    </div>
                </div>
                
                ${activity.observations ? `
                    <div class="detail-section mt-4">
                        <h5 class="detail-title">Observaciones</h5>
                        <div class="detail-description">
                            ${activity.observations}
                        </div>
                    </div>
                ` : ''}
                
                <div class="detail-section mt-4">
                    <h5 class="detail-title">Información de Registro</h5>
                    <div class="detail-row">
                        <span class="detail-label">Creado:</span>
                        <span class="detail-value">${this.formatDateTime(activity.createdAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Última modificación:</span>
                        <span class="detail-value">${this.formatDateTime(activity.updatedAt)}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.showDetailModal();
    }
    
    showDetailModal() {
        const modal = document.getElementById('activityDetailModal');
        if (!modal) return;
        
        requestAnimationFrame(() => {
            modal.style.display = 'flex';
            modal.classList.add('show');
            modal.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
        });
    }
    
    closeDetailModal() {
        const modal = document.getElementById('activityDetailModal');
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
    
    clearFilters() {
        const form = document.getElementById('filterForm');
        if (form) {
            form.reset();
        }
        
        this.currentFilters = {};
        this.filteredActivities = [];
        
        // Clear results
        const container = document.getElementById('resultsTableContainer');
        const countElement = document.getElementById('resultsCount');
        
        if (container) {
            container.innerHTML = '<p class="text-center text-secondary">Utilice los filtros para buscar actividades</p>';
        }
        
        if (countElement) {
            countElement.textContent = '0 actividades encontradas';
        }
    }
    
    exportResults() {
        if (this.filteredActivities.length === 0) {
            alert('No hay resultados para exportar. Realice una búsqueda primero.');
            return;
        }
        
        // Create CSV content
        const headers = [
            'Fecha', 'Hora', 'Entorno', 'Tipo', 'Título', 'Descripción', 
            'Profesor', 'Año', 'División', 'Grupo', 'Duración (min)', 'Observaciones'
        ];
        
        const csvContent = [
            headers.join(','),
            ...this.filteredActivities.map(activity => [
                activity.activityDate,
                activity.activityTime,
                `"${activity.environmentName}"`,
                this.getEnvironmentTypeLabel(activity.environmentType),
                `"${activity.activityTitle}"`,
                `"${activity.activityDescription.replace(/"/g, '""')}"`,
                `"${activity.responsibleTeacher}"`,
                activity.year,
                activity.division,
                `"${activity.group}"`,
                activity.duration,
                `"${(activity.observations || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `consulta_actividades_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (window.Components && window.Components.Alert) {
            window.Components.Alert.show('Archivo exportado exitosamente', 'success');
        }
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
    
    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
    
    // Initialize activity query module
    window.activityQueryModule = new ActivityQueryModule();
    
    // Initialize dropdowns
    if (window.Components && window.Components.Dropdown) {
        window.Components.Dropdown.initAll();
    }
});
