/**
 * 📊 Advanced Analytics System
 * Tracks user behavior without compromising privacy
 */

class AnalyticsManager {
    constructor() {
        this.sessionId = null;
        this.pageViews = [];
        this.events = [];
        this.userProperties = {};
        this.init();
    }

    init() {
        console.log('📊 Analytics Initializing...');
        
        // Generate session ID
        this.sessionId = this.generateSessionId();
        
        // Load existing data
        this.loadStoredData();
        
        // Track page view
        this.trackPageView();
        
        // Track events
        this.initEventTracking();
        
        // Track performance
        this.trackPerformance();
        
        // Set up periodic sync
        this.setupSync();
        
        console.log('✅ Analytics Ready');
    }

    generateSessionId() {
        // Generate unique session ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `session_${timestamp}_${random}`;
    }

    loadStoredData() {
        // Load stored analytics data
        const stored = localStorage.getItem('resumeai_analytics');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.pageViews = data.pageViews || [];
                this.events = data.events || [];
                this.userProperties = data.userProperties || {};
            } catch (e) {
                this.clearStoredData();
            }
        }
    }

    saveStoredData() {
        const data = {
            sessionId: this.sessionId,
            pageViews: this.pageViews.slice(-100), // Keep last 100 page views
            events: this.events.slice(-200), // Keep last 200 events
            userProperties: this.userProperties,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('resumeai_analytics', JSON.stringify(data));
    }

    clearStoredData() {
        localStorage.removeItem('resumeai_analytics');
        this.pageViews = [];
        this.events = [];
        this.userProperties = {};
    }

    trackPageView() {
        const pageView = {
            type: 'page_view',
            url: window.location.pathname + window.location.search,
            title: document.title,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            referrer: document.referrer,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent
        };
        
        this.pageViews.push(pageView);
        this.saveStoredData();
        
        console.log('📄 Page View:', pageView.url);
    }

    initEventTracking() {
        // Track clicks
        document.addEventListener('click', (e) => {
            const element = e.target;
            const trackingData = this.extractTrackingData(element);
            
            if (trackingData) {
                this.trackEvent('click', {
                    element: element.tagName,
                    id: element.id,
                    className: element.className,
                    text: element.textContent?.substring(0, 100),
                    ...trackingData
                });
            }
        });

        // Track form interactions
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                formId: e.target.id,
                formAction: e.target.action
            });
        });

        // Track scroll depth
        let scrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > scrollDepth) {
                scrollDepth = scrollPercent;
                
                // Track at 25%, 50%, 75%, 100%
                if ([25, 50, 75, 100].includes(scrollDepth)) {
                    this.trackEvent('scroll_depth', {
                        depth: scrollDepth,
                        page: window.location.pathname
                    });
                }
            }
        });

        // Track time on page
        let pageEnterTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - pageEnterTime;
            this.trackEvent('page_time', {
                timeSpent: Math.round(timeSpent / 1000), // seconds
                page: window.location.pathname
            });
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.trackEvent('error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Track online/offline status
        window.addEventListener('online', () => {
            this.trackEvent('online_status', { status: 'online' });
        });

        window.addEventListener('offline', () => {
            this.trackEvent('online_status', { status: 'offline' });
        });
    }

    extractTrackingData(element) {
        // Extract data from data-* attributes
        const data = {};
        
        if (element.dataset.track) {
            data.track = element.dataset.track;
        }
        
        if (element.dataset.category) {
            data.category = element.dataset.category;
        }
        
        if (element.dataset.action) {
            data.action = element.dataset.action;
        }
        
        if (element.dataset.label) {
            data.label = element.dataset.label;
        }
        
        return Object.keys(data).length > 0 ? data : null;
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            type: 'event',
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            page: window.location.pathname
        };
        
        this.events.push(event);
        this.saveStoredData();
        
        console.log('📈 Event:', eventName, properties);
        
        // Send to analytics endpoint (if configured)
        this.sendToEndpoint(event);
    }

    trackPerformance() {
        // Track page load performance
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const timing = window.performance.timing;
                
                const metrics = {
                    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                    tcpConnect: timing.connectEnd - timing.connectStart,
                    serverResponse: timing.responseEnd - timing.requestStart,
                    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                    pageLoad: timing.loadEventEnd - timing.navigationStart,
                    domInteractive: timing.domInteractive - timing.navigationStart,
                    contentLoad: timing.domContentLoadedEventStart - timing.navigationStart
                };
                
                this.trackEvent('performance_metrics', metrics);
            });
        }

        // Track memory usage (if available)
        if (performance.memory) {
            setInterval(() => {
                const memory = {
                    usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
                    totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
                    jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
                };
                
                this.trackEvent('memory_usage', memory);
            }, 60000); // Every minute
        }
    }

    sendToEndpoint(event) {
        // In production, send to your analytics endpoint
        // This is a simplified version
        const endpoint = '/api/analytics/track';
        
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        }).catch(error => {
            console.log('Analytics endpoint unavailable, storing locally');
        });
    }

    setupSync() {
        // Sync analytics data every 5 minutes
        setInterval(() => {
            this.syncWithServer();
        }, 5 * 60 * 1000);
        
        // Also sync when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncWithServer();
            }
        });
    }

    syncWithServer() {
        // Send batched analytics data to server
        const batch = {
            sessionId: this.sessionId,
            pageViews: this.pageViews,
            events: this.events,
            timestamp: new Date().toISOString()
        };
        
        // Send to server
        fetch('/api/analytics/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch)
        }).then(response => {
            if (response.ok) {
                // Clear sent data
                this.pageViews = [];
                this.events = [];
                this.saveStoredData();
                console.log('📊 Analytics synced with server');
            }
        }).catch(error => {
            console.log('📊 Analytics sync failed, will retry later');
        });
    }

    // Public methods
    trackFeatureUsage(feature, details = {}) {
        this.trackEvent('feature_usage', {
            feature: feature,
            ...details
        });
    }

    trackConversion(conversionType, value = null) {
        this.trackEvent('conversion', {
            type: conversionType,
            value: value
        });
    }

    trackError(error, context = {}) {
        this.trackEvent('error_occurred', {
            error: error.toString(),
            stack: error.stack,
            ...context
        });
    }

    setUserProperty(key, value) {
        this.userProperties[key] = value;
        this.saveStoredData();
    }

    getUserProperties() {
        return { ...this.userProperties };
    }

    getSessionId() {
        return this.sessionId;
    }

    getStats() {
        return {
            sessionId: this.sessionId,
            pageViewCount: this.pageViews.length,
            eventCount: this.events.length,
            userProperties: this.userProperties
        };
    }
}

// Initialize Analytics
const analytics = new AnalyticsManager();

// Make globally available
window.analytics = analytics;

// Helper functions
window.trackEvent = function(eventName, properties) {
    analytics.trackEvent(eventName, properties);
};

window.trackFeature = function(feature, details) {
    analytics.trackFeatureUsage(feature, details);
};

window.setUserProperty = function(key, value) {
    analytics.setUserProperty(key, value);
};

console.log('📊 Analytics loaded successfully!');