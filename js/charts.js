/**
 * Campaign Analyzer - Charts Module
 * Handles all chart creation and management using Chart.js
 */

// Set global Chart.js defaults for consistent styling
if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#374151'; // gray-700
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
}

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
 * Create enhanced segment chart with Revenue bars and switchable metric lines (Charts E & F)
 */
function createEnhancedSegmentChart(canvasId, segmentData, title, selectedMetric = 'ctr') {
    // Sort segments by revenue (highest to lowest) and take top 10
    const sortedSegments = Object.entries(segmentData)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 10);
    
    if (sortedSegments.length === 0) {
        console.log(`No segments available for ${canvasId}`);
        return;
    }
    
    const segments = sortedSegments.map(([segment, data]) => segment);
    const revenues = sortedSegments.map(([segment, data]) => data.revenue);
    
    // Calculate different metrics for the line
    const ctrs = sortedSegments.map(([segment, data]) => {
        return data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0;
    });
    
    const postClickRates = sortedSegments.map(([segment, data]) => {
        return data.clicks > 0 ? (data.postClickConversions / data.clicks * 100) : 0;
    });
    
    const postViewRates = sortedSegments.map(([segment, data]) => {
        return data.clicks > 0 ? (data.postViewConversions / data.clicks * 100) : 0;
    });
    
    const costPerOrder = sortedSegments.map(([segment, data]) => {
        // Calculate Cost Per Order using only floodlight activities with "order" in the name
        let orderConversions = 0;
        let orderRevenue = 0;
        
        // Get filtered data for this segment to access individual floodlight activities
        const allData = window.CampaignAnalyzer.getFilteredData();
        const segmentData = allData.filter(row => {
            const audienceType = canvasId === 'fp-segments-chart' ? '1st Party' : 'Converged';
            return row.AudienceType === audienceType && row.AudienceSegment === segment;
        });
        
        // Sum conversions only from floodlight activities containing "order"
        segmentData.forEach(row => {
            const activity = (row.FloodlightActivity || '').toLowerCase();
            if (activity.includes('order') || activity.includes('purchase') || activity.includes('buy')) {
                orderConversions += (row.PostClickConversions || 0) + (row.PostViewConversions || 0);
                orderRevenue += row.Revenue || 0;
            }
        });
        
        return orderConversions > 0 ? (orderRevenue / orderConversions) : 0;
    });
    
    const costPerLead = sortedSegments.map(([segment, data]) => {
        // Calculate Cost Per Lead using only floodlight activities with "lead" in the name
        let leadConversions = 0;
        let leadRevenue = 0;
        
        // Get filtered data for this segment to access individual floodlight activities
        const allData = window.CampaignAnalyzer.getFilteredData();
        const segmentData = allData.filter(row => {
            const audienceType = canvasId === 'fp-segments-chart' ? '1st Party' : 'Converged';
            return row.AudienceType === audienceType && row.AudienceSegment === segment;
        });
        
        // Sum conversions only from floodlight activities containing "lead"
        segmentData.forEach(row => {
            const activity = (row.FloodlightActivity || '').toLowerCase();
            if (activity.includes('lead') || activity.includes('signup') || activity.includes('register') || 
                activity.includes('form') || activity.includes('contact')) {
                leadConversions += (row.PostClickConversions || 0) + (row.PostViewConversions || 0);
                leadRevenue += row.Revenue || 0;
            }
        });
        
        return leadConversions > 0 ? (leadRevenue / leadConversions) : 0;
    });
    
    // Select data and styling based on chosen metric
    let lineData, lineLabel, lineColor, yAxisTitle;
    switch(selectedMetric) {
        case 'ctr':
            lineData = ctrs;
            lineLabel = 'CTR (%)';
            lineColor = '#e74c3c';
            yAxisTitle = 'CTR (%)';
            break;
        case 'post-click-rate':
            lineData = postClickRates;
            lineLabel = 'Post-Click Conv. Rate (%)';
            lineColor = '#f39c12';
            yAxisTitle = 'Conversion Rate (%)';
            break;
        case 'post-view-rate':
            lineData = postViewRates;
            lineLabel = 'Post-View Conv. Rate (%)';
            lineColor = '#9b59b6';
            yAxisTitle = 'Conversion Rate (%)';
            break;
        case 'cost-per-order':
            lineData = costPerOrder;
            lineLabel = 'Cost Per Order (PLN)';
            lineColor = '#27ae60';
            yAxisTitle = 'Cost Per Order (PLN)';
            break;
        case 'cost-per-lead':
            lineData = costPerLead;
            lineLabel = 'Cost Per Lead (PLN)';
            lineColor = '#8e44ad';
            yAxisTitle = 'Cost Per Lead (PLN)';
            break;
        default:
            lineData = ctrs;
            lineLabel = 'CTR (%)';
            lineColor = '#e74c3c';
            yAxisTitle = 'CTR (%)';
    }
    
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
                    label: 'Revenue (PLN)',
                    data: revenues,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: lineLabel,
                    data: lineData,
                    backgroundColor: lineColor + '40',
                    borderColor: lineColor,
                    borderWidth: 3,
                    type: 'line',
                    yAxisID: 'y1',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
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
                            
                            if (label.includes('Revenue')) {
                                return `${label}: ${value.toLocaleString()} PLN`;
                            } else if (label.includes('Cost Per')) {
                                return `${label}: ${value.toFixed(2)} PLN`;
                            } else if (label.includes('%') || label.includes('Rate')) {
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
                        text: 'Audience Segments'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue (PLN)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' PLN';
                        }
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
                        text: yAxisTitle
                    },
                    ticks: {
                        callback: function(value) {
                            if (yAxisTitle.includes('PLN')) {
                                return value.toFixed(2) + ' PLN';
                            } else {
                                return value.toFixed(2) + '%';
                            }
                        }
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
    
    // Store chart data for toggle functionality
    if (canvasId === 'fp-segments-chart') {
        window.fpSegmentChartData = {
            segments,
            revenues,
            ctrs,
            postClickRates,
            postViewRates,
            costPerOrder,
            costPerLead,
            segmentData: sortedSegments
        };
    } else if (canvasId === 'cnv-segments-chart') {
        window.cnvSegmentChartData = {
            segments,
            revenues,
            ctrs,
            postClickRates,
            postViewRates,
            costPerOrder,
            costPerLead,
            segmentData: sortedSegments
        };
    }
}

