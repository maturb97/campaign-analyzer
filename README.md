# Multi-Platform Campaign Analyzer

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://maturb97.github.io/campaign-analyzer/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Comprehensive analysis tool for Display & Video 360, Google Ads, and Social Media campaigns**

A powerful, browser-based analytics dashboard that unifies campaign performance data from multiple advertising platforms into actionable insights. Import CSV files and instantly generate interactive visualizations, detailed tables, and comparative analysis.

## 🚀 **[Live Demo](https://maturb97.github.io/campaign-analyzer/)**

## ✨ Features

### 📊 **Multi-Platform Support**
- **Display & Video 360 (DV360)** - Programmatic display campaigns
- **Google Ads** - Search, display, and shopping campaigns  
- **Social Media Platforms** - Facebook, Instagram, LinkedIn, TikTok

### 🎯 **Advanced Analytics**
- **Real-time Metrics** - Impressions, clicks, revenue, CTR, CPM, conversions
- **Time Series Analysis** - Performance trends with interactive charts
- **Audience Segmentation** - 1st Party vs Converged audience comparison
- **Campaign Performance** - Detailed breakdown by campaign type and platform

### 📈 **Interactive Visualizations**
- **Chart.js Integration** - Line charts, bar charts, radar charts, doughnut charts
- **Dynamic Filtering** - Platform selection and date range filtering
- **Responsive Design** - Optimized for desktop, tablet, and mobile

### 🔧 **Technical Features**
- **Progressive Web App (PWA)** - Install on any device, works offline
- **CSV Processing** - Drag-and-drop file upload with automatic platform detection
- **No Server Required** - Runs entirely in the browser for maximum security
- **Modern Architecture** - Modular JavaScript, separation of concerns

## 🛠️ Usage

### 1. **Upload Data**
- Drag and drop CSV files or click to browse
- Supports multiple files from different platforms
- Automatic platform detection based on headers and filename

### 2. **Analyze Results**
- View unified metrics across all platforms
- Explore interactive charts and tables
- Apply date range filters for focused analysis

### 3. **Export Insights**
- Copy data from tables for reports
- Take screenshots of visualizations
- Print-friendly layouts available

## 📁 Supported CSV Formats

### **DV360 Exports**
Expected columns: `Date`, `Campaign`, `Line Item`, `Impressions`, `Clicks`, `Revenue (Adv Currency)`, `Active View: Viewable Impressions`, `Post-Click Conversions`, `Post-View Conversions`, `Total Conversions`

### **Google Ads Exports**  
Expected columns: `Date`, `Campaign`, `Ad Group`, `Impressions`, `Clicks`, `Cost`, `Conversions`, `Quality Score`

### **Social Media Exports**
Expected columns: `Date`, `Campaign`, `Ad Set Name`, `Impressions`, `Clicks`, `Amount Spent`, `Reach`, `Frequency`, `Link Clicks`, `Video Views`

## 🏗️ Project Structure

```
campaign-analyzer/
├── index.html              # Main application page
├── manifest.json           # PWA configuration
├── sw.js                  # Service worker for offline functionality
├── css/
│   ├── styles.css         # Main styles and layout
│   ├── components.css     # Interactive components
│   └── responsive.css     # Mobile-responsive design
├── js/
│   ├── app.js            # Core application logic
│   ├── data-processor.js # CSV processing and platform detection
│   ├── charts.js         # Chart.js visualizations
│   └── tables.js         # Table rendering and management
├── assets/
│   ├── favicon.ico       # Browser favicon
│   ├── icon-192.png      # PWA icon (192x192)
│   └── icon-512.png      # PWA icon (512x512)
└── CLAUDE.md             # Development documentation
```

## 🚀 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: [Chart.js](https://www.chartjs.org/) v3.9.1
- **CSV Processing**: [PapaParse](https://www.papaparse.com/) v5.3.2
- **PWA**: Service Workers, Web App Manifest
- **Design**: CSS Grid, Flexbox, Glassmorphism effects

## 📱 Progressive Web App

This application is a fully functional PWA that can be:
- **Installed** on desktop and mobile devices
- **Used offline** after first visit
- **Updated automatically** in the background
- **Accessed** from home screen like native apps

### Installation
1. Visit the [live demo](https://maturb97.github.io/campaign-analyzer/)
2. Look for the "Install App" button or browser install prompt
3. Click install to add to your device

## 🔒 Privacy & Security

- **No Data Upload** - All processing happens locally in your browser
- **No Server Storage** - CSV files never leave your device
- **No Tracking** - No analytics or user tracking implemented
- **HTTPS Secure** - Served over secure connection via GitHub Pages

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 70+ | ✅ Full Support |
| Firefox | 65+ | ✅ Full Support |
| Safari | 12+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |

## 📋 Key Metrics Calculated

- **CTR (Click-Through Rate)**: Clicks ÷ Impressions × 100
- **CPM (Cost Per Mille)**: Cost ÷ Impressions × 1000  
- **Conversion Rate**: Conversions ÷ Impressions × 100
- **Viewability**: Viewable Impressions ÷ Total Impressions × 100
- **ROAS (Return on Ad Spend)**: Revenue ÷ Cost

## 🔄 Recent Updates

- ✅ **Modular Architecture** - Separated CSS and JavaScript into logical modules
- ✅ **PWA Support** - Added offline functionality and installation capability
- ✅ **Enhanced Error Handling** - Better validation and user feedback
- ✅ **Accessibility Improvements** - ARIA labels, semantic HTML, keyboard navigation
- ✅ **Performance Optimization** - Lazy loading, efficient data processing

## 🤝 Contributing

This project is open for contributions! Areas for improvement:
- Additional platform integrations (Pinterest, Snapchat, etc.)
- Advanced filtering and segmentation options
- Export functionality for charts and reports
- Enhanced mobile experience
- Custom dashboard layouts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Verify your CSV files match the expected format
3. Try refreshing the page or clearing browser cache
4. Create an issue on GitHub with details about your problem

---

**Built with ❤️ for digital marketing professionals**

*Transform your campaign data into actionable insights in seconds*