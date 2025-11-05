// Dashboard principal del sistema solar
const dashboard = {
    // Estado del sistema
    systemState: {
        voltage: 0,
        current: 0,
        power: 0,
        mode: 'desconocido',
        lastUpdate: null,
        isOnline: false
    },

    // Datos en tiempo real
    realtimeData: {
        powerHistory: [],
        voltageHistory: [],
        currentHistory: [],
        timestamps: []
    },

    // Elementos del DOM
    elements: {},

    // Inicializar dashboard
    init: function() {
        // Verificar autenticación
        if (!auth.requireAuth()) {
            return;
        }

        this.initializeElements();
        this.bindEvents();
        this.startRealtimeUpdates();
        this.updateUserInfo();
        this.initializeCharts();
        this.loadInitialData();
        
        console.log('Dashboard inicializado correctamente');
    },

    // Inicializar elementos del DOM
    initializeElements: function() {
        this.elements = {
            // Métricas del sistema
            systemVoltage: document.getElementById('systemVoltage'),
            systemCurrent: document.getElementById('systemCurrent'),
            systemPower: document.getElementById('systemPower'),
            operationMode: document.getElementById('operationMode'),
            modeValue: document.getElementById('modeValue'),
            modeDescription: document.getElementById('modeDescription'),
            
            // Tendencias
            voltageTrend: document.getElementById('voltageTrend'),
            currentTrend: document.getElementById('currentTrend'),
            powerTrend: document.getElementById('powerTrend'),
            
            // Barras de rango
            voltageFill: document.getElementById('voltageFill'),
            currentFill: document.getElementById('currentFill'),
            powerFill: document.getElementById('powerFill'),
            
            // Eficiencia
            panelEfficiency: document.getElementById('panelEfficiency'),
            batteryEfficiency: document.getElementById('batteryEfficiency'),
            conversionEfficiency: document.getElementById('conversionEfficiency'),
            panelEfficiencyFill: document.getElementById('panelEfficiencyFill'),
            batteryEfficiencyFill: document.getElementById('batteryEfficiencyFill'),
            conversionEfficiencyFill: document.getElementById('conversionEfficiencyFill'),
            
            // Consumo
            totalEnergyConsumed: document.getElementById('totalEnergyConsumed'),
            activeDevices: document.getElementById('activeDevices'),
            totalChargeTime: document.getElementById('totalChargeTime'),
            sessionsList: document.getElementById('sessionsList'),
            
            // Alertas
            alertCount: document.getElementById('alertCount'),
            criticalAlerts: document.getElementById('criticalAlerts'),
            warningAlerts: document.getElementById('warningAlerts'),
            infoAlerts: document.getElementById('infoAlerts'),
            alertsList: document.getElementById('alertsList'),
            
            // Tiempo y fecha
            currentTime: document.getElementById('currentTime'),
            currentDate: document.getElementById('currentDate'),
            lastUpdateTime: document.getElementById('lastUpdateTime'),
            
            // Estadísticas de energía
            energySaved: document.getElementById('energySaved'),
            maxPower: document.getElementById('maxPower'),
            minPower: document.getElementById('minPower'),
            avgPower: document.getElementById('avgPower'),
            
            // Información ambiental
            temperature: document.getElementById('temperature'),
            solarRadiation: document.getElementById('solarRadiation'),
            humidity: document.getElementById('humidity'),
            
            // Sistema
            systemUptime: document.getElementById('systemUptime'),
            dataPoints: document.getElementById('dataPoints'),
            panelsOnline: document.getElementById('panelsOnline')
        };
    },

    // Vincular eventos
    bindEvents: function() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // User menu
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userMenuDropdown = document.getElementById('userMenuDropdown');
        
        if (userMenuBtn && userMenuDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('show');
            });

            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', () => {
                userMenuDropdown.classList.remove('show');
            });
        }

        // Filtros de gráficos
        const powerTimeRange = document.getElementById('powerTimeRange');
        if (powerTimeRange) {
            powerTimeRange.addEventListener('change', (e) => {
                this.handleTimeRangeChange(e.target.value);
            });
        }

        // Navegación del sidebar
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.getAttribute('href'));
            });
        });
    },

    // Actualizar información del usuario
    updateUserInfo: function() {
        const username = auth.getCurrentUser();
        
        // Actualizar en sidebar
        const userNameElements = document.querySelectorAll('#userName, #userNameSm');
        userNameElements.forEach(el => {
            if (el) el.textContent = username;
        });

        // Actualizar en actividades
        this.addActivity(`Sesión iniciada - Usuario: ${username}`);
    },

    // Manejar navegación
    handleNavigation: function(section) {
        // Actualizar título de página
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const sectionNames = {
                '#dashboard': 'Dashboard Principal',
                '#panels': 'Paneles Solares',
                '#batteries': 'Sistema de Baterías',
                '#consumption': 'Consumo Energético',
                '#reports': 'Reportes del Sistema',
                '#settings': 'Configuración'
            };
            
            pageTitle.textContent = sectionNames[section] || 'Dashboard Principal';
        }

        // Actualizar breadcrumb
        const breadcrumbActive = document.querySelector('.breadcrumb-active');
        if (breadcrumbActive) {
            breadcrumbActive.textContent = section.replace('#', '');
        }

        // Actualizar navegación activa
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const activeNav = document.querySelector(`.nav-link[href="${section}"]`).parentElement;
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // Aquí podrías cargar contenido específico de la sección
        console.log(`Navegando a: ${section}`);
    },

    // Manejar cambio de rango de tiempo
    handleTimeRangeChange: function(range) {
        console.log(`Cambiando rango de tiempo a: ${range}`);
        // En una implementación real, esto recargaría los datos del gráfico
        utils.notification.show(`Rango de tiempo actualizado: ${range}`, 'info');
    },

    // Iniciar actualizaciones en tiempo real
    startRealtimeUpdates: function() {
        // Simular datos en tiempo real cada 2 segundos
        setInterval(() => {
            this.updateRealtimeData();
        }, 2000);

        // Actualizar hora cada segundo
        setInterval(() => {
            this.updateDateTime();
        }, 1000);

        console.log('Sistema de actualizaciones en tiempo real iniciado');
    },

    // Actualizar fecha y hora
    updateDateTime: function() {
        const now = new Date();
        
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = utils.formatTime(now);
        }
        
        if (this.elements.currentDate) {
            this.elements.currentDate.textContent = utils.formatDate(now);
        }
    },

    // Actualizar datos en tiempo real
    updateRealtimeData: function() {
        // Simular datos del sistema solar
        this.simulateSolarData();
        
        // Actualizar UI
        this.updateSystemMetrics();
        this.updateEfficiencyMetrics();
        this.updateCharts();
        this.updateAlerts();
        this.updateActivity();
        
        // Actualizar timestamp
        this.systemState.lastUpdate = new Date();
        if (this.elements.lastUpdateTime) {
            this.elements.lastUpdateTime.textContent = 'hace unos segundos';
        }
    },

    // Simular datos del sistema solar
    simulateSolarData: function() {
        const now = new Date();
        const hour = now.getHours();
        
        // Simular variación basada en la hora del día
        let basePower = 600; // Watts base
        
        if (hour >= 6 && hour <= 18) {
            // Horas de sol
            const solarIntensity = Math.sin((hour - 6) * Math.PI / 12);
            basePower = 200 + solarIntensity * 800;
        } else {
            // Noche
            basePower = 50 + Math.random() * 100;
        }

        // Agregar variación aleatoria
        const variation = (Math.random() - 0.5) * 100;
        const power = Math.max(0, basePower + variation);
        
        // Calcular voltaje y corriente (relaciones típicas de sistemas solares)
        const voltage = 48 + (Math.random() - 0.5) * 4; // 46-50V típico para 48V systems
        const current = power / voltage;

        // Actualizar estado del sistema
        this.systemState.voltage = voltage;
        this.systemState.current = current;
        this.systemState.power = power;
        this.systemState.isOnline = true;
        
        // Determinar modo de operación basado en la potencia
        if (power > 700) {
            this.systemState.mode = 'Generación Máxima';
        } else if (power > 300) {
            this.systemState.mode = 'Generación Normal';
        } else if (power > 100) {
            this.systemState.mode = 'Generación Mínima';
        } else {
            this.systemState.mode = 'Modo Noche/Baterías';
        }

        // Agregar a historial para gráficos
        this.addToHistory(voltage, current, power);
    },

    // Agregar datos al historial
    addToHistory: function(voltage, current, power) {
        const now = new Date();
        
        this.realtimeData.voltageHistory.push(voltage);
        this.realtimeData.currentHistory.push(current);
        this.realtimeData.powerHistory.push(power);
        this.realtimeData.timestamps.push(now);

        // Mantener solo los últimos 100 puntos de datos
        const maxPoints = 100;
        if (this.realtimeData.powerHistory.length > maxPoints) {
            this.realtimeData.voltageHistory.shift();
            this.realtimeData.currentHistory.shift();
            this.realtimeData.powerHistory.shift();
            this.realtimeData.timestamps.shift();
        }
    },

    // Actualizar métricas del sistema
    updateSystemMetrics: function() {
        const state = this.systemState;
        
        // Actualizar valores principales
        if (this.elements.systemVoltage) {
            this.elements.systemVoltage.textContent = `${state.voltage.toFixed(1)} V`;
        }
        
        if (this.elements.systemCurrent) {
            this.elements.systemCurrent.textContent = `${state.current.toFixed(2)} A`;
        }
        
        if (this.elements.systemPower) {
            this.elements.systemPower.textContent = `${Math.round(state.power)} W`;
        }
        
        if (this.elements.modeValue) {
            this.elements.modeValue.textContent = state.mode;
        }

        // Actualizar barras de progreso
        this.updateProgressBars();
        
        // Actualizar tendencias
        this.updateTrends();
    },

    // Actualizar barras de progreso
    updateProgressBars: function() {
        const state = this.systemState;
        
        // Voltaje (0-60V)
        if (this.elements.voltageFill) {
            const voltagePercent = (state.voltage / 60) * 100;
            this.elements.voltageFill.style.width = `${Math.min(100, voltagePercent)}%`;
        }
        
        // Corriente (0-20A)
        if (this.elements.currentFill) {
            const currentPercent = (state.current / 20) * 100;
            this.elements.currentFill.style.width = `${Math.min(100, currentPercent)}%`;
        }
        
        // Potencia (0-1200W)
        if (this.elements.powerFill) {
            const powerPercent = (state.power / 1200) * 100;
            this.elements.powerFill.style.width = `${Math.min(100, powerPercent)}%`;
        }
    },

    // Actualizar tendencias
    updateTrends: function() {
        // Simular tendencias basadas en datos recientes
        const history = this.realtimeData.powerHistory;
        if (history.length < 2) return;

        const current = history[history.length - 1];
        const previous = history[history.length - 2];
        const trend = current - previous;

        let trendIcon, trendText, trendClass;
        
        if (Math.abs(trend) < 10) {
            trendIcon = '→';
            trendText = 'Estable';
            trendClass = '';
        } else if (trend > 0) {
            trendIcon = '↗';
            trendText = 'Subiendo';
            trendClass = 'trend-up';
        } else {
            trendIcon = '↘';
            trendText = 'Bajando';
            trendClass = 'trend-down';
        }

        // Aplicar a todos los trend elements
        const trendElements = [
            this.elements.voltageTrend,
            this.elements.currentTrend,
            this.elements.powerTrend
        ];

        trendElements.forEach(element => {
            if (element) {
                const icon = element.querySelector('.trend-icon');
                const text = element.querySelector('.trend-text');
                
                if (icon) icon.textContent = trendIcon;
                if (text) text.textContent = trendText;
                
                element.className = `metric-trend ${trendClass}`;
            }
        });
    },

    // Actualizar métricas de eficiencia
    updateEfficiencyMetrics: function() {
        // Simular eficiencias (en un sistema real vendrían de sensores)
        const panelEff = 85 + Math.random() * 10; // 85-95%
        const batteryEff = 92 + Math.random() * 5; // 92-97%
        const conversionEff = 96 + Math.random() * 3; // 96-99%

        if (this.elements.panelEfficiency) {
            this.elements.panelEfficiency.textContent = `${Math.round(panelEff)}%`;
        }
        if (this.elements.batteryEfficiency) {
            this.elements.batteryEfficiency.textContent = `${Math.round(batteryEff)}%`;
        }
        if (this.elements.conversionEfficiency) {
            this.elements.conversionEfficiency.textContent = `${Math.round(conversionEff)}%`;
        }

        // Actualizar barras de eficiencia
        if (this.elements.panelEfficiencyFill) {
            this.elements.panelEfficiencyFill.style.width = `${panelEff}%`;
        }
        if (this.elements.batteryEfficiencyFill) {
            this.elements.batteryEfficiencyFill.style.width = `${batteryEff}%`;
        }
        if (this.elements.conversionEfficiencyFill) {
            this.elements.conversionEfficiencyFill.style.width = `${conversionEff}%`;
        }
    },

    // Inicializar gráficos
    initializeCharts: function() {
        // Los gráficos se inicializan en solar-charts.js
        if (window.solarCharts) {
            solarCharts.init();
        }
    },

    // Actualizar gráficos
    updateCharts: function() {
        if (window.solarCharts) {
            solarCharts.updateData(
                this.realtimeData.timestamps,
                this.realtimeData.powerHistory,
                this.realtimeData.voltageHistory,
                this.realtimeData.currentHistory
            );
        }

        // Actualizar estadísticas del gráfico de potencia
        this.updatePowerStats();
    },

    // Actualizar estadísticas de potencia
    updatePowerStats: function() {
        const powerData = this.realtimeData.powerHistory;
        if (powerData.length === 0) return;

        const maxPower = Math.max(...powerData);
        const minPower = Math.min(...powerData);
        const avgPower = powerData.reduce((a, b) => a + b, 0) / powerData.length;

        if (this.elements.maxPower) {
            this.elements.maxPower.textContent = `${Math.round(maxPower)} W`;
        }
        if (this.elements.minPower) {
            this.elements.minPower.textContent = `${Math.round(minPower)} W`;
        }
        if (this.elements.avgPower) {
            this.elements.avgPower.textContent = `${Math.round(avgPower)} W`;
        }
    },

    // Actualizar alertas
    updateAlerts: function() {
        // Simular alertas del sistema
        this.simulateAlerts();
    },

    // Simular alertas del sistema
    simulateAlerts: function() {
        const alerts = [];
        const state = this.systemState;

        // Alertas basadas en el estado del sistema
        if (state.voltage > 52) {
            alerts.push({
                type: 'warning',
                title: 'Voltaje Elevado',
                message: `Voltaje del sistema: ${state.voltage.toFixed(1)}V`,
                timestamp: new Date()
            });
        }

        if (state.voltage < 44) {
            alerts.push({
                type: 'critical',
                title: 'Voltaje Bajo',
                message: `Voltaje crítico: ${state.voltage.toFixed(1)}V`,
                timestamp: new Date()
            });
        }

        if (state.power > 1000) {
            alerts.push({
                type: 'info',
                title: 'Alta Generación',
                message: `Generando ${Math.round(state.power)}W - Máxima eficiencia`,
                timestamp: new Date()
            });
        }

        // Actualizar contadores
        this.updateAlertCounters(alerts);
        
        // Actualizar lista de alertas (solo si hay cambios)
        if (alerts.length > 0) {
            this.updateAlertsList(alerts);
        }
    },

    // Actualizar contadores de alertas
    updateAlertCounters: function(alerts) {
        const counts = {
            critical: alerts.filter(a => a.type === 'critical').length,
            warning: alerts.filter(a => a.type === 'warning').length,
            info: alerts.filter(a => a.type === 'info').length
        };

        if (this.elements.criticalAlerts) {
            this.elements.criticalAlerts.textContent = counts.critical;
        }
        if (this.elements.warningAlerts) {
            this.elements.warningAlerts.textContent = counts.warning;
        }
        if (this.elements.infoAlerts) {
            this.elements.infoAlerts.textContent = counts.info;
        }

        // Total de alertas
        const total = counts.critical + counts.warning;
        if (this.elements.alertCount) {
            this.elements.alertCount.textContent = total;
            this.elements.alertCount.style.display = total > 0 ? 'flex' : 'none';
        }
    },

    // Actualizar lista de alertas
    updateAlertsList: function(alerts) {
        if (!this.elements.alertsList) return;

        // Mantener solo las alertas recientes (últimas 10)
        const recentAlerts = alerts.slice(0, 10);
        
        this.elements.alertsList.innerHTML = recentAlerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-time">${utils.timeAgo(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    },

    // Obtener ícono de alerta
    getAlertIcon: function(type) {
        const icons = {
            critical: '🚨',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    },

    // Actualizar actividad
    updateActivity: function() {
        // Simular sesiones de carga ocasionales
        if (Math.random() < 0.1) { // 10% de probabilidad cada actualización
            this.simulateChargingSession();
        }

        // Actualizar energía total consumida
        this.updateEnergyConsumption();
    },

    // Simular sesión de carga
    simulateChargingSession: function() {
        const devices = ['Laptop Dell', 'Teléfono Samsung', 'Tablet iPad', 'Router WiFi', 'Cámara Seguridad'];
        const device = devices[Math.floor(Math.random() * devices.length)];
        const power = 20 + Math.random() * 80; // 20-100W
        const duration = 1 + Math.random() * 4; // 1-5 horas

        this.addChargingSession(device, power, duration);
    },

    // Agregar sesión de carga
    addChargingSession: function(device, power, duration) {
        const session = {
            id: utils.generateId(),
            device: device,
            power: power,
            duration: duration,
            energy: (power * duration).toFixed(2),
            startTime: new Date(),
            status: 'active'
        };

        // Guardar sesión
        const sessions = utils.storage.get('chargingSessions', []);
        sessions.push(session);
        utils.storage.set('chargingSessions', sessions);

        // Actualizar UI
        this.updateSessionsList();
        this.addActivity(`Dispositivo conectado: ${device} (${power}W)`);
    },

    // Actualizar lista de sesiones
    updateSessionsList: function() {
        if (!this.elements.sessionsList) return;

        const sessions = utils.storage.get('chargingSessions', []);
        const activeSessions = sessions.filter(s => s.status === 'active');

        if (activeSessions.length === 0) {
            this.elements.sessionsList.innerHTML = `
                <div class="no-sessions">
                    <span class="no-data-icon">🔌</span>
                    <p>No hay sesiones de carga activas</p>
                </div>
            `;
            return;
        }

        this.elements.sessionsList.innerHTML = activeSessions.map(session => `
            <div class="session-item">
                <div class="session-device">
                    <span class="device-icon">🔋</span>
                    <span class="device-name">${session.device}</span>
                </div>
                <div class="session-info">
                    <span class="session-power">${session.power.toFixed(1)}W</span>
                    <span class="session-duration">${session.duration.toFixed(1)}h</span>
                </div>
            </div>
        `).join('');

        // Actualizar contadores
        this.updateSessionCounters(activeSessions);
    },

    // Actualizar contadores de sesiones
    updateSessionCounters: function(sessions) {
        if (this.elements.activeDevices) {
            this.elements.activeDevices.textContent = sessions.length;
        }

        if (this.elements.totalChargeTime) {
            const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0);
            const hours = Math.floor(totalHours);
            const minutes = Math.round((totalHours - hours) * 60);
            this.elements.totalChargeTime.textContent = `${hours}h ${minutes}m`;
        }
    },

    // Actualizar consumo de energía
    updateEnergyConsumption: function() {
        const sessions = utils.storage.get('chargingSessions', []);
        const totalEnergy = sessions.reduce((sum, session) => sum + parseFloat(session.energy), 0);

        if (this.elements.totalEnergyConsumed) {
            this.elements.totalEnergyConsumed.textContent = `${totalEnergy.toFixed(2)} Wh`;
        }

        // Actualizar energía ahorrada (estimación)
        if (this.elements.energySaved) {
            const energySaved = totalEnergy * 0.8; // Estimación del 80% de ahorro vs red eléctrica
            this.elements.energySaved.textContent = `${energySaved.toFixed(1)} kWh`;
        }
    },

    // Agregar actividad al log
    addActivity: function(message) {
        const activity = {
            id: utils.generateId(),
            message: message,
            timestamp: new Date(),
            type: 'info'
        };

        // Guardar actividad
        const activities = utils.storage.get('systemActivities', []);
        activities.unshift(activity);
        
        // Mantener solo las últimas 50 actividades
        if (activities.length > 50) {
            activities.pop();
        }
        
        utils.storage.set('systemActivities', activities);

        // Actualizar UI si estamos en la sección de actividades
        this.updateActivityLog();
    },

    // Actualizar log de actividades
    updateActivityLog: function() {
        // Esta función se llamaría cuando se navega a la sección de actividades
        console.log('Actualizando log de actividades');
    },

    // Cargar datos iniciales
    loadInitialData: function() {
        utils.loading.show('Cargando datos del sistema...');

        // Simular carga inicial
        setTimeout(() => {
            this.updateSessionsList();
            this.updateEnergyConsumption();
            
            // Cargar datos ambientales simulados
            this.loadEnvironmentalData();
            
            utils.loading.hide();
            utils.notification.show('Sistema solar conectado correctamente', 'success');
        }, 2000);
    },

    // Cargar datos ambientales
    loadEnvironmentalData: function() {
        // Simular datos del sensor ambiental
        const temperature = 25 + (Math.random() - 0.5) * 10; // 20-30°C
        const solarRadiation = this.calculateSolarRadiation();
        const humidity = 40 + (Math.random() - 0.5) * 30; // 25-55%

        if (this.elements.temperature) {
            this.elements.temperature.textContent = `${temperature.toFixed(1)}°C`;
        }
        if (this.elements.solarRadiation) {
            this.elements.solarRadiation.textContent = `${solarRadiation} W/m²`;
        }
        if (this.elements.humidity) {
            this.elements.humidity.textContent = `${humidity.toFixed(0)}%`;
        }
    },

    // Calcular radiación solar (simulada)
    calculateSolarRadiation: function() {
        const now = new Date();
        const hour = now.getHours();
        
        if (hour >= 6 && hour <= 18) {
            const solarIntensity = Math.sin((hour - 6) * Math.PI / 12);
            return Math.round(200 + solarIntensity * 800);
        }
        return 0;
    }
};