/**
 * Legacy create segment chart function (kept for backward compatibility)
 */
function createSegmentChart(canvasId, segmentData, title) {
    // Use the enhanced version with default CTR metric
    createEnhancedSegmentChart(canvasId, segmentData, title, 'ctr');
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
    // Update 1st Party cards - currency info moved to card descriptions
    const fpElements = {
        'fp-impressions': fpMetrics.impressions.toLocaleString(),
        'fp-ctr': fpMetrics.ctr.toFixed(3) + '%',
        'fp-cpm': fpMetrics.cpm.toFixed(2),
        'fp-viewability': fpMetrics.viewability.toFixed(1) + '%',
        'fp-conversions': fpMetrics.conversions.toLocaleString(),
        'fp-conv-rate': fpMetrics.conversionRate.toFixed(4) + '%'
    };
    
    // Update Converged cards - currency info moved to card descriptions
    const convElements = {
        'conv-impressions': convMetrics.impressions.toLocaleString(),
        'conv-ctr': convMetrics.ctr.toFixed(3) + '%',
        'conv-cpm': convMetrics.cpm.toFixed(2),
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

/**
 * Chart A: Impressions (bars) + CTR (line) - Day by Day
 */
function updateImpressionsAndCTRChart() {
    const data = window.CampaignAnalyzer.getFilteredData();
    
    if (!data || data.length === 0) {
        console.log('No data available for impressions and CTR chart');
        return;
    }
    
    // Group data by date
    const dailyData = {};
    data.forEach(row => {
        if (!row.DateObj) return;
        
        const dateKey = row.DateObj.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { impressions: 0, clicks: 0 };
        }
        dailyData[dateKey].impressions += row.Impressions || 0;
        dailyData[dateKey].clicks += row.Clicks || 0;
    });
    
    const dates = Object.keys(dailyData).sort();
    const impressions = dates.map(date => dailyData[date].impressions);
    const ctrs = dates.map(date => {
        const dayData = dailyData[date];
        return dayData.impressions > 0 ? (dayData.clicks / dayData.impressions * 100) : 0;
    });
    
    const ctx = document.getElementById('impressions-ctr-chart')?.getContext('2d');
    if (!ctx) {
        console.error('Chart canvas not found: impressions-ctr-chart');
        return;
    }
    
    // Destroy existing chart
    if (window.CampaignAnalyzer.getChartInstance('impressionsAndCTRChart')) {
        window.CampaignAnalyzer.getChartInstance('impressionsAndCTRChart').destroy();
    }
    
    const impressionsAndCTRChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Impressions',
                data: impressions,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'CTR (%)',
                data: ctrs,
                type: 'line',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Impressions & CTR Performance'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Impressions'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'CTR (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Store chart instance
    window.CampaignAnalyzer.setChartInstance('impressionsAndCTRChart', impressionsAndCTRChart);
}

/**
 * Chart B: Revenue (bars) + Switchable Conversion Rates (lines)
 */
function updateRevenueAndConversionsChart(selectedMetric = 'post-click') {
    const data = window.CampaignAnalyzer.getFilteredData();
    
    if (!data || data.length === 0) {
        console.log('No data available for revenue and conversions chart');
        return;
    }
    
    // Group data by date
    const dailyData = {};
    data.forEach(row => {
        if (!row.DateObj) return;
        
        const dateKey = row.DateObj.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { 
                revenue: 0, 
                clicks: 0, 
                postClickConversions: 0, 
                postViewConversions: 0 
            };
        }
        dailyData[dateKey].revenue += row.Revenue || 0;
        dailyData[dateKey].clicks += row.Clicks || 0;
        dailyData[dateKey].postClickConversions += row.PostClickConversions || 0;
        dailyData[dateKey].postViewConversions += row.PostViewConversions || 0;
    });
    
    const dates = Object.keys(dailyData).sort();
    const revenues = dates.map(date => dailyData[date].revenue);
    
    let conversionRates, lineLabel;
    if (selectedMetric === 'post-click') {
        conversionRates = dates.map(date => {
            const dayData = dailyData[date];
            return dayData.clicks > 0 ? (dayData.postClickConversions / dayData.clicks * 100) : 0;
        });
        lineLabel = 'Post-Click Conversion Rate (%)';
    } else {
        conversionRates = dates.map(date => {
            const dayData = dailyData[date];
            return dayData.clicks > 0 ? (dayData.postViewConversions / dayData.clicks * 100) : 0;
        });
        lineLabel = 'Post-View Conversion Rate (%)';
    }
    
    const ctx = document.getElementById('revenue-conversions-chart')?.getContext('2d');
    if (!ctx) {
        console.error('Chart canvas not found: revenue-conversions-chart');
        return;
    }
    
    // Destroy existing chart
    if (window.CampaignAnalyzer.getChartInstance('revenueAndConversionsChart')) {
        window.CampaignAnalyzer.getChartInstance('revenueAndConversionsChart').destroy();
    }
    
    const revenueAndConversionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Revenue (PLN)',
                data: revenues,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: lineLabel,
                data: conversionRates,
                type: 'line',
                backgroundColor: selectedMetric === 'post-click' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 69, 19, 0.2)',
                borderColor: selectedMetric === 'post-click' ? 'rgba(239, 68, 68, 1)' : 'rgba(139, 69, 19, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: `Daily Revenue & ${selectedMetric === 'post-click' ? 'Post-Click' : 'Post-View'} Conversion Rate`
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue (PLN)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' PLN';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Conversion Rate (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Store chart instance
    window.CampaignAnalyzer.setChartInstance('revenueAndConversionsChart', revenueAndConversionsChart);
}

