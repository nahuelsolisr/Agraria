// ===== AUTHENTICATION SYSTEM =====
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'sistemaAgraria_session';
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        // Check for existing session on page load
        this.checkSession();

        // Initialize login form if present
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            this.initLoginForm(loginForm);
        }

        // Initialize forgot password link
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPasswordRecovery();
            });
        }
    }

    // ===== USER DATA =====
    loadUsers() {
        // In a real application, this would come from a server
        // For demo purposes, we'll use localStorage with default users
        const savedUsers = localStorage.getItem('sistemaAgraria_users');
        if (savedUsers) {
            return JSON.parse(savedUsers);
        }

        // Default users for demonstration
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                email: 'admin@sistemaagraria.com',
                firstName: 'Administrador',
                lastName: 'Sistema',
                role: 'administrador',
                securityQuestion: '¿Cuál es el nombre de tu primera mascota?',
                securityAnswer: 'firulais',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'jefe',
                password: 'jefe123',
                email: 'jefe.area@sistemaagraria.com',
                firstName: 'Jefe',
                lastName: 'Área',
                role: 'jefe_area',
                securityQuestion: '¿En qué ciudad naciste?',
                securityAnswer: 'buenos aires',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                username: 'prof.animal',
                password: 'prof123',
                email: 'prof.animal@sistemaagraria.com',
                firstName: 'Ana',
                lastName: 'Martínez',
                role: 'profesor_animal',
                securityQuestion: '¿Cuál es tu color favorito?',
                securityAnswer: 'azul',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                username: 'prof.vegetal',
                password: 'prof123',
                email: 'prof.vegetal@sistemaagraria.com',
                firstName: 'María',
                lastName: 'González',
                role: 'profesor_vegetal',
                securityQuestion: '¿Cuál es tu comida favorita?',
                securityAnswer: 'milanesa',
                active: true,
                createdAt: new Date().toISOString()
            },
        ];

        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    saveUsers(users) {
        localStorage.setItem('sistemaAgraria_users', JSON.stringify(users));
        this.users = users;
    }

    // ===== SESSION MANAGEMENT =====
    checkSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const user = this.users.find(u => u.id === sessionData.userId);

                if (user && user.active && this.isSessionValid(sessionData)) {
                    this.currentUser = user;
                    this.redirectToDashboard();
                } else {
                    this.clearSession();
                }
            } catch (error) {
                this.clearSession();
            }
        }
    }

    isSessionValid(sessionData) {
        const now = new Date().getTime();
        const sessionTime = new Date(sessionData.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        return (now - sessionTime) < maxAge;
    }

    createSession(user, rememberMe = false) {
        const sessionData = {
            userId: user.id,
            username: user.username,
            role: user.role,
            timestamp: new Date().toISOString(),
            rememberMe: rememberMe
        };

        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        this.currentUser = user;
    }

    clearSession() {
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
    }

    // ===== LOGIN FUNCTIONALITY =====
    initLoginForm(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(form);
        });
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        const rememberMe = form.querySelector('#remember-me').checked;

        // Clear previous errors
        this.clearLoginErrors();

        // Validate inputs
        if (!username || !password) {
            this.showLoginError('Por favor complete todos los campos');
            return;
        }

        // Show loading
        Components.showLoading();

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Find user
            const user = this.users.find(u =>
                u.username.toLowerCase() === username.toLowerCase() &&
                u.password === password &&
                u.active
            );

            if (user) {
                this.createSession(user, rememberMe);
                Components.showAlert('Inicio de sesión exitoso', 'success', 2000);

                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            } else {
                this.showLoginError('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            this.showLoginError('Error en el servidor. Intente nuevamente.');
        } finally {
            Components.hideLoading();
        }
    }

    showLoginError(message) {
        const alertElement = document.getElementById('loginAlert');
        if (alertElement) {
            alertElement.textContent = message;
            alertElement.classList.remove('hidden');
        }
    }

    clearLoginErrors() {
        const alertElement = document.getElementById('loginAlert');
        if (alertElement) {
            alertElement.classList.add('hidden');
        }
    }

    // ===== PASSWORD RECOVERY =====
    showPasswordRecovery() {
        const modalHtml = `
            <div class="modal" id="passwordRecoveryModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Recuperar Contraseña</h5>
                            <button type="button" class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="passwordRecoveryForm" data-validate>
                                <div class="form-group">
                                    <label for="recoveryUsername" class="form-label">Usuario</label>
                                    <input type="text" id="recoveryUsername" name="username" class="form-control" required>
                                    <div class="error-message" id="recoveryUsernameError"></div>
                                </div>
                                
                                <div id="securityQuestionSection" class="hidden">
                                    <div class="form-group">
                                        <label id="securityQuestionLabel" class="form-label">Pregunta de Seguridad</label>
                                        <p id="securityQuestionText" class="text-secondary"></p>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="securityAnswer" class="form-label">Respuesta</label>
                                        <input type="text" id="securityAnswer" name="securityAnswer" class="form-control">
                                        <div class="error-message" id="securityAnswerError"></div>
                                    </div>
                                </div>
                                
                                <div id="newPasswordSection" class="hidden">
                                    <div class="form-group">
                                        <label for="newPassword" class="form-label">Nueva Contraseña</label>
                                        <input type="password" id="newPassword" name="newPassword" class="form-control">
                                        <div class="error-message" id="newPasswordError"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                                        <input type="password" id="confirmPassword" name="confirmPassword" class="form-control" data-confirm="newPassword">
                                        <div class="error-message" id="confirmPasswordError"></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-close">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="recoveryNextBtn">Siguiente</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        Components.openModal('passwordRecoveryModal');

        this.initPasswordRecovery();
    }

    initPasswordRecovery() {
        const modal = document.getElementById('passwordRecoveryModal');
        const form = document.getElementById('passwordRecoveryForm');
        const nextBtn = document.getElementById('recoveryNextBtn');
        let currentStep = 1;
        let selectedUser = null;

        nextBtn.addEventListener('click', () => {
            if (currentStep === 1) {
                this.handleRecoveryStep1(form, nextBtn, selectedUser);
            } else if (currentStep === 2) {
                this.handleRecoveryStep2(form, nextBtn, selectedUser);
            } else if (currentStep === 3) {
                this.handleRecoveryStep3(form, modal, selectedUser);
            }
        });

        // Handle step progression
        this.handleRecoveryStep1 = (form, nextBtn, user) => {
            const username = form.username.value.trim();
            if (!username) {
                Components.showAlert('Ingrese un nombre de usuario', 'danger');
                return;
            }

            selectedUser = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (!selectedUser) {
                Components.showAlert('Usuario no encontrado', 'danger');
                return;
            }

            // Show security question
            document.getElementById('securityQuestionText').textContent = selectedUser.securityQuestion;
            document.getElementById('securityQuestionSection').classList.remove('hidden');
            nextBtn.textContent = 'Verificar';
            currentStep = 2;
        };

        this.handleRecoveryStep2 = (form, nextBtn, user) => {
            const answer = form.securityAnswer.value.trim().toLowerCase();
            if (answer !== selectedUser.securityAnswer.toLowerCase()) {
                Components.showAlert('Respuesta incorrecta', 'danger');
                return;
            }

            // Show new password fields
            document.getElementById('newPasswordSection').classList.remove('hidden');
            nextBtn.textContent = 'Cambiar Contraseña';
            currentStep = 3;
        };

        this.handleRecoveryStep3 = (form, modal, user) => {
            const newPassword = form.newPassword.value;
            const confirmPassword = form.confirmPassword.value;

            if (!newPassword || newPassword.length < 6) {
                Components.showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
                return;
            }

            if (newPassword !== confirmPassword) {
                Components.showAlert('Las contraseñas no coinciden', 'danger');
                return;
            }

            // Update password
            selectedUser.password = newPassword;
            this.saveUsers(this.users);

            Components.showAlert('Contraseña actualizada exitosamente', 'success');
            Components.closeModal(modal);
            modal.remove();
        };
    }

    // ===== NAVIGATION =====
    redirectToDashboard() {
        const path = window.location.pathname;
        const last = path.split('/').pop().toLowerCase();
        const isIndex = last === '' || last === 'index.html';
        if (isIndex) {
            window.location.href = 'dashboard.html';
        }
    }

    logout() {
        this.clearSession();
        Components.showAlert('Sesión cerrada exitosamente', 'info', 2000);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // ===== USER MANAGEMENT =====
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAuthenticated() {
        return this.isLoggedIn();
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isAdmin() {
        return this.hasRole('administrador');
    }

    isJefeArea() {
        return this.hasRole('jefe_area');
    }

    isProfesor() {
        return this.currentUser && (this.currentUser.role === 'profesor_animal' || this.currentUser.role === 'profesor_vegetal');
    }

    getProfesorTipo() {
        if (!this.isProfesor()) return null;
        return this.currentUser.role === 'profesor_animal' ? 'animal' : 'vegetal';
    }

    // ===== ROUTE PROTECTION =====
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.requireAuth() || !this.isAdmin()) {
            Components.showAlert('Acceso denegado. Se requieren permisos de administrador.', 'danger');
            return false;
        }
        return true;
    }
}

// Initialize authentication system
const Auth = new AuthSystem();

// Export for use in other modules
window.Auth = Auth;
