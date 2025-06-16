# Multi-Platform Campaign Analyzer

A comprehensive web-based tool for analyzing digital advertising campaigns across Display & Video 360 (DV360), Google Ads, and Social Media platforms with modern design and enhanced analytics capabilities.

## Overview

This project is a professional Progressive Web App (PWA) that provides unified campaign performance analysis and reporting capabilities. It features a modular architecture with modern styling, enhanced metrics calculation, and comprehensive floodlight activity tracking. The application allows marketers and analysts to import CSV data from multiple advertising platforms and generate consolidated insights through interactive dashboards, charts, and detailed tables.

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
- **Enhanced Performance Metrics**: Impressions, clicks, revenue (PLN), conversions, CTR, CPM, CPC, CPA
- **Advanced Conversion Tracking**: Post-click and post-view conversion rates calculated from clicks
- **Time Series Analysis**: Interactive charts with metric switching, sorted by revenue (highest to lowest)
- **Platform Comparison**: Side-by-side performance analysis with enhanced visualizations
- **Audience Segmentation**: First-party vs. converged audience analysis with detailed metrics
- **Floodlight Activities**: Comprehensive tracking and analysis of DV360 conversion activities

### Reporting Features
- **Campaign Performance Table**: Revenue-sorted breakdown with CPC/CPA metrics and bidirectional sorting
- **Audience Analysis Table**: Enhanced performance metrics with smart sorting capabilities
- **First-Party Segments**: Dedicated analysis with conversion rate calculations from clicks
- **Converged Segments**: Lookalike and similar audience performance with enhanced metrics
- **Floodlight Activities Table**: Dedicated tracking of conversion activities with grouping and tagging
- **Visual Charts**: Modern, responsive charts with PLN currency formatting and revenue-based sorting

### Data Filtering
- Date range filtering
- Platform-specific filtering
- Real-time dashboard updates

## Technical Stack

- **Frontend**: Modular HTML5, CSS3, JavaScript (ES6+) architecture
- **Styling**: CSS custom properties system with glassmorphism effects and modern design
- **Charting**: Chart.js library with enhanced PLN formatting and revenue-based sorting
- **CSV Processing**: PapaParse library with enhanced platform detection
- **PWA Features**: Service Worker, Web App Manifest, offline functionality
- **Responsive Design**: Mobile-first approach with dark mode support and accessibility features

## File Structure

