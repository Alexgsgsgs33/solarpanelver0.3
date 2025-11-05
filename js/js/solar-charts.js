// Gráficos específicos para el sistema solar
const solarCharts = {
    charts: {},
    config: {
        powerChart: null,
        distributionChart: null,
        realtimeChart: null
    },

    // Colores personalizados para los gráficos
    colors: {
        royalBlue: '#1e3a8a',
        royalBlueLight: '#3b82f6',
        wine: '#7f1d1d',
        wineLight: '#dc2626',
        solarYellow: '#fbbf24',
        batteryGreen: '#10b981',
        gridGray: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    },

    // Inicializar todos los gráficos
    init: function() {
        this.initPowerChart();
        this.initDistributionChart();
        this.initRealtimeChart();
        console.log('Gráficos del sistema solar inicializados');
    },

    // Gráfico de potencia principal
    initPowerChart: function() {
        const ctx = document.getElementById('powerChart');
        if (!ctx) return;

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

        this.config.powerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Potencia (W)',
                    data: [],
                    borderColor: this.colors.royalBlue,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.royalBlue,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: this.colors.royalBlue,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                return `Potencia: ${context.parsed.y}W`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return value + 'W';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Potencia (W)',
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            maxTicksLimit: 8
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    },

    // Gráfico de distribución
    initDistributionChart: function() {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        this.config.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Paneles Solares', 'Baterías', 'Consumo Directo', 'Pérdidas'],
                datasets: [{
                    data: [65, 20, 12, 3],
                    backgroundColor: [
                        this.colors.solarYellow,
                        this.colors.batteryGreen,
                        this.colors.royalBlue,
                        this.colors.gridGray
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            color: '#6b7280',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value}% (${percentage}% del total)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Gráfico en tiempo real
    initRealtimeChart: function() {
        const ctx = document.getElementById('realtimeChart');
        if (!ctx) return;

        const voltageGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        voltageGradient.addColorStop(0, 'rgba(30, 58, 138, 0.3)');
        voltageGradient.addColorStop(1, 'rgba(30, 58, 138, 0.05)');

        const currentGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        currentGradient.addColorStop(0, 'rgba(220, 38, 38, 0.3)');
        currentGradient.addColorStop(1, 'rgba(220, 38, 38, 0.05)');

        this.config.realtimeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Voltaje (V)',
                        data: [],
                        borderColor: this.colors.royalBlue,
                        backgroundColor: voltageGradient,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Corriente (A)',
                        data: [],
                        borderColor: this.colors.wineLight,
                        backgroundColor: currentGradient,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#6b7280',
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Voltaje (V)',
                            color: this.colors.royalBlue
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: this.colors.royalBlue
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Corriente (A)',
                            color: this.colors.wineLight
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: this.colors.wineLight
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            maxTicksLimit: 6
                        }
                    }
                }
            }
        });
    },

    // Actualizar datos de los gráficos
    updateData: function(timestamps, powerData, voltageData, currentData) {
        this.updatePowerChart(timestamps, powerData);
        this.updateDistributionChart(powerData);
        this.updateRealtimeChart(timestamps, voltageData, currentData);
    },

    // Actualizar gráfico de potencia
    updatePowerChart: function(timestamps, powerData) {
        if (!this.config.powerChart) return;

        const labels = timestamps.map(time => {
            const date = new Date(time);
            return date.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        });

        this.config.powerChart.data.labels = labels;
        this.config.powerChart.data.datasets[0].data = powerData;
        this.config.powerChart.update('none');
    },

    // Actualizar gráfico de distribución
    updateDistributionChart: function(powerData) {
        if (!this.config.distributionChart || powerData.length === 0) return;

        const currentPower = powerData[powerData.length - 1];
        
        // Simular distribución basada en la potencia actual
        const panelContribution = Math.min(100, currentPower / 8);
        const batteryContribution = Math.min(30, currentPower / 20);
        const directConsumption = Math.min(15, currentPower / 40);
        const losses = Math.max(0, 100 - panelContribution - batteryContribution - directConsumption);

        this.config.distributionChart.data.datasets[0].data = [
            panelContribution,
            batteryContribution,
            directConsumption,
            losses
        ];

        this.config.distributionChart.update();
    },

    // Actualizar gráfico en tiempo real
    updateRealtimeChart: function(timestamps, voltageData, currentData) {
        if (!this.config.realtimeChart) return;

        const labels = timestamps.map(time => {
            const date = new Date(time);
            return date.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
            });
        });

        this.config.realtimeChart.data.labels = labels;
        this.config.realtimeChart.data.datasets[0].data = voltageData;
        this.config.realtimeChart.data.datasets[1].data = currentData;
        this.config.realtimeChart.update('none');
    },

    // Exportar datos de potencia
    exportPowerData: function() {
        if (!this.config.powerChart) return;

        const data = this.config.powerChart.data;
        const csvContent = this.convertToCSV(data.labels, data.datasets[0].data);
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datos_potencia_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        utils.notification.show('Datos de potencia exportados', 'success');
    },

    // Convertir datos a CSV
    convertToCSV: function(labels, data) {
        let csv = 'Tiempo,Potencia (W)\n';
        labels.forEach((label, index) => {
            csv += `"${label}",${data[index] || 0}\n`;
        });
        return csv;
    },

    // Actualizar distribución
    refreshDistribution: function() {
        if (this.config.distributionChart) {
            this.config.distributionChart.update();
            utils.notification.show('Distribución actualizada', 'info');
        }
    },

    // Alternar gráfico en tiempo real
    toggleRealtime: function() {
        const button = document.getElementById('realtimeToggle');
        if (!button) return;

        const isPaused = button.querySelector('.action-icon').textContent === '▶️';
        
        if (isPaused) {
            button.querySelector('.action-icon').textContent = '⏸️';
            utils.notification.show('Gráfico en tiempo real activado', 'info');
        } else {
            button.querySelector('.action-icon').textContent = '▶️';
            utils.notification.show('Gráfico en tiempo real pausado', 'warning');
        }
    },

    // Destruir gráficos (para limpieza)
    destroy: function() {
        Object.values(this.config).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.config = {
            powerChart: null,
            distributionChart: null,
            realtimeChart: null
        };
    }
};

// Inicializar gráficos cuando estén disponibles
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Chart.js esté cargado
    if (typeof Chart !== 'undefined') {
        setTimeout(() => {
            solarCharts.init();
        }, 100);
    }
});

// Exportar para uso global
window.solarCharts = solarCharts;
