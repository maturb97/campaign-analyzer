/**
 * Campaign Analyzer - Charts Module
 * Handles all chart creation and management using Chart.js
 */

/**
 * Update time series chart with filtered data
 */
function updateTimeSeriesChart() {
    const data = window.CampaignAnalyzer.getFilteredData();
    
    if (!data || data.length === 0) {
        console.log('No data available for time series chart');
        return;
    }
    
    // Group by date
    const dailyData = {};
    data.forEach(row => {
        const date = row.Date;
        if (!date) return;
        
        if (!dailyData[date]) {
            dailyData[date] = { 
                impressions: 0, 
                clicks: 0, 
                revenue: 0, 
                conversions: 0 
            };
        }
        
        dailyData[date].impressions += row.Impressions || 0;
        dailyData[date].clicks += row.Clicks || 0;
        dailyData[date].revenue += row.Revenue || 0;
        dailyData[date].conversions += row.TotalConversions || 0;
    });
    
    const dates = Object.keys(dailyData).sort();
    const impressions = dates.map(date => dailyData[date].impressions);
    const clicks = dates.map(date => dailyData[date].clicks);
    const revenue = dates.map(date => dailyData[date].revenue);
    const conversions = dates.map(date => dailyData[date].conversions);
    const ctr = dates.map(date => {
        const dayData = dailyData[date];
        return dayData.impressions > 0 ? (dayData.clicks / dayData.impressions * 100) : 0;
    });
    
    const ctx = document.getElementById('time-series-chart')?.getContext('2d');
    if (!ctx) {
        console.error('Time series chart canvas not found');
        return;
    }
    
    // Get current chart instance and destroy if exists
    const chartInstances = window.CampaignAnalyzer.getChartInstances();
    if (chartInstances.timeSeriesChart) {
        chartInstances.timeSeriesChart.destroy();
    }
    
    const timeSeriesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Impressions',
                data: impressions,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            
                            if (label.includes('Revenue')) {
                                return `${label}: ${value.toLocaleString()} PLN`;
                            } else if (label.includes('CTR')) {
                                return `${label}: ${value.toFixed(2)}%`;
                            } else {
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    // Store chart instance
    window.CampaignAnalyzer.setChartInstance('timeSeriesChart', timeSeriesChart);
    
    // Add metric toggle functionality
    setupTimeSeriesToggle(impressions, clicks, revenue, ctr, conversions);
}

/**
 * Setup toggle buttons for time series chart
 */
function setupTimeSeriesToggle(impressions, clicks, revenue, ctr, conversions) {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        // Remove existing listeners to prevent duplicates
        btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const metric = btn.dataset.metric;
            let newData, label, color, yAxisTitle;
            
            switch(metric) {
                case 'impressions':
                    newData = impressions;
                    label = 'Impressions';
                    color = '#3498db';
                    yAxisTitle = 'Impressions';
                    break;
                case 'clicks':
                    newData = clicks;
                    label = 'Clicks';
                    color = '#e74c3c';
                    yAxisTitle = 'Clicks';
                    break;
                case 'revenue':
                    newData = revenue;
                    label = 'Revenue';
                    color = '#2ecc71';
                    yAxisTitle = 'Revenue (PLN)';
                    break;
                case 'ctr':
                    newData = ctr;
                    label = 'CTR (%)';
                    color = '#f39c12';
                    yAxisTitle = 'CTR (%)';
                    break;
                case 'conversions':
                    newData = conversions;
                    label = 'Conversions';
                    color = '#9b59b6';
                    yAxisTitle = 'Conversions';
                    break;
                default:
                    return;
            }
            
            const chartInstance = window.CampaignAnalyzer.getChartInstances().timeSeriesChart;
            if (chartInstance) {
                chartInstance.data.datasets[0].data = newData;
                chartInstance.data.datasets[0].label = label;
                chartInstance.data.datasets[0].borderColor = color;
                chartInstance.data.datasets[0].backgroundColor = color + '20';
                chartInstance.options.scales.y.title.text = yAxisTitle;
                chartInstance.update('active');
            }
        });
    });
    
    // Set default active button
    const defaultBtn = document.querySelector('.toggle-btn[data-metric="impressions"]');
    if (defaultBtn) {
        defaultBtn.classList.add('active');
    }
}

/**
 * Update audience chart
 */
