// CDN Helper for Blue Mountain Bank
// Provides dynamic CDN asset loading with fallback

class CDNHelper {
    constructor(options = {}) {
        // CDN configuration
        this.cdnBase = options.cdnBase || 'https://cdn.bluemountainbank.com';
        this.cdnVersion = options.cdnVersion || 'v1';
        this.fallbackUrl = options.fallbackUrl || window.location.origin;
        this.statusCheckUrl = options.statusCheckUrl || '/health/cdn-status.json';
        this.maxRetries = options.maxRetries || 2;
        this.cacheDuration = options.cacheDuration || 300000; // 5 minutes
        
        // State
        this.cdnAvailable = null;
        this.lastStatusCheck = null;
        this.retryCount = 0;
        this.loadedAssets = new Map();
        this.failedAssets = new Set();
        
        // Statistics
        this.stats = {
            cdnLoaded: 0,
            fallbackLoaded: 0,
            errors: 0,
            avgCdnLoadTime: 0,
            avgFallbackLoadTime: 0
        };
    }
    
    /**
     * Check if the CDN is available
     * @returns {Promise<boolean>} Whether the CDN is available
     */
    async checkCDNStatus() {
        const now = Date.now();
        
        // Use cached result if available and not expired
        if (this.cdnAvailable !== null && 
            this.lastStatusCheck && 
            now - this.lastStatusCheck < this.cacheDuration) {
            console.log('Using cached CDN status:', this.cdnAvailable);
            return this.cdnAvailable;
        }
        
        // Otherwise check status from the health endpoint
        try {
            console.log('Checking CDN status...');
            const response = await fetch(this.statusCheckUrl, { 
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.cdnAvailable = data.available === true;
                this.cdnBase = data.cdnBase || this.cdnBase;
                this.cdnVersion = data.version || this.cdnVersion;
            } else {
                // If status check fails, assume CDN is down
                console.warn('CDN status check failed:', response.status);
                this.cdnAvailable = false;
            }
        } catch (error) {
            console.error('Error checking CDN status:', error);
            this.cdnAvailable = false;
        }
        
        this.lastStatusCheck = now;
        console.log('CDN status:', this.cdnAvailable ? 'Available' : 'Unavailable');
        return this.cdnAvailable;
    }
    
    /**
     * Get the URL for an asset, using CDN if available, otherwise fallback
     * @param {string} path - Asset path (without leading slash)
     * @returns {string} - Complete URL for the asset
     */
    getAssetUrl(path) {
        // Remove leading slash if present
        const assetPath = path.startsWith('/') ? path.substring(1) : path;
        
        // Use CDN if available, otherwise fallback to local
        if (this.cdnAvailable) {
            return `${this.cdnBase}/${this.cdnVersion}/${assetPath}`;
        } else {
            return `${this.fallbackUrl}/${assetPath}`;
        }
    }
    
    /**
     * Load a script from the CDN with fallback
     * @param {string} path - Script path (without leading slash)
     * @returns {Promise<HTMLElement>} - The loaded script element
     */
    async loadScript(path) {
        // Check if this script has been loaded before
        if (this.loadedAssets.has(path)) {
            console.log(`Script ${path} already loaded`);
            return this.loadedAssets.get(path);
        }
        
        // Check if this script failed to load before
        if (this.failedAssets.has(path)) {
            console.warn(`Script ${path} previously failed to load, using direct fallback`);
            return this.loadScriptFallback(path);
        }
        
        // Ensure CDN status is checked
        if (this.cdnAvailable === null) {
            await this.checkCDNStatus();
        }
        
        try {
            // Try CDN first if available
            if (this.cdnAvailable) {
                console.log(`Loading script from CDN: ${path}`);
                const startTime = Date.now();
                
                try {
                    const script = await this.loadScriptFromUrl(this.getAssetUrl(path));
                    
                    // Update statistics
                    const loadTime = Date.now() - startTime;
                    this.stats.cdnLoaded++;
                    this.stats.avgCdnLoadTime = ((this.stats.avgCdnLoadTime * (this.stats.cdnLoaded - 1)) + loadTime) / this.stats.cdnLoaded;
                    
                    // Cache the loaded script
                    this.loadedAssets.set(path, script);
                    return script;
                } catch (error) {
                    console.warn(`CDN script load failed for ${path}, falling back to local:`, error);
                    return await this.loadScriptFallback(path);
                }
            } else {
                // If CDN unavailable, use fallback directly
                return await this.loadScriptFallback(path);
            }
        } catch (error) {
            console.error(`Failed to load script ${path}:`, error);
            this.failedAssets.add(path);
            this.stats.errors++;
            throw error;
        }
    }
    
    /**
     * Load a script from the fallback URL
     * @param {string} path - Script path
     * @returns {Promise<HTMLElement>} - The loaded script element
     */
    async loadScriptFallback(path) {
        console.log(`Loading script from fallback: ${path}`);
        const startTime = Date.now();
        
        try {
            const script = await this.loadScriptFromUrl(`${this.fallbackUrl}/${path}`);
            
            // Update statistics
            const loadTime = Date.now() - startTime;
            this.stats.fallbackLoaded++;
            this.stats.avgFallbackLoadTime = ((this.stats.avgFallbackLoadTime * (this.stats.fallbackLoaded - 1)) + loadTime) / this.stats.fallbackLoaded;
            
            // Cache the loaded script
            this.loadedAssets.set(path, script);
            return script;
        } catch (error) {
            this.failedAssets.add(path);
            this.stats.errors++;
            throw error;
        }
    }
    
    /**
     * Load a script from a specific URL
     * @param {string} url - Full URL to load
     * @returns {Promise<HTMLElement>} - The loaded script element
     */
    loadScriptFromUrl(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            // Set handlers
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script from ${url}`));
            
            // Add to document
            document.head.appendChild(script);
        });
    }
    
    /**
     * Load a CSS stylesheet from the CDN with fallback
     * @param {string} path - CSS path (without leading slash)
     * @returns {Promise<HTMLElement>} - The loaded link element
     */
    async loadCSS(path) {
        // Check if this CSS has been loaded before
        if (this.loadedAssets.has(path)) {
            return this.loadedAssets.get(path);
        }
        
        // Check if this CSS failed to load before
        if (this.failedAssets.has(path)) {
            return this.loadCSSFallback(path);
        }
        
        // Ensure CDN status is checked
        if (this.cdnAvailable === null) {
            await this.checkCDNStatus();
        }
        
        try {
            // Try CDN first if available
            if (this.cdnAvailable) {
                console.log(`Loading CSS from CDN: ${path}`);
                const startTime = Date.now();
                
                try {
                    const link = await this.loadCSSFromUrl(this.getAssetUrl(path));
                    
                    // Update statistics
                    const loadTime = Date.now() - startTime;
                    this.stats.cdnLoaded++;
                    this.stats.avgCdnLoadTime = ((this.stats.avgCdnLoadTime * (this.stats.cdnLoaded - 1)) + loadTime) / this.stats.cdnLoaded;
                    
                    // Cache the loaded link
                    this.loadedAssets.set(path, link);
                    return link;
                } catch (error) {
                    console.warn(`CDN CSS load failed for ${path}, falling back to local:`, error);
                    return await this.loadCSSFallback(path);
                }
            } else {
                // If CDN unavailable, use fallback directly
                return await this.loadCSSFallback(path);
            }
        } catch (error) {
            console.error(`Failed to load CSS ${path}:`, error);
            this.failedAssets.add(path);
            this.stats.errors++;
            throw error;
        }
    }
    
    /**
     * Load a CSS stylesheet from the fallback URL
     * @param {string} path - CSS path
     * @returns {Promise<HTMLElement>} - The loaded link element
     */
    async loadCSSFallback(path) {
        console.log(`Loading CSS from fallback: ${path}`);
        const startTime = Date.now();
        
        try {
            const link = await this.loadCSSFromUrl(`${this.fallbackUrl}/${path}`);
            
            // Update statistics
            const loadTime = Date.now() - startTime;
            this.stats.fallbackLoaded++;
            this.stats.avgFallbackLoadTime = ((this.stats.avgFallbackLoadTime * (this.stats.fallbackLoaded - 1)) + loadTime) / this.stats.fallbackLoaded;
            
            // Cache the loaded link
            this.loadedAssets.set(path, link);
            return link;
        } catch (error) {
            this.failedAssets.add(path);
            this.stats.errors++;
            throw error;
        }
    }
    
    /**
     * Load a CSS stylesheet from a specific URL
     * @param {string} url - Full URL to load
     * @returns {Promise<HTMLElement>} - The loaded link element
     */
    loadCSSFromUrl(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            
            // Set handlers
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to load CSS from ${url}`));
            
