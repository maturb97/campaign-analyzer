/**
 * Campaign Analyzer - Data Processing Module
 * Handles CSV file processing, platform detection, and data transformation
 */

/**
 * Handle multiple files for processing
 */
function handleFiles(files) {
    console.log('Handling files:', files.length);
    
    if (!files || files.length === 0) {
        console.log('No files to process');
        return;
    }
    
    const statusDiv = document.getElementById('file-status');
    if (statusDiv) {
        statusDiv.innerHTML = '<p class="loading">📤 Processing files...</p>';
    }
    
    let processedFiles = 0;
    const totalFiles = files.length;
    
    Array.from(files).forEach(file => {
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        if (!file.name.toLowerCase().endsWith('.csv')) {
            if (statusDiv) {
                statusDiv.innerHTML = `<p class="status-message error">❌ Error: ${file.name} is not a CSV file</p>`;
            }
            return;
        }
        
        Papa.parse(file, {
            header: true,
            dynamicTyping: false, // Keep as strings for better platform detection
            skipEmptyLines: true,
            complete: function(results) {
                console.log('Parse complete for:', file.name, 'Rows:', results.data.length, 'Headers:', results.meta.fields);
                
                try {
                    const platform = detectPlatform(results.meta.fields, file.name);
                    console.log('Detected platform:', platform, 'for file:', file.name);
                    
                    processCampaignData(results.data, file.name, platform);
                    processedFiles++;
                    
                    if (processedFiles === totalFiles) {
                        showProcessingComplete(totalFiles);
                    }
                } catch (error) {
                    console.error('Error processing file:', file.name, error);
                    if (statusDiv) {
                        statusDiv.innerHTML = `<p class="status-message error">❌ Error processing ${file.name}: ${error.message}</p>`;
                    }
                }
            },
            error: function(error) {
                console.error('Parse error for:', file.name, error);
                if (statusDiv) {
                    statusDiv.innerHTML = `<p class="status-message error">❌ Error parsing ${file.name}: ${error.message}</p>`;
                }
            }
        });
    });
}

/**
 * Show processing completion status
 */
function showProcessingComplete(totalFiles) {
    const campaignData = window.CampaignAnalyzer.getCampaignData();
    const platformsDetected = [...new Set(campaignData.map(row => row.Platform))];
    
    const statusDiv = document.getElementById('file-status');
    if (statusDiv) {
        statusDiv.innerHTML = `
            <div class="status-message success">
                <p>✅ Successfully loaded ${totalFiles} file(s)</p>
                <p style="color: #666; font-size: 0.9em; margin-top: 8px;">
                    Platforms detected: ${platformsDetected.map(p => {
                        switch(p) {
                            case 'dv360': return 'Display & Video 360';
                            case 'google-ads': return 'Google Ads';
                            case 'social': return 'Social Media';
                            default: return p;
                        }
                    }).join(', ')}
                </p>
                <p style="color: #666; font-size: 0.9em;">
                    Total records: ${campaignData.length.toLocaleString()}
                </p>
            </div>
        `;
    }
    
    // Show date filter section
    const dateFilterSection = document.getElementById('date-filter-section');
    if (dateFilterSection) {
        dateFilterSection.style.display = 'block';
    }
    
    // Update dashboard
    window.CampaignAnalyzer.updateDashboard();
}

/**
 * Detect platform based on CSV headers and filename
 */