/**
 * Setup toggle functionality for conversion metrics chart (Chart B)
 */
function setupConversionToggle() {
    document.querySelectorAll('.conversion-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.conversion-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const metric = btn.dataset.metric;
            updateRevenueAndConversionsChart(metric);
        });
    });
}

/**
 * Setup toggle functionality for First Party segments chart (Chart E)
 */
function setupFirstPartyToggle() {
    document.querySelectorAll('.fp-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.fp-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const metric = btn.dataset.metric;
            updateFirstPartySegmentChart(metric);
        });
    });
}

/**
 * Setup toggle functionality for Converged segments chart (Chart F)
 */
function setupConvergedToggle() {
    document.querySelectorAll('.cnv-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cnv-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const metric = btn.dataset.metric;
            updateConvergedSegmentChart(metric);
        });
    });
}

/**
 * Update First Party segment chart with selected metric
 */
function updateFirstPartySegmentChart(selectedMetric) {
    if (!window.fpSegmentChartData) {
        console.log('No first party segment data available for toggle');
        return;
    }
    
    const chartInstance = window.CampaignAnalyzer.getChartInstances().fpSegmentsChart;
    if (!chartInstance) {
        console.log('No first party segment chart instance found');
        return;
    }
    
    const data = window.fpSegmentChartData;
    let lineData, lineLabel, lineColor, yAxisTitle;
    
    switch(selectedMetric) {
        case 'ctr':
            lineData = data.ctrs;
            lineLabel = 'CTR (%)';
            lineColor = '#e74c3c';
            yAxisTitle = 'CTR (%)';
            break;
        case 'post-click-rate':
            lineData = data.postClickRates;
            lineLabel = 'Post-Click Conv. Rate (%)';
            lineColor = '#f39c12';
            yAxisTitle = 'Conversion Rate (%)';
            break;
        case 'post-view-rate':
            lineData = data.postViewRates;
            lineLabel = 'Post-View Conv. Rate (%)';
            lineColor = '#9b59b6';
            yAxisTitle = 'Conversion Rate (%)';
            break;
        case 'cost-per-order':
            lineData = data.costPerOrder;
            lineLabel = 'Cost Per Order (PLN)';
            lineColor = '#27ae60';
            yAxisTitle = 'Cost Per Order (PLN)';
            break;
        case 'cost-per-lead':
            lineData = data.costPerLead;
            lineLabel = 'Cost Per Lead (PLN)';
            lineColor = '#8e44ad';
            yAxisTitle = 'Cost Per Lead (PLN)';
            break;
        default:
            return;
    }
    
    // Update chart data
    chartInstance.data.datasets[1].data = lineData;
    chartInstance.data.datasets[1].label = lineLabel;
    chartInstance.data.datasets[1].borderColor = lineColor;
    chartInstance.data.datasets[1].backgroundColor = lineColor + '40';
    chartInstance.options.scales.y1.title.text = yAxisTitle;
    
    // Update tick formatting
    chartInstance.options.scales.y1.ticks.callback = function(value) {
        if (yAxisTitle.includes('PLN')) {
            return value.toFixed(2) + ' PLN';
        } else {
            return value.toFixed(2) + '%';
        }
    };
    
    chartInstance.update('active');
}