function updateAudienceChart() {
    const data = window.CampaignAnalyzer.getFilteredData();
    
    if (!data || data.length === 0) {
        console.log('No data available for audience chart');
        return;
    }
    
    // Group by audience type
    const audienceData = {};
    data.forEach(row => {
        const audienceType = row.AudienceType || 'Unknown';
        
        if (!audienceData[audienceType]) {
            audienceData[audienceType] = { 
                impressions: 0, 
                clicks: 0, 
                revenue: 0 
            };
        }
        
        audienceData[audienceType].impressions += row.Impressions || 0;
        audienceData[audienceType].clicks += row.Clicks || 0;
        audienceData[audienceType].revenue += row.Revenue || 0;
    });
    
    const audienceTypes = Object.keys(audienceData);
    const impressions = audienceTypes.map(type => audienceData[type].impressions);
    const ctrs = audienceTypes.map(type => {
        const data = audienceData[type];
        return data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0;
    });
    
    const ctx = document.getElementById('audience-chart')?.getContext('2d');
    if (!ctx) {
        console.error('Audience chart canvas not found');
        return;
    }
    
    // Destroy existing chart
    const chartInstances = window.CampaignAnalyzer.getChartInstances();
    if (chartInstances.audienceChart) {
        chartInstances.audienceChart.destroy();
    }
    
    const audienceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: audienceTypes,
            datasets: [
                {
                    label: 'Impressions',
                    data: impressions,
                    backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6'],
                    borderColor: ['#2980b9', '#c0392b', '#e67e22', '#27ae60', '#8e44ad'],
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'CTR (%)',
                    data: ctrs,
                    backgroundColor: 'rgba(231, 76, 60, 0.6)',
                    borderColor: '#c0392b',
                    borderWidth: 2,
                    type: 'line',
                    yAxisID: 'y1',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            
                            if (label.includes('CTR')) {
                                return `${label}: ${value.toFixed(2)}%`;
                            } else {
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Impressions'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'CTR (%)'
                    }
                }
            }
        }
    });
    
    // Store chart instance
    window.CampaignAnalyzer.setChartInstance('audienceChart', audienceChart);
}

/**
 * Create segment chart (used for both 1P and Converged segments)
 */
function createSegmentChart(canvasId, segmentData, title) {
    // Sort segments by revenue (highest to lowest) and take top 10
    const sortedSegments = Object.entries(segmentData)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 10);
    
    if (sortedSegments.length === 0) {
        console.log(`No segments available for ${canvasId}`);
        return;
    }
    
    const segments = sortedSegments.map(([segment, data]) => segment);
    const ctrs = sortedSegments.map(([segment, data]) => {
        return data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0;
    });
    const impressions = sortedSegments.map(([segment, data]) => data.impressions);
    const revenues = sortedSegments.map(([segment, data]) => data.revenue);
    
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.error(`Chart canvas not found: ${canvasId}`);
        return;
    }
    
    // Destroy existing chart
    const chartInstances = window.CampaignAnalyzer.getChartInstances();
    if (canvasId === 'fp-segments-chart' && chartInstances.fpSegmentsChart) {
        chartInstances.fpSegmentsChart.destroy();
    } else if (canvasId === 'cnv-segments-chart' && chartInstances.cnvSegmentsChart) {
        chartInstances.cnvSegmentsChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: segments.map(s => s.length > 15 ? s.substring(0, 15) + '...' : s),
            datasets: [
                {
                    label: 'Impressions',
                    data: impressions,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: '#3498db',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'CTR (%)',
                    data: ctrs,
                    backgroundColor: 'rgba(231, 76, 60, 0.8)',
                    borderColor: '#e74c3c',
                    borderWidth: 2,
                    type: 'line',
                    yAxisID: 'y1',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return segments[context[0].dataIndex];
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            
                            if (label.includes('CTR')) {
                                return `${label}: ${value.toFixed(2)}%`;
                            } else {
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Segments'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Impressions'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'CTR (%)'
                    }
                }
            }
        }
    });
    
    // Store chart reference
    if (canvasId === 'fp-segments-chart') {
        window.CampaignAnalyzer.setChartInstance('fpSegmentsChart', chart);
    } else if (canvasId === 'cnv-segments-chart') {
        window.CampaignAnalyzer.setChartInstance('cnvSegmentsChart', chart);
    }
}

/**
 * Update audience comparison radar chart
 */