function detectPlatform(headers, filename) {
    if (!headers || !Array.isArray(headers)) {
        console.warn('Invalid headers provided to detectPlatform');
        return 'dv360'; // Default fallback
    }
    
    const headerStr = headers.join('|').toLowerCase();
    const filenameStr = filename.toLowerCase();
    
    // DV360 Detection - Look for specific DV360 headers
    if (headerStr.includes('insertion order') || 
        headerStr.includes('line item') || 
        headerStr.includes('active view: viewable impressions') ||
        headerStr.includes('advertiser currency') ||
        headerStr.includes('revenue (adv currency)') ||
        filenameStr.includes('dv360') ||
        filenameStr.includes('display') ||
        filenameStr.includes('video')) {
        return 'dv360';
    }
    
    // Google Ads Detection - Look for specific Google Ads headers
    if (headerStr.includes('campaign id') || 
        headerStr.includes('ad group') || 
        headerStr.includes('quality score') ||
        headerStr.includes('search impression share') ||
        headerStr.includes('cost per conversion') ||
        headerStr.includes('avg. cpc') ||
        filenameStr.includes('google ads') ||
        filenameStr.includes('google_ads') ||
        filenameStr.includes('adwords')) {
        return 'google-ads';
    }
    
    // Social Media Detection - Look for social platform headers
    if (headerStr.includes('reach') || 
        headerStr.includes('frequency') || 
        headerStr.includes('post engagement') ||
        headerStr.includes('link clicks') ||
        headerStr.includes('video views') ||
        headerStr.includes('ad set name') ||
        headerStr.includes('amount spent') ||
        filenameStr.includes('facebook') ||
        filenameStr.includes('instagram') ||
        filenameStr.includes('linkedin') ||
        filenameStr.includes('tiktok') ||
        filenameStr.includes('social')) {
        return 'social';
    }
    
    // Log when platform detection is uncertain
    console.log('Could not detect platform for:', filename);
    console.log('Headers:', headers);
    
    // Default to DV360 if uncertain
    return 'dv360';
}

/**
 * Process campaign data based on detected platform
 */
function processCampaignData(data, filename, platform) {
    console.log(`Processing ${filename} as ${platform} platform`);
    
    if (!data || data.length === 0) {
        console.warn('No data to process for:', filename);
        return;
    }
    
    // Clean the data based on platform
    let cleanData;
    switch (platform) {
        case 'dv360':
            cleanData = processDV360Data(data);
            break;
        case 'google-ads':
            cleanData = processGoogleAdsData(data);
            break;
        case 'social':
            cleanData = processSocialData(data);
            break;
        default:
            console.warn('Unknown platform:', platform, '- using DV360 processing');
            cleanData = processDV360Data(data);
    }
    
    // Add platform info to each row
    cleanData.forEach(row => {
        row.Platform = platform;
        row.SourceFile = filename;
        
        // Standardize date format for filtering
        if (row.Date) {
            try {
                row.DateObj = new Date(row.Date);
                // Validate date
                if (isNaN(row.DateObj.getTime())) {
                    console.warn('Invalid date found:', row.Date, 'in file:', filename);
                    row.DateObj = null;
                }
            } catch (error) {
                console.warn('Error parsing date:', row.Date, 'in file:', filename);
                row.DateObj = null;
            }
        }
    });
    
    // Add to global campaign data
    const existingData = window.CampaignAnalyzer.getCampaignData();
    existingData.push(...cleanData);
    
    console.log(`Added ${cleanData.length} rows from ${filename}`);
}

/**
 * Process DV360 CSV data
 */
function processDV360Data(data) {
    console.log('Processing DV360 data...');
    
    // Filter out invalid rows
    const cleanData = data.filter(row => 
        row.Date && 
        row.Campaign && 
        row['Line Item'] && 
        row.Date !== 'null' && 
        row.Campaign !== 'null' && 
        row['Line Item'] !== 'null' &&
        row.Date.trim() !== '' &&
        row.Campaign.trim() !== '' &&
        row['Line Item'].trim() !== ''
    );
    
    console.log(`DV360: Filtered ${data.length} rows to ${cleanData.length} valid rows`);
    
    return cleanData.map(row => ({
        ...row,
        // Standardize numeric fields
        Revenue: parseFloat(row['Revenue (Adv Currency)'] || row['Revenue'] || 0),
        Impressions: parseInt(row.Impressions || 0),
        Clicks: parseInt(row.Clicks || 0),
        ViewableImpressions: parseInt(row['Active View: Viewable Impressions'] || row.Impressions || 0),
        PostClickConversions: parseFloat(row['Post-Click Conversions'] || 0),
        PostViewConversions: parseFloat(row['Post-View Conversions'] || 0),
        TotalConversions: parseFloat(row['Total Conversions'] || 0),
        
        // Determine audience type and segment
        AudienceType: determineAudienceType(row['Line Item']),
        AudienceSegment: extractAudienceSegment(row['Line Item']),
        
        // Extract campaign type from campaign name
        CampaignType: extractCampaignType(row.Campaign)
    }));
}

