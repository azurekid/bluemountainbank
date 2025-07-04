// Azure Storage Proxy to handle CORS issues
class AzureStorageProxy {
    constructor() {
        // List of public CORS proxies to try (in order) - updated with more reliable options
        this.proxyEndpoints = [
            "https://api.allorigins.win/raw?url=",
            "https://cors-anywhere.herokuapp.com/",
            "https://proxy.cors.sh/",
            "https://corsproxy.io/?" // Moved to end due to recent 403 issues
        ];
        
        this.currentProxyIndex = 0;
        this.proxyFailureCount = 0;
        this.maxFailures = 1; // Fail faster to try next proxy sooner
        this.directAccessAttempted = false;
        
        // Track which proxies have failed for which URLs
        this.failedProxies = new Map();
        
        // Track global proxy health
        this.proxyHealth = new Map();
        this.initializeProxyHealth();
        
        console.log("Azure Storage Proxy initialized with enhanced fallback strategy");
    }
    
    /**
     * Initialize proxy health tracking
     */
    initializeProxyHealth() {
        this.proxyEndpoints.forEach((proxy, index) => {
            this.proxyHealth.set(index, {
                failures: 0,
                lastFailure: null,
                isBlocked: false
            });
        });
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
        
        // Find the next healthy proxy
        let attempts = 0;
        while (attempts < this.proxyEndpoints.length) {
            const proxyHealth = this.proxyHealth.get(this.currentProxyIndex);
            
            // Skip blocked or recently failed proxies
            if (proxyHealth.isBlocked || 
                (proxyHealth.lastFailure && Date.now() - proxyHealth.lastFailure < 60000)) { // 1 minute cooldown
                this.switchProxy();
                attempts++;
                continue;
            }
            
            // Skip if this proxy failed for this specific URL
            if (failedForUrl.includes(this.currentProxyIndex)) {
                this.switchProxy();
                attempts++;
                continue;
            }
            
            break;
        }
        
        // If no healthy proxy found, try direct access
        if (attempts >= this.proxyEndpoints.length) {
            console.log(`No healthy proxies available for ${urlKey}, attempting direct access`);
            return url;
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
    trackProxyFailure(url, statusCode = null) {
        const urlKey = this.getUrlKey(url);
        let failedForUrl = this.failedProxies.get(urlKey) || [];
        
        if (!failedForUrl.includes(this.currentProxyIndex)) {
            failedForUrl.push(this.currentProxyIndex);
            this.failedProxies.set(urlKey, failedForUrl);
        }
        
        // Update proxy health
        const proxyHealth = this.proxyHealth.get(this.currentProxyIndex);
        proxyHealth.failures++;
        proxyHealth.lastFailure = Date.now();
        
        // Block proxy if it's consistently failing or returning 403
        if (statusCode === 403 || proxyHealth.failures >= 3) {
            proxyHealth.isBlocked = true;
            console.warn(`Proxy ${this.currentProxyIndex} (${this.proxyEndpoints[this.currentProxyIndex]}) blocked due to repeated failures`);
        }
        
        console.log(`Proxy ${this.currentProxyIndex} failed for ${urlKey}. Status: ${statusCode}. Failed proxies for this URL: ${failedForUrl.length}/${this.proxyEndpoints.length}`);
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
        
        // For credentials container, start with allorigins if available
        if (isCredentialsRequest && !this.credentialsProxyStarted) {
            this.currentProxyIndex = 0; // Start with allorigins for credentials
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
            
            // Check for proxy-specific errors
            if (!response.ok && !isDirect) {
                if (response.status === 403) {
                    console.warn(`Proxy returned 403 - likely blocked or rate limited`);
                    this.trackProxyFailure(url, 403);
                    
                    // Try next proxy immediately for 403 errors
                    if (this.proxyEndpoints.length > 1) {
                        this.switchProxy();
                        return this.sendRequest(url, options);
                    }
                } else if (response.status >= 500) {
                    console.warn(`Proxy server error: ${response.status}`);
                    this.trackProxyFailure(url, response.status);
                }
            }
            
            // Reset failure count on success
            if (response.ok && !isDirect) {
                this.proxyFailureCount = 0;
                // Reset proxy health on success
                const proxyHealth = this.proxyHealth.get(this.currentProxyIndex);
                if (proxyHealth.failures > 0) {
                    proxyHealth.failures = Math.max(0, proxyHealth.failures - 1);
                }
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