function updateAudienceComparison() {
    const data = window.CampaignAnalyzer.getFilteredData();
    
    if (!data || data.length === 0) {
        console.log('No data available for audience comparison');
        return;
    }
    
    // Calculate metrics for 1st Party and Converged audiences
    const fpData = data.filter(row => row.AudienceType === '1st Party');
    const convData = data.filter(row => row.AudienceType === 'Converged');
    
    const fpMetrics = window.CampaignAnalyzer.calculateMetrics(fpData);
    const convMetrics = window.CampaignAnalyzer.calculateMetrics(convData);
    
    // Update metric cards first
    updateAudienceMetricCards(fpMetrics, convMetrics);
    
    // Create radar chart
    const ctx = document.getElementById('audience-comparison-chart')?.getContext('2d');
    if (!ctx) {
        console.error('Audience comparison chart canvas not found');
        return;
    }
    
    // Destroy existing chart
    const chartInstances = window.CampaignAnalyzer.getChartInstances();
    if (chartInstances.audienceComparisonChart) {
        chartInstances.audienceComparisonChart.destroy();
    }
    
    // Calculate max values for proper scaling
    const maxCtr = Math.max(fpMetrics.ctr || 0, convMetrics.ctr || 0, 1);
    const maxViewability = Math.max(fpMetrics.viewability || 0, convMetrics.viewability || 0, 1);
    const maxConvRate = Math.max(fpMetrics.conversionRate || 0, convMetrics.conversionRate || 0, 1);
    const maxCpmEff = Math.max(
        fpMetrics.cpm > 0 ? (100 / fpMetrics.cpm) : 0, 
        convMetrics.cpm > 0 ? (100 / convMetrics.cpm) : 0, 
        1
    );
    
    const audienceComparisonChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['CTR (%)', 'Viewability (%)', 'Conv. Rate (%)', 'CPM Efficiency'],
            datasets: [
                {
                    label: '1st Party',
                    data: [
                        (fpMetrics.ctr / maxCtr) * 100,
                        (fpMetrics.viewability / maxViewability) * 100,
                        (fpMetrics.conversionRate / maxConvRate) * 100,
                        fpMetrics.cpm > 0 ? ((100 / fpMetrics.cpm) / maxCpmEff) * 100 : 0
                    ],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: '#3498db',
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#3498db',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 3
                },
                {
                    label: 'Converged',
                    data: [
                        (convMetrics.ctr / maxCtr) * 100,
                        (convMetrics.viewability / maxViewability) * 100,
                        (convMetrics.conversionRate / maxConvRate) * 100,
                        convMetrics.cpm > 0 ? ((100 / convMetrics.cpm) / maxCpmEff) * 100 : 0
                    ],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: '#e74c3c',
                    pointBackgroundColor: '#e74c3c',
                    pointBorderColor: '#e74c3c',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Audience Performance Comparison',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.r;
                            return `${label}: ${value.toFixed(1)}% (relative)`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
    
    // Store chart instance
    window.CampaignAnalyzer.setChartInstance('audienceComparisonChart', audienceComparisonChart);
}

/**
 * Update audience metric cards
 */
function updateAudienceMetricCards(fpMetrics, convMetrics) {
    // Update 1st Party cards
    const fpElements = {
        'fp-impressions': fpMetrics.impressions.toLocaleString(),
        'fp-ctr': fpMetrics.ctr.toFixed(3) + '%',
        'fp-cpm': fpMetrics.cpm.toFixed(2) + ' PLN',
        'fp-viewability': fpMetrics.viewability.toFixed(1) + '%',
        'fp-conversions': fpMetrics.conversions.toLocaleString(),
        'fp-conv-rate': fpMetrics.conversionRate.toFixed(4) + '%'
    };
    
    // Update Converged cards
    const convElements = {
        'conv-impressions': convMetrics.impressions.toLocaleString(),
        'conv-ctr': convMetrics.ctr.toFixed(3) + '%',
        'conv-cpm': convMetrics.cpm.toFixed(2) + ' PLN',
        'conv-viewability': convMetrics.viewability.toFixed(1) + '%',
        'conv-conversions': convMetrics.conversions.toLocaleString(),
        'conv-conv-rate': convMetrics.conversionRate.toFixed(4) + '%'
    };
    
    // Update DOM elements
    Object.entries({...fpElements, ...convElements}).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Make functions available globally
window.Charts = {
    updateTimeSeriesChart,
    updateAudienceChart,
    createSegmentChart,
    updateAudienceComparison,
    updateAudienceMetricCards
};