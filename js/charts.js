// js/charts.js

console.log('charts.js loaded');

/**
 * Aggregates data by date.
 * @param {Array<Object>} data The processed campaign data.
 * @returns {Object} Aggregated data by date.
 */
function aggregateDailyData(data) {
    const dailyData = {};

    data.filter(row => row.Date).forEach(row => {
        const date = row.Date; // Assuming Date is in YYYY-MM-DD format
        if (!dailyData[date]) {
            dailyData[date] = {
                Impressions: 0,
                Click: 0,
                'Post-Click Conversions': 0,
                'Post-view Conversions': 0,
                'Total Conversions': 0,
                'Revenue (Advertiser Currency)': 0,
            };
        }
        dailyData[date].Impressions += row.Impressions;
        dailyData[date].Click += row.Click;
        dailyData[date]['Post-Click Conversions'] += row['Post-Click Conversions'];
        dailyData[date]['Post-view Conversions'] += row['Post-view Conversions'];
        dailyData[date]['Total Conversions'] += row['Total Conversions'];
        dailyData[date]['Revenue (Advertiser Currency)'] += row['Revenue (Advertiser Currency)'];
    });

    // Sort dates and convert to array of objects
    const sortedDates = Object.keys(dailyData).sort();
    return sortedDates.map(date => ({
        Date: date,
        ...dailyData[date]
    }));
}

/**
 * Aggregates data by week (week starts on Monday).
 * @param {Array<Object>} data The processed campaign data.
 * @returns {Object} Aggregated data by week.
 */
function aggregateWeeklyData(data) {
    const weeklyData = {};

    data.filter(row => row.Date).forEach(row => {
        const date = new Date(row.Date + 'T00:00:00'); // Ensure date is parsed correctly as UTC to avoid timezone issues
        const day = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday of the current week
        const monday = new Date(date.setDate(diff));
        const weekStart = monday.toISOString().split('T')[0];

        if (!weeklyData[weekStart]) {
            weeklyData[weekStart] = {
                Impressions: 0,
                Click: 0,
                'Post-Click Conversions': 0,
                'Post-view Conversions': 0,
                'Total Conversions': 0,
                'Revenue (Advertiser Currency)': 0,
            };
        }
        weeklyData[weekStart].Impressions += row.Impressions;
        weeklyData[weekStart].Click += row.Click;
        weeklyData[weekStart]['Post-Click Conversions'] += row['Post-Click Conversions'];
        weeklyData[weekStart]['Post-view Conversions'] += row['Post-view Conversions'];
        weeklyData[weekStart]['Total Conversions'] += row['Total Conversions'];
        weeklyData[weekStart]['Revenue (Advertiser Currency)'] += row['Revenue (Advertiser Currency)'];
    });

    const sortedWeeks = Object.keys(weeklyData).sort();
    return sortedWeeks.map(week => ({
        Week: week,
        ...weeklyData[week]
    }));
}

/**
 * Renders the Impressions and Clicks chart.
 * @param {Array<Object>} data Aggregated daily/weekly data.
 * @param {string} containerId The ID of the canvas element.
 * @param {string} type 'daily' or 'weekly'.
 */
function renderImpressionsClicksChart(data, containerId, type) {
    const labels = data.map(row => type === 'daily' ? row.Date : row.Week);
    const impressions = data.map(row => row.Impressions);
    const clicks = data.map(row => row.Click);

    const ctx = document.getElementById(containerId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Impressions',
                    data: impressions,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y',
                },
                {
                    label: 'Clicks',
                    data: clicks,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `Impressions & Clicks (${type === 'daily' ? 'Daily' : 'Weekly'})`
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Impressions'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Clicks'
                    }
                }
            }
        }
    });
}

/**
 * Renders the Total Conversions and CVR chart.
 * @param {Array<Object>} data Aggregated daily/weekly data.
 * @param {string} containerId The ID of the canvas element.
 * @param {string} type 'daily' or 'weekly'.
 */
function renderConversionsCVRChart(data, containerId, type) {
    const labels = data.map(row => type === 'daily' ? row.Date : row.Week);
    const postClickConversions = data.map(row => row['Post-Click Conversions']);
    const postViewConversions = data.map(row => row['Post-view Conversions']);

    // Calculate CVRs
    const pvCvr = data.map(row => row.Impressions > 0 ? (row['Post-view Conversions'] / row.Impressions) * 100 : 0);
    const pcCvr = data.map(row => row.Click > 0 ? (row['Post-Click Conversions'] / row.Click) * 100 : 0);

    const ctx = document.getElementById(containerId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Post-Click Conversions',
                    data: postClickConversions,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    stack: 'conversions',
                    yAxisID: 'y',
                },
                {
                    label: 'Post-View Conversions',
                    data: postViewConversions,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    stack: 'conversions',
                    yAxisID: 'y',
                },
                {
                    label: 'PV CVR',
                    data: pvCvr,
                    type: 'line',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                    yAxisID: 'y1',
                },
                {
                    label: 'PC CVR',
                    data: pcCvr,
                    type: 'line',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    fill: false,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: `Total Conversions & CVR (${type === 'daily' ? 'Daily' : 'Weekly'})`
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Conversions'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'CVR (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renders the Revenue and CPC chart.
 * @param {Array<Object>} data Aggregated daily/weekly data.
 * @param {string} containerId The ID of the canvas element.
 * @param {string} type 'daily' or 'weekly'.
 */
function renderRevenueCPCChart(data, containerId, type) {
    const labels = data.map(row => type === 'daily' ? row.Date : row.Week);
    const revenue = data.map(row => row['Revenue (Advertiser Currency)']);
    const cpc = data.map(row => row.Click > 0 ? row['Revenue (Advertiser Currency)'] / row.Click : 0);

    const ctx = document.getElementById(containerId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenue,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y',
                },
                {
                    label: 'CPC',
                    data: cpc,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `Revenue & CPC (${type === 'daily' ? 'Daily' : 'Weekly'})`
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'CPC'
                    }
                }
            }
        }
    });
}

