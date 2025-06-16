/**
 * Campaign Analyzer - Tables Module
 * Handles all table updates and data display
 */

/**
 * Update main metrics display
 */
function updateMetrics() {
    const data = window.CampaignAnalyzer.getFilteredData();
    
    if (!data || data.length === 0) {
        console.log('No data available for metrics');
        clearMetrics();
        return;
    }
    
    const totals = data.reduce((acc, row) => ({
        impressions: acc.impressions + (row.Impressions || 0),
        clicks: acc.clicks + (row.Clicks || 0),
        revenue: acc.revenue + (row.Revenue || 0),
        viewableImpressions: acc.viewableImpressions + (row.ViewableImpressions || 0),
        totalConversions: acc.totalConversions + (row.TotalConversions || 0),
        postClickConversions: acc.postClickConversions + (row.PostClickConversions || 0),
        postViewConversions: acc.postViewConversions + (row.PostViewConversions || 0)
    }), { 
        impressions: 0, clicks: 0, revenue: 0, viewableImpressions: 0,
        totalConversions: 0, postClickConversions: 0, postViewConversions: 0
    });
    
    // Calculate derived metrics with safety checks
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0;
    const conversionRate = totals.impressions > 0 ? (totals.totalConversions / totals.impressions * 100) : 0;
    
    // Update metric displays
    const metricUpdates = {
        'total-impressions': totals.impressions.toLocaleString(),
        'total-clicks': totals.clicks.toLocaleString(),
        'total-revenue': '$' + totals.revenue.toLocaleString(undefined, {minimumFractionDigits: 2}),
        'overall-ctr': ctr.toFixed(3) + '%',
        'total-conversions': totals.totalConversions.toLocaleString(),
        'conversion-rate': conversionRate.toFixed(4) + '%',
        'post-click-conversions': totals.postClickConversions.toLocaleString(),
        'post-view-conversions': totals.postViewConversions.toLocaleString()
    };
    
    Object.entries(metricUpdates).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

/**
 * Clear metrics display when no data
 */
function clearMetrics() {
    const metricIds = [
        'total-impressions', 'total-clicks', 'total-revenue', 'overall-ctr',
        'total-conversions', 'conversion-rate', 'post-click-conversions', 'post-view-conversions'
    ];
    
    metricIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '0';
        }
    });
}

/**
 * Update campaign performance table
 */
