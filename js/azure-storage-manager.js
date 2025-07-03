// Azure Storage Manager with SAS Token and Local Fallback
class AzureStorageManager {
    constructor() {
        // Azure Storage configuration
        this.storageAccount = 'bluemountaindata'; // Your storage account name
        this.containerName = 'userdata';
        this.credentialsContainerName = 'credentials'; // Separate container for credentials
        this.sasToken = 'sv=2024-11-04&ss=b&srt=sco&sp=rwlactfx&se=2028-07-03T02:59:11Z&st=2025-07-01T18:59:11Z&spr=https&sig=4SpC5AFMit2tivoHPxJN%2F63%2BgpmiEPbcYw3XFiNFUv0%3D';
        this.baseUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}`;
        this.credentialsBaseUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.credentialsContainerName}`;
        this.useLocalFallback = false;

        // Initialize proxy for CORS handling
        this.proxy = window.AzureStorageProxy ? new window.AzureStorageProxy() : null;

        // Local sample data for fallback
        this.localUsers = {
            'alice_martinez': {
                credentials: {
                    username: 'alice.martinez',
                    password: 'AliceM2024!',
                    email: 'alice.martinez@email.com'
                }
            }
        };
    }

    // Upload user data to Azure Blob Storage
    async saveUserData(userId, userData) {
        const blobName = `users/${userId}.json`;
        const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;
        const options = {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        };

        try {
            let response;

            // Use proxy if available, otherwise use direct fetch
            if (this.proxy) {
                console.log(`Using proxy for saving user data: ${userId}`);
                response = await this.proxy.sendRequest(url, options);
            } else {
                console.log(`Direct fetch for saving user data: ${userId}`);
                response = await fetch(url, options);
            }

            if (response.ok) {
                console.log(`User data saved for ${userId}`);
                return { success: true };
            } else {
                console.error(`Failed HTTP status: ${response.status} - ${response.statusText}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to save user data:', error);

            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected. Please ensure Azure Storage CORS settings are configured properly.');
            }

            return { success: false, error: error.message };
        }
    }

    // Load user data from Azure Blob Storage
    async loadUserData(userId) {
        const blobName = `users/${userId}.json`;
        const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        try {
            console.log('Loading user data from Azure URL:', url);

            let response;

            // Use proxy if available, otherwise use direct fetch
            if (this.proxy) {
                console.log(`Using proxy for loading user data: ${userId}`);
                response = await this.proxy.sendRequest(url, options);
            } else {
                console.log(`Direct fetch for loading user data: ${userId}`);
                response = await fetch(url, options);
            }

            if (response.ok) {
                const userData = await response.json();
                console.log('Successfully loaded user data from Azure for:', userId);
                return { success: true, data: userData };
            } else if (response.status === 404) {
                console.log('User data file not found in Azure Storage for:', userId);
                return { success: false, error: 'User not found' };
            } else {
                console.error('Failed to load user data from Azure:', response.status, response.statusText);

                // Try to get more details about the error
                if (response.status === 403) {
                    console.log('Access denied - check SAS token permissions');
                } else {
                    const errorText = await response.text();
                    console.log('Error response:', errorText);
                }

                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Network error loading user data:', error);

            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected. Please ensure Azure Storage CORS settings are configured properly.');
                console.warn('Falling back to local data if available...');
                this.useLocalFallback = true;
            }

            return { success: false, error: error.message };
        }
    }

    // Save transaction data
    async saveTransaction(userId, transaction) {
        const timestamp = new Date().toISOString();
        const blobName = `transactions/${userId}/${timestamp}_${transaction.id || 'tx'}.json`;
        const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;
        const options = {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...transaction,
                userId,
                timestamp
            })
        };

        try {
            let response;

            // Use proxy if available, otherwise use direct fetch
            if (this.proxy) {
                console.log(`Using proxy for saving transaction: ${userId}`);
                response = await this.proxy.sendRequest(url, options);
            } else {
                console.log(`Direct fetch for saving transaction: ${userId}`);
                response = await fetch(url, options);
            }

            return response.ok ? { success: true } : { success: false, error: 'Failed to save transaction' };
        } catch (error) {
            console.error('Failed to save transaction:', error);

            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected when saving transaction. Check Azure Storage CORS settings.');
            }

            return { success: false, error: error.message };
        }
    }

    // List transactions for a user
    async getTransactions(userId, limit = 20) {
        const url = `${this.baseUrl}?restype=container&comp=list&prefix=transactions/${userId}/&maxresults=${limit}&${this.sasToken}`;
        const options = {
            method: 'GET'
        };

        try {
            let response;
            
            // Use proxy if available, otherwise use direct fetch
            if (this.proxy) {
                console.log(`Using proxy for listing transactions: ${userId}`);
                response = await this.proxy.sendRequest(url, options);
            } else {
                console.log(`Direct fetch for listing transactions: ${userId}`);
                response = await fetch(url, options);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const blobs = xmlDoc.getElementsByTagName('Blob');
            const transactions = [];

            for (let blob of blobs) {
                const blobName = blob.getElementsByTagName('Name')[0].textContent;
                const transactionUrl = `${this.baseUrl}/${blobName}?${this.sasToken}`;

                try {
                    let transactionResponse;

                    // Use proxy for each transaction request
                    if (this.proxy) {
                        transactionResponse = await this.proxy.sendRequest(transactionUrl, { method: 'GET' });
                    } else {
                        transactionResponse = await fetch(transactionUrl);
                    }

                    if (transactionResponse.ok) {
                        const transactionData = await transactionResponse.json();
                        transactions.push(transactionData);
                    }
                } catch (error) {
                    console.warn(`Failed to load transaction ${blobName}:`, error);
                }
            }

            // Sort by date (newest first)
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            return { success: true, data: transactions.slice(0, limit) };
        } catch (error) {
            console.error('Failed to get transactions:', error);

            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected when listing transactions. Check Azure Storage CORS settings.');
            }

            return { success: false, error: error.message };
        }
    }

    // Authenticate user (simplified - in production, use proper authentication service)
    async authenticateUser(username, password) {
        console.log('🔐 Starting authentication for username:', username);
        console.log('🔐 Current useLocalFallback flag:', this.useLocalFallback);

        // ALWAYS try Azure first, regardless of previous failures
        console.log('☁️ Attempting Azure authentication first...');
        try {
            const azureResult = await this.authenticateUserAzure(username, password);
            console.log('☁️ Azure authentication result:', azureResult);

            if (azureResult.success) {
                console.log('✅ Azure authentication successful!');
                this.useLocalFallback = false; // Reset flag on success
                return azureResult;
            } else {
                console.log('❌ Azure authentication failed (invalid credentials)');
            }
        } catch (azureError) {
            console.error('❌ Azure authentication error:', azureError.message);
            console.error('❌ Full Azure error:', azureError);
        }

        // Only fall back to local if Azure completely fails
        console.log('💾 Falling back to local authentication...');
        try {
            const localResult = await this.authenticateUserLocal(username, password);
            if (localResult.success) {
                console.log('💾 Local authentication successful');
                this.useLocalFallback = true; // Set flag for subsequent calls
            }
            return localResult;
        } catch (fallbackError) {
            console.error('❌ Fallback authentication also failed:', fallbackError);
            return { success: false, message: "Authentication system temporarily unavailable" };
        }
    }

    // Azure authentication method
    async authenticateUserAzure(username, password) {
        // First, try to get all user IDs from both containers
        let userIds = [];

        try {
            // First check the dedicated credentials container
            console.log('Checking credentials container first...');
            const credentialsUrl = `${this.credentialsBaseUrl}?restype=container&comp=list&${this.sasToken}`;
            
            let credResponse;
            if (this.proxy) {
                credResponse = await this.proxy.sendRequest(credentialsUrl, { method: 'GET' });
            } else {
                credResponse = await fetch(credentialsUrl);
            }

            if (credResponse.ok) {
                const xmlText = await credResponse.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                const blobs = xmlDoc.getElementsByTagName('Blob');

                console.log('Found', blobs.length, 'credential files in Azure');

                for (let blob of blobs) {
                    const blobName = blob.getElementsByTagName('Name')[0].textContent;
                    const userId = blobName.replace('.json', '');
                    userIds.push(userId);
                }
            }
        } catch (credError) {
            console.error('Error checking credentials container:', credError);
            // Continue with regular user container if credential container fails
        }

        // If no credentials found or error occurred, try the regular user container
        if (userIds.length === 0) {
            try {
                console.log('Checking users container...');
                const userListUrl = `${this.baseUrl}?restype=container&comp=list&prefix=users/&${this.sasToken}`;

                let userResponse;
                if (this.proxy) {
                    userResponse = await this.proxy.sendRequest(userListUrl, { method: 'GET' });
                } else {
                    userResponse = await fetch(userListUrl);
                }

                if (userResponse.ok) {
                    const xmlText = await userResponse.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                    const blobs = xmlDoc.getElementsByTagName('Blob');

                    console.log('Found', blobs.length, 'user files in Azure');

                    for (let blob of blobs) {
                        const blobName = blob.getElementsByTagName('Name')[0].textContent;
                        const userId = blobName.split('/')[1].replace('.json', '');
                        userIds.push(userId);
                    }
                }
            } catch (userError) {
                console.error('Error checking user container:', userError);
                throw userError;
            }
        }

        // No users found in either container
        if (userIds.length === 0) {
            console.log('No user files found in Azure');
            return { success: false, message: "Invalid credentials" };
        }

        // Check each user for matching credentials
        for (const userId of userIds) {
            console.log('Checking user:', userId);

            // First check for separate credentials
            try {
                const credResult = await this.loadUserCredentials(userId);

                if (credResult.success) {
                    console.log('Found credentials for:', userId);

                    if (credResult.data.username === username) {
                        console.log('Username match found in credentials');
                        const passwordMatch = await this.verifyPassword(password, credResult.data.password);

                        if (passwordMatch) {
                            console.log('Password verified from credentials');
                            // Load full user data
                            const userData = await this.loadUserData(userId);

                            if (userData.success) {
                                console.log('Successfully loaded full user data');
                                const userWithSource = { ...userData.data, _dataSource: 'Azure' };
                                return { success: true, userId, user: userWithSource, dataSource: 'Azure' };
                            } else {
                                console.log('Failed to load full user data, returning partial credentials');
                                // Return a basic user object if we can't load the full user data
                                return {
                                    success: true,
                                    userId,
                                    user: {
                                        credentials: credResult.data,
                                        _dataSource: 'Azure',
                                        profile: {
                                            fullName: credResult.data.username
                                        }
                                    },
                                    dataSource: 'Azure'
                                };
                            }
                        }
                    }
                } else {
                    // If no separate credentials found, check the user data
                    const userData = await this.loadUserData(userId);

                    if (userData.success && userData.data.credentials) {
                        if (userData.data.credentials.username === username) {
                            const passwordMatch = await this.verifyPassword(password, userData.data.credentials.password);

                            if (passwordMatch) {
                                console.log('Azure authentication successful from user data for:', username);
                                const userWithSource = { ...userData.data, _dataSource: 'Azure' };
                                return { success: true, userId, user: userWithSource, dataSource: 'Azure' };
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking user credentials:', error);
                // Continue to next user
            }
        }

        console.log('No matching user credentials found in Azure');
        return { success: false, message: "Invalid credentials" };
    }

    // Local fallback authentication
    async authenticateUserLocal(username, password) {
        console.log('Checking local user data for:', username);

        for (const [userId, userData] of Object.entries(this.localUsers)) {
            console.log('Checking local user:', userId, 'username:', userData.credentials.username);

            if (userData.credentials.username === username) {
                const passwordMatch = await this.verifyPassword(password, userData.credentials.password);
                console.log('Local password verification result:', passwordMatch);

                if (passwordMatch) {
                    console.log('Local authentication successful for:', username);
                    this.useLocalFallback = true; // Ensure flag is set for future operations
                    const userWithSource = { ...userData, _dataSource: 'Local' };
                    return { success: true, userId, user: userWithSource, dataSource: 'Local' };
                }
            }
        }

        console.log('No matching local user credentials found');
        return { success: false, message: "Invalid credentials" };
    }

    // Verify password (implement proper hashing in production)
    async verifyPassword(password, hashedPassword) {
        // Simple verification - use bcrypt or similar in production
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedInput = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

        return hashedInput === hashedPassword;
    }

    // Method compatibility for application integration
    async getUserData(userId) {
        console.log('📊 getUserData called for userId:', userId);
        console.log('📊 Current useLocalFallback flag:', this.useLocalFallback);

        // If we're not in fallback mode, ALWAYS try Azure first
        if (!this.useLocalFallback) {
            console.log('☁️ Attempting to load user data from Azure first...');
            try {
                const result = await this.loadUserData(userId);
                if (result.success) {
                    console.log('✅ Successfully loaded user data from Azure for:', userId);
                    return { ...result.data, _dataSource: 'Azure' };
                } else {
                    console.log('❌ Failed to load user data from Azure for:', userId);
                }
            } catch (error) {
                console.error('❌ Error loading user data from Azure:', error);
            }
        }

        // Fall back to local data
        console.log('💾 Using local fallback data for:', userId);
        const localData = this.localUsers[userId];
        if (localData) {
            console.log('✅ Found local user data for:', userId);
            return { ...localData, _dataSource: 'Local' };
        } else {
            console.log('❌ No local user data found for:', userId);
            console.log('Available local users:', Object.keys(this.localUsers));
            return null;
        }
    }

    // Get all users (required by admin panel)
    async getAllUsers() {
        const userListUrl = `${this.baseUrl}?restype=container&comp=list&prefix=users/&${this.sasToken}`;

        try {
            const response = await fetch(userListUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const blobs = xmlDoc.getElementsByTagName('Blob');
            const users = {};

            for (let blob of blobs) {
                const blobName = blob.getElementsByTagName('Name')[0].textContent;
                const userId = blobName.split('/')[1].replace('.json', '');

                const userData = await this.getUserData(userId);
                if (userData) {
                    users[userId] = userData;
                }
            }

            return users;
        } catch (error) {
            console.error('Failed to get all users:', error);
            return {};
        }
    }

    // Add transaction to user's account
    async addTransaction(userId, transaction) {
        try {
            // Get current user data
            const userData = await this.getUserData(userId);
            if (!userData) {
                return false;
            }

            // Add transaction to user's transaction list
            userData.transactions = userData.transactions || [];
            userData.transactions.unshift(transaction);

            // Save updated user data
            const result = await this.saveUserData(userId, userData);
            return result.success;
        } catch (error) {
            console.error('Failed to add transaction:', error);
            return false;
        }
    }

    // Update account balance
    async updateAccountBalance(userId, accountType, newBalance) {
        try {
            const userData = await this.getUserData(userId);
            if (!userData || !userData.accounts[accountType]) {
                return false;
            }

            userData.accounts[accountType].balance = newBalance;
            const result = await this.saveUserData(userId, userData);
            return result.success;
        } catch (error) {
            console.error('Failed to update account balance:', error);
            return false;
        }
    }

    // Initialize the storage manager
    async initialize() {
        console.log('🚀 Initializing Azure Storage Manager');

        // Reset fallback flag on initialization
        this.useLocalFallback = false;
        console.log('🔄 Reset fallback flag - will attempt Azure first');

        // Check if users exist, if not, suggest manual upload
        try {
            const testUrl = `${this.baseUrl}?restype=container&comp=list&prefix=users/&${this.sasToken}`;
            console.log('🔍 Testing Azure connectivity:', testUrl);

            const response = await fetch(testUrl);
            if (response.ok) {
                console.log('✅ Azure Storage connection successful');
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                const blobs = xmlDoc.getElementsByTagName('Blob');
                console.log(`📁 Found ${blobs.length} user files in Azure storage`);

                if (blobs.length === 0) {
                    console.warn('⚠️ No user files found in Azure storage. Please upload sample user data.');
                }
            } else {
                console.error('❌ Azure Storage connection failed:', response.status, response.statusText);
                console.log('💾 Will use local fallback data');
                this.useLocalFallback = true;
            }
        } catch (error) {
            console.error('❌ Could not test Azure connectivity:', error.message);
            console.log('💾 Will use local fallback data');
            this.useLocalFallback = true;
        }

        return this;
    }

    // Initialize with sample data (legacy method)
    async initializeData() {
        return this.initialize();
    }

    hashPassword(password) {
        return btoa(password);
    }

    // Reset fallback flag to force Azure attempts
    resetFallbackMode() {
        console.log('🔄 Resetting fallback mode - will try Azure again');
        this.useLocalFallback = false;
    }

    // Check if currently using local fallback
    isUsingLocalFallback() {
        return this.useLocalFallback;
    }

    // Save only the credentials to a separate secure container
    async saveUserCredentials(userId, credentials) {
        const blobName = `${userId}.json`;
        const url = `${this.credentialsBaseUrl}/${blobName}?${this.sasToken}`;
        const options = {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        };

        try {
            let response;
            
            // Use proxy if available, otherwise use direct fetch
            if (this.proxy) {
                console.log(`Using proxy for saving user credentials: ${userId}`);
                response = await this.proxy.sendRequest(url, options);
            } else {
                console.log(`Direct fetch for saving user credentials: ${userId}`);
                response = await fetch(url, options);
            }

            if (response.ok) {
                console.log(`User credentials saved for ${userId}`);
                return { success: true };
            } else {
                console.error(`Failed HTTP status: ${response.status} - ${response.statusText}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to save user credentials:', error);
            
            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected. Please ensure Azure Storage CORS settings are configured properly.');
            }
            
            return { success: false, error: error.message };
        }
    }

    // Load user credentials from the secure container
    async loadUserCredentials(userId) {
        const blobName = `${userId}.json`;
        const url = `${this.credentialsBaseUrl}/${blobName}?${this.sasToken}`;
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        try {
            console.log('Loading user credentials from Azure URL:', url);
            
            let response;
            let attempt = 1;
            const maxAttempts = 3;
            let lastError = null;
            
            // Try multiple attempts with different strategies
            while (attempt <= maxAttempts) {
                try {
                    console.log(`Credential fetch attempt ${attempt}/${maxAttempts} for user ${userId}`);
                    
                    // Use different strategies based on attempt number
                    if (attempt === 1 && this.proxy) {
                        console.log(`Using proxy for loading user credentials: ${userId}`);
                        response = await this.proxy.sendRequest(url, options);
                    } else if (attempt === 2) {
                        // Second attempt: try direct access
                        console.log(`Direct fetch for loading user credentials: ${userId}`);
                        response = await fetch(url, options);
                    } else {
                        // Third attempt: try fallback to user container
                        console.log(`Trying to fetch user data instead of credentials for: ${userId}`);
                        const userData = await this.loadUserData(userId);
                        
                        if (userData.success && userData.data.credentials) {
                            console.log('Successfully extracted credentials from user data');
                            return { success: true, data: userData.data.credentials };
                        } else {
                            throw new Error('Could not fetch credentials from user data');
                        }
                    }
                    
                    // If we get here, we have a response
                    if (response.ok) {
                        const credentials = await response.json();
                        console.log('Successfully loaded user credentials from Azure for:', userId);
                        return { success: true, data: credentials };
                    } else if (response.status === 404) {
                        console.log('User credentials file not found in Azure Storage for:', userId);
                        // Continue to next attempt rather than failing immediately
                        attempt++;
                        continue;
                    } else {
                        console.error('Failed to load user credentials from Azure:', response.status, response.statusText);
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                } catch (attemptError) {
                    console.error(`Attempt ${attempt} failed:`, attemptError);
                    lastError = attemptError;
                    attempt++;
                }
            }
            
            // If we get here, all attempts failed
            throw lastError || new Error('All credential fetch attempts failed');
        } catch (error) {
            console.error('Network error loading user credentials:', error);
            
            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected. Please ensure Azure Storage CORS settings are configured properly.');
                
                // Try fallback to local data for this user if it exists
                if (this.localUsers[userId] && this.localUsers[userId].credentials) {
                    console.log('CORS issue - using local fallback data for:', userId);
                    this.useLocalFallback = true; // Set fallback flag
                    return { success: true, data: this.localUsers[userId].credentials };
                }
                
                // Check if we have a sample user with that username instead of userId
                for (const localId in this.localUsers) {
                    const localUser = this.localUsers[localId];
                    if (localUser.credentials && localUser.credentials.username === userId) {
                        console.log('Found local data by username match:', localId);
                        this.useLocalFallback = true;
                        return { success: true, data: localUser.credentials };
                    }
                }
            }
            
            return { success: false, error: error.message };
        }
    }

    // Delete user credentials from the secure container
    async deleteUserCredentials(userId) {
        const blobName = `${userId}.json`;
        const url = `${this.credentialsBaseUrl}/${blobName}?${this.sasToken}`;
        const options = {
            method: 'DELETE'
        };

        try {
            let response;
            
            // Use proxy if available, otherwise use direct fetch
            if (this.proxy) {
                console.log(`Using proxy for deleting user credentials: ${userId}`);
                response = await this.proxy.sendRequest(url, options);
            } else {
                console.log(`Direct fetch for deleting user credentials: ${userId}`);
                response = await fetch(url, options);
            }

            if (response.ok || response.status === 404) { // Success or not found (already deleted)
                console.log(`User credentials deleted for ${userId}`);
                return { success: true };
            } else {
                console.error(`Failed HTTP status: ${response.status} - ${response.statusText}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to delete user credentials:', error);

            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected. Please ensure Azure Storage CORS settings are configured properly.');
            }

            return { success: false, error: error.message };
        }
    }

    // List all credentials in the secure container
    async listAllCredentials() {
        const url = `${this.credentialsBaseUrl}?restype=container&comp=list&prefix=&${this.sasToken}`;
        const options = {
            method: 'GET'
        };

        try {
            let response;

            // Use proxy if available, otherwise use direct fetch
            if (this.proxy) {
                console.log(`Using proxy for listing all credentials`);
                response = await this.proxy.sendRequest(url, options);
            } else {
                console.log(`Direct fetch for listing all credentials`);
                response = await fetch(url, options);
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const blobs = xmlDoc.getElementsByTagName('Blob');
            const credentials = [];

            for (let blob of blobs) {
                const blobName = blob.getElementsByTagName('Name')[0].textContent;
                const userId = blobName.replace('.json', '');

                const credentialData = await this.loadUserCredentials(userId);
                if (credentialData.success) {
                    credentials.push({
                        userId: userId,
                        ...credentialData.data
                    });
                }
            }

            return { success: true, data: credentials };
        } catch (error) {
            console.error('Failed to list all credentials:', error);

            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.warn('CORS issue detected. Please ensure Azure Storage CORS settings are configured properly.');
            }

            return { success: false, error: error.message };
        }
    }
}

// Usage example
const azureManager = new AzureStorageManager();

// Export for use
window.AzureStorageManager = AzureStorageManager;
