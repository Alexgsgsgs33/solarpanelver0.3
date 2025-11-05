// Sistema de notificaciones para el dashboard solar
const notifications = {
    // Configuración
    config: {
        maxNotifications: 5,
        autoRemove: true,
        defaultDuration: 5000,
        position: 'top-right'
    },

    // Estado
    state: {
        notifications: [],
        isPaused: false,
        soundEnabled: true
    },

    // Tipos de notificación
    types: {
        info: {
            icon: 'ℹ️',
            color: '#3b82f6',
            sound: 'info'
        },
        success: {
            icon: '✅',
            color: '#10b981',
            sound: 'success'
        },
        warning: {
            icon: '⚠️',
            color: '#f59e0b',
            sound: 'warning'
        },
        error: {
            icon: '❌',
            color: '#ef4444',
            sound: 'error'
        },
        critical: {
            icon: '🚨',
            color: '#dc2626',
            sound: 'critical'
        }
    },

    // Inicializar
    init: function() {
        this.createContainer();
        this.loadSettings();
        this.setupEventListeners();
        console.log('Sistema de notificaciones inicializado');
    },

    // Crear contenedor de notificaciones
    createContainer: function() {
        let container = document.getElementById('notificationContainer');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = `notification-container ${this.config.position}`;
            document.body.appendChild(container);
        }

        this.container = container;
    },

    // Cargar configuración
    loadSettings: function() {
        const settings = utils.storage.get('notificationSettings', {});
        this.config = { ...this.config, ...settings };
    },

    // Guardar configuración
    saveSettings: function() {
        utils.storage.set('notificationSettings', this.config);
    },

    // Configurar event listeners
    setupEventListeners: function() {
        // Escuchar eventos del sistema
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.togglePause();
            }
        });

        // Suscribirse a eventos del sistema solar
        if (window.realtimeData) {
            realtimeData.subscribe(this.handleSystemData.bind(this), 'dataUpdate');
            realtimeData.subscribe(this.handleConnectionChange.bind(this), 'connectionChange');
            realtimeData.subscribe(this.handleSystemError.bind(this), 'error');
        }
    },

    // Mostrar notificación
    show: function(message, type = 'info', options = {}) {
        if (this.state.isPaused && !options.force) {
            return null;
        }

        const notification = {
            id: utils.generateId(),
            message: message,
            type: type,
            timestamp: new Date(),
            duration: options.duration || this.config.defaultDuration,
            actions: options.actions || [],
            persistent: options.persistent || false
        };

        // Agregar a la lista
        this.state.notifications.unshift(notification);

        // Limitar cantidad
        if (this.state.notifications.length > this.config.maxNotifications) {
            this.remove(this.state.notifications[this.config.maxNotifications].id);
        }

        // Crear elemento DOM
        this.createNotificationElement(notification);

        // Reproducir sonido
        if (this.state.soundEnabled && !options.silent) {
            this.playSound(type);
        }

        // Disparar evento personalizado
        this.dispatchEvent('notificationShow', notification);

        return notification.id;
    },

    // Crear elemento de notificación
    createNotificationElement: function(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.setAttribute('data-id', notification.id);

        const typeConfig = this.types[notification.type] || this.types.info;

        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${typeConfig.icon}</div>
                <div class="notification-body">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${utils.formatTime(notification.timestamp)}</div>
                </div>
                <div class="notification-actions">
                    ${notification.actions.map(action => `
                        <button class="notification-action" onclick="notifications.handleAction('${notification.id}', '${action.id}')">
                            ${action.label}
                        </button>
                    `).join('')}
                    <button class="notification-close" onclick="notifications.remove('${notification.id}')">
                        ×
                    </button>
                </div>
            </div>
            ${!notification.persistent ? `<div class="notification-progress"></div>` : ''}
        `;

        // Estilos dinámicos
        element.style.setProperty('--notification-color', typeConfig.color);

        // Agregar al contenedor
        this.container.appendChild(element);

        // Animación de entrada
        setTimeout(() => {
            element.classList.add('show');
        }, 10);

        // Auto-remove si está configurado
        if (this.config.autoRemove && !notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        // Barra de progreso para auto-remove
        if (!notification.persistent && notification.duration > 0) {
            const progressBar = element.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.animation = `progress ${notification.duration}ms linear`;
            }
        }

        return element;
    },

    // Remover notificación
    remove: function(notificationId) {
        const element = this.container.querySelector(`[data-id="${notificationId}"]`);
        if (element) {
            element.classList.remove('show');
            element.classList.add('hide');
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }

        // Remover del estado
        this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId);

        // Disparar evento
        this.dispatchEvent('notificationRemove', { id: notificationId });
    },

    // Limpiar todas las notificaciones
    clearAll: function() {
        this.state.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    },

    // Manejar acción de notificación
    handleAction: function(notificationId, actionId) {
        const notification = this.state.notifications.find(n => n.id === notificationId);
        if (notification) {
            const action = notification.actions.find(a => a.id === actionId);
            if (action && action.callback) {
                action.callback(notification);
            }
        }

        this.remove(notificationId);
    },

    // Reproducir sonido
    playSound: function(type) {
        // En una implementación real, aquí se reproducirían sonidos diferentes
        // según el tipo de notificación
        console.log(`Reproduciendo sonido para notificación: ${type}`);
    },

    // Alternar pausa
    togglePause: function() {
        this.state.isPaused = !this.state.isPaused;
        
        if (this.state.isPaused) {
            this.show('Notificaciones pausadas (Ctrl+K para reanudar)', 'info', { persistent: true });
        } else {
            this.show('Notificaciones reanudadas', 'success', { duration: 2000 });
        }

        return this.state.isPaused;
    },

    // Alternar sonido
    toggleSound: function() {
        this.state.soundEnabled = !this.state.soundEnabled;
        utils.storage.set('notificationSound', this.state.soundEnabled);
        
        const message = this.state.soundEnabled ? 'Sonido activado' : 'Sonido desactivado';
        this.show(message, 'info', { duration: 2000 });
        
        return this.state.soundEnabled;
    },

    // Manejar datos del sistema
    handleSystemData: function(data) {
        // Notificaciones basadas en cambios en los datos del sistema
        const recentNotifications = this.state.notifications.slice(0, 3);
        const hasRecentPowerAlert = recentNotifications.some(n => 
            n.message.includes('Potencia') && (Date.now() - n.timestamp.getTime()) < 30000
        );

        // Alerta de alta potencia
        if (data.power > 800 && !hasRecentPowerAlert) {
            this.show(
                `Alta generación de potencia: ${Math.round(data.power)}W`,
                'success',
                { duration: 5000 }
            );
        }

        // Alerta de baja potencia
        if (data.power < 50 && data.mode !== 'night') {
            this.show(
                'Baja generación de potencia - Verificar paneles',
                'warning',
                { duration: 8000 }
            );
        }

        // Alerta de voltaje crítico
        if (data.voltage > 52) {
            this.show(
                `Voltaje elevado: ${data.voltage.toFixed(1)}V - Verificar regulador`,
                'warning',
                { 
                    duration: 10000,
                    actions: [
                        {
                            id: 'acknowledge',
                            label: 'Entendido',
                            callback: () => console.log('Alerta de voltaje reconocida')
                        }
                    ]
                }
            );
        }

        if (data.voltage < 44) {
            this.show(
                `Voltaje crítico: ${data.voltage.toFixed(1)}V - Sistema en riesgo`,
                'critical',
                { 
                    persistent: true,
                    actions: [
                        {
                            id: 'acknowledge',
                            label: 'Reconocer',
                            callback: () => console.log('Alerta crítica reconocida')
                        },
                        {
                            id: 'override',
                            label: 'Anular',
                            callback: () => console.log('Alerta crítica anulada')
                        }
                    ]
                }
            );
        }
    },

    // Manejar cambio de conexión
    handleConnectionChange: function(isConnected) {
        if (isConnected) {
            this.show('Conexión con el sistema solar establecida', 'success', { duration: 3000 });
        } else {
            this.show(
                'Conexión perdida con el sistema solar',
                'error',
                { 
                    persistent: true,
                    actions: [
                        {
                            id: 'reconnect',
                            label: 'Reconectar',
                            callback: () => realtimeData.connectToHardware()
                        }
                    ]
                }
            );
        }
    },

    // Manejar error del sistema
    handleSystemError: function(error) {
        this.show(
            `Error del sistema: ${error.message}`,
            'error',
            { 
                duration: 10000,
                actions: [
                    {
                        id: 'details',
                        label: 'Detalles',
                        callback: () => this.showErrorDetails(error)
                    }
                ]
            }
        );
    },

    // Mostrar detalles de error
    showErrorDetails: function(error) {
        this.show(
            `Detalles del error: ${error.stack || 'No hay más detalles'}`,
            'info',
            { duration: 15000 }
        );
    },

    // Disparar evento personalizado
    dispatchEvent: function(eventName, detail) {
        const event = new CustomEvent(`notification:${eventName}`, { detail });
        document.dispatchEvent(event);
    },

    // Obtener estadísticas
    getStats: function() {
        return {
            total: this.state.notifications.length,
            byType: this.state.notifications.reduce((acc, notification) => {
                acc[notification.type] = (acc[notification.type] || 0) + 1;
                return acc;
            }, {}),
            active: this.state.notifications.filter(n => !n.persistent).length,
            persistent: this.state.notifications.filter(n => n.persistent).length
        };
    },

    // Exportar historial
    exportHistory: function() {
        const history = {
            exportedAt: new Date().toISOString(),
            notifications: this.state.notifications.map(n => ({
                ...n,
                timestamp: n.timestamp.toISOString()
            }))
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `notifications_history_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        this.show('Historial de notificaciones exportado', 'success');
    },

    // Configurar posición
    setPosition: function(position) {
        const validPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
        if (validPositions.includes(position)) {
            this.config.position = position;
            this.container.className = `notification-container ${position}`;
            this.saveSettings();
        }
    },

    // Destruir instancia
    destroy: function() {
        this.clearAll();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    notifications.init();
});

