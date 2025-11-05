// Manejo de datos en tiempo real para el sistema solar
const realtimeData = {
    // Configuración
    config: {
        updateInterval: 2000, // 2 segundos
        maxDataPoints: 100,
        simulation: true // Cambiar a false cuando se conecte a hardware real
    },

    // Estado de conexión
    connection: {
        isConnected: false,
        lastConnection: null,
        retryCount: 0,
        maxRetries: 5
    },

    // Callbacks para actualizaciones
    callbacks: {
        onDataUpdate: [],
        onConnectionChange: [],
        onError: []
    },

    // Inicializar
    init: function() {
        if (this.config.simulation) {
            this.startSimulation();
        } else {
            this.connectToHardware();
        }

        this.setupEventListeners();
        console.log('Sistema de datos en tiempo real inicializado');
    },

    // Configurar event listeners
    setupEventListeners: function() {
        // Reconexión automática si se pierde la conexión
        window.addEventListener('online', () => {
            this.handleConnectionRestored();
        });

        window.addEventListener('offline', () => {
            this.handleConnectionLost();
        });

        // Visibilidad de la página (pausar/reanudar cuando no está visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });
    },

    // Conectar a hardware real (placeholder)
    connectToHardware: function() {
        console.log('Conectando a hardware del sistema solar...');
        
        // Aquí iría la lógica real de conexión a:
        // - Controladores de carga MPPT
        // - Inversores
        // - Sensores de corriente/voltaje
        // - Sistemas de monitoreo de baterías
        
        this.connection.isConnected = true;
        this.connection.lastConnection = new Date();
        this.notifyConnectionChange();
    },

    // Iniciar simulación (para desarrollo/demo)
    startSimulation: function() {
        console.log('Iniciando simulación de datos del sistema solar');
        
        this.connection.isConnected = true;
        this.connection.lastConnection = new Date();
        this.notifyConnectionChange();

        // Generar datos iniciales
        this.generateInitialData();

        // Iniciar actualizaciones periódicas
        this.updateInterval = setInterval(() => {
            this.generateNewDataPoint();
        }, this.config.updateInterval);
    },

    // Generar datos iniciales
    generateInitialData: function() {
        const now = new Date();
        this.data = {
            timestamps: [],
            voltage: [],
            current: [],
            power: [],
            temperature: 25,
            humidity: 45,
            solarRadiation: 0,
            batteryLevel: 85,
            mode: 'charging'
        };

        // Generar 10 puntos de datos iniciales
        for (let i = 10; i > 0; i--) {
            const timestamp = new Date(now.getTime() - (i * this.config.updateInterval));
            this.addDataPoint(timestamp, true);
        }
    },

    // Generar nuevo punto de datos
    generateNewDataPoint: function() {
        const timestamp = new Date();
        this.addDataPoint(timestamp, false);
    },

    // Agregar punto de datos
    addDataPoint: function(timestamp, isInitial = false) {
        const data = this.calculateSimulatedData(timestamp);
        
        this.data.timestamps.push(timestamp);
        this.data.voltage.push(data.voltage);
        this.data.current.push(data.current);
        this.data.power.push(data.power);
        
        // Actualizar datos ambientales ocasionalmente
        if (Math.random() < 0.1) {
            this.data.temperature = data.temperature;
            this.data.humidity = data.humidity;
            this.data.solarRadiation = data.solarRadiation;
        }

        // Actualizar estado de la batería
        this.data.batteryLevel = data.batteryLevel;
        this.data.mode = data.mode;

        // Limitar cantidad de datos
        if (this.data.timestamps.length > this.config.maxDataPoints) {
            this.data.timestamps.shift();
            this.data.voltage.shift();
            this.data.current.shift();
            this.data.power.shift();
        }

        // Notificar a los suscriptores
        if (!isInitial) {
            this.notifyDataUpdate();
        }
    },

    // Calcular datos simulados
    calculateSimulatedData: function(timestamp) {
        const hour = timestamp.getHours();
        const minute = timestamp.getMinutes();
        
        // Simular ciclo solar diario
        let solarIntensity = 0;
        if (hour >= 6 && hour <= 18) {
            const solarHour = (hour - 6) + (minute / 60);
            solarIntensity = Math.sin(solarHour * Math.PI / 12);
        }

        // Voltaje del sistema (48V nominal)
        const baseVoltage = 48;
        const voltageVariation = (Math.random() - 0.5) * 2; // ±1V
        const voltage = baseVoltage + voltageVariation + (solarIntensity * 2);

        // Corriente basada en intensidad solar y carga
        const baseCurrent = solarIntensity * 10; // 0-10A basado en sol
        const loadVariation = Math.random() * 3; // Variación de carga 0-3A
        const current = Math.max(0, baseCurrent + loadVariation);

        // Potencia calculada
        const power = voltage * current;

        // Temperatura ambiental
        const baseTemp = 25;
        const tempVariation = solarIntensity * 10; // Más caliente con sol
        const randomTemp = (Math.random() - 0.5) * 5;
        const temperature = baseTemp + tempVariation + randomTemp;

        // Humedad (inversamente relacionada con temperatura)
        const baseHumidity = 50;
        const humidityVariation = -tempVariation * 2;
        const randomHumidity = (Math.random() - 0.5) * 10;
        const humidity = Math.max(20, Math.min(80, baseHumidity + humidityVariation + randomHumidity));

        // Radiación solar
        const solarRadiation = Math.round(solarIntensity * 1000);

        // Nivel de batería (se carga durante el día, descarga durante la noche)
        let batteryLevel = this.data?.batteryLevel || 85;
        if (solarIntensity > 0.3) {
            // Cargando
            batteryLevel = Math.min(100, batteryLevel + (solarIntensity * 0.5));
        } else {
            // Descargando (más rápido si hay carga)
            const dischargeRate = 0.1 + (current > 2 ? 0.2 : 0);
            batteryLevel = Math.max(20, batteryLevel - dischargeRate);
        }

        // Modo de operación
        let mode = 'standby';
        if (solarIntensity > 0.5 && batteryLevel < 95) {
            mode = 'charging';
        } else if (current > 2) {
            mode = 'discharging';
        } else if (solarIntensity > 0.1) {
            mode = 'generating';
        }

        return {
            voltage: parseFloat(voltage.toFixed(2)),
            current: parseFloat(current.toFixed(2)),
            power: parseFloat(power.toFixed(1)),
            temperature: parseFloat(temperature.toFixed(1)),
            humidity: parseFloat(humidity.toFixed(1)),
            solarRadiation: solarRadiation,
            batteryLevel: parseFloat(batteryLevel.toFixed(1)),
            mode: mode
        };
    },

    // Suscribirse a actualizaciones de datos
    subscribe: function(callback, type = 'dataUpdate') {
        if (this.callbacks[type]) {
            this.callbacks[type].push(callback);
        }
    },

    // Desuscribirse
    unsubscribe: function(callback, type = 'dataUpdate') {
        if (this.callbacks[type]) {
            this.callbacks[type] = this.callbacks[type].filter(cb => cb !== callback);
        }
    },

    // Notificar actualización de datos
    notifyDataUpdate: function() {
        const data = this.getCurrentData();
        this.callbacks.onDataUpdate.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error en callback de actualización de datos:', error);
            }
        });
    },

    // Notificar cambio de conexión
    notifyConnectionChange: function() {
        this.callbacks.onConnectionChange.forEach(callback => {
            try {
                callback(this.connection.isConnected);
            } catch (error) {
                console.error('Error en callback de cambio de conexión:', error);
            }
        });
    },

    // Notificar error
    notifyError: function(error) {
        this.callbacks.onError.forEach(callback => {
            try {
                callback(error);
            } catch (error) {
                console.error('Error en callback de error:', error);
            }
        });
    },

    // Obtener datos actuales
    getCurrentData: function() {
        return {
            ...this.data,
            isConnected: this.connection.isConnected,
            lastUpdate: new Date(),
            dataPoints: this.data.timestamps.length
        };
    },

    // Obtener datos históricos
    getHistoricalData: function(hours = 24) {
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        const indices = [];
        
        for (let i = 0; i < this.data.timestamps.length; i++) {
            if (this.data.timestamps[i] >= cutoffTime) {
                indices.push(i);
            }
        }

        return {
            timestamps: indices.map(i => this.data.timestamps[i]),
            voltage: indices.map(i => this.data.voltage[i]),
            current: indices.map(i => this.data.current[i]),
            power: indices.map(i => this.data.power[i])
        };
    },

    // Manejar pérdida de conexión
    handleConnectionLost: function() {
        if (this.connection.isConnected) {
            this.connection.isConnected = false;
            this.notifyConnectionChange();
            this.notifyError(new Error('Conexión perdida con el sistema solar'));
            
            // Intentar reconexión
            this.attemptReconnection();
        }
    },

    // Manejar restauración de conexión
    handleConnectionRestored: function() {
        if (!this.connection.isConnected) {
            this.connection.isConnected = true;
            this.connection.retryCount = 0;
            this.connection.lastConnection = new Date();
            this.notifyConnectionChange();
            utils.notification.show('Conexión restaurada con el sistema solar', 'success');
        }
    },

    // Intentar reconexión
    attemptReconnection: function() {
        if (this.connection.retryCount < this.connection.maxRetries) {
            this.connection.retryCount++;
            
            setTimeout(() => {
                if (this.config.simulation) {
                    this.connection.isConnected = true;
                    this.notifyConnectionChange();
                    utils.notification.show('Conexión simulada restaurada', 'info');
                } else {
                    this.connectToHardware();
                }
            }, Math.pow(2, this.connection.retryCount) * 1000); // Backoff exponencial
        } else {
            this.notifyError(new Error('No se pudo restaurar la conexión después de múltiples intentos'));
        }
    },

    // Pausar actualizaciones
    pauseUpdates: function() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    // Reanudar actualizaciones
    resumeUpdates: function() {
        if (!this.updateInterval && this.connection.isConnected) {
            this.updateInterval = setInterval(() => {
                this.generateNewDataPoint();
            }, this.config.updateInterval);
        }
    },

    // Cambiar entre simulación y hardware real
    setSimulationMode: function(enabled) {
        this.config.simulation = enabled;
        
        // Reiniciar el sistema
        this.pauseUpdates();
        
        if (enabled) {
            this.startSimulation();
        } else {
            this.connectToHardware();
        }
    },

    // Configurar intervalo de actualización
    setUpdateInterval: function(interval) {
        this.config.updateInterval = interval;
        
        if (this.updateInterval) {
            this.pauseUpdates();
            this.resumeUpdates();
        }
    },

    // Limpiar recursos
    destroy: function() {
        this.pauseUpdates();
        this.callbacks = {
            onDataUpdate: [],
            onConnectionChange: [],
            onError: []
        };
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    realtimeData.init();
});

// Exportar para uso global
window.realtimeData = realtimeData;