/**
 * Renders the Revenue and CPA chart.
 * @param {Array<Object>} data Aggregated daily/weekly data.
 * @param {string} containerId The ID of the canvas element.
 * @param {string} type 'daily' or 'weekly'.
 */
function renderRevenueCPAChart(data, containerId, type) {
    const labels = data.map(row => type === 'daily' ? row.Date : row.Week);
    const revenue = data.map(row => row['Revenue (Advertiser Currency)']);
    const cpa = data.map(row => row['Total Conversions'] > 0 ? row['Revenue (Advertiser Currency)'] / row['Total Conversions'] : 0);

    const ctx = document.getElementById(containerId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenue,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y',
                },
                {
                    label: 'CPA',
                    data: cpa,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `Revenue & CPA (${type === 'daily' ? 'Daily' : 'Weekly'})`
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'CPA'
                    }
                }
            }
        }
    });
}

/**
 * Renders a generic line chart for trends (CTR, PV CVR, PC CVR).
 * @param {Array<Object>} data Aggregated daily/weekly data.
 * @param {string} containerId The ID of the canvas element.
 * @param {string} type 'daily' or 'weekly'.
 */
function renderTrendChart(data, containerId, type) {
    const labels = data.map(row => type === 'daily' ? row.Date : row.Week);
    const ctr = data.map(row => row.Impressions > 0 ? (row.Click / row.Impressions) * 100 : 0);
    const pvCvr = data.map(row => row.Impressions > 0 ? (row['Post-view Conversions'] / row.Impressions) * 100 : 0);
    const pcCvr = data.map(row => row.Click > 0 ? (row['Post-Click Conversions'] / row.Click) * 100 : 0);

    const ctx = document.getElementById(containerId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CTR (%)',
                    data: ctr,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    yAxisID: 'y',
                },
                {
                    label: 'PV CVR (%)',
                    data: pvCvr,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    fill: false,
                    yAxisID: 'y',
                },
                {
                    label: 'PC CVR (%)',
                    data: pcCvr,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    fill: false,
                    yAxisID: 'y',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: `CTR, PV CVR, PC CVR Trends (${type === 'daily' ? 'Daily' : 'Weekly'})`
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Percentage'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renders growth charts for CTR+CPC and PV CVR, PC CVR, CPA.
 * @param {Array<Object>} data Aggregated daily/weekly data.
 * @param {string} containerId The ID of the canvas element.
 * @param {string} type 'daily' or 'weekly'.
 */
function renderGrowthChart(data, containerId, type) {
    const labels = data.map(row => type === 'daily' ? row.Date : row.Week);

    // Calculate growth percentage relative to the first data point
    const calculateGrowth = (values) => {
        if (values.length === 0 || values[0] === 0) return values.map(() => 0);
        const firstValue = values[0];
        return values.map(value => ((value - firstValue) / firstValue) * 100);
    };

    const ctrValues = data.map(row => row.Impressions > 0 ? (row.Click / row.Impressions) : 0);
    const cpcValues = data.map(row => row.Click > 0 ? row['Revenue (Advertiser Currency)'] / row.Click : 0);
    const pvCvrValues = data.map(row => row.Impressions > 0 ? (row['Post-view Conversions'] / row.Impressions) : 0);
    const pcCvrValues = data.map(row => row.Click > 0 ? (row['Post-Click Conversions'] / row.Click) : 0);
    const cpaValues = data.map(row => row['Total Conversions'] > 0 ? row['Revenue (Advertiser Currency)'] / row['Total Conversions'] : 0);

    const ctrGrowth = calculateGrowth(ctrValues);
    const cpcGrowth = calculateGrowth(cpcValues);
    const pvCvrGrowth = calculateGrowth(pvCvrValues);
    const pcCvrGrowth = calculateGrowth(pcCvrValues);
    const cpaGrowth = calculateGrowth(cpaValues);

    const ctx = document.getElementById(containerId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CTR Growth (%)',
                    data: ctrGrowth,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                },
                {
                    label: 'CPC Growth (%)',
                    data: cpcGrowth,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                },
                {
                    label: 'PV CVR Growth (%)',
                    data: pvCvrGrowth,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    fill: false,
                },
                {
                    label: 'PC CVR Growth (%)',
                    data: pcCvrGrowth,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    fill: false,
                },
                {
                    label: 'CPA Growth (%)',
                    data: cpaGrowth,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: `Growth Trends (${type === 'daily' ? 'Daily' : 'Weekly'})`
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Growth Percentage'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}