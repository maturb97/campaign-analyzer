// js/tables.js

console.log('tables.js loaded');

/**
 * Aggregates data by a given dimension and calculates metrics.
 * @param {Array<Object>} data The processed campaign data.
 * @param {string} dimension The dimension to group by (e.g., 'AudienceType', 'OptimizedTargeting').
 * @returns {Array<Object>} Aggregated data.
 */
function aggregateDataByDimension(data, dimension) {
    const aggregated = {};

    data.forEach(row => {
        const dimValue = row[dimension];
        if (!dimValue) return; // Skip if dimension value is null or undefined

        if (!aggregated[dimValue]) {
            aggregated[dimValue] = {
                Impressions: 0,
                Click: 0,
                'Post-Click Conversions': 0,
                'Post-view Conversions': 0,
                'Total Conversions': 0,
                'Revenue (Advertiser Currency)': 0,
                count: 0 // To calculate averages if needed
            };
        }
        aggregated[dimValue].Impressions += row.Impressions;
        aggregated[dimValue].Click += row.Click;
        aggregated[dimValue]['Post-Click Conversions'] += row['Post-Click Conversions'];
        aggregated[dimValue]['Post-view Conversions'] += row['Post-view Conversions'];
        aggregated[dimValue]['Total Conversions'] += row['Total Conversions'];
        aggregated[dimValue]['Revenue (Advertiser Currency)'] += row['Revenue (Advertiser Currency)'];
        aggregated[dimValue].count++;
    });

    return Object.keys(aggregated).map(key => {
        const item = aggregated[key];
        const ctr = item.Impressions > 0 ? (item.Click / item.Impressions) * 100 : 0;
        const pvCvr = item.Impressions > 0 ? (item['Post-view Conversions'] / item.Impressions) * 100 : 0;
        const pcCvr = item.Click > 0 ? (item['Post-Click Conversions'] / item.Click) * 100 : 0;
        const cpc = item.Click > 0 ? item['Revenue (Advertiser Currency)'] / item.Click : 0;
        const cpa = item['Total Conversions'] > 0 ? item['Revenue (Advertiser Currency)'] / item['Total Conversions'] : 0;

        return {
            [dimension]: key,
            Impressions: item.Impressions,
            Click: item.Click,
            CTR: ctr.toFixed(2) + '%',
            'Post-Click Conversions': item['Post-Click Conversions'],
            'Post-view Conversions': item['Post-view Conversions'],
            'Total Conversions': item['Total Conversions'],
            'PV CVR': pvCvr.toFixed(2) + '%',
            'PC CVR': pcCvr.toFixed(2) + '%',
            'Revenue (Advertiser Currency)': item['Revenue (Advertiser Currency)'].toFixed(2),
            CPC: cpc.toFixed(2),
            CPA: cpa.toFixed(2)
        };
    });
}

/**
 * Renders a generic table.
 * @param {string} containerId The ID of the container to render the table into.
 * @param {string} title The title of the table.
 * @param {Array<Object>} data The data to display in the table.
 */
function renderTable(containerId, title, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let tableHTML = `<h3>${title}</h3>`;

    if (data.length === 0) {
        tableHTML += '<p>No data available for this table.</p>';
        container.innerHTML = tableHTML;
        return;
    }

    const headers = Object.keys(data[0]);
    tableHTML += '<table class="data-table"><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach(row => {
        tableHTML += '<tr>';
        headers.forEach(header => {
            tableHTML += `<td>${row[header]}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}
