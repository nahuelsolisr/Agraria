// ===== MAIN APPLICATION =====
class SistemaAgraria {
    constructor() {
        this.currentModule = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    initializeApp() {
        // Initialize based on current page
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.initLoginPage();
                break;
            case 'dashboard':
                this.initDashboard();
                break;
            case 'usuarios':
                this.initUsersModule();
                break;
            case 'entornos':
                this.initEnvironmentsModule();
                break;
            case 'actividades':
                this.initActivitiesModule();
                break;
            case 'consulta-actividades':
                this.initActivitiesQueryModule();
                break;
            case 'ventas':
                this.initSalesModule();
                break;
            case 'consulta-ventas':
                this.initSalesQueryModule();
                break;
            case 'inventario':
                this.initInventoryModule();
                break;
            default:
                console.log('Unknown page:', currentPage);
                // For any unknown authenticated page, still set up layout
                if (Auth && Auth.isAuthenticated && Auth.isAuthenticated()) {
                    this.setupSidebar();
                    this.setupHeader();
                }
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'index';
    }

    // ===== LOGIN PAGE =====
    initLoginPage() {
        // Login functionality is handled by Auth system
        console.log('Login page initialized');
    }

    // ===== DASHBOARD =====
    initDashboard() {
        if (!Auth.requireAuth()) return;

        this.setupSidebar();
        this.setupHeader();
        this.loadDashboardContent();
    }

    setupSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            });
        }

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const clickOutsideSidebar = !sidebar.contains(e.target);
            const clickOutsideToggle = !mobileToggle || !mobileToggle.contains(e.target);
            if (window.innerWidth <= 1024 && clickOutsideSidebar && clickOutsideToggle) {
                sidebar.classList.remove('open');
            }
        });

        // Apply role-based navigation visibility
        this.applyNavVisibility();
    }

    setupHeader() {
        const user = Auth.getCurrentUser();
        if (user) {
            // Update user info in header
            const userNameElement = document.getElementById('currentUserName');
            const userRoleElement = document.getElementById('currentUserRole');
            
            if (userNameElement) {
                userNameElement.textContent = `${user.firstName} ${user.lastName}`;
            }
            if (userRoleElement) {
                userRoleElement.textContent =
                    user.role === 'administrador' ? 'Administrador' :
                    user.role === 'jefe_area' ? 'Jefe de Área' :
                    user.role === 'profesor_animal' ? 'Profesor - Animal' :
                    user.role === 'profesor_vegetal' ? 'Profesor - Vegetal' : user.role;
            }
        }
    }

    loadDashboardContent() {
        const user = Auth.getCurrentUser();
        const dashboardContent = document.getElementById('dashboardContent');
        
        if (!dashboardContent) return;

        // Show role-based dashboard content
        if (user.role === 'administrador') {
            this.loadAdminDashboard(dashboardContent);
        } else {
            this.loadUserDashboard(dashboardContent);
        }
    }

    loadAdminDashboard(container) {
        const stats = this.getDashboardStats();
        
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="card">
                    <div class="card-body">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-secondary">Usuarios Activos</p>
                                <p class="text-2xl font-bold text-primary">${stats.activeUsers}</p>
                            </div>
                            <div class="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-secondary">Entornos Formativos</p>
                                <p class="text-2xl font-bold text-success">${stats.environments}</p>
                            </div>
                            <div class="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-secondary">Actividades Hoy</p>
                                <p class="text-2xl font-bold text-warning">${stats.todayActivities}</p>
                            </div>
                            <div class="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-secondary">Ventas del Mes</p>
                                <p class="text-2xl font-bold text-info">${Components.formatCurrency(stats.monthSales)}</p>
                            </div>
                            <div class="w-12 h-12 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Actividades Recientes</h3>
                    </div>
                    <div class="card-body">
                        <div id="recentActivities">Cargando...</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Accesos Rápidos</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-2 gap-4">
                            <a href="usuarios.html" class="btn btn-outline-secondary">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                                Usuarios
                            </a>
                            <a href="entornos.html" class="btn btn-outline-secondary">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                Entornos
                            </a>
                            <a href="actividades.html" class="btn btn-outline-secondary">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                                Actividades
                            </a>
                            <a href="ventas.html" class="btn btn-outline-secondary">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                                Ventas
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
           
            
           
        `;

        this.loadRecentActivities();
    }

    loadUserDashboard(container) {
        const stats = this.getDashboardStats();
        const isProfesor = window.Auth && window.Auth.isProfesor && window.Auth.isProfesor();
         
        container.innerHTML = `
             <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div class="card">
                     <div class="card-body">
                         <div class="flex items-center justify-between">
                             <div>
                                 <p class="text-sm text-secondary">Mis Actividades</p>
                                 <p class="text-2xl font-bold text-primary">${stats.userActivities}</p>
                             </div>
                             <div class="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                                 <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                 </svg>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 <div class="card">
                     <div class="card-body">
                         <div class="flex items-center justify-between">
                             <div>
                                 <p class="text-sm text-secondary">Entornos Asignados</p>
                                 <p class="text-2xl font-bold text-success">${stats.userEnvironments}</p>
                             </div>
                             <div class="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                                 <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                 </svg>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 ${!isProfesor ? `
                 <div class="card">
                     <div class="card-body">
                         <div class="flex items-center justify-between">
                             <div>
                                 <p class="text-sm text-secondary">Ventas Registradas</p>
                                 <p class="text-2xl font-bold text-info">${stats.userSales}</p>
                             </div>
                             <div class="w-12 h-12 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
                                 <svg class="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                 </svg>
                             </div>
                         </div>
                     </div>
                 </div>
                 ` : ''}
             </div>
             
             <div class="card">
                 <div class="card-header">
                     <h3 class="card-title">Acciones Rápidas</h3>
                 </div>
                 <div class="card-body">
                     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <a href="actividades.html" class="btn btn-primary">
                             <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                             </svg>
                             Registrar Actividad
                         </a>
                         ${!isProfesor ? `
                         <a href="ventas.html" class="btn btn-success">
                             <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                             </svg>
                             Nueva Venta
                         </a>
                         ` : ''}
                         <a href="consulta-actividades.html" class="btn btn-secondary">
                             <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                             </svg>
                             Consultar Actividades
                         </a>
                         ${!isProfesor ? `
                         <a href="inventario.html" class="btn btn-warning">
                             <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4"></path>
                             </svg>
                             Ver Inventario
                         </a>
                         ` : ''}
                     </div>
                 </div>
             </div>
         `;
     }

    getDashboardStats() {
        const currentUser = Auth.getCurrentUser();
        const users = Auth.users || [];
        const environments = this.getStoredData('environments', []);
        const activities = this.getStoredData('activities', []);
        const sales = this.getStoredData('sales', []);

        // Helper to normalize names (remove Prof.)
        const normalizeName = (s) => (s || '').toLowerCase().replace(/^\s*prof\.?\s*/i, '').trim();

        const isProfesor = Auth.isProfesor && Auth.isProfesor();
        const tipoProfesor = Auth.getProfesorTipo && Auth.getProfesorTipo();

        // Today activities: based on activities.activityDate
        const todayStr = new Date().toDateString();
        const todayActivities = activities.filter(a => new Date(a.activityDate).toDateString() === todayStr).length;

        // User activities: if professor, count assigned ones of their type
        let userActivitiesCount = 0;
        if (currentUser) {
            if (isProfesor) {
                // Activities assigned to this professor by environment.responsibleId or by name
                const envIdsForUser = environments
                    .filter(e => e.environmentType === tipoProfesor && e.responsibleId === currentUser.id)
                    .map(e => e.id);
                userActivitiesCount = activities.filter(a => {
                    const byEnv = envIdsForUser.includes(a.environmentId);
                    const byName = normalizeName(a.responsibleTeacher) === normalizeName(`${currentUser.firstName} ${currentUser.lastName}`);
                    const byType = a.environmentType === tipoProfesor;
                    return byType && (byEnv || byName);
                }).length;
            } else {
                // Non-professors: keep existing behavior (activities created by user if present)
                userActivitiesCount = activities.filter(a => a.userId === currentUser.id).length;
            }
        }

        // User environments: count environments where user is responsible
        const userEnvironmentsCount = environments.filter(e => e.responsibleId === currentUser?.id).length;

        // Month sales
        const now = new Date();
        const monthSales = sales
            .filter(s => {
                const d = new Date(s.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((total, sale) => total + (sale.total || 0), 0);

        return {
            activeUsers: users.filter(u => u.active).length,
            environments: environments.length,
            todayActivities,
            monthSales,
            userActivities: userActivitiesCount,
            userEnvironments: userEnvironmentsCount,
            userSales: sales.filter(s => s.userId === currentUser?.id).length
        };
    }

    loadRecentActivities() {
        const container = document.getElementById('recentActivities');
        if (!container) return;
    
        const activities = this.getStoredData('activities', [])
            .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate))
            .slice(0, 5);
    
        if (activities.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay actividades registradas</p>';
            return;
        }
    
        const typeLabel = (t) =>
            t === 'animal' ? 'Animal' :
            t === 'vegetal' ? 'Vegetal' :
            (t || 'Otro');
    
        container.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div>
                    <p class="font-medium">${activity.environmentName || '-'}</p>
                    <p class="text-sm text-secondary">${typeLabel(activity.environmentType)} - ${activity.responsibleTeacher || '-'}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm">${Components.formatDate(activity.activityDate)}</p>
                    <span class="badge badge-primary">${activity.year}° ${activity.division}</span>
                </div>
            </div>
        `).join('');
    }

    // ===== MODULE INITIALIZERS =====
    initUsersModule() {
        if (!Auth.requireAdmin()) return;
        this.setupSidebar();
        this.setupHeader();
        // Users module initialization will be handled in separate files
    }

    initEnvironmentsModule() {
        if (!Auth.requireAuth()) return;
        this.setupSidebar();
        this.setupHeader();
        // Environments module initialization
    }

    initActivitiesModule() {
        if (!Auth.requireAuth()) return;
        this.setupSidebar();
        this.setupHeader();
        // Activities module initialization
    }

    initSalesModule() {
        if (!Auth.requireAuth()) return;
        this.setupSidebar();
        this.setupHeader();
        // Sales module initialization
    }

    initInventoryModule() {
        if (!Auth.requireAuth()) return;
        this.setupSidebar();
        this.setupHeader();
        // Inventory module initialization
    }

    initSalesQueryModule() {
        if (!Auth.requireAuth()) return;
        this.setupSidebar();
        this.setupHeader();
    }

    initActivitiesQueryModule() {
        if (!Auth.requireAuth()) return;
        this.setupSidebar();
        this.setupHeader();
    }

    // ===== UTILITY METHODS =====
    getStoredData(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(`sistemaAgraria_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    setStoredData(key, data) {
        try {
            localStorage.setItem(`sistemaAgraria_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    applyNavVisibility() {
        if (!window.Auth) return;
        const user = window.Auth.getCurrentUser();
        if (!user) return;
        // utilities
        const hideLink = (href) => {
            const link = document.querySelector(`.sidebar a[href="${href}"]`);
            if (link) link.parentElement.style.display = 'none';
        };
        const showLink = (href) => {
            const link = document.querySelector(`.sidebar a[href="${href}"]`);
            if (link) link.parentElement.style.display = '';
        };

        // Start by showing all, then hide as needed
        const allHrefs = ['dashboard.html','usuarios.html','entornos.html','actividades.html','consulta-actividades.html','ventas.html','consulta-ventas.html','inventario.html'];
        allHrefs.forEach(showLink);

        if (window.Auth.isAdmin && window.Auth.isAdmin()) {
            // Admin sees all
            return;
        }

        if (window.Auth.isJefeArea && window.Auth.isJefeArea()) {
            // Jefe de Área: only ventas (registro en modo solo vista), consulta ventas, inventario
            hideLink('usuarios.html');
            hideLink('entornos.html');
            hideLink('actividades.html');
            hideLink('consulta-actividades.html');
            // Keep ventas.html, consulta-ventas.html, inventario.html, dashboard
            return;
        }

        if (window.Auth.isProfesor && window.Auth.isProfesor()) {
            // Profesor: solo Entornos
            hideLink('usuarios.html');
            hideLink('actividades.html');
            hideLink('consulta-actividades.html');
            hideLink('ventas.html');
            hideLink('consulta-ventas.html');
            hideLink('inventario.html');
            // Keep entornos and dashboard
        }
    }
}

// Initialize main application
const App = new SistemaAgraria();

// Export for use in other modules
window.App = App;