/**
 * Process Google Ads CSV data
 */
function processGoogleAdsData(data) {
    console.log('Processing Google Ads data...');
    
    // Filter out invalid rows
    const cleanData = data.filter(row => 
        row.Date && 
        row.Campaign &&
        row.Date !== 'null' && 
        row.Campaign !== 'null' &&
        row.Date.trim() !== '' &&
        row.Campaign.trim() !== ''
    );
    
    console.log(`Google Ads: Filtered ${data.length} rows to ${cleanData.length} valid rows`);
    
    return cleanData.map(row => ({
        ...row,
        // Map Google Ads fields to standard format
        Revenue: parseFloat(row.Cost || row['Cost (Local Currency)'] || row['Amount Spent'] || 0),
        Impressions: parseInt(row.Impressions || 0),
        Clicks: parseInt(row.Clicks || 0),
        ViewableImpressions: parseInt(row.Impressions || 0), // Fallback to impressions
        PostClickConversions: parseFloat(row.Conversions || 0),
        PostViewConversions: parseFloat(row['View-through Conversions'] || 0),
        TotalConversions: (parseFloat(row.Conversions || 0) + parseFloat(row['View-through Conversions'] || 0)),
        
        // Determine audience type from ad group or campaign
        AudienceType: determineGoogleAdsAudienceType(row['Ad Group'] || row.Campaign),
        AudienceSegment: row['Ad Group'] || row.Campaign || 'Unknown',
        CampaignType: extractCampaignType(row.Campaign)
    }));
}

/**
 * Process Social Media CSV data
 */
function processSocialData(data) {
    console.log('Processing Social Media data...');
    
    // Filter out invalid rows
    const cleanData = data.filter(row => 
        row.Date && 
        row.Campaign &&
        row.Date !== 'null' && 
        row.Campaign !== 'null' &&
        row.Date.trim() !== '' &&
        row.Campaign.trim() !== ''
    );
    
    console.log(`Social Media: Filtered ${data.length} rows to ${cleanData.length} valid rows`);
    
    return cleanData.map(row => ({
        ...row,
        // Map social media fields to standard format
        Revenue: parseFloat(row['Amount Spent'] || row.Spend || row.Cost || 0),
        Impressions: parseInt(row.Impressions || row.Reach || 0),
        Clicks: parseInt(row.Clicks || row['Link Clicks'] || row['Post Clicks'] || 0),
        ViewableImpressions: parseInt(row.Impressions || row.Reach || 0),
        PostClickConversions: parseFloat(row.Conversions || row.Results || row.Purchases || 0),
        PostViewConversions: parseFloat(row['View Conversions'] || row['Video Views'] || 0),
        TotalConversions: parseFloat(row.Conversions || row.Results || row.Purchases || 0),
        
        // Determine audience type from ad set or campaign
        AudienceType: determineSocialAudienceType(row['Ad Set Name'] || row.Campaign),
        AudienceSegment: row['Ad Set Name'] || row.Campaign || 'Unknown',
        CampaignType: extractCampaignType(row.Campaign)
    }));
}

/**
 * Determine audience type from DV360 line item
 */
