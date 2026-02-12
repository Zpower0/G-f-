/**
 * 🚀 Ultimate Ad Manager
 * 30-second ads before premium features
 * Multiple fallback networks
 */

class AdManager {
    constructor() {
        this.adNetworks = [
            'google_adsense',
            'propeller_ads',
            'adsterra',
            'monumetric',
            'media_net'
        ];
        this.activeNetwork = null;
        this.adQueue = [];
        this.isAdPlaying = false;
        this.userCredits = 0;
        this.adConfig = {
            videoDuration: 30, // seconds
            maxAdsPerDay: 10,
            rewardPerAd: 1
        };
        this.init();
    }

    init() {
        console.log('💰 Ad Manager Initializing...');
        
        // Load user ad credits
        this.loadUserCredits();
        
        // Initialize ad networks
        this.initAdNetworks();
        
        // Create ad containers
        this.createAdContainers();
        
        // Start ad rotation
        this.startAdRotation();
        
        console.log('✅ Ad Manager Ready');
    }

    loadUserCredits() {
        const saved = localStorage.getItem('resumeai_ad_credits');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.userCredits = data.credits || 0;
                this.adConfig = { ...this.adConfig, ...data.config };
            } catch (e) {
                this.userCredits = 0;
            }
        }
        
        // Update UI
        this.updateCreditsDisplay();
    }

    saveUserCredits() {
        const data = {
            credits: this.userCredits,
            config: this.adConfig,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('resumeai_ad_credits', JSON.stringify(data));
    }

    initAdNetworks() {
        // Initialize Google AdSense
        this.initGoogleAdSense();
        
        // Initialize PropellerAds
        this.initPropellerAds();
        
        // Initialize Adsterra
        this.initAdsterra();
        
        // Set active network
        this.activeNetwork = this.adNetworks[0];
    }

    initGoogleAdSense() {
        // Load AdSense script
        if (!document.querySelector('script[src*="googlesyndication"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544';
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
            
            console.log('🔗 Google AdSense loaded');
        }
    }

    initPropellerAds() {
        // Load PropellerAds script
        if (!document.querySelector('script[src*="dataclusters"]')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '//dataclusters.eu/nt/nt.js';
            document.head.appendChild(script);
            
            console.log('🔗 PropellerAds loaded');
        }
    }

    initAdsterra() {
        // Load Adsterra script
        if (!document.querySelector('script[src*="profitablecpmgate"]')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://www.profitablecpmgate.com/12345.js';
            document.head.appendChild(script);
            
            console.log('🔗 Adsterra loaded');
        }
    }

    createAdContainers() {
        // Create video ad container
        const videoAdContainer = document.createElement('div');
        videoAdContainer.id = 'video-ad-container';
        videoAdContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 640px;
            max-width: 90vw;
            max-height: 90vh;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            z-index: 99999;
            display: none;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        `;
        document.body.appendChild(videoAdContainer);

        // Create banner ad containers
        for (let i = 1; i <= 3; i++) {
            const banner = document.createElement('div');
            banner.id = `banner-ad-${i}`;
            banner.className = 'ad-banner';
            banner.style.cssText = `
                margin: 20px auto;
                text-align: center;
                min-height: 90px;
            `;
            
            // Insert in strategic locations
            if (i === 1) {
                const hero = document.querySelector('.hero');
                if (hero) hero.after(banner);
            } else if (i === 2) {
                const features = document.querySelector('.features');
                if (features) features.after(banner);
            } else {
                const footer = document.querySelector('footer');
                if (footer) footer.before(banner);
            }
        }
    }

    startAdRotation() {
        // Rotate ads every 30 seconds
        setInterval(() => {
            this.rotateBannerAds();
        }, 30000);
    }

    rotateBannerAds() {
        // Cycle through ad networks for banners
        const currentIndex = this.adNetworks.indexOf(this.activeNetwork);
        const nextIndex = (currentIndex + 1) % this.adNetworks.length;
        this.activeNetwork = this.adNetworks[nextIndex];
        
        // Update banner ads
        this.updateBannerAds();
    }

    updateBannerAds() {
        // Update all banner ads with current network
        document.querySelectorAll('.ad-banner').forEach(banner => {
            banner.innerHTML = this.generateBannerAd(this.activeNetwork);
        });
    }

    generateBannerAd(network) {
        const ads = {
            google_adsense: `
                <ins class="adsbygoogle"
                    style="display:block"
                    data-ad-client="ca-pub-3940256099942544"
                    data-ad-slot="1234567890"
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>
                <script>
                    (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            `,
            propeller_ads: `
                <div id="propeller-ad" style="text-align: center;">
                    <script type="text/javascript">
                        var _propeller = _propeller || [];
                        _propeller.push(['showBanner', 'propeller-ad']);
                    </script>
                </div>
            `,
            adsterra: `
                <div class="adsterra-banner">
                    <!-- Adsterra banner code would go here -->
                    <div style="text-align: center; padding: 20px; background: #1a1a2e; border-radius: 8px;">
                        <p style="color: #fff; margin: 0;">Advertisement</p>
                        <small style="color: #94a3b8;">Supports our free service</small>
                    </div>
                </div>
            `
        };

        return ads[network] || ads.google_adsense;
    }

    async showAd(feature) {
        return new Promise((resolve) => {
            console.log(`🎬 Showing ad for: ${feature}`);
            
            // Check if user has watched too many ads today
            if (this.hasReachedDailyLimit()) {
                console.log('⚠️ Daily ad limit reached, skipping ad');
                resolve(true);
                return;
            }
            
            // Check if user has enough credits
            if (this.userCredits > 5 && feature !== 'export') {
                console.log('💰 Using credits instead of ad');
                this.userCredits -= 1;
                this.saveUserCredits();
                this.updateCreditsDisplay();
                resolve(true);
                return;
            }
            
            // Create and show video ad
            this.showVideoAd(feature).then(() => {
                // Reward user
                this.addCredits(this.adConfig.rewardPerAd);
                
                // Track ad completion
                this.trackAdCompletion(feature);
                
                resolve(true);
            }).catch((error) => {
                console.error('Ad error:', error);
                // Even if ad fails, allow feature (better UX)
                resolve(true);
            });
        });
    }

    showVideoAd(feature) {
        return new Promise((resolve, reject) => {
            if (this.isAdPlaying) {
                resolve();
                return;
            }
            
            this.isAdPlaying = true;
            const container = document.getElementById('video-ad-container');
            
            // Create ad content
            container.innerHTML = this.createVideoAdContent();
            container.style.display = 'block';
            
            // Start countdown
            let secondsLeft = this.adConfig.videoDuration;
            const timer = container.querySelector('.ad-timer');
            const progress = container.querySelector('.ad-progress');
            
            const countdown = setInterval(() => {
                secondsLeft--;
                
                // Update timer
                if (timer) timer.textContent = secondsLeft;
                
                // Update progress bar
                if (progress) {
                    const percent = 100 - ((secondsLeft / this.adConfig.videoDuration) * 100);
                    progress.style.width = `${percent}%`;
                }
                
                // Check if ad completed
                if (secondsLeft <= 0) {
                    clearInterval(countdown);
                    this.completeVideoAd(container, feature);
                    resolve();
                }
            }, 1000);
            
            // Close button (disabled until ad completes)
            const closeBtn = container.querySelector('.ad-close');
            if (closeBtn) {
                closeBtn.onclick = (e) => {
                    e.preventDefault();
                    // Show message that ad must complete
                    this.showMustWatchMessage();
                };
            }
            
            // Escape key disabled
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.showMustWatchMessage();
                }
            };
            document.addEventListener('keydown', escapeHandler);
            
            // Store handler for cleanup
            container._escapeHandler = escapeHandler;
            
            // Auto-resolve after max time (safety)
            setTimeout(() => {
                if (this.isAdPlaying) {
                    clearInterval(countdown);
                    this.completeVideoAd(container, feature);
                    resolve();
                }
            }, (this.adConfig.videoDuration + 5) * 1000);
        });
    }

    createVideoAdContent() {
        return `
            <div class="video-ad-content">
                <div class="ad-header">
                    <h3>🎬 Advertisement</h3>
                    <p>This ad supports our free service</p>
                </div>
                
                <div class="ad-video-placeholder">
                    <div class="video-player">
                        <i class="fas fa-play-circle" style="font-size: 60px; color: #a855f7;"></i>
                        <p style="margin-top: 20px;">Video advertisement playing...</p>
                    </div>
                </div>
                
                <div class="ad-timer-container">
                    <div class="ad-progress-bar">
                        <div class="ad-progress" style="width: 0%"></div>
                    </div>
                    <div class="ad-timer-display">
                        <span>Ad ends in: </span>
                        <span class="ad-timer">${this.adConfig.videoDuration}</span>
                        <span> seconds</span>
                    </div>
                </div>
                
                <div class="ad-note">
                    <i class="fas fa-info-circle"></i>
                    Thank you for supporting our free service!
                </div>
                
                <button class="ad-close" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.7;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    completeVideoAd(container, feature) {
        this.isAdPlaying = false;
        
        // Remove escape handler
        if (container._escapeHandler) {
            document.removeEventListener('keydown', container._escapeHandler);
        }
        
        // Show completion message
        container.innerHTML = `
            <div class="ad-complete" style="
                padding: 40px;
                text-align: center;
                color: #fff;
            ">
                <div style="font-size: 60px; color: #10b981; margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="margin-bottom: 10px;">Ad Complete!</h3>
                <p style="margin-bottom: 20px; color: #94a3b8;">
                    Feature unlocked: ${feature}
                </p>
                <p style="color: #f59e0b; margin-bottom: 20px;">
                    <i class="fas fa-coins"></i> +${this.adConfig.rewardPerAd} Credit Added
                </p>
                <button class="btn-continue" style="
                    background: #a855f7;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-top: 10px;
                ">
                    Continue
                </button>
            </div>
        `;
        
        // Continue button
        const continueBtn = container.querySelector('.btn-continue');
        if (continueBtn) {
            continueBtn.onclick = () => {
                container.style.display = 'none';
                container.innerHTML = '';
            };
        }
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (container.style.display !== 'none') {
                container.style.display = 'none';
                container.innerHTML = '';
            }
        }, 3000);
    }

    showMustWatchMessage() {
        // Create toast message
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 100000;
            animation: slideIn 0.3s ease;
        `;
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            Please watch the ad to continue (${this.adConfig.videoDuration}s)
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        // Add CSS for animation
        if (!document.querySelector('#ad-animations')) {
            const style = document.createElement('style');
            style.id = 'ad-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    addCredits(amount) {
        this.userCredits += amount;
        this.saveUserCredits();
        this.updateCreditsDisplay();
        
        // Show credit notification
        this.showCreditNotification(amount);
    }

    showCreditNotification(amount) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideUp 0.5s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        notification.innerHTML = `
            <i class="fas fa-coins" style="font-size: 24px;"></i>
            <div>
                <strong>+${amount} Credit${amount > 1 ? 's' : ''}!</strong>
                <div style="font-size: 12px; opacity: 0.9;">Total: ${this.userCredits}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    updateCreditsDisplay() {
        const creditsDisplay = document.getElementById('credits-display');
        if (!creditsDisplay) {
            // Create credits display if it doesn't exist
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                const creditsElement = document.createElement('div');
                creditsElement.id = 'credits-display';
                creditsElement.className = 'credits-display';
                creditsElement.innerHTML = `
                    <i class="fas fa-coins" style="color: #f59e0b;"></i>
                    <span>${this.userCredits}</span>
                `;
                creditsElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(245, 158, 11, 0.1);
                    padding: 8px 15px;
                    border-radius: 20px;
                    color: #f59e0b;
                    font-weight: 600;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                `;
                navMenu.insertBefore(creditsElement, navMenu.firstChild);
            }
        } else {
            creditsDisplay.querySelector('span').textContent = this.userCredits;
        }
    }

    hasReachedDailyLimit() {
        const today = new Date().toDateString();
        const adHistory = JSON.parse(localStorage.getItem('resumeai_ad_history') || '{}');
        
        if (!adHistory[today]) {
            adHistory[today] = 0;
        }
        
        return adHistory[today] >= this.adConfig.maxAdsPerDay;
    }

    trackAdCompletion(feature) {
        const today = new Date().toDateString();
        const adHistory = JSON.parse(localStorage.getItem('resumeai_ad_history') || '{}');
        
        if (!adHistory[today]) {
            adHistory[today] = 0;
        }
        
        adHistory[today]++;
        localStorage.setItem('resumeai_ad_history', JSON.stringify(adHistory));
        
        // Track in analytics
        this.trackAdEvent('ad_completed', {
            feature: feature,
            network: this.activeNetwork,
            credits_earned: this.adConfig.rewardPerAd,
            daily_count: adHistory[today]
        });
    }

    trackAdEvent(event, data) {
        const eventData = {
            event: event,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        // Log to console (in production, send to analytics)
        console.log('💰 Ad Event:', eventData);
        
        // Save to localStorage
        const events = JSON.parse(localStorage.getItem('resumeai_ad_events') || '[]');
        events.push(eventData);
        localStorage.setItem('resumeai_ad_events', JSON.stringify(events.slice(-50)));
    }

    // Public methods for features to call
    showAdForExport() {
        return this.showAd('export');
    }

    showAdForAI() {
        return this.showAd('ai_suggestions');
    }

    showAdForTemplate() {
        return this.showAd('premium_template');
    }

    showAdForTool() {
        return this.showAd('career_tool');
    }

    getCredits() {
        return this.userCredits;
    }

    useCredits(amount) {
        if (this.userCredits >= amount) {
            this.userCredits -= amount;
            this.saveUserCredits();
            this.updateCreditsDisplay();
            return true;
        }
        return false;
    }
}

// Initialize Ad Manager
const adManager = new AdManager();

// Make globally available
window.AdManager = adManager;

// Helper functions for features
window.showAdForFeature = function(feature) {
    return adManager.showAd(feature);
};

window.hasEnoughCredits = function(amount) {
    return adManager.getCredits() >= amount;
};

window.useAdCredits = function(amount) {
    return adManager.useCredits(amount);
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update credits display
    adManager.updateCreditsDisplay();
    
    // Initialize banner ads
    setTimeout(() => {
        adManager.updateBannerAds();
    }, 1000);
});

console.log('💰 Ad Manager loaded successfully!');/**
 * 🚀 Ultimate Ad Manager
 * 30-second ads before premium features
 * Multiple fallback networks
 */

class AdManager {
    constructor() {
        this.adNetworks = [
            'google_adsense',
            'propeller_ads',
            'adsterra',
            'monumetric',
            'media_net'
        ];
        this.activeNetwork = null;
        this.adQueue = [];
        this.isAdPlaying = false;
        this.userCredits = 0;
        this.adConfig = {
            videoDuration: 30, // seconds
            maxAdsPerDay: 10,
            rewardPerAd: 1
        };
        this.init();
    }

    init() {
        console.log('💰 Ad Manager Initializing...');
        
        // Load user ad credits
        this.loadUserCredits();
        
        // Initialize ad networks
        this.initAdNetworks();
        
        // Create ad containers
        this.createAdContainers();
        
        // Start ad rotation
        this.startAdRotation();
        
        console.log('✅ Ad Manager Ready');
    }

    loadUserCredits() {
        const saved = localStorage.getItem('resumeai_ad_credits');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.userCredits = data.credits || 0;
                this.adConfig = { ...this.adConfig, ...data.config };
            } catch (e) {
                this.userCredits = 0;
            }
        }
        
        // Update UI
        this.updateCreditsDisplay();
    }

    saveUserCredits() {
        const data = {
            credits: this.userCredits,
            config: this.adConfig,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('resumeai_ad_credits', JSON.stringify(data));
    }

    initAdNetworks() {
        // Initialize Google AdSense
        this.initGoogleAdSense();
        
        // Initialize PropellerAds
        this.initPropellerAds();
        
        // Initialize Adsterra
        this.initAdsterra();
        
        // Set active network
        this.activeNetwork = this.adNetworks[0];
    }

    initGoogleAdSense() {
        // Load AdSense script
        if (!document.querySelector('script[src*="googlesyndication"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544';
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
            
            console.log('🔗 Google AdSense loaded');
        }
    }

    initPropellerAds() {
        // Load PropellerAds script
        if (!document.querySelector('script[src*="dataclusters"]')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '//dataclusters.eu/nt/nt.js';
            document.head.appendChild(script);
            
            console.log('🔗 PropellerAds loaded');
        }
    }

    initAdsterra() {
        // Load Adsterra script
        if (!document.querySelector('script[src*="profitablecpmgate"]')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://www.profitablecpmgate.com/12345.js';
            document.head.appendChild(script);
            
            console.log('🔗 Adsterra loaded');
        }
    }

    createAdContainers() {
        // Create video ad container
        const videoAdContainer = document.createElement('div');
        videoAdContainer.id = 'video-ad-container';
        videoAdContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 640px;
            max-width: 90vw;
            max-height: 90vh;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            z-index: 99999;
            display: none;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        `;
        document.body.appendChild(videoAdContainer);

        // Create banner ad containers
        for (let i = 1; i <= 3; i++) {
            const banner = document.createElement('div');
            banner.id = `banner-ad-${i}`;
            banner.className = 'ad-banner';
            banner.style.cssText = `
                margin: 20px auto;
                text-align: center;
                min-height: 90px;
            `;
            
            // Insert in strategic locations
            if (i === 1) {
                const hero = document.querySelector('.hero');
                if (hero) hero.after(banner);
            } else if (i === 2) {
                const features = document.querySelector('.features');
                if (features) features.after(banner);
            } else {
                const footer = document.querySelector('footer');
                if (footer) footer.before(banner);
            }
        }
    }

    startAdRotation() {
        // Rotate ads every 30 seconds
        setInterval(() => {
            this.rotateBannerAds();
        }, 30000);
    }

    rotateBannerAds() {
        // Cycle through ad networks for banners
        const currentIndex = this.adNetworks.indexOf(this.activeNetwork);
        const nextIndex = (currentIndex + 1) % this.adNetworks.length;
        this.activeNetwork = this.adNetworks[nextIndex];
        
        // Update banner ads
        this.updateBannerAds();
    }

    updateBannerAds() {
        // Update all banner ads with current network
        document.querySelectorAll('.ad-banner').forEach(banner => {
            banner.innerHTML = this.generateBannerAd(this.activeNetwork);
        });
    }

    generateBannerAd(network) {
        const ads = {
            google_adsense: `
                <ins class="adsbygoogle"
                    style="display:block"
                    data-ad-client="ca-pub-3940256099942544"
                    data-ad-slot="1234567890"
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>
                <script>
                    (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            `,
            propeller_ads: `
                <div id="propeller-ad" style="text-align: center;">
                    <script type="text/javascript">
                        var _propeller = _propeller || [];
                        _propeller.push(['showBanner', 'propeller-ad']);
                    </script>
                </div>
            `,
            adsterra: `
                <div class="adsterra-banner">
                    <!-- Adsterra banner code would go here -->
                    <div style="text-align: center; padding: 20px; background: #1a1a2e; border-radius: 8px;">
                        <p style="color: #fff; margin: 0;">Advertisement</p>
                        <small style="color: #94a3b8;">Supports our free service</small>
                    </div>
                </div>
            `
        };

        return ads[network] || ads.google_adsense;
    }

    async showAd(feature) {
        return new Promise((resolve) => {
            console.log(`🎬 Showing ad for: ${feature}`);
            
            // Check if user has watched too many ads today
            if (this.hasReachedDailyLimit()) {
                console.log('⚠️ Daily ad limit reached, skipping ad');
                resolve(true);
                return;
            }
            
            // Check if user has enough credits
            if (this.userCredits > 5 && feature !== 'export') {
                console.log('💰 Using credits instead of ad');
                this.userCredits -= 1;
                this.saveUserCredits();
                this.updateCreditsDisplay();
                resolve(true);
                return;
            }
            
            // Create and show video ad
            this.showVideoAd(feature).then(() => {
                // Reward user
                this.addCredits(this.adConfig.rewardPerAd);
                
                // Track ad completion
                this.trackAdCompletion(feature);
                
                resolve(true);
            }).catch((error) => {
                console.error('Ad error:', error);
                // Even if ad fails, allow feature (better UX)
                resolve(true);
            });
        });
    }

    showVideoAd(feature) {
        return new Promise((resolve, reject) => {
            if (this.isAdPlaying) {
                resolve();
                return;
            }
            
            this.isAdPlaying = true;
            const container = document.getElementById('video-ad-container');
            
            // Create ad content
            container.innerHTML = this.createVideoAdContent();
            container.style.display = 'block';
            
            // Start countdown
            let secondsLeft = this.adConfig.videoDuration;
            const timer = container.querySelector('.ad-timer');
            const progress = container.querySelector('.ad-progress');
            
            const countdown = setInterval(() => {
                secondsLeft--;
                
                // Update timer
                if (timer) timer.textContent = secondsLeft;
                
                // Update progress bar
                if (progress) {
                    const percent = 100 - ((secondsLeft / this.adConfig.videoDuration) * 100);
                    progress.style.width = `${percent}%`;
                }
                
                // Check if ad completed
                if (secondsLeft <= 0) {
                    clearInterval(countdown);
                    this.completeVideoAd(container, feature);
                    resolve();
                }
            }, 1000);
            
            // Close button (disabled until ad completes)
            const closeBtn = container.querySelector('.ad-close');
            if (closeBtn) {
                closeBtn.onclick = (e) => {
                    e.preventDefault();
                    // Show message that ad must complete
                    this.showMustWatchMessage();
                };
            }
            
            // Escape key disabled
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.showMustWatchMessage();
                }
            };
            document.addEventListener('keydown', escapeHandler);
            
            // Store handler for cleanup
            container._escapeHandler = escapeHandler;
            
            // Auto-resolve after max time (safety)
            setTimeout(() => {
                if (this.isAdPlaying) {
                    clearInterval(countdown);
                    this.completeVideoAd(container, feature);
                    resolve();
                }
            }, (this.adConfig.videoDuration + 5) * 1000);
        });
    }

    createVideoAdContent() {
        return `
            <div class="video-ad-content">
                <div class="ad-header">
                    <h3>🎬 Advertisement</h3>
                    <p>This ad supports our free service</p>
                </div>
                
                <div class="ad-video-placeholder">
                    <div class="video-player">
                        <i class="fas fa-play-circle" style="font-size: 60px; color: #a855f7;"></i>
                        <p style="margin-top: 20px;">Video advertisement playing...</p>
                    </div>
                </div>
                
                <div class="ad-timer-container">
                    <div class="ad-progress-bar">
                        <div class="ad-progress" style="width: 0%"></div>
                    </div>
                    <div class="ad-timer-display">
                        <span>Ad ends in: </span>
                        <span class="ad-timer">${this.adConfig.videoDuration}</span>
                        <span> seconds</span>
                    </div>
                </div>
                
                <div class="ad-note">
                    <i class="fas fa-info-circle"></i>
                    Thank you for supporting our free service!
                </div>
                
                <button class="ad-close" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.7;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    completeVideoAd(container, feature) {
        this.isAdPlaying = false;
        
        // Remove escape handler
        if (container._escapeHandler) {
            document.removeEventListener('keydown', container._escapeHandler);
        }
        
        // Show completion message
        container.innerHTML = `
            <div class="ad-complete" style="
                padding: 40px;
                text-align: center;
                color: #fff;
            ">
                <div style="font-size: 60px; color: #10b981; margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="margin-bottom: 10px;">Ad Complete!</h3>
                <p style="margin-bottom: 20px; color: #94a3b8;">
                    Feature unlocked: ${feature}
                </p>
                <p style="color: #f59e0b; margin-bottom: 20px;">
                    <i class="fas fa-coins"></i> +${this.adConfig.rewardPerAd} Credit Added
                </p>
                <button class="btn-continue" style="
                    background: #a855f7;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-top: 10px;
                ">
                    Continue
                </button>
            </div>
        `;
        
        // Continue button
        const continueBtn = container.querySelector('.btn-continue');
        if (continueBtn) {
            continueBtn.onclick = () => {
                container.style.display = 'none';
                container.innerHTML = '';
            };
        }
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (container.style.display !== 'none') {
                container.style.display = 'none';
                container.innerHTML = '';
            }
        }, 3000);
    }

    showMustWatchMessage() {
        // Create toast message
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 100000;
            animation: slideIn 0.3s ease;
        `;
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            Please watch the ad to continue (${this.adConfig.videoDuration}s)
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        // Add CSS for animation
        if (!document.querySelector('#ad-animations')) {
            const style = document.createElement('style');
            style.id = 'ad-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    addCredits(amount) {
        this.userCredits += amount;
        this.saveUserCredits();
        this.updateCreditsDisplay();
        
        // Show credit notification
        this.showCreditNotification(amount);
    }

    showCreditNotification(amount) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideUp 0.5s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        notification.innerHTML = `
            <i class="fas fa-coins" style="font-size: 24px;"></i>
            <div>
                <strong>+${amount} Credit${amount > 1 ? 's' : ''}!</strong>
                <div style="font-size: 12px; opacity: 0.9;">Total: ${this.userCredits}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    updateCreditsDisplay() {
        const creditsDisplay = document.getElementById('credits-display');
        if (!creditsDisplay) {
            // Create credits display if it doesn't exist
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                const creditsElement = document.createElement('div');
                creditsElement.id = 'credits-display';
                creditsElement.className = 'credits-display';
                creditsElement.innerHTML = `
                    <i class="fas fa-coins" style="color: #f59e0b;"></i>
                    <span>${this.userCredits}</span>
                `;
                creditsElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(245, 158, 11, 0.1);
                    padding: 8px 15px;
                    border-radius: 20px;
                    color: #f59e0b;
                    font-weight: 600;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                `;
                navMenu.insertBefore(creditsElement, navMenu.firstChild);
            }
        } else {
            creditsDisplay.querySelector('span').textContent = this.userCredits;
        }
    }

    hasReachedDailyLimit() {
        const today = new Date().toDateString();
        const adHistory = JSON.parse(localStorage.getItem('resumeai_ad_history') || '{}');
        
        if (!adHistory[today]) {
            adHistory[today] = 0;
        }
        
        return adHistory[today] >= this.adConfig.maxAdsPerDay;
    }

    trackAdCompletion(feature) {
        const today = new Date().toDateString();
        const adHistory = JSON.parse(localStorage.getItem('resumeai_ad_history') || '{}');
        
        if (!adHistory[today]) {
            adHistory[today] = 0;
        }
        
        adHistory[today]++;
        localStorage.setItem('resumeai_ad_history', JSON.stringify(adHistory));
        
        // Track in analytics
        this.trackAdEvent('ad_completed', {
            feature: feature,
            network: this.activeNetwork,
            credits_earned: this.adConfig.rewardPerAd,
            daily_count: adHistory[today]
        });
    }

    trackAdEvent(event, data) {
        const eventData = {
            event: event,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        // Log to console (in production, send to analytics)
        console.log('💰 Ad Event:', eventData);
        
        // Save to localStorage
        const events = JSON.parse(localStorage.getItem('resumeai_ad_events') || '[]');
        events.push(eventData);
        localStorage.setItem('resumeai_ad_events', JSON.stringify(events.slice(-50)));
    }

    // Public methods for features to call
    showAdForExport() {
        return this.showAd('export');
    }

    showAdForAI() {
        return this.showAd('ai_suggestions');
    }

    showAdForTemplate() {
        return this.showAd('premium_template');
    }

    showAdForTool() {
        return this.showAd('career_tool');
    }

    getCredits() {
        return this.userCredits;
    }

    useCredits(amount) {
        if (this.userCredits >= amount) {
            this.userCredits -= amount;
            this.saveUserCredits();
            this.updateCreditsDisplay();
            return true;
        }
        return false;
    }
}

// Initialize Ad Manager
const adManager = new AdManager();

// Make globally available
window.AdManager = adManager;

// Helper functions for features
window.showAdForFeature = function(feature) {
    return adManager.showAd(feature);
};

window.hasEnoughCredits = function(amount) {
    return adManager.getCredits() >= amount;
};

window.useAdCredits = function(amount) {
    return adManager.useCredits(amount);
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update credits display
    adManager.updateCreditsDisplay();
    
    // Initialize banner ads
    setTimeout(() => {
        adManager.updateBannerAds();
    }, 1000);
});

console.log('💰 Ad Manager loaded successfully!');