            // Add to document
            document.head.appendChild(link);
        });
    }
    
    /**
     * Get URL for an image, prepending CDN base if available
     * @param {string} path - Image path
     * @returns {string} - URL for the image
     */
    getImageUrl(path) {
        return this.getAssetUrl(path);
    }
    
    /**
     * Preload critical assets
     * @param {Array<string>} assets - Array of asset paths to preload
     */
    async preloadAssets(assets = []) {
        if (!Array.isArray(assets) || assets.length === 0) {
            return;
        }
        
        console.log(`Preloading ${assets.length} assets...`);
        const promises = [];
        
        for (const asset of assets) {
            // Determine type based on file extension
            const ext = asset.split('.').pop().toLowerCase();
            let promise;
            
            if (['js'].includes(ext)) {
                promise = this.loadScript(asset).catch(err => console.warn(`Preload failed for ${asset}:`, err));
            } else if (['css'].includes(ext)) {
                promise = this.loadCSS(asset).catch(err => console.warn(`Preload failed for ${asset}:`, err));
            } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
                // For images, just create a preload link
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = this.getAssetUrl(asset);
                document.head.appendChild(link);
            }
            
            if (promise) {
                promises.push(promise);
            }
        }
        
        // Wait for all preloads to complete
        await Promise.allSettled(promises);
        console.log('Preloading complete');
    }
    
    /**
     * Get performance statistics
     * @returns {Object} - Statistics about asset loading
     */
    getStats() {
        return {
            ...this.stats,
            cdnAvailable: this.cdnAvailable,
            loadedAssets: this.loadedAssets.size,
            failedAssets: this.failedAssets.size,
            lastChecked: this.lastStatusCheck ? new Date(this.lastStatusCheck).toISOString() : null
        };
    }
    
    /**
     * Reset the CDN helper state
     */
    reset() {
        this.cdnAvailable = null;
        this.lastStatusCheck = null;
        this.retryCount = 0;
        this.stats = {
            cdnLoaded: 0,
            fallbackLoaded: 0,
            errors: 0,
            avgCdnLoadTime: 0,
            avgFallbackLoadTime: 0
        };
        console.log('CDN helper reset');
    }
}

// Create global instance
window.CDNHelper = new CDNHelper();
