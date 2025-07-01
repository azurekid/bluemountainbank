// API Manager for Backend Communication
class APIManager {
    constructor() {
        // Configure your backend API endpoint
        this.baseUrl = 'https://your-api-endpoint.com/api';
        this.apiKey = 'your-api-key-here'; // Use environment variables in production
        this.authToken = localStorage.getItem('authToken');
    }

    // Set authentication token
    setAuthToken(token) {
        this.authToken = token;
        localStorage.setItem('authToken', token);
    }

    // Clear authentication
    clearAuth() {
        this.authToken = null;
        localStorage.removeItem('authToken');
    }

    // Generic API request method
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
        };

        if (this.authToken) {
            defaultHeaders['Authorization'] = `Bearer ${this.authToken}`;
        }

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return { success: true, data };
        } catch (error) {
            console.error(`API Request failed for ${endpoint}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Authentication
    async login(username, password) {
        const result = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (result.success && result.data.token) {
            this.setAuthToken(result.data.token);
            return { 
                success: true, 
                userId: result.data.userId, 
                user: result.data.user 
            };
        }

        return result;
    }

    // Logout
    async logout() {
        const result = await this.makeRequest('/auth/logout', {
            method: 'POST'
        });
        
        this.clearAuth();
        return result;
    }

    // Get user profile
    async getUserProfile(userId) {
        return await this.makeRequest(`/users/${userId}`);
    }

    // Get user accounts
    async getUserAccounts(userId) {
        return await this.makeRequest(`/users/${userId}/accounts`);
    }

    // Get transactions
    async getTransactions(userId, options = {}) {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.offset) params.append('offset', options.offset);
        if (options.startDate) params.append('startDate', options.startDate);
        if (options.endDate) params.append('endDate', options.endDate);
        if (options.category) params.append('category', options.category);

        const queryString = params.toString();
        const endpoint = `/users/${userId}/transactions${queryString ? '?' + queryString : ''}`;
        
        return await this.makeRequest(endpoint);
    }

    // Create new transaction
    async createTransaction(userId, transactionData) {
        return await this.makeRequest(`/users/${userId}/transactions`, {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }

    // Transfer money between accounts
    async transferMoney(fromAccount, toAccount, amount, description) {
        return await this.makeRequest('/transactions/transfer', {
            method: 'POST',
            body: JSON.stringify({
                fromAccount,
                toAccount,
                amount,
                description
            })
        });
    }

    // Update account balance
    async updateAccountBalance(accountId, newBalance) {
        return await this.makeRequest(`/accounts/${accountId}/balance`, {
            method: 'PUT',
            body: JSON.stringify({ balance: newBalance })
        });
    }

    // Get account statements
    async getAccountStatement(accountId, startDate, endDate) {
        const params = new URLSearchParams({
            startDate,
            endDate
        });
        
        return await this.makeRequest(`/accounts/${accountId}/statement?${params}`);
    }

    // Search transactions
    async searchTransactions(userId, searchQuery, filters = {}) {
        return await this.makeRequest('/transactions/search', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                query: searchQuery,
                filters
            })
        });
    }

    // Get spending analytics
    async getSpendingAnalytics(userId, period = 'month') {
        return await this.makeRequest(`/users/${userId}/analytics/spending?period=${period}`);
    }

    // Update user profile
    async updateUserProfile(userId, profileData) {
        return await this.makeRequest(`/users/${userId}/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
}

// Usage example:
/*
const apiManager = new APIManager();

// Login
const loginResult = await apiManager.login('alice.martinez', 'AliceM2024!');
if (loginResult.success) {
    // Get transactions
    const transactions = await apiManager.getTransactions(loginResult.userId, { limit: 20 });
    
    // Create new transaction
    const newTransaction = await apiManager.createTransaction(loginResult.userId, {
        description: 'Coffee Shop Purchase',
        amount: -5.99,
        category: 'dining',
        type: 'withdrawal'
    });
}
*/

// Export for use
window.APIManager = APIManager;
