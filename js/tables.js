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
    const cpm = totals.impressions > 0 ? (totals.revenue / totals.impressions * 1000) : 0;
    const cpc = totals.clicks > 0 ? (totals.revenue / totals.clicks) : 0;
    
    // Conversion rates calculated from clicks (not impressions)
    const postClickConversionRate = totals.clicks > 0 ? (totals.postClickConversions / totals.clicks * 100) : 0;
    const postViewConversionRate = totals.clicks > 0 ? (totals.postViewConversions / totals.clicks * 100) : 0;
    const overallConversionRate = totals.clicks > 0 ? (totals.totalConversions / totals.clicks * 100) : 0;
    
    // Cost per acquisition metrics
    const cpaPostClick = totals.postClickConversions > 0 ? (totals.revenue / totals.postClickConversions) : 0;
    const cpaPostView = totals.postViewConversions > 0 ? (totals.revenue / totals.postViewConversions) : 0;
    
    // Update metric displays - currency info moved to card descriptions
    const metricUpdates = {
        'total-impressions': totals.impressions.toLocaleString(),
        'total-clicks': totals.clicks.toLocaleString(),
        'total-revenue': totals.revenue.toLocaleString(undefined, {minimumFractionDigits: 2}),
        'overall-ctr': ctr.toFixed(3) + '%',
        'cpm': cpm.toFixed(2),
        'cpc': cpc.toFixed(2),
        'total-conversions': totals.totalConversions.toLocaleString(),
        'conversion-rate': overallConversionRate.toFixed(4) + '%',
        'post-click-conversions': totals.postClickConversions.toLocaleString(),
        'post-click-conversion-rate': postClickConversionRate.toFixed(4) + '%',
        'post-view-conversions': totals.postViewConversions.toLocaleString(),
        'post-view-conversion-rate': postViewConversionRate.toFixed(4) + '%',
        'cpa-post-click': cpaPostClick.toFixed(2),
        'cpa-post-view': cpaPostView.toFixed(2)
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
        'total-impressions', 'total-clicks', 'total-revenue', 'overall-ctr', 'cpm', 'cpc',
        'total-conversions', 'conversion-rate', 'post-click-conversions', 'post-click-conversion-rate',
        'post-view-conversions', 'post-view-conversion-rate', 'cpa-post-click', 'cpa-post-view'
    ];
    
    metricIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const isPLN = id.includes('cpm') || id.includes('cpc') || id.includes('cpa') || id.includes('revenue');
            element.textContent = isPLN ? '0 PLN' : '0';
        }
    });
}

/**
 * Table sorting functionality
 */
let currentSort = { column: null, direction: 'asc' };

function initializeTableSorting() {
    // Add click listeners to all sortable headers
    document.querySelectorAll('th.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const table = header.closest('table');
            const columnIndex = Array.from(header.parentNode.children).indexOf(header);
            const dataType = header.dataset.type || 'string';
            sortTable(table, columnIndex, dataType);
        });
    });
}