// Objeto para manejar acciones del sistema
const system = {
    exportReport: function() {
        utils.loading.show('Generando reporte...');
        
        setTimeout(() => {
            const report = {
                timestamp: new Date().toISOString(),
                generatedBy: auth.getCurrentUser(),
                systemMetrics: {
                    voltage: dashboard.systemState.voltage,
                    current: dashboard.systemState.current,
                    power: dashboard.systemState.power,
                    mode: dashboard.systemState.mode
                },
                energyStats: {
                    totalConsumed: document.getElementById('totalEnergyConsumed')?.textContent,
                    energySaved: document.getElementById('energySaved')?.textContent,
                    activeSessions: document.getElementById('activeDevices')?.textContent
                },
                efficiency: {
                    panels: document.getElementById('panelEfficiency')?.textContent,
                    batteries: document.getElementById('batteryEfficiency')?.textContent,
                    conversion: document.getElementById('conversionEfficiency')?.textContent
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `reporte_solar_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            utils.loading.hide();
            utils.notification.show('Reporte exportado correctamente', 'success');
            dashboard.addActivity('Reporte del sistema exportado');
        }, 1500);
    },

    refreshAll: function() {
        utils.notification.show('Actualizando todos los datos...', 'info');
        dashboard.loadInitialData();
    },

    manualOverride: function() {
        utils.notification.show('Modo manual activado', 'warning');
        dashboard.addActivity('Control manual activado por el operador');
    },

    systemDiagnostic: function() {
        utils.loading.show('Ejecutando diagnóstico del sistema...');
        
        setTimeout(() => {
            const diagnostic = {
                status: 'optimal',
                checks: {
                    panels: 'ok',
                    batteries: 'ok',
                    inverter: 'ok',
                    sensors: 'ok',
                    communication: 'ok'
                },
                recommendations: [
                    'Sistema operando dentro de parámetros normales',
                    'Mantener limpieza de paneles solares',
                    'Verificar conexiones mensualmente'
                ]
            };

            utils.loading.hide();
            utils.notification.show('Diagnóstico completado - Sistema OK', 'success');
            dashboard.addActivity('Diagnóstico del sistema ejecutado - Todo OK');
        }, 3000);
    }
};

// Objeto para manejar consumo
const consumption = {
    clearSessions: function() {
        if (confirm('¿Estás seguro de que quieres limpiar todas las sesiones de carga?')) {
            utils.storage.set('chargingSessions', []);
            dashboard.updateSessionsList();
            utils.notification.show('Sesiones de carga limpiadas', 'info');
            dashboard.addActivity('Todas las sesiones de carga fueron limpiadas');
        }
    }
};

// Objeto para manejar alertas
const alerts = {
    clearAll: function() {
        if (confirm('¿Estás seguro de que quieres limpiar todas las alertas?')) {
            // En un sistema real, esto limpiaría las alertas del servidor
            utils.notification.show('Alertas limpiadas', 'info');
            dashboard.addActivity('Todas las alertas fueron limpiadas');
        }
    }
};

// Objeto para notificaciones
const notifications = {
    toggle: function() {
        utils.notification.show('Sistema de notificaciones', 'info');
    }
};

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    dashboard.init();
});

// Exportar para uso global
window.dashboard = dashboard;
window.system = system;
window.consumption = consumption;
window.alerts = alerts;
window.notifications = notifications;
