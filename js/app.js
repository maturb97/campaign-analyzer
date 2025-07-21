// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Campaign Analyzer app loaded.');

    let processedCampaignData = []; // Store processed data globally

    // Function to render the UI
    function renderUI() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <p>Upload your CSV report here.</p>
            <input type="file" id="csvFileInput" accept=".csv" />
            <div id="filters-container"></div>
            <div id="breakdowns-container"></div>
        `;

        document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);
    }

    // Function to handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvContent = e.target.result;
                console.log('CSV file loaded. Content length:', csvContent.length);
                try {
                    const rawData = parseCSV(csvContent);
                    processedCampaignData = processData(rawData);
                    console.log('Processed Data:', processedCampaignData);
                    alert('CSV file loaded and processed successfully!');
                    renderFilters(processedCampaignData);
                    renderBreakdowns(processedCampaignData);
                } catch (error) {
                    console.error('Error processing CSV:', error);
                    alert('Error processing CSV: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    }

    // Placeholder for rendering filters
    function renderFilters(data) {
        const filtersContainer = document.getElementById('filters-container');
        filtersContainer.innerHTML = `
            <h2>Filters</h2>
            <div class="filter-group">
                <label for="datePicker">Date Range:</label>
                <input type="date" id="startDate">
                <input type="date" id="endDate">
            </div>
            <div class="filter-group">
                <label for="b2bB2cSwitcher">B2B / B2C:</label>
                <select id="b2bB2cSwitcher">
                    <option value="all">All</option>
                    ${[...new Set(data.map(row => row.B2B_B2C_Type))].filter(type => type !== null).map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="campaignFilter">Campaign ID:</label>
                <select id="campaignFilter">
                    <option value="all">All</option>
                    ${[...new Set(data.map(row => row.CampaignID))].filter(id => id !== null).map(id => `<option value="${id}">${id}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="ampIdFilter">AMP ID:</label>
                <select id="ampIdFilter">
                    <option value="all">All</option>
                    ${[...new Set(data.map(row => row.AMPID))].filter(id => id !== null).map(id => `<option value="${id}">${id}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="audienceTypeFilter">Audience Type:</label>
                <select id="audienceTypeFilter">
                    <option value="all">All</option>
                    ${[...new Set(data.map(row => row.AudienceType))].filter(type => type !== 'Unknown').map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="optimizedTargetingFilter">Optimized Targeting:</label>
                <select id="optimizedTargetingFilter">
                    <option value="all">All</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="customBiddingFilter">Custom Bidding:</label>
                <select id="customBiddingFilter">
                    <option value="all">All</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="optimizationTypeFilter">FL/GA Optimization:</label>
                <select id="optimizationTypeFilter">
                    <option value="all">All</option>
                    ${[...new Set(data.map(row => row.OptimizationType))].filter(type => type !== 'Unknown').map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
        `;

        // Add event listeners to filters to trigger data re-rendering
        filtersContainer.querySelectorAll('select, input[type="date"]').forEach(filter => {
            filter.addEventListener('change', applyFiltersAndRenderBreakdowns);
        });
    }

    // Placeholder for applying filters and rendering breakdowns
    function applyFiltersAndRenderBreakdowns() {
        let filteredData = [...processedCampaignData];

        // Apply date filter
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        if (startDate) {
            filteredData = filteredData.filter(row => row.Date >= startDate);
        }
        if (endDate) {
            filteredData = filteredData.filter(row => row.Date <= endDate);
        }

        // Apply Campaign ID filter
        const selectedCampaignId = document.getElementById('campaignFilter').value;
        if (selectedCampaignId !== 'all') {
            filteredData = filteredData.filter(row => row.CampaignID === selectedCampaignId);
        }

        // Apply AMP ID filter
        const selectedAmpId = document.getElementById('ampIdFilter').value;
        if (selectedAmpId !== 'all') {
            filteredData = filteredData.filter(row => row.AMPID === selectedAmpId);
        }

        // Apply Audience Type filter
        const selectedAudienceType = document.getElementById('audienceTypeFilter').value;
        if (selectedAudienceType !== 'all') {
            filteredData = filteredData.filter(row => row.AudienceType === selectedAudienceType);
        }

        // Apply Optimized Targeting filter
        const selectedOptimizedTargeting = document.getElementById('optimizedTargetingFilter').value;
        if (selectedOptimizedTargeting !== 'all') {
            filteredData = filteredData.filter(row => row.OptimizedTargeting === selectedOptimizedTargeting);
        }

        // Apply Custom Bidding filter
        const selectedCustomBidding = document.getElementById('customBiddingFilter').value;
        if (selectedCustomBidding !== 'all') {
            filteredData = filteredData.filter(row => row.CustomBidding === selectedCustomBidding);
        }

        // Apply FL/GA Optimization filter
        const selectedOptimizationType = document.getElementById('optimizationTypeFilter').value;
        if (selectedOptimizationType !== 'all') {
            filteredData = filteredData.filter(row => row.OptimizationType === selectedOptimizationType);
        }

        // Apply B2B/B2C filter
        const selectedB2B_B2C_Type = document.getElementById('b2bB2cSwitcher').value;
        if (selectedB2B_B2C_Type !== 'all') {
            filteredData = filteredData.filter(row => row.B2B_B2C_Type === selectedB2B_B2C_Type);
        }

        renderBreakdowns(filteredData);
    }

    // Placeholder for rendering breakdowns
    function renderBreakdowns(data) {
        const breakdownsContainer = document.getElementById('breakdowns-container');
        breakdownsContainer.innerHTML = `
            <h2>Breakdowns</h2>
            <div id="overview-summary"></div>
            <div class="chart-section">
                <h3>Impressions & Clicks - Daily</h3>
                <canvas id="impressionsClicksDailyChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Impressions & Clicks - Weekly</h3>
                <canvas id="impressionsClicksWeeklyChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Conversions & CVR - Daily</h3>
                <canvas id="conversionsCVRDailyChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Conversions & CVR - Weekly</h3>
                <canvas id="conversionsCVRWeeklyChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Revenue & CPC - Daily</h3>
                <canvas id="revenueCPCDailyChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Revenue & CPC - Weekly</h3>
                <canvas id="revenueCPCWeeklyChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Revenue & CPA - Daily</h3>
                <canvas id="revenueCPADailyChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Revenue & CPA - Weekly</h3>
                <canvas id="revenueCPAWeeklyChart"></canvas>
            </div>
            <div id="audience-types-table"></div>
            <div id="optimized-targeting-table"></div>
            <div id="audiences-table"></div>
            <div id="custom-bidding-table"></div>
            <div id="fl-ga-optimization-table"></div>
            <div id="creative-lines-table"></div>
            <div class="chart-section">
                <h3>Daily Trends (CTR, PV CVR, PC CVR)</h3>
                <canvas id="dailyTrendChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Weekly Trends (CTR, PV CVR, PC CVR)</h3>
                <canvas id="weeklyTrendChart"></canvas>
            </div>
            <div class="chart-section">
                <h3>Weekly Growth Trends (CTR+CPC, PV CVR, PC CVR, CPA)</h3>
                <canvas id="weeklyGrowthChart"></canvas>
            </div>
        `;

        // Render overview summary
        const totalImpressions = data.reduce((sum, row) => sum + row.Impressions, 0);
        const totalClicks = data.reduce((sum, row) => sum + row.Click, 0);
        const totalRevenue = data.reduce((sum, row) => sum + row['Revenue (Advertiser Currency)'], 0);
        const totalConversions = data.reduce((sum, row) => sum + row['Total Conversions'], 0);

        document.getElementById('overview-summary').innerHTML = `
            <h3>Overview Summary</h3>
            <p>Total Impressions: ${totalImpressions.toLocaleString()}</p>
            <p>Total Clicks: ${totalClicks.toLocaleString()}</p>
            <p>Total Conversions: ${totalConversions.toLocaleString()}</p>
            <p>Total Revenue: ${totalRevenue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</p>
        `;

        // Aggregate data for charts
        const dailyAggregatedData = aggregateDailyData(data);
        const weeklyAggregatedData = aggregateWeeklyData(data);

        // Render charts
        renderImpressionsClicksChart(dailyAggregatedData, 'impressionsClicksDailyChart', 'daily');
        renderImpressionsClicksChart(weeklyAggregatedData, 'impressionsClicksWeeklyChart', 'weekly');
        renderConversionsCVRChart(dailyAggregatedData, 'conversionsCVRDailyChart', 'daily');
        renderConversionsCVRChart(weeklyAggregatedData, 'conversionsCVRWeeklyChart', 'weekly');
        renderRevenueCPCChart(dailyAggregatedData, 'revenueCPCDailyChart', 'daily');
        renderRevenueCPCChart(weeklyAggregatedData, 'revenueCPCWeeklyChart', 'weekly');
        renderRevenueCPAChart(dailyAggregatedData, 'revenueCPADailyChart', 'daily');
        renderRevenueCPAChart(weeklyAggregatedData, 'revenueCPAWeeklyChart', 'weekly');

        renderTrendChart(dailyAggregatedData, 'dailyTrendChart', 'daily');
        renderTrendChart(weeklyAggregatedData, 'weeklyTrendChart', 'weekly');
        renderGrowthChart(weeklyAggregatedData, 'weeklyGrowthChart', 'weekly');

        // Render tables
        renderTable('audience-types-table', 'Audience Types Breakdown', aggregateDataByDimension(data, 'AudienceType'));
        renderTable('optimized-targeting-table', 'Optimized Targeting Breakdown', aggregateDataByDimension(data, 'OptimizedTargeting'));
        renderTable('audiences-table', 'Audiences Breakdown', aggregateDataByDimension(data, 'AudienceName'));
        renderTable('custom-bidding-table', 'Custom Bidding Breakdown', aggregateDataByDimension(data, 'CustomBidding'));
        renderTable('fl-ga-optimization-table', 'FL/GA Optimization Breakdown', aggregateDataByDimension(data, 'OptimizationType'));
        renderTable('creative-lines-table', 'Creative Lines Breakdown', aggregateDataByDimension(data, 'CreativeLine'));

        breakdownsContainer.insertAdjacentHTML('beforeend', `<p>Displaying ${data.length} rows after filtering.</p>`);
    }

    renderUI();
});