function sortTable(table, columnIndex, dataType) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Determine sort direction
    const header = table.querySelectorAll('th')[columnIndex];
    let direction = 'asc';
    
    if (currentSort.column === columnIndex) {
        direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    
    // Update visual indicators
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    header.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
    
    // Sort rows
    rows.sort((a, b) => {
        const aCell = a.cells[columnIndex];
        const bCell = b.cells[columnIndex];
        
        let aValue = aCell.textContent.trim();
        let bValue = bCell.textContent.trim();
        
        // Handle different data types
        switch (dataType) {
            case 'number':
                aValue = parseFloat(aValue.replace(/[,%\s]/g, '').replace('PLN', '')) || 0;
                bValue = parseFloat(bValue.replace(/[,%\s]/g, '').replace('PLN', '')) || 0;
                break;
            case 'currency':
                aValue = parseFloat(aValue.replace(/[,\s]/g, '').replace('PLN', '')) || 0;
                bValue = parseFloat(bValue.replace(/[,\s]/g, '').replace('PLN', '')) || 0;
                break;
            case 'percentage':
                aValue = parseFloat(aValue.replace('%', '')) || 0;
                bValue = parseFloat(bValue.replace('%', '')) || 0;
                break;
            default: // string
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
        }
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        return direction === 'asc' ? comparison : -comparison;
    });
    
    // Update current sort state
    currentSort = { column: columnIndex, direction };
    
    // Rebuild tbody with sorted rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
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
                postClickConversions: 0,
                postViewConversions: 0,
                platform: row.Platform || 'unknown'
            };
        }
        
        campaignData[campaign].impressions += row.Impressions || 0;
        campaignData[campaign].clicks += row.Clicks || 0;
        campaignData[campaign].revenue += row.Revenue || 0;
        campaignData[campaign].conversions += row.TotalConversions || 0;
        campaignData[campaign].postClickConversions += row.PostClickConversions || 0;
        campaignData[campaign].postViewConversions += row.PostViewConversions || 0;
    });
    
    // Sort by revenue descending (highest to lowest)
    const sortedCampaigns = Object.entries(campaignData)
        .sort(([,a], [,b]) => b.revenue - a.revenue);
    
    sortedCampaigns.forEach(([campaign, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const cpc = metrics.clicks > 0 ? (metrics.revenue / metrics.clicks) : 0;
        
        // Conversion rates calculated from clicks
        const postClickConvRate = metrics.clicks > 0 ? (metrics.postClickConversions / metrics.clicks * 100) : 0;
        const postViewConvRate = metrics.clicks > 0 ? (metrics.postViewConversions / metrics.clicks * 100) : 0;
        const overallConvRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks * 100) : 0;
        
        // CPA metrics
        const cpaPostClick = metrics.postClickConversions > 0 ? (metrics.revenue / metrics.postClickConversions) : 0;
        const cpaPostView = metrics.postViewConversions > 0 ? (metrics.revenue / metrics.postViewConversions) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td title="${campaign}">${campaign.length > 30 ? campaign.substring(0, 30) + '...' : campaign}</td>
            <td><span class="platform-badge ${metrics.platform}">${metrics.platform.toUpperCase()}</span></td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td class="currency-pln">${metrics.revenue.toFixed(2)} PLN</td>
            <td>${ctr.toFixed(3)}%</td>
            <td class="currency-pln">${cpm.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpc.toFixed(2)} PLN</td>
            <td>${metrics.conversions.toLocaleString()}</td>
            <td class="metric-${overallConvRate > 0 ? 'positive' : 'neutral'}">${overallConvRate.toFixed(4)}%</td>
            <td class="metric-${postClickConvRate > 0 ? 'positive' : 'neutral'}">${postClickConvRate.toFixed(4)}%</td>
            <td class="metric-${postViewConvRate > 0 ? 'positive' : 'neutral'}">${postViewConvRate.toFixed(4)}%</td>
            <td class="currency-pln">${cpaPostClick.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpaPostView.toFixed(2)} PLN</td>
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
                postClickConversions: 0,
                postViewConversions: 0,
                platform: row.Platform || 'unknown'
            };
        }
        
        audienceData[audience].impressions += row.Impressions || 0;
        audienceData[audience].clicks += row.Clicks || 0;
        audienceData[audience].revenue += row.Revenue || 0;
        audienceData[audience].viewableImpressions += row.ViewableImpressions || 0;
        audienceData[audience].conversions += row.TotalConversions || 0;
        audienceData[audience].postClickConversions += row.PostClickConversions || 0;
        audienceData[audience].postViewConversions += row.PostViewConversions || 0;
    });
    
    // Sort by revenue descending (highest to lowest)
    const sortedAudiences = Object.entries(audienceData)
        .sort(([,a], [,b]) => b.revenue - a.revenue);
    
    sortedAudiences.forEach(([audience, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const cpc = metrics.clicks > 0 ? (metrics.revenue / metrics.clicks) : 0;
        const viewability = metrics.impressions > 0 ? (metrics.viewableImpressions / metrics.impressions * 100) : 0;
        
        // Conversion rates calculated from clicks
        const postClickConvRate = metrics.clicks > 0 ? (metrics.postClickConversions / metrics.clicks * 100) : 0;
        const postViewConvRate = metrics.clicks > 0 ? (metrics.postViewConversions / metrics.clicks * 100) : 0;
        const overallConvRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks * 100) : 0;
        
        // CPA metrics
        const cpaPostClick = metrics.postClickConversions > 0 ? (metrics.revenue / metrics.postClickConversions) : 0;
        const cpaPostView = metrics.postViewConversions > 0 ? (metrics.revenue / metrics.postViewConversions) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${audience}</td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td class="currency-pln">${metrics.revenue.toFixed(2)} PLN</td>
            <td>${ctr.toFixed(3)}%</td>
            <td class="currency-pln">${cpm.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpc.toFixed(2)} PLN</td>
            <td>${viewability.toFixed(1)}%</td>
            <td>${metrics.conversions.toLocaleString()}</td>
            <td class="metric-${overallConvRate > 0 ? 'positive' : 'neutral'}">${overallConvRate.toFixed(4)}%</td>
            <td class="metric-${postClickConvRate > 0 ? 'positive' : 'neutral'}">${postClickConvRate.toFixed(4)}%</td>
            <td class="metric-${postViewConvRate > 0 ? 'positive' : 'neutral'}">${postViewConvRate.toFixed(4)}%</td>
            <td class="currency-pln">${cpaPostClick.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpaPostView.toFixed(2)} PLN</td>
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
        tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: #666;">No first-party data available</td></tr>';
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
    
    // Sort by revenue descending (highest to lowest)
    const sortedSegments = Object.entries(segmentData)
        .sort(([,a], [,b]) => b.revenue - a.revenue);
    
    sortedSegments.forEach(([segment, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const cpc = metrics.clicks > 0 ? (metrics.revenue / metrics.clicks) : 0;
        const viewability = metrics.impressions > 0 ? (metrics.viewableImpressions / metrics.impressions * 100) : 0;
        
        // Conversion rates calculated from clicks
        const postClickConvRate = metrics.clicks > 0 ? (metrics.postClickConversions / metrics.clicks * 100) : 0;
        const postViewConvRate = metrics.clicks > 0 ? (metrics.postViewConversions / metrics.clicks * 100) : 0;
        const overallConvRate = metrics.clicks > 0 ? (metrics.totalConversions / metrics.clicks * 100) : 0;
        
        // CPA metrics
        const cpaPostClick = metrics.postClickConversions > 0 ? (metrics.revenue / metrics.postClickConversions) : 0;
        const cpaPostView = metrics.postViewConversions > 0 ? (metrics.revenue / metrics.postViewConversions) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td title="${segment}">${segment.length > 25 ? segment.substring(0, 25) + '...' : segment}</td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td class="currency-pln">${metrics.revenue.toFixed(2)} PLN</td>
            <td>${ctr.toFixed(3)}%</td>
            <td class="currency-pln">${cpm.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpc.toFixed(2)} PLN</td>
            <td>${viewability.toFixed(1)}%</td>
            <td class="metric-${overallConvRate > 0 ? 'positive' : 'neutral'}">${overallConvRate.toFixed(4)}%</td>
            <td class="metric-${postClickConvRate > 0 ? 'positive' : 'neutral'}">${postClickConvRate.toFixed(4)}%</td>
            <td class="metric-${postViewConvRate > 0 ? 'positive' : 'neutral'}">${postViewConvRate.toFixed(4)}%</td>
            <td class="currency-pln">${cpaPostClick.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpaPostView.toFixed(2)} PLN</td>
            <td>${metrics.postClickConversions.toLocaleString()}</td>
            <td>${metrics.postViewConversions.toLocaleString()}</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
    
    // Create enhanced chart for 1P segments with revenue bars and switchable metrics
    window.Charts.createEnhancedSegmentChart('fp-segments-chart', segmentData, '1st Party Audience Segments', 'ctr');
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
        tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: #666;">No converged audience data available</td></tr>';
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
    
    // Sort by revenue descending (highest to lowest)
    const sortedSegments = Object.entries(segmentData)
        .sort(([,a], [,b]) => b.revenue - a.revenue);
    
    sortedSegments.forEach(([segment, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpm = metrics.impressions > 0 ? (metrics.revenue / metrics.impressions * 1000) : 0;
        const cpc = metrics.clicks > 0 ? (metrics.revenue / metrics.clicks) : 0;
        const viewability = metrics.impressions > 0 ? (metrics.viewableImpressions / metrics.impressions * 100) : 0;
        
        // Conversion rates calculated from clicks
        const postClickConvRate = metrics.clicks > 0 ? (metrics.postClickConversions / metrics.clicks * 100) : 0;
        const postViewConvRate = metrics.clicks > 0 ? (metrics.postViewConversions / metrics.clicks * 100) : 0;
        const overallConvRate = metrics.clicks > 0 ? (metrics.totalConversions / metrics.clicks * 100) : 0;
        
        // CPA metrics
        const cpaPostClick = metrics.postClickConversions > 0 ? (metrics.revenue / metrics.postClickConversions) : 0;
        const cpaPostView = metrics.postViewConversions > 0 ? (metrics.revenue / metrics.postViewConversions) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td title="${segment}">${segment.length > 25 ? segment.substring(0, 25) + '...' : segment}</td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td class="currency-pln">${metrics.revenue.toFixed(2)} PLN</td>
            <td>${ctr.toFixed(3)}%</td>
            <td class="currency-pln">${cpm.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpc.toFixed(2)} PLN</td>
            <td>${viewability.toFixed(1)}%</td>
            <td class="metric-${overallConvRate > 0 ? 'positive' : 'neutral'}">${overallConvRate.toFixed(4)}%</td>
            <td class="metric-${postClickConvRate > 0 ? 'positive' : 'neutral'}">${postClickConvRate.toFixed(4)}%</td>
            <td class="metric-${postViewConvRate > 0 ? 'positive' : 'neutral'}">${postViewConvRate.toFixed(4)}%</td>
            <td class="currency-pln">${cpaPostClick.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpaPostView.toFixed(2)} PLN</td>
            <td>${metrics.postClickConversions.toLocaleString()}</td>
            <td>${metrics.postViewConversions.toLocaleString()}</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
    
    // Create enhanced chart for converged segments with revenue bars and switchable metrics
    window.Charts.createEnhancedSegmentChart('cnv-segments-chart', segmentData, 'Converged Audience Segments', 'ctr');
}

/**
 * Update floodlight activities table
 */
function updateFloodlightActivities() {
    const data = window.CampaignAnalyzer.getFilteredData();
    const tbody = document.querySelector('#floodlight-activities-table tbody');
    
    if (!tbody) {
        console.error('Floodlight activities table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: #666;">No floodlight data available</td></tr>';
        return;
    }
    
    // Filter for DV360 data with floodlight activities
    const floodlightData = data.filter(row => 
        row.Platform === 'dv360' && 
        row.FloodlightActivity && 
        row.FloodlightActivity !== 'Unknown' &&
        (row.PostClickConversions > 0 || row.PostViewConversions > 0)
    );
    
    if (floodlightData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: #666;">No floodlight activities with conversions found</td></tr>';
        return;
    }
    
    // Group by floodlight activity
    const activityData = {};
    floodlightData.forEach(row => {
        const activityKey = `${row.FloodlightActivity}_${row.FloodlightGroup}`;
        
        if (!activityData[activityKey]) {
            activityData[activityKey] = { 
                activity: row.FloodlightActivity,
                group: row.FloodlightGroup,
                tag: row.FloodlightTag,
                impressions: 0, 
                clicks: 0, 
                revenue: 0, 
                postClickConversions: 0,
                postViewConversions: 0,
                totalConversions: 0,
                campaigns: new Set()
            };
        }
        
        activityData[activityKey].impressions += row.Impressions || 0;
        activityData[activityKey].clicks += row.Clicks || 0;
        activityData[activityKey].revenue += row.Revenue || 0;
        activityData[activityKey].postClickConversions += row.PostClickConversions || 0;
        activityData[activityKey].postViewConversions += row.PostViewConversions || 0;
        activityData[activityKey].totalConversions += row.TotalConversions || 0;
        activityData[activityKey].campaigns.add(row.Campaign);
    });
    
    // Sort by total conversions descending (highest to lowest)
    const sortedActivities = Object.entries(activityData)
        .sort(([,a], [,b]) => b.totalConversions - a.totalConversions);
    
    sortedActivities.forEach(([activityKey, metrics]) => {
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100) : 0;
        const cpc = metrics.clicks > 0 ? (metrics.revenue / metrics.clicks) : 0;
        
        // Conversion rates calculated from clicks
        const postClickConvRate = metrics.clicks > 0 ? (metrics.postClickConversions / metrics.clicks * 100) : 0;
        const postViewConvRate = metrics.clicks > 0 ? (metrics.postViewConversions / metrics.clicks * 100) : 0;
        const overallConvRate = metrics.clicks > 0 ? (metrics.totalConversions / metrics.clicks * 100) : 0;
        
        // CPA metrics
        const cpaPostClick = metrics.postClickConversions > 0 ? (metrics.revenue / metrics.postClickConversions) : 0;
        const cpaPostView = metrics.postViewConversions > 0 ? (metrics.revenue / metrics.postViewConversions) : 0;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td title="${metrics.activity}">${metrics.activity.length > 25 ? metrics.activity.substring(0, 25) + '...' : metrics.activity}</td>
            <td><span class="platform-badge floodlight">${metrics.group}</span></td>
            <td class="font-mono">${metrics.tag}</td>
            <td>${metrics.campaigns.size}</td>
            <td>${metrics.impressions.toLocaleString()}</td>
            <td>${metrics.clicks.toLocaleString()}</td>
            <td class="currency-pln">${metrics.revenue.toFixed(2)} PLN</td>
            <td>${ctr.toFixed(3)}%</td>
            <td class="currency-pln">${cpc.toFixed(2)} PLN</td>
            <td class="metric-${metrics.totalConversions > 0 ? 'positive' : 'neutral'}">${metrics.totalConversions.toLocaleString()}</td>
            <td class="metric-${postClickConvRate > 0 ? 'positive' : 'neutral'}">${postClickConvRate.toFixed(4)}%</td>
            <td class="metric-${postViewConvRate > 0 ? 'positive' : 'neutral'}">${postViewConvRate.toFixed(4)}%</td>
            <td class="currency-pln">${cpaPostClick.toFixed(2)} PLN</td>
            <td class="currency-pln">${cpaPostView.toFixed(2)} PLN</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
}

/**
 * Add table sorting functionality to all tables
 */
function addTableSorting() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            // Skip if header already has sorting or is not meant to be sortable
            if (header.classList.contains('sortable') || header.classList.contains('no-sort')) return;
            
            header.classList.add('sortable');
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            
            // Determine data type from content or data attribute
            let dataType = header.dataset.type || 'string';
            if (!header.dataset.type) {
                const firstRow = table.querySelector('tbody tr');
                if (firstRow && firstRow.cells[index]) {
                    const cellContent = firstRow.cells[index].textContent.trim();
                    if (cellContent.includes('%')) dataType = 'percentage';
                    else if (cellContent.includes('PLN')) dataType = 'currency';
                    else if (!isNaN(parseFloat(cellContent.replace(/[,\s]/g, '')))) dataType = 'number';
                }
            }
            header.dataset.type = dataType;
            
            header.addEventListener('click', () => {
                sortTable(table, index, dataType);
            });
        });
    });
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
    updateFloodlightActivities,
    addTableSorting,
    initializeTableSorting,
    sortTable
};