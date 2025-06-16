/**
 * Campaign Analyzer - Main Application Logic
 * Handles initialization, state management, and core functionality
 */

// Global state variables
let campaignData = [];
let filteredData = [];
let currentPlatform = 'all';
let dateFilter = { start: null, end: null };

// Chart instances
let timeSeriesChart = null;
let audienceChart = null;
let audienceComparisonChart = null;
let fpSegmentsChart = null;
let cnvSegmentsChart = null;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Campaign Analyzer - Initializing application...');
    
    initializeUpload();
    initializeNavigation();
    initializeDateFilters();
    
    console.log('Campaign Analyzer - Application initialized successfully');
});

/**
 * Initialize file upload functionality
 */
function initializeUpload() {
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('file-drop-zone');
    
    if (!fileInput || !dropZone) {
        console.error('Upload elements not found');
        return;
    }
    
    // Click to upload
    dropZone.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Drop zone clicked');
        // Ensure the hidden input gains focus before triggering the file dialog
        fileInput.focus();
        fileInput.click();
    });

    // Keyboard accessibility - trigger click on Enter or Space
    dropZone.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            fileInput.focus();
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        console.log('File input changed');
        handleFiles(e.target.files);
    });
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
}

/**
 * Initialize platform navigation
 */
function initializeNavigation() {
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;
            updateDashboard();
        });
    });
}

/**
 * Initialize date filter functionality
 */
function initializeDateFilters() {
    const applyBtn = document.getElementById('apply-filter');
    const clearBtn = document.getElementById('clear-filter');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyDateFilter);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearDateFilter);
    }
}

/**
 * Prevent default drag behaviors
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Highlight drop zone during drag
 */
function highlight(e) {
    const dropZone = document.getElementById('file-drop-zone');
    if (dropZone) {
        dropZone.classList.add('drag-over');
    }
}

/**
 * Remove highlight from drop zone
 */
function unhighlight(e) {
    const dropZone = document.getElementById('file-drop-zone');
    if (dropZone) {
        dropZone.classList.remove('drag-over');
    }
}

/**
 * Handle file drop
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    console.log('Files dropped:', files.length);
    handleFiles(files);
}

/**
 * Apply date filter
 */
function applyDateFilter() {
    const startDate = document.getElementById('start-date')?.value;
    const endDate = document.getElementById('end-date')?.value;
    
    if (startDate && endDate) {
        dateFilter.start = startDate;
        dateFilter.end = endDate;
        updateDashboard();
        
        // Show success message
        showStatusMessage('Date filter applied successfully', 'success');
    } else {
        showStatusMessage('Please select both start and end dates', 'error');
    }
}

/**
 * Clear date filter
 */
function clearDateFilter() {
    dateFilter.start = null;
    dateFilter.end = null;
    
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    
    updateDashboard();
    showStatusMessage('Date filter cleared', 'info');
}

/**
 * Show status message to user
 */
function showStatusMessage(message, type = 'info') {
    const statusDiv = document.getElementById('file-status');
    if (!statusDiv) return;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    statusDiv.innerHTML = `<p class="status-message ${type}">${icons[type]} ${message}</p>`;
    
    // Auto-clear after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            if (statusDiv.innerHTML.includes(message)) {
                statusDiv.innerHTML = '';
            }
        }, 5000);
    }
}

/**
 * Update the main dashboard
 */
function updateDashboard() {
    console.log('Updating dashboard...');
    
    const dashboard = document.getElementById('analytics-dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
    }
    
    // Get filtered data based on current filters
    filteredData = getFilteredData();
    console.log(`Dashboard updated with ${filteredData.length} records`);
    
    // Update all dashboard components
    if (window.Tables) {
        window.Tables.updateMetrics();
        window.Tables.updateCampaignTable();
        window.Tables.updateAudienceTable();
        window.Tables.updateAudienceSegmentTables();
        window.Tables.updateFloodlightActivities();
    }
    
    if (window.Charts) {
        window.Charts.updateTimeSeriesChart();
        window.Charts.updateAudienceChart();
        window.Charts.updateAudienceComparison();
    }
}

/**
 * Get filtered data based on current platform and date filters
 */
function getFilteredData() {
    let data = [...campaignData];
    
    // Filter by platform
    if (currentPlatform !== 'all') {
        data = data.filter(row => row.Platform === currentPlatform);
    }
    
    // Filter by date range
    if (dateFilter.start && dateFilter.end) {
        const startDate = new Date(dateFilter.start);
        const endDate = new Date(dateFilter.end);
        data = data.filter(row => {
            const rowDate = new Date(row.Date);
            return rowDate >= startDate && rowDate <= endDate;
        });
    }
    
    return data;
}

/**
 * Calculate comprehensive metrics from data
 */
function calculateMetrics(data) {
    if (!data || data.length === 0) {
        return {
            impressions: 0,
            clicks: 0,
            revenue: 0,
            conversions: 0,
            ctr: 0,
            cpm: 0,
            viewability: 0,
            conversionRate: 0
        };
    }
    
    const totals = data.reduce((acc, row) => ({
        impressions: acc.impressions + (row.Impressions || 0),
        clicks: acc.clicks + (row.Clicks || 0),
        revenue: acc.revenue + (row.Revenue || 0),
        viewableImpressions: acc.viewableImpressions + (row.ViewableImpressions || 0),
        conversions: acc.conversions + (row.TotalConversions || 0)
    }), { 
        impressions: 0, 
        clicks: 0, 
        revenue: 0, 
        viewableImpressions: 0, 
        conversions: 0 
    });
    
    return {
        impressions: totals.impressions,
        clicks: totals.clicks,
        revenue: totals.revenue,
        conversions: totals.conversions,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0,
        cpm: totals.impressions > 0 ? (totals.revenue / totals.impressions * 1000) : 0,
        viewability: totals.impressions > 0 ? (totals.viewableImpressions / totals.impressions * 100) : 0,
        conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks * 100) : 0
    };
}

// Make functions available globally for other modules
window.CampaignAnalyzer = {
    // State
    getCampaignData: () => campaignData,
    getFilteredData: () => filteredData,
    getCurrentPlatform: () => currentPlatform,
    getDateFilter: () => dateFilter,
    
    // Core functions
    updateDashboard,
    calculateMetrics,
    showStatusMessage,
    
    // Chart instances (for cleanup)
    getChartInstances: () => ({
        timeSeriesChart,
        audienceChart,
        audienceComparisonChart,
        fpSegmentsChart,
        cnvSegmentsChart
    }),
    
    setChartInstance: (name, instance) => {
        switch(name) {
            case 'timeSeriesChart': timeSeriesChart = instance; break;
            case 'audienceChart': audienceChart = instance; break;
            case 'audienceComparisonChart': audienceComparisonChart = instance; break;
            case 'fpSegmentsChart': fpSegmentsChart = instance; break;
            case 'cnvSegmentsChart': cnvSegmentsChart = instance; break;
        }
    }
};