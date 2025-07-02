// Azure Storage Proxy to handle CORS issues
class AzureStorageProxy {
    constructor() {
        // List of public CORS proxies to try (in order)
        this.proxyEndpoints = [
            "https://corsproxy.io/?",
            "https://cors-anywhere.herokuapp.com/",
            "https://api.allorigins.win/raw?url="
        ];
        
        this.currentProxyIndex = 0;
        this.proxyFailureCount = 0;
        this.maxFailures = 3; // After this many failures, try the next proxy
        
        // Note: In production, you should use your own proxy server or Azure Functions
        console.log("Azure Storage Proxy initialized with multiple fallback proxies");
    }

    /**
     * Create a proxy URL for Azure Blob Storage requests
     * @param {string} url - The original Azure URL
     * @returns {string} - The proxied URL
     */
    createProxyUrl(url) {
        return this.proxyEndpoints[this.currentProxyIndex] + encodeURIComponent(url);
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
     * Send a proxied fetch request to Azure Blob Storage
     * @param {string} url - Original Azure URL
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} - Fetch response
     */
    async sendRequest(url, options = {}) {
        const proxiedUrl = this.createProxyUrl(url);
        
        try {
            console.log(`Sending proxied request to: ${proxiedUrl}`);
            
            const response = await fetch(proxiedUrl, {
                ...options,
                headers: {
                    ...options.headers,
                    'X-Requested-With': 'XMLHttpRequest', // Required by some proxies
                }
            });
            
            // Reset failure count on success
            this.proxyFailureCount = 0;
            
            return response;
        } catch (error) {
            console.error('Proxy request failed:', error);
            
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
            
            return response.ok;
        } catch (error) {
            console.log('Direct access to Azure Storage failed:', error.message);
            return false;
        }
    }
}

// Export for global use
window.AzureStorageProxy = AzureStorageProxy;
