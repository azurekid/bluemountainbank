// Azure Storage Proxy to handle CORS issues
class AzureStorageProxy {
    constructor() {
        // List of public CORS proxies to try (in order)
        this.proxyEndpoints = [
            "https://corsproxy.io/?",
            "https://cors-anywhere.herokuapp.com/",
            "https://api.allorigins.win/raw?url=",
            "https://proxy.cors.sh/" // Added additional proxy as backup
        ];
        
        this.currentProxyIndex = 0;
        this.proxyFailureCount = 0;
        this.maxFailures = 2; // Reduced to fail faster and try the next proxy sooner
        this.directAccessAttempted = false;
        
        // Track which proxies have failed for which URLs
        this.failedProxies = new Map();
        
        console.log("Azure Storage Proxy initialized with multiple fallback proxies");
    }

    /**
     * Create a proxy URL for Azure Blob Storage requests
     * @param {string} url - The original Azure URL
     * @returns {string} - The proxied URL
     */
    createProxyUrl(url) {
        // If we've tried all proxies for this specific URL, try direct access
        const urlKey = this.getUrlKey(url);
        const failedForUrl = this.failedProxies.get(urlKey) || [];
        
        // If all proxies have failed for this URL, try direct access
        if (failedForUrl.length >= this.proxyEndpoints.length) {
            console.log(`All proxies failed for ${urlKey}, attempting direct access`);
            return url;
        }
        
        // If this proxy has failed for this URL before, try the next one
        while (failedForUrl.includes(this.currentProxyIndex)) {
            this.switchProxy();
        }
        
        return this.proxyEndpoints[this.currentProxyIndex] + encodeURIComponent(url);
    }
    
    /**
     * Get a simplified key for the URL to track failures
     */
    getUrlKey(url) {
        // Extract container and blob name only to group similar requests
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            return path; // Just use the path as the key
        } catch (e) {
            return url; // Fallback to full URL if parsing fails
        }
    }

    /**
     * Switch to the next available proxy
     */
    switchProxy() {
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyEndpoints.length;
        this.proxyFailureCount = 0;
        console.log(`Switched to proxy: ${this.proxyEndpoints[this.currentProxyIndex]}`);
    }

    /**
     * Track proxy failure for a specific URL
     */
    trackProxyFailure(url) {
        const urlKey = this.getUrlKey(url);
        let failedForUrl = this.failedProxies.get(urlKey) || [];
        
        if (!failedForUrl.includes(this.currentProxyIndex)) {
            failedForUrl.push(this.currentProxyIndex);
            this.failedProxies.set(urlKey, failedForUrl);
        }
        
        console.log(`Proxy ${this.currentProxyIndex} failed for ${urlKey}. Failed proxies for this URL: ${failedForUrl.length}/${this.proxyEndpoints.length}`);
    }

    /**
     * Send a proxied fetch request to Azure Blob Storage
     * @param {string} url - Original Azure URL
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} - Fetch response
     */
    async sendRequest(url, options = {}) {
        // Try to determine if this is a credentials request (more sensitive to CORS)
        const isCredentialsRequest = url.includes('/credentials/');
        
        // For credentials container, start with a different proxy if needed
        if (isCredentialsRequest && !this.credentialsProxyStarted) {
            this.currentProxyIndex = 1; // Start with the second proxy for credentials
            this.credentialsProxyStarted = true;
        }
        
        const proxiedUrl = this.createProxyUrl(url);
        const isDirect = proxiedUrl === url; // Check if we're using direct access
        
        try {
            console.log(`Sending ${isDirect ? 'direct' : 'proxied'} request to: ${proxiedUrl}`);
            
            const fetchOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'X-Requested-With': 'XMLHttpRequest', // Required by some proxies
                }
            };
            
            // Add custom headers for specific proxies
            if (proxiedUrl.includes('cors.sh')) {
                fetchOptions.headers['x-cors-api-key'] = 'temp_me_a_key';
            }
            
            const response = await fetch(proxiedUrl, fetchOptions);
            
            // Reset failure count on success
            if (!isDirect) {
                this.proxyFailureCount = 0;
            }
            
            return response;
        } catch (error) {
            console.error(`${isDirect ? 'Direct' : 'Proxy'} request failed:`, error);
            
            if (!isDirect) {
                // Track this failure for this specific URL
                this.trackProxyFailure(url);
                
                // Track failures and switch proxies if needed
                this.proxyFailureCount++;
                
                if (this.proxyFailureCount >= this.maxFailures) {
                    if (this.proxyEndpoints.length > 1) {
                        console.log(`Proxy failed ${this.proxyFailureCount} times. Trying next proxy.`);
                        this.switchProxy();
                        
                        // Try again with the new proxy
                        return this.sendRequest(url, options);
                    }
                }
            }
            
            throw error;
        }
    }
    
    /**
     * Check if the Azure Blob Storage is directly accessible without proxy
     * This can help determine if CORS is properly configured
     * @returns {Promise<boolean>} - True if direct access works
     */
    async checkDirectAccess() {
        try {
            // Try to access a simple Azure Storage endpoint
            const testUrl = `https://bluemountaindata.blob.core.windows.net/userdata?restype=container&comp=list&maxresults=1`;
            const response = await fetch(testUrl, {
                method: 'HEAD'
            });
            
            this.directAccessAttempted = true;
            const directAccessWorks = response.ok;
            
            if (directAccessWorks) {
                console.log('Direct access to Azure Storage is working! CORS is properly configured.');
            }
            
            return directAccessWorks;
        } catch (error) {
            console.log('Direct access to Azure Storage failed:', error.message);
            this.directAccessAttempted = true;
            return false;
        }
    }
}

// Export for global use
window.AzureStorageProxy = AzureStorageProxy;
