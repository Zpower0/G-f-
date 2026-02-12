/**
 * 📱 Progressive Web App Support
 * Install as native app, offline support, push notifications
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        console.log('📱 PWA Manager Initializing...');
        
        // Check if PWA is already installed
        this.checkInstallation();
        
        // Register service worker
        this.registerServiceWorker();
        
        // Handle install prompt
        this.handleInstallPrompt();
        
        // Setup before install prompt
        this.setupBeforeInstallPrompt();
        
        // Setup app lifecycle
        this.setupAppLifecycle();
        
        console.log('✅ PWA Manager Ready');
    }

    checkInstallation() {
        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('📱 App is installed as PWA');
            this.trackPWAEvent('installed');
        }
        
        // Check for iOS standalone mode
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('📱 App is installed on iOS');
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('✅ ServiceWorker registered:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('🔄 New service worker found');
                            
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.log('❌ ServiceWorker registration failed:', error);
                    });
            });
        }
    }

    handleInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show install button
            this.showInstallButton();
            
            console.log('📱 Install prompt available');
            this.trackPWAEvent('install_prompt_available');
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        if (!document.getElementById('pwa-install-btn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.className = 'pwa-install-btn';
            installBtn.innerHTML = `
                <i class="fas fa-download"></i>
                <span>Install App</span>
            `;
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #a855f7, #6366f1);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
                z-index: 1000;
                animation: bounce 2s infinite;
            `;
            
            installBtn.addEventListener('click', () => {
                this.installPWA();
            });
            
            document.body.appendChild(installBtn);
            
            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('❌ Install prompt not available');
            return;
        }
        
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const choiceResult = await this.deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
            this.trackPWAEvent('install_accepted');
            
            // Hide install button
            this.hideInstallButton();
            
            // Mark as installed
            this.isInstalled = true;
            
            // Show success message
            this.showInstallSuccess();
        } else {
            console.log('❌ User dismissed the install prompt');
            this.trackPWAEvent('install_dismissed');
        }
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    showInstallSuccess() {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'pwa-install-success';
        notification.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>App Installed Successfully!</strong>
                    <p>You can now use ResumeAI Pro like a native app.</p>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    showUpdateNotification() {
        // Show update available notification
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-sync-alt"></i>
                <div>
                    <strong>Update Available!</strong>
                    <p>A new version of ResumeAI Pro is available.</p>
                </div>
                <button class="btn-update">Update Now</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Update button
        notification.querySelector('.btn-update').onclick = () => {
            window.location.reload();
        };
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 10000);
    }

    setupBeforeInstallPrompt() {
        // Listen for app installed event
        window.addEventListener('appinstalled', (e) => {
            console.log('📱 App was installed');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.trackPWAEvent('app_installed');
        });
    }

    setupAppLifecycle() {
        // Track app visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackPWAEvent('app_background');
            } else {
                this.trackPWAEvent('app_foreground');
            }
        });
        
        // Track network status
        window.addEventListener('online', () => {
            this.trackPWAEvent('network_online');
        });
        
        window.addEventListener('offline', () => {
            this.trackPWAEvent('network_offline');
        });
    }

    trackPWAEvent(eventName, data = {}) {
        // Track PWA-related events
        const eventData = {
            event: `pwa_${eventName}`,
            timestamp: new Date().toISOString(),
            isInstalled: this.isInstalled,
            displayMode: this.getDisplayMode(),
            ...data
        };
        
        console.log('📱 PWA Event:', eventName, eventData);
        
        // Send to analytics
        if (window.analytics) {
            window.analytics.trackEvent(`pwa_${eventName}`, eventData);
        }
    }

    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return 'standalone';
        } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return 'fullscreen';
        } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return 'minimal-ui';
        } else {
            return 'browser';
        }
    }

    // Public methods
    isPWAInstalled() {
        return this.isInstalled;
    }

    getInstallPrompt() {
        return this.deferredPrompt;
    }

    showInstallPrompt() {
        if (this.deferredPrompt) {
            return this.installPWA();
        } else {
            console.log('Install prompt not available');
            return Promise.resolve(false);
        }
    }

    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
            });
        }
    }

    // Offline capabilities
    setupOfflineUI() {
        // Show offline indicator when needed
        if (!navigator.onLine) {
            this.showOfflineIndicator();
        }
        
        window.addEventListener('online', () => {
            this.hideOfflineIndicator();
        });
        
        window.addEventListener('offline', () => {
            this.showOfflineIndicator();
        });
    }

    showOfflineIndicator() {
        // Create offline indicator
        if (!document.getElementById('offline-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <span>You are offline. Changes saved locally.</span>
            `;
            
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ef4444;
                color: white;
                padding: 10px 20px;
                text-align: center;
                z-index: 1001;
                animation: slideDown 0.3s ease;
            `;
            
            document.body.appendChild(indicator);
        }
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }
    }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Make globally available
window.pwaManager = pwaManager;

// Helper functions
window.installApp = function() {
    return pwaManager.showInstallPrompt();
};

window.checkAppUpdate = function() {
    return pwaManager.checkForUpdates();
};

// Auto-setup offline UI
document.addEventListener('DOMContentLoaded', function() {
    pwaManager.setupOfflineUI();
});

console.log('📱 PWA Manager loaded successfully!');