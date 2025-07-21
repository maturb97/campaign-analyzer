// js/data-processor.js

console.log('data-processor.js loaded');

/**
 * Parses CSV content into an array of objects.
 * Assumes the first row is the header.
 * @param {string} csvString The raw CSV content.
 * @returns {Array<Object>} An array of objects, where each object represents a row.
 */
function parseCSV(csvString) {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) {
        return [];
    }

    // Filter out empty lines and potential "Totals" or description lines at the end
    const dataLines = lines.filter(line => {
        const trimmedLine = line.trim();
        return trimmedLine.length > 0 && !trimmedLine.startsWith('Totals') && !trimmedLine.startsWith('Report Description');
    });

    if (dataLines.length === 0) {
        return [];
    }

    const headers = dataLines[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < dataLines.length; i++) {
        const currentLine = dataLines[i].split(',');
        const row = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = currentLine[j] ? currentLine[j].trim() : '';
        }
        data.push(row);
    }
    return data;
}

/**
 * Processes the raw parsed data to extract and transform dimensions.
 * @param {Array<Object>} rawData The raw data parsed from CSV.
 * @returns {Array<Object>} Processed data with new dimensions.
 */
function processData(rawData) {
    return rawData.map(row => {
        const processedRow = { ...row };

        // Campaign Filter: digits extracted from Campaign dimension (first digits before "_")
        const campaignMatch = row.Campaign.match(/^(\d+)_/);
        processedRow.CampaignID = campaignMatch ? campaignMatch[1] : null;

        // AMP ID Filter: Insertion Orders - the first string before the the "_"
        const ampIdMatch = row['Insertion Order'].match(/^([a-zA-Z0-9]+)_/);
        processedRow.AMPID = ampIdMatch ? ampIdMatch[1] : null;

        // Audience type filter: 1st party ("1P", "1STPARTY", "1stPARTY"), 3rd party ("3P", "3rdPARTY", "3RDPARTY", "JUSTTAG"), Converged ("CONVERGED", "CNV")
        const lineItemName = row['Line Item'].toUpperCase();
        if (lineItemName.includes('1P') || lineItemName.includes('1STPARTY')) {
            processedRow.AudienceType = '1st Party';
        } else if (lineItemName.includes('3P') || lineItemName.includes('3RDPARTY') || lineItemName.includes('JUSTTAG')) {
            processedRow.AudienceType = '3rd Party';
        } else if (lineItemName.includes('CONVERGED') || lineItemName.includes('CNV')) {
            processedRow.AudienceType = 'Converged';
        } else {
            processedRow.AudienceType = 'Unknown';
        }

        // Optimized targeting filter: "-OPTIMIZED" in Line Item name
        processedRow.OptimizedTargeting = lineItemName.includes('-OPTIMIZED') ? 'Yes' : 'No';

        // Custom bidding filter: "CB" or "CUSTOMBIDDING" in Line Item name
        processedRow.CustomBidding = (lineItemName.includes('CB') || lineItemName.includes('CUSTOMBIDDING')) ? 'Yes' : 'No';

        // FL/GA optimization: "GA" or "FL" in Line Item name
        if (lineItemName.includes('GA')) {
            processedRow.OptimizationType = 'GA';
        } else if (lineItemName.includes('FL')) {
            processedRow.OptimizationType = 'FL';
        } else {
            processedRow.OptimizationType = 'Unknown';
        }

        // Creative lines: after "CPM_" in Creative name
        const creativeMatch = row.Creative.match(/CPM_([a-zA-Z0-9_\-]+)/);
        processedRow.CreativeLine = creativeMatch ? creativeMatch[1] : null;

        // B2B/B2C classification (placeholder - needs specific rules from user)
        // For now, default to 'Unknown' or 'Not Classified'
        processedRow.B2B_B2C_Type = 'Not Classified';

        // Audience Name: after "1x1_" and before the type of data (e.g., 1STPARTY) and before "_OPEN_EXHANGE)"
        const audienceNameMatch = lineItemName.match(/1X1_([A-Z0-9_\-]+?)_(1STPARTY|3RDPARTY|JUSTTAG|CONVERGED|CNV|3P|1P)/);
        processedRow.AudienceName = audienceNameMatch ? audienceNameMatch[1] : null;

        // Convert relevant metrics to numbers
        // Convert relevant metrics to numbers and Date to Date object
        // Convert YYYY/MM/DD to YYYY-MM-DD and validate date
        const dateStr = row.Date.replace(/\//g, '-');
        const dateObj = new Date(dateStr + 'T00:00:00'); // Append time to ensure correct parsing
        processedRow.Date = isNaN(dateObj.getTime()) ? null : dateStr;
        processedRow['Revenue (Advertiser Currency)'] = parseFloat(row['Revenue (Advertiser Currency)']) || 0;
        processedRow.Impressions = parseInt(row.Impressions) || 0;
        processedRow.Click = parseInt(row.Click) || 0;
        processedRow['Active View: Viewable Impressions'] = parseInt(row['Active View: Viewable Impressions']) || 0;
        processedRow['Post-Click Conversions'] = parseInt(row['Post-Click Conversions']) || 0;
        processedRow['Post-view Conversions'] = parseInt(row['Post-view Conversions']) || 0;
        processedRow['Total Conversions'] = parseInt(row['Total Conversions']) || 0;

        return processedRow;
    });
}
