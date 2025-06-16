# Multi-Platform Campaign Analyzer

A comprehensive web-based tool for analyzing digital advertising campaigns across Display & Video 360 (DV360), Google Ads, and Social Media platforms.

## Overview

This project is a single HTML file application that provides unified campaign performance analysis and reporting capabilities. It allows marketers and analysts to import CSV data from multiple advertising platforms and generate consolidated insights through interactive dashboards, charts, and detailed tables.

## Key Features

### Platform Support
- **Display & Video 360 (DV360)**: Full support for programmatic display campaigns
- **Google Ads**: Search, display, and shopping campaign analysis
- **Social Media Platforms**: Facebook, Instagram, LinkedIn, TikTok campaign data

### Data Import & Processing
- CSV file upload with drag-and-drop interface
- Automatic platform detection based on file headers and naming
- Data validation and cleansing
- Standardized metric calculations across platforms

### Analytics Dashboard
- **Key Performance Metrics**: Impressions, clicks, revenue, conversions, CTR, CPM, conversion rates
- **Time Series Analysis**: Interactive charts with metric switching (impressions, clicks, revenue, CTR, conversions)
- **Platform Comparison**: Side-by-side performance analysis
- **Audience Segmentation**: First-party vs. converged audience analysis

### Reporting Features
- **Campaign Performance Table**: Detailed breakdown by campaign type
- **Audience Analysis Table**: Performance metrics by audience segments
- **First-Party Segments**: Dedicated analysis for 1P audiences
- **Converged Segments**: Lookalike and similar audience performance
- **Visual Charts**: Bar charts, line charts, doughnut charts, and radar charts

### Data Filtering
- Date range filtering
- Platform-specific filtering
- Real-time dashboard updates

## Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Charting**: Chart.js library for interactive visualizations
- **CSV Processing**: PapaParse library for robust CSV parsing
- **Styling**: Modern CSS with gradients, glassmorphism effects, and responsive design

## File Structure

```
campaign-analyzer/
├── Cross-platfrom campaign analyzer.html  # Main application file
├── CLAUDE.md                              # Project documentation
└── README.md                              # GitHub Pages documentation
```

## Usage Instructions

1. **Access the Application**: Open the HTML file in any modern web browser
2. **Upload Data**: Drag and drop CSV files or click to browse
3. **Automatic Processing**: The system detects platform type and processes data
4. **View Analytics**: Interactive dashboard displays automatically
5. **Filter Data**: Use date range and platform filters as needed
6. **Export Insights**: Analyze tables and charts for reporting

## Data Format Requirements

### Expected CSV Columns (by Platform)

**DV360:**
- Date, Campaign, Line Item, Impressions, Clicks, Revenue (Adv Currency)
- Active View: Viewable Impressions, Post-Click Conversions, Post-View Conversions
- Total Conversions

**Google Ads:**
- Date, Campaign, Ad Group, Impressions, Clicks, Cost
- Conversions, Quality Score, Search Impression Share

**Social Media:**
- Date, Campaign, Ad Set Name, Impressions, Clicks, Amount Spent
- Reach, Frequency, Link Clicks, Video Views, Results

## Key Metrics Calculated

- **CTR (Click-Through Rate)**: Clicks ÷ Impressions × 100
- **CPM (Cost Per Mille)**: Cost ÷ Impressions × 1000
- **Conversion Rate**: Conversions ÷ Impressions × 100
- **Viewability**: Viewable Impressions ÷ Total Impressions × 100
- **ROAS (Return on Ad Spend)**: Revenue ÷ Cost

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Recent Fixes & Improvements

- ✅ Removed duplicate function definitions
- ✅ Fixed missing `filterDataByPlatform()` function
- ✅ Added division by zero protection for all calculations
- ✅ Cleaned up HTML structure and removed extra closing tags
- ✅ Improved error handling for malformed data
- ✅ Enhanced cross-platform data processing

## Development Notes

This application is designed to be self-contained and portable. All dependencies are loaded via CDN, making it easy to deploy on any web server or use locally. The code follows modern JavaScript practices with proper error handling and responsive design principles.

## Future Enhancements

- Additional platform integrations (TikTok Ads, Pinterest, etc.)
- Advanced filtering options (geographic, demographic)
- Export functionality for reports and charts
- Real-time API connections for live data
- Mobile-optimized interface improvements