function determineAudienceType(lineItem) {
    if (!lineItem || typeof lineItem !== 'string') return 'Other';
    
    const item = lineItem.toLowerCase();
    
    if (item.includes('1p') || item.includes('first party') || item.includes('fp_')) {
        return '1st Party';
    } else if (item.includes('conv') || item.includes('converged') || item.includes('lookalike')) {
        return 'Converged';
    } else {
        return 'Other';
    }
}

/**
 * Determine audience type from Google Ads ad group
 */
function determineGoogleAdsAudienceType(adGroup) {
    if (!adGroup || typeof adGroup !== 'string') return 'Other';
    
    const group = adGroup.toLowerCase();
    
    if (group.includes('1p') || group.includes('first party') || group.includes('custom') || group.includes('crm')) {
        return '1st Party';
    } else if (group.includes('conv') || group.includes('similar') || group.includes('lookalike') || group.includes('affinity')) {
        return 'Converged';
    } else {
        return 'Other';
    }
}

/**
 * Determine audience type from social media ad set
 */
function determineSocialAudienceType(adSetName) {
    if (!adSetName || typeof adSetName !== 'string') return 'Other';
    
    const name = adSetName.toLowerCase();
    
    if (name.includes('custom') || name.includes('retargeting') || name.includes('remarketing') || name.includes('1p')) {
        return '1st Party';
    } else if (name.includes('lookalike') || name.includes('similar') || name.includes('lal') || name.includes('interests')) {
        return 'Converged';
    } else {
        return 'Other';
    }
}

/**
 * Extract meaningful audience segment names
 */
function extractAudienceSegment(lineItem) {
    if (!lineItem || typeof lineItem !== 'string') return 'Unknown';
    
    // Clean up the line item name
    let segment = lineItem.trim();
    
    // Extract meaningful audience segment names from line item
    if (segment.includes('1P') || segment.includes('1p')) {
        // For 1st party, look for patterns after 1P
        const parts = segment.split(/[_\-\s]+/);
        const fpIndex = parts.findIndex(part => part.toLowerCase().includes('1p'));
        if (fpIndex >= 0 && fpIndex < parts.length - 1) {
            return parts.slice(Math.max(0, fpIndex - 1), fpIndex + 2).join('_');
        }
    } else if (segment.includes('CONV') || segment.includes('CONVERGED') || segment.toLowerCase().includes('conv')) {
        // For converged, extract relevant parts
        const parts = segment.split(/[_\-\s]+/);
        const convIndex = parts.findIndex(part => part.toLowerCase().includes('conv'));
        if (convIndex >= 0) {
            return parts.slice(Math.max(0, convIndex - 1), convIndex + 2).join('_');
        }
    }
    
    // Truncate long names for readability
    return segment.length > 30 ? segment.substring(0, 30) + '...' : segment;
}

/**
 * Extract campaign type from campaign name
 */
function extractCampaignType(campaign) {
    if (!campaign || typeof campaign !== 'string') return 'Unknown';
    
    const name = campaign.trim();
    
    // Try to extract meaningful campaign type from name
    const parts = name.split(/[_\-\s]+/);
    
    // Look for common campaign type indicators
    for (const part of parts) {
        const lowerPart = part.toLowerCase();
        if (['search', 'display', 'video', 'shopping', 'discovery', 'youtube', 'performance', 'brand', 'remarketing', 'prospecting'].includes(lowerPart)) {
            return part;
        }
    }
    
    // If campaign name has underscores, try to get the type from a specific position
    if (parts.length >= 4) {
        return parts[3]; // Common position for campaign type
    } else if (parts.length >= 2) {
        return parts[1]; // Fallback position
    }
    
    // Return truncated campaign name if no specific type found
    return name.length > 20 ? name.substring(0, 20) + '...' : name;
}

// Make functions available globally
window.DataProcessor = {
    handleFiles,
    detectPlatform,
    processCampaignData,
    processDV360Data,
    processGoogleAdsData,
    processSocialData,
    determineAudienceType,
    extractAudienceSegment,
    extractCampaignType
};