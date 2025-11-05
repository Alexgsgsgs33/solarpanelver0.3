// Utilidades generales del sistema

const utils = {
    // Formatear números
    formatNumber: (number, decimals = 0) => {
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },

    // Formatear fechas
    formatDate: (date) => {
        return new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    },

    // Formatear hora
    formatTime: (date) => {
        return new Intl.DateTimeFormat('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);
    },

    // Calcular tiempo transcurrido
    timeAgo: (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'hace unos segundos';
    },

    // Generar ID único
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validar email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // LocalStorage helpers
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    },

    // Theme management
    theme: {
        current: 'light',

        init: () => {
            const savedTheme = utils.storage.get('theme', 'light');
            utils.theme.set(savedTheme);
        },

        set: (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            utils.theme.current = theme;
            utils.storage.set('theme', theme);
            
            // Actualizar ícono del tema
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        },

        toggle: () => {
            const newTheme = utils.theme.current === 'light' ? 'dark' : 'light';
            utils.theme.set(newTheme);
        }
    },

    // Fullscreen management
    fullscreen: {
        toggle: () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error('Error attempting to enable fullscreen:', err);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    },

    // Notification system
    notification: {
        show: (message, type = 'info', duration = 5000) => {
            const container = document.getElementById('notificationContainer');
            if (!container) return;

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${utils.notification.getIcon(type)}</span>
                    <span class="notification-message">${message}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;

            // Agregar estilos si no existen
            if (!document.querySelector('#notification-styles')) {
                const styles = document.createElement('style');
                styles.id = 'notification-styles';
                styles.textContent = utils.notification.getStyles();
                document.head.appendChild(styles);
            }

            container.appendChild(notification);

            // Auto-remove
            if (duration > 0) {
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, duration);
            }

            return notification;
        },

        getIcon: (type) => {
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            return icons[type] || icons.info;
        },

        getStyles: () => `
            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid #3b82f6;
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success { border-left-color: #10b981; }
            .notification-error { border-left-color: #ef4444; }
            .notification-warning { border-left-color: #f59e0b; }
            .notification-info { border-left-color: #3b82f6; }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
            }
            
            .notification-icon { font-size: 16px; }
            .notification-message { flex: 1; font-size: 14px; }
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #6b7280;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `
    },

    // Loading states
    loading: {
        show: (message = 'Cargando...') => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.style.display = 'flex';
                const messageEl = overlay.querySelector('p');
                if (messageEl) messageEl.textContent = message;
            }
        },

        hide: () => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
    },

    // API helpers
    api: {
        baseURL: '', // Configurar según necesidad
        
        request: async (endpoint, options = {}) => {
            const url = utils.api.baseURL + endpoint;
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        },

        get: (endpoint) => utils.api.request(endpoint),
        
        post: (endpoint, data) => 
            utils.api.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            }),
            
        put: (endpoint, data) => 
            utils.api.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            }),
            
        delete: (endpoint) => 
            utils.api.request(endpoint, { method: 'DELETE' })
    }
};

// Inicializar tema al cargar
document.addEventListener('DOMContentLoaded', () => {
    utils.theme.init();
    
    // Actualizar hora en tiempo real
    if (typeof updateDateTime === 'function') {
        setInterval(updateDateTime, 1000);
        updateDateTime();
    }
});

// Exportar para uso global
window.utils = utils;
