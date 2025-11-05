// Sistema de autenticación
const auth = {
    // Credenciales válidas
    validCredentials: {
        'admin': 'admin2608',
        'operador': 'operador123',
        'invitado': 'invitado456'
    },

    // Estado de la sesión
    session: {
        isLoggedIn: false,
        username: null,
        loginTime: null,
        rememberMe: false
    },

    // Elementos del DOM
    elements: {
        loginForm: null,
        usernameInput: null,
        passwordInput: null,
        rememberMeCheckbox: null,
        loginBtn: null,
        btnText: null,
        btnSpinner: null
    },

    // Inicializar
    init: function() {
        this.elements.loginForm = document.getElementById('loginForm');
        this.elements.usernameInput = document.getElementById('username');
        this.elements.passwordInput = document.getElementById('password');
        this.elements.rememberMeCheckbox = document.getElementById('rememberMe');
        this.elements.loginBtn = document.getElementById('loginBtn');
        
        if (this.elements.loginBtn) {
            this.elements.btnText = this.elements.loginBtn.querySelector('.btn-text');
            this.elements.btnSpinner = this.elements.loginBtn.querySelector('.btn-spinner');
        }

        this.loadSession();
        this.bindEvents();
    },

    // Cargar sesión existente
    loadSession: function() {
        const savedSession = utils.storage.get('solarAuthSession');
        
        if (savedSession && savedSession.isLoggedIn) {
            this.session = { ...this.session, ...savedSession };
            
            // Verificar expiración (8 horas)
            const sessionAge = Date.now() - savedSession.loginTime;
            const eightHours = 8 * 60 * 60 * 1000;
            
            if (sessionAge < eightHours) {
                this.redirectToDashboard();
            } else {
                this.clearSession();
            }
        }
    },

    // Vincular eventos
    bindEvents: function() {
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Enter key support
        if (this.elements.passwordInput) {
            this.elements.passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }

        // Auto-focus username
        if (this.elements.usernameInput) {
            this.elements.usernameInput.focus();
        }
    },

    // Manejar login
    handleLogin: function() {
        const username = this.elements.usernameInput.value.trim();
        const password = this.elements.passwordInput.value;
        const rememberMe = this.elements.rememberMeCheckbox.checked;

        if (!username || !password) {
            this.showError('Por favor, completa todos los campos');
            return;
        }

        this.showLoading(true);

        // Simular verificación (en producción sería una llamada a la API)
        setTimeout(() => {
            if (this.authenticate(username, password)) {
                this.loginSuccess(username, rememberMe);
            } else {
                this.loginFailed();
            }
        }, 1500);
    },

    // Autenticar usuario
    authenticate: function(username, password) {
        return this.validCredentials[username] === password;
    },

    // Login exitoso
    loginSuccess: function(username, rememberMe) {
        this.session = {
            isLoggedIn: true,
            username: username,
            loginTime: Date.now(),
            rememberMe: rememberMe
        };

        // Guardar sesión
        if (rememberMe) {
            utils.storage.set('solarAuthSession', this.session);
        } else {
            utils.storage.set('solarAuthSession', this.session);
        }

        // Registrar evento
        this.logLoginEvent(username);

        // Redirigir al dashboard
        this.redirectToDashboard();
    },

    // Login fallido
    loginFailed: function() {
        this.showLoading(false);
        this.showError('Credenciales incorrectas. Intenta nuevamente.');
        
        // Limpiar contraseña y enfocar
        this.elements.passwordInput.value = '';
        this.elements.passwordInput.focus();
        
        // Efecto de shake
        this.shakeForm();
    },

    // Mostrar/ocultar loading
    showLoading: function(show) {
        if (this.elements.btnText && this.elements.btnSpinner) {
            if (show) {
                this.elements.btnText.style.display = 'none';
                this.elements.btnSpinner.style.display = 'block';
                this.elements.loginBtn.disabled = true;
            } else {
                this.elements.btnText.style.display = 'block';
                this.elements.btnSpinner.style.display = 'none';
                this.elements.loginBtn.disabled = false;
            }
        }
    },

    // Mostrar error
    showError: function(message) {
        // Usar el sistema de notificaciones si está disponible
        if (window.utils && utils.notification) {
            utils.notification.show(message, 'error');
        } else {
            // Fallback simple
            alert(message);
        }
    },

    // Efecto shake en el formulario
    shakeForm: function() {
        const form = this.elements.loginForm;
        form.classList.add('shake');
        setTimeout(() => {
            form.classList.remove('shake');
        }, 500);
    },

    // Redirigir al dashboard
    redirectToDashboard: function() {
        window.location.href = 'dashboard.html';
    },

    // Cerrar sesión
    logout: function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.clearSession();
            window.location.href = 'login.html';
        }
    },

    // Limpiar sesión
    clearSession: function() {
        this.session = {
            isLoggedIn: false,
            username: null,
            loginTime: null,
            rememberMe: false
        };
        utils.storage.remove('solarAuthSession');
    },

    // Verificar autenticación en páginas protegidas
    requireAuth: function() {
        const savedSession = utils.storage.get('solarAuthSession');
        
        if (!savedSession || !savedSession.isLoggedIn) {
            window.location.href = 'login.html';
            return false;
        }

        this.session = { ...this.session, ...savedSession };
        return true;
    },

    // Obtener información del usuario actual
    getCurrentUser: function() {
        return this.session.username;
    },

    // Registrar evento de login
    logLoginEvent: function(username) {
        const event = {
            type: 'login',
            username: username,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // Guardar en historial de eventos
        const events = utils.storage.get('systemEvents', []);
        events.unshift(event);
        
        // Mantener solo los últimos 100 eventos
        if (events.length > 100) {
            events.splice(100);
        }
        
        utils.storage.set('systemEvents', events);
    },

    // Verificar permisos
    hasPermission: function(permission) {
        const user = this.session.username;
        const permissions = {
            'admin': ['read', 'write', 'delete', 'admin'],
            'operador': ['read', 'write'],
            'invitado': ['read']
        };

        return permissions[user]?.includes(permission) || false;
    }
};

// Inicializar autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    auth.init();
});

// Exportar para uso global
window.auth = auth;