/**
 * Update Converged segment chart with selected metric
 */
function updateConvergedSegmentChart(selectedMetric) {
    if (!window.cnvSegmentChartData) {
        console.log('No converged segment data available for toggle');
        return;
    }
    
    const chartInstance = window.CampaignAnalyzer.getChartInstances().cnvSegmentsChart;
    if (!chartInstance) {
        console.log('No converged segment chart instance found');
        return;
    }
    
    const data = window.cnvSegmentChartData;
    let lineData, lineLabel, lineColor, yAxisTitle;
    
    switch(selectedMetric) {
        case 'ctr':
            lineData = data.ctrs;
            lineLabel = 'CTR (%)';
            lineColor = '#e74c3c';
            yAxisTitle = 'CTR (%)';
            break;
        case 'post-click-rate':
            lineData = data.postClickRates;
            lineLabel = 'Post-Click Conv. Rate (%)';
            lineColor = '#f39c12';
            yAxisTitle = 'Conversion Rate (%)';
            break;
        case 'post-view-rate':
            lineData = data.postViewRates;
            lineLabel = 'Post-View Conv. Rate (%)';
            lineColor = '#9b59b6';
            yAxisTitle = 'Conversion Rate (%)';
            break;
        case 'cost-per-order':
            lineData = data.costPerOrder;
            lineLabel = 'Cost Per Order (PLN)';
            lineColor = '#27ae60';
            yAxisTitle = 'Cost Per Order (PLN)';
            break;
        case 'cost-per-lead':
            lineData = data.costPerLead;
            lineLabel = 'Cost Per Lead (PLN)';
            lineColor = '#8e44ad';
            yAxisTitle = 'Cost Per Lead (PLN)';
            break;
        default:
            return;
    }
    
    // Update chart data
    chartInstance.data.datasets[1].data = lineData;
    chartInstance.data.datasets[1].label = lineLabel;
    chartInstance.data.datasets[1].borderColor = lineColor;
    chartInstance.data.datasets[1].backgroundColor = lineColor + '40';
    chartInstance.options.scales.y1.title.text = yAxisTitle;
    
    // Update tick formatting
    chartInstance.options.scales.y1.ticks.callback = function(value) {
        if (yAxisTitle.includes('PLN')) {
            return value.toFixed(2) + ' PLN';
        } else {
            return value.toFixed(2) + '%';
        }
    };
    
    chartInstance.update('active');
}

/**
 * Initialize all toggle functionalities
 */
function initializeChartToggles() {
    setupConversionToggle();
    setupFirstPartyToggle();
    setupConvergedToggle();
}

// Make functions available globally
window.Charts = {
    updateTimeSeriesChart,
    updateAudienceChart,
    createSegmentChart,
    createEnhancedSegmentChart,
    updateAudienceComparison,
    updateAudienceMetricCards,
    updateImpressionsAndCTRChart,
    updateRevenueAndConversionsChart,
    setupConversionToggle,
    setupFirstPartyToggle,
    setupConvergedToggle,
    updateFirstPartySegmentChart,
    updateConvergedSegmentChart,
    initializeChartToggles
};