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
            case 'ventas':
                this.initSalesModule();
                break;
            case 'inventario':
                this.initInventoryModule();
                break;
            default:
                console.log('Unknown page:', currentPage);
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
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
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
                userRoleElement.textContent = user.role === 'administrador' ? 'Administrador' : 'Usuario Estándar';
            }
        }

        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
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
                        <a href="ventas.html" class="btn btn-success">
                            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                            Nueva Venta
                        </a>
                        <a href="consulta-actividades.html" class="btn btn-secondary">
                            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            Consultar Actividades
                        </a>
                        <a href="inventario.html" class="btn btn-warning">
                            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            Ver Inventario
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    getDashboardStats() {
        // In a real application, this would fetch from server
        // For demo purposes, we'll use mock data
        return {
            activeUsers: Auth.users.filter(u => u.active).length,
            environments: this.getStoredData('environments', []).length,
            todayActivities: this.getStoredData('activities', []).filter(a => 
                new Date(a.date).toDateString() === new Date().toDateString()
            ).length,
            monthSales: this.getStoredData('sales', [])
                .filter(s => new Date(s.date).getMonth() === new Date().getMonth())
                .reduce((total, sale) => total + sale.total, 0),
            userActivities: this.getStoredData('activities', []).filter(a => 
                a.userId === Auth.getCurrentUser()?.id
            ).length,
            userEnvironments: this.getStoredData('environments', []).filter(e => 
                e.responsibleId === Auth.getCurrentUser()?.id
            ).length,
            userSales: this.getStoredData('sales', []).filter(s => 
                s.userId === Auth.getCurrentUser()?.id
            ).length
        };
    }

    loadRecentActivities() {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        const activities = this.getStoredData('activities', [])
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (activities.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay actividades registradas</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div>
                    <p class="font-medium">${activity.environment}</p>
                    <p class="text-sm text-secondary">${activity.type} - ${activity.responsible}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm">${Components.formatDate(activity.date)}</p>
                    <span class="badge badge-primary">${activity.year}° ${activity.division}</span>
                </div>
            </div>
        `).join('');
    }

    // ===== MODULE INITIALIZERS =====
    initUsersModule() {
        if (!Auth.requireAdmin()) return;
        // Users module initialization will be handled in separate files
    }

    initEnvironmentsModule() {
        if (!Auth.requireAuth()) return;
        // Environments module initialization
    }

    initActivitiesModule() {
        if (!Auth.requireAuth()) return;
        // Activities module initialization
    }

    initSalesModule() {
        if (!Auth.requireAuth()) return;
        // Sales module initialization
    }

    initInventoryModule() {
        if (!Auth.requireAuth()) return;
        // Inventory module initialization
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
}

// Initialize main application
const App = new SistemaAgraria();

// Export for use in other modules
window.App = App;