function updateCampaignTable() {
    const data = window.CampaignAnalyzer.getFilteredData();
    const tbody = document.querySelector('#campaign-table tbody');
    
    if (!tbody) {
        console.error('Campaign table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">No data available</td></tr>';
        return;
    }
    
    // Group by campaign type
    const campaignData = {};
    data.forEach(row => {
        const campaign = row.CampaignType || 'Unknown';
        
        if (!campaignData[campaign]) {
            campaignData[campaign] = { 
                impressions: 0, 
                clicks: 0, 
                revenue: 0, 
                conversions: 0,
                platform: row.Platform || 'unknown'
            };
        }
        
        campaignData[campaign].impressions += row.Impressions || 0;
        campaignData[campaign].clicks += row.Clicks || 0;
        campaignData[campaign].revenue += row.Revenue || 0;
        campaignData[campaign].conversions += row.TotalConversions || 0;
    });
    
    // Sort by impressions descending
    const sortedCampaigns = Object.entries(campaignData)
        .sort(([,a], [,b]) => b.impressions - a.impressions);
    
    sortedCampaigns.forEach(([campaign, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const convRate = metrics.impressions > 0 ? (metrics.conversions / metrics.impressions * 100) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td title="${campaign}">${campaign.length > 30 ? campaign.substring(0, 30) + '...' : campaign}</td>
            <td><span class="platform-badge ${metrics.platform}">${metrics.platform.toUpperCase()}</span></td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td>$${metrics.revenue.toFixed(2)}</td>
            <td>${ctr.toFixed(3)}%</td>
            <td>$${cpm.toFixed(2)}</td>
            <td>${metrics.conversions.toLocaleString()}</td>
            <td>${convRate.toFixed(4)}%</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
}

/**
 * Update audience performance table
 */
function updateAudienceTable() {
    const data = window.CampaignAnalyzer.getFilteredData();
    const tbody = document.querySelector('#audience-table tbody');
    
    if (!tbody) {
        console.error('Audience table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">No data available</td></tr>';
        return;
    }
    
    // Group by audience type
    const audienceData = {};
    data.forEach(row => {
        const audience = row.AudienceType || 'Unknown';
        
        if (!audienceData[audience]) {
            audienceData[audience] = { 
                impressions: 0, 
                clicks: 0, 
                revenue: 0, 
                viewableImpressions: 0, 
                conversions: 0,
                platform: row.Platform || 'unknown'
            };
        }
        
        audienceData[audience].impressions += row.Impressions || 0;
        audienceData[audience].clicks += row.Clicks || 0;
        audienceData[audience].revenue += row.Revenue || 0;
        audienceData[audience].viewableImpressions += row.ViewableImpressions || 0;
        audienceData[audience].conversions += row.TotalConversions || 0;
    });
    
    // Sort by impressions descending
    const sortedAudiences = Object.entries(audienceData)
        .sort(([,a], [,b]) => b.impressions - a.impressions);
    
    sortedAudiences.forEach(([audience, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const viewability = metrics.impressions > 0 ? (metrics.viewableImpressions / metrics.impressions * 100) : 0;
        const convRate = metrics.impressions > 0 ? (metrics.conversions / metrics.impressions * 100) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${audience}</td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td>${ctr.toFixed(3)}%</td>
            <td>$${cpm.toFixed(2)}</td>
            <td>${viewability.toFixed(1)}%</td>
            <td>${metrics.conversions.toLocaleString()}</td>
            <td>${convRate.toFixed(4)}%</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
}

/**
 * Update audience segment tables
 */
function updateAudienceSegmentTables() {
    updateFirstPartySegments();
    updateConvergedSegments();
}

/**
 * Update first party segments table
 */
function updateFirstPartySegments() {
    const data = window.CampaignAnalyzer.getFilteredData().filter(row => row.AudienceType === '1st Party');
    const tbody = document.querySelector('#fp-segments-table tbody');
    
    if (!tbody) {
        console.error('First party segments table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">No first-party data available</td></tr>';
        return;
    }
    
    // Group by audience segment
    const segmentData = {};
    data.forEach(row => {
        const segment = row.AudienceSegment || 'Unknown';
        
        if (!segmentData[segment]) {
            segmentData[segment] = { 
                impressions: 0, 
                clicks: 0, 
                revenue: 0, 
                viewableImpressions: 0,
                postClickConversions: 0, 
                postViewConversions: 0, 
                totalConversions: 0
            };
        }
        
        segmentData[segment].impressions += row.Impressions || 0;
        segmentData[segment].clicks += row.Clicks || 0;
        segmentData[segment].revenue += row.Revenue || 0;
        segmentData[segment].viewableImpressions += row.ViewableImpressions || 0;
        segmentData[segment].postClickConversions += row.PostClickConversions || 0;
        segmentData[segment].postViewConversions += row.PostViewConversions || 0;
        segmentData[segment].totalConversions += row.TotalConversions || 0;
    });
    
    // Sort by impressions descending
    const sortedSegments = Object.entries(segmentData)
        .sort(([,a], [,b]) => b.impressions - a.impressions);
    
    sortedSegments.forEach(([segment, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const viewability = metrics.impressions > 0 ? (metrics.viewableImpressions / metrics.impressions * 100) : 0;
        const convRate = metrics.impressions > 0 ? (metrics.totalConversions / metrics.impressions * 100) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td title="${segment}">${segment.length > 25 ? segment.substring(0, 25) + '...' : segment}</td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td>${ctr.toFixed(3)}%</td>
            <td>$${cpm.toFixed(2)}</td>
            <td>${viewability.toFixed(1)}%</td>
            <td>${convRate.toFixed(4)}%</td>
            <td>${metrics.postClickConversions.toFixed(2)}</td>
            <td>${metrics.postViewConversions.toFixed(2)}</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
    
    // Create chart for 1P segments
    window.Charts.createSegmentChart('fp-segments-chart', segmentData, '1st Party Audience Segments');
}

/**
 * Update converged segments table
 */
function updateConvergedSegments() {
    const data = window.CampaignAnalyzer.getFilteredData().filter(row => row.AudienceType === 'Converged');
    const tbody = document.querySelector('#cnv-segments-table tbody');
    
    if (!tbody) {
        console.error('Converged segments table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">No converged audience data available</td></tr>';
        return;
    }
    
    // Group by audience segment
    const segmentData = {};
    data.forEach(row => {
        const segment = row.AudienceSegment || 'Unknown';
        
        if (!segmentData[segment]) {
            segmentData[segment] = { 
                impressions: 0, 
                clicks: 0, 
                revenue: 0, 
                viewableImpressions: 0,
                postClickConversions: 0, 
                postViewConversions: 0, 
                totalConversions: 0
            };
        }
        
        segmentData[segment].impressions += row.Impressions || 0;
        segmentData[segment].clicks += row.Clicks || 0;
        segmentData[segment].revenue += row.Revenue || 0;
        segmentData[segment].viewableImpressions += row.ViewableImpressions || 0;
        segmentData[segment].postClickConversions += row.PostClickConversions || 0;
        segmentData[segment].postViewConversions += row.PostViewConversions || 0;
        segmentData[segment].totalConversions += row.TotalConversions || 0;
    });
    
    // Sort by impressions descending
    const sortedSegments = Object.entries(segmentData)
        .sort(([,a], [,b]) => b.impressions - a.impressions);
    
    sortedSegments.forEach(([segment, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const viewability = metrics.impressions > 0 ? (metrics.viewableImpressions / metrics.impressions * 100) : 0;
        const convRate = metrics.impressions > 0 ? (metrics.totalConversions / metrics.impressions * 100) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td title="${segment}">${segment.length > 25 ? segment.substring(0, 25) + '...' : segment}</td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td>${ctr.toFixed(3)}%</td>
            <td>$${cpm.toFixed(2)}</td>
            <td>${viewability.toFixed(1)}%</td>
            <td>${convRate.toFixed(4)}%</td>
            <td>${metrics.postClickConversions.toFixed(2)}</td>
            <td>${metrics.postViewConversions.toFixed(2)}</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
    
    // Create chart for converged segments
    window.Charts.createSegmentChart('cnv-segments-chart', segmentData, 'Converged Audience Segments');
}

/**
 * Add table sorting functionality
 */
function addTableSorting() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            // Skip if header already has sorting
            if (header.classList.contains('sortable')) return;
            
            header.classList.add('sortable');
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            
            // Add sort indicator
            header.innerHTML += ' <span class="sort-indicator">⇅</span>';
            
            header.addEventListener('click', () => {
                sortTable(table, index);
            });
        });
    });
}

/**
 * Sort table by column
 */
function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const header = table.querySelectorAll('th')[columnIndex];
    
    // Determine sort direction
    const isAscending = !header.classList.contains('sort-desc');
    
    // Clear all sort indicators
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        const indicator = th.querySelector('.sort-indicator');
        if (indicator) {
            indicator.textContent = '⇅';
        }
    });
    
    // Set current sort indicator
    header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
    const indicator = header.querySelector('.sort-indicator');
    if (indicator) {
        indicator.textContent = isAscending ? '↑' : '↓';
    }
    
    // Sort rows
    rows.sort((a, b) => {
        const aVal = a.cells[columnIndex]?.textContent.trim() || '';
        const bVal = b.cells[columnIndex]?.textContent.trim() || '';
        
        // Try to parse as numbers
        const aNum = parseFloat(aVal.replace(/[$,%]/g, ''));
        const bNum = parseFloat(bVal.replace(/[$,%]/g, ''));
        
        let comparison = 0;
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            // Numeric comparison
            comparison = aNum - bNum;
        } else {
            // String comparison
            comparison = aVal.localeCompare(bVal);
        }
        
        return isAscending ? comparison : -comparison;
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Initialize table sorting when module loads
document.addEventListener('DOMContentLoaded', () => {
    // Delay to ensure tables are rendered
    setTimeout(addTableSorting, 1000);
});

// Make functions available globally
window.Tables = {
    updateMetrics,
    updateCampaignTable,
    updateAudienceTable,
    updateAudienceSegmentTables,
    updateFirstPartySegments,
    updateConvergedSegments,
    addTableSorting,
    sortTable
};