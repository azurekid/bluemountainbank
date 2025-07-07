/**
 * Enhanced Storage Factory for Blue Mountain Bank
 * Supports both Azure SQL Database and local storage fallback
 */

class AzureSQLStorageManager {
    constructor(apiBaseUrl, token) {
        this.apiBaseUrl = apiBaseUrl || 'http://localhost:3001/api';
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    async getUserData(userId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result.success ? result.data : null;

        } catch (error) {
            console.error('Error fetching user data from API:', error);
            throw error;
        }
    }

    async updateUserData(userId, userData) {
        try {
            // For user preferences update
            if (userData.preferences) {
                const response = await fetch(`${this.apiBaseUrl}/users/${userId}/preferences`, {
                    method: 'PUT',
                    headers: this.headers,
                    body: JSON.stringify(userData.preferences)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            }

            // For other user data updates, we would need additional endpoints
            console.warn('Full user data update not implemented. Use specific update methods.');
            return { success: false, error: 'Use specific update methods' };

        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    }

    async addTransaction(userId, transactionData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}/transactions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }

    async getTransactions(userId, filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}/transactions?${queryParams}`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result.success ? result.data : [];

        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    // Compatibility methods for existing code
    async saveUserData(userId, userData) {
        return this.updateUserData(userId, userData);
    }

    async loadUserData(userId) {
        return this.getUserData(userId);
    }
}

class AuthenticationManager {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl || 'http://localhost:3001/api';
        this.token = null;
        this.currentUser = null;
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                this.token = result.token;
                this.currentUser = result.user;
                
                // Store in session storage for compatibility
                sessionStorage.setItem('authToken', this.token);
                sessionStorage.setItem('currentUser', this.currentUser.userId);
                
                return {
                    success: true,
                    user: this.currentUser,
                    token: this.token
                };
            } else {
                return {
                    success: false,
                    error: result.error
                };
            }

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Connection failed. Please try again.'
            };
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            return await response.json();

        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Registration failed. Please try again.'
            };
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return this.token !== null || sessionStorage.getItem('authToken') !== null;
    }

    getToken() {
        return this.token || sessionStorage.getItem('authToken');
    }

    getCurrentUserId() {
        return this.currentUser?.userId || sessionStorage.getItem('currentUser');
    }
}

class EnhancedStorageFactory {
    constructor() {
        this.authManager = new AuthenticationManager();
        this.useAzureSQL = true; // Set to false to use local storage fallback
        this.apiBaseUrl = 'http://localhost:3001/api';
    }

    async getStorageManager() {
        try {
            // Check if we should use Azure SQL
            if (this.useAzureSQL) {
                // Check authentication
                const token = this.authManager.getToken();
                
                if (!token) {
                    console.log('No authentication token found, redirecting to login');
                    window.location.href = 'login.html';
                    return null;
                }

                // Test API connection
                const response = await fetch(`${this.apiBaseUrl.replace('/api', '')}/health`);
                
                if (response.ok) {
                    console.log('✅ Connected to Azure SQL API');
                    return new AzureSQLStorageManager(this.apiBaseUrl, token);
                } else {
                    console.warn('⚠️ API not available, falling back to local storage');
                    this.useAzureSQL = false;
                }
            }

            // Fallback to local storage manager
            console.log('📁 Using local storage manager');
            
            // Import the existing local storage manager
            if (typeof LocalStorageManager !== 'undefined') {
                return new LocalStorageManager();
            } else {
                throw new Error('LocalStorageManager not available');
            }

        } catch (error) {
            console.error('Error initializing storage manager:', error);
            
            // Ultimate fallback
            return {
                async getUserData(userId) {
                    console.error('Storage manager unavailable');
                    return null;
                },
                async updateUserData(userId, userData) {
                    console.error('Storage manager unavailable');
                    return { success: false };
                }
            };
        }
    }

    getAuthManager() {
        return this.authManager;
    }

    setApiBaseUrl(url) {
        this.apiBaseUrl = url;
        this.authManager = new AuthenticationManager(url);
    }

    enableAzureSQL(enabled = true) {
        this.useAzureSQL = enabled;
    }
}

// For backwards compatibility, replace the existing StorageFactory
if (typeof window !== 'undefined') {
    window.StorageFactory = EnhancedStorageFactory;
    window.AuthenticationManager = AuthenticationManager;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StorageFactory: EnhancedStorageFactory,
        AzureSQLStorageManager,
        AuthenticationManager
    };
}