```
campaign-analyzer/
├── index.html                  # Main application page
├── manifest.json               # PWA configuration
├── sw.js                      # Service worker for offline functionality
├── css/
│   ├── styles.css             # Main styles with CSS custom properties
│   ├── components.css         # Interactive components and modern styling
│   └── responsive.css         # Mobile-responsive design with accessibility
├── js/
│   ├── app.js                # Core application logic and dashboard updates
│   ├── data-processor.js     # CSV processing with floodlight activity extraction
│   ├── charts.js             # Chart.js visualizations with PLN formatting
│   └── tables.js             # Table rendering with bidirectional sorting
├── assets/
│   ├── favicon.ico           # Browser favicon
│   ├── icon-192.png          # PWA icon (192x192)
│   └── icon-512.png          # PWA icon (512x512)
├── CLAUDE.md                 # Development documentation
├── README.md                 # GitHub Pages documentation
├── robots.txt                # SEO crawler instructions
└── sitemap.xml               # Site structure for search engines
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
- Total Conversions, Floodlight Activity, Floodlight Activity Group, Activity ID

**Google Ads:**
- Date, Campaign, Ad Group, Impressions, Clicks, Cost
- Conversions, Quality Score, Search Impression Share

**Social Media:**
- Date, Campaign, Ad Set Name, Impressions, Clicks, Amount Spent
- Reach, Frequency, Link Clicks, Video Views, Results

## Key Metrics Calculated

- **CTR (Click-Through Rate)**: Clicks ÷ Impressions × 100
- **CPM (Cost Per Mille)**: Cost ÷ Impressions × 1000 (in PLN)
- **CPC (Cost Per Click)**: Cost ÷ Clicks (in PLN)
- **Post-Click Conversion Rate**: Post-Click Conversions ÷ Clicks × 100
- **Post-View Conversion Rate**: Post-View Conversions ÷ Clicks × 100
- **Overall Conversion Rate**: Total Conversions ÷ Clicks × 100
- **CPA Post-Click**: Cost ÷ Post-Click Conversions (in PLN)
- **CPA Post-View**: Cost ÷ Post-View Conversions (in PLN)
- **Viewability**: Viewable Impressions ÷ Total Impressions × 100
- **ROAS (Return on Ad Spend)**: Revenue ÷ Cost

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Latest Updates (Comprehensive Enhancement - June 2025)

### 🎯 **Complete Campaign Analyzer Overhaul (June 16, 2025)**

#### **Enhanced Chart System (Charts A-F)**
- **Chart A**: Daily Impressions + CTR dual-axis visualization with professional formatting
- **Chart B**: Daily Revenue + switchable conversion rates (post-click/post-view toggle)
- **Charts E&F**: Enhanced segment charts with Revenue bars and switchable metric lines:
  - CTR, Post-Click/Post-View conversion rates, Cost Per Order, Cost Per Lead
  - Interactive toggle buttons for seamless metric switching
  - Full-width responsive design for better data visualization

#### **Advanced Filtering & Business Intelligence**
- **B2C/B2B Campaign Detection**: Automatic campaign type detection from campaign names
- **Business Type Navigation**: New filtering system to analyze B2B vs B2C performance
- **Enhanced Audience Categorization**: Improved 1P vs Converged detection logic
- **Multi-dimensional Filtering**: Platform + Business Type + Date range combinations

#### **Floodlight Integration & Cost Analysis**
- **Enhanced Cost Per Order/Lead Calculations**: Now properly filters floodlight activities by name
- **Activity-based Conversions**: Separates "order"/"purchase" from "lead"/"signup" conversions
- **Accurate Attribution**: Revenue and conversions matched to specific floodlight activities
- **Comprehensive Activity Tracking**: Full integration with existing floodlight activity tables

#### **User Experience Improvements**
- **Fixed File Upload**: Reliable click-to-import functionality restored
- **Enhanced Text Visibility**: Improved contrast and CSS fallbacks for all browsers
- **Professional Card Design**: PLN currency moved to descriptions, cleaner value display
- **Interactive Chart Controls**: Smooth metric switching with visual feedback
- **Full-width Tables**: Campaign and audience tables now utilize full screen space

#### **Technical Architecture Enhancements**
- **Dual-axis Chart System**: Professional Chart.js implementation with proper scaling
- **State Management**: Enhanced filtering system with business type support
- **Performance Optimization**: Efficient chart rendering and data processing
- **Backward Compatibility**: All changes maintain existing functionality

### ✅ **Previous Major Updates**

#### **Major UI/UX Redesign (June 2025)**
- **Complete CSS overhaul** with modern CSS custom properties and glassmorphism effects
- **Enhanced responsive design** with mobile-first approach and dark mode support
- **Improved accessibility** with ARIA labels, high contrast mode, and reduced motion support
- **Modern component styling** with hover animations, shadows, and visual hierarchy

#### **Enhanced Metrics & Analytics**
- **Updated conversion rate calculations** to use clicks instead of impressions as denominator
- **Added new cost metrics**: CPC (Cost Per Click) and CPA (Cost Per Acquisition)
- **Separate tracking** for post-click and post-view conversion rates
- **Currency conversion** from USD to PLN throughout the entire application

#### **Advanced Table Features**
- **Bidirectional sorting** (A-Z, Z-A) on all table columns with visual indicators
- **Smart data type detection** for proper sorting of numbers, currency, and percentages
- **Revenue-based sorting** as default for all tables (highest to lowest)
- **Enhanced table styling** with modern hover effects and better readability

#### **Floodlight Activities Tracking**
- **Comprehensive floodlight activity detection** for DV360 campaigns
- **Dedicated floodlight activities table** with performance metrics
- **Activity grouping** (Purchase Actions, Lead Generation, Content Engagement, etc.)
- **Tag-based tracking** with campaign association and conversion analysis

#### **Chart Improvements**
- **Revenue-based sorting** for all chart visualizations
- **PLN currency formatting** in tooltips and axis labels
- **Enhanced chart containers** with modern styling and responsive behavior
- **Improved data visualization** with better color schemes and readability

### ✅ **Previous Fixes & Improvements**
- ✅ Removed duplicate function definitions
- ✅ Fixed missing `filterDataByPlatform()` function
- ✅ Added division by zero protection for all calculations
- ✅ Cleaned up HTML structure and removed extra closing tags
- ✅ Improved error handling for malformed data
- ✅ Enhanced cross-platform data processing

## Development Notes

This application features a modular architecture with separation of concerns across CSS, JavaScript modules, and PWA components. All dependencies are loaded via CDN for portability. The codebase follows modern web development practices with:

- **CSS Custom Properties** for consistent theming and easy maintenance
- **ES6+ JavaScript modules** for better code organization and reusability
- **Progressive enhancement** for accessibility and performance
- **Mobile-first responsive design** with graceful degradation
- **Comprehensive error handling** and data validation
- **SEO optimization** with proper meta tags, sitemap, and robots.txt

## Deployment

The application is deployed as a GitHub Pages site with:
- **Continuous deployment** from the main branch
- **PWA capabilities** for offline use and app installation
- **SEO optimization** for search engine visibility
- **Performance optimization** with efficient asset loading

**Live Demo**: [https://maturb97.github.io/campaign-analyzer/](https://maturb97.github.io/campaign-analyzer/)

## Future Enhancements

- Additional platform integrations (TikTok Ads, Pinterest, Snapchat, etc.)
- Advanced filtering options (geographic, demographic, device targeting)
- Export functionality for reports and charts (PDF, Excel, PowerPoint)
- Real-time API connections for live data streaming
- Advanced floodlight activity analysis with funnel visualization
- Custom dashboard layouts and saved views
- Team collaboration features and shared reports