// Exportar para uso global
window.notifications = notifications;

// Estilos CSS para las notificaciones (inyectados dinámicamente)
const notificationStyles = `
.notification-container {
    position: fixed;
    z-index: 10000;
    max-width: 400px;
    pointer-events: none;
}

.notification-container.top-right {
    top: 20px;
    right: 20px;
}

.notification-container.top-left {
    top: 20px;
    left: 20px;
}

.notification-container.bottom-right {
    bottom: 20px;
    right: 20px;
}

.notification-container.bottom-left {
    bottom: 20px;
    left: 20px;
}

.notification {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    margin-bottom: 12px;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: all;
    position: relative;
    overflow: hidden;
    border-left: 4px solid var(--notification-color, #3b82f6);
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification.hide {
    transform: translateX(100%);
    opacity: 0;
}

.notification-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    position: relative;
    z-index: 2;
}

.notification-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.notification-body {
    flex: 1;
    min-width: 0;
}

.notification-message {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
    line-height: 1.4;
}

.notification-time {
    font-size: 12px;
    color: #6b7280;
}

.notification-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.notification-action {
    background: none;
    border: 1px solid #e5e7eb;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #6b7280;
}

.notification-action:hover {
    background: #f3f4f6;
    color: #374151;
}

.notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #9ca3af;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.notification-close:hover {
    background: #f3f4f6;
    color: #374151;
}

.notification-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: var(--notification-color, #3b82f6);
    transform-origin: left;
}

@keyframes progress {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
}

/* Tipos de notificación */
.notification-info {
    border-left-color: #3b82f6;
}

.notification-success {
    border-left-color: #10b981;
}

.notification-warning {
    border-left-color: #f59e0b;
}

.notification-error {
    border-left-color: #ef4444;
}

.notification-critical {
    border-left-color: #dc2626;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
    50% { box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3); }
}
`;

// Inyectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
