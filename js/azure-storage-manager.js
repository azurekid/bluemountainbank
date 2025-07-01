// Azure Storage Manager with SAS Token and Local Fallback
class AzureStorageManager {
    constructor() {
        // Azure Storage configuration
        this.storageAccount = 'bluemountaindata'; // Your storage account name
        this.containerName = 'userdata';
        this.sasToken = 'sv=2024-11-04&ss=bfqt&srt=sco&sp=rlptfx&se=2028-07-01T21:22:53Z&st=2025-07-01T13:22:53Z&spr=https&sig=pH34OTj9l29ovANxyjOWAgiShFQ6A3qY0sspcDNp4VE%3D';
        this.baseUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}`;
        this.useLocalFallback = false;
        
        // Local sample data for fallback
        this.localUsers = {
            'alice_martinez': {
                credentials: {
                    username: 'alice.martinez',
                    password: 'ec4874af59fe23a3f555276a4ebfa20a3e3ccaa5cd535065d6052db5e7bf5d01',
                    email: 'alice.martinez@email.com'
                },
                profile: {
                    firstName: 'Alice',
                    lastName: 'Martinez',
                    fullName: 'Alice Martinez',
                    age: 28,
                    profession: 'Software Engineer',
                    phone: '(555) 123-4567',
                    address: '1234 Tech Avenue, San Francisco, CA 94105',
                    joinDate: '2022-03-15',
                    avatar: 'AM',
                    accountNumber: '****-1234'
                },
                accounts: {
                    checking: {
                        balance: 8750.43,
                        accountNumber: 'CHK-001-1234',
                        type: 'Premium Checking'
                    },
                    savings: {
                        balance: 25300.89,
                        accountNumber: 'SAV-001-1234',
                        type: 'High Yield Savings'
                    }
                },
                recentTransactions: [
                    {
                        id: 'tx_001_001',
                        date: '2024-12-28',
                        description: 'Salary Deposit',
                        amount: 5200.00,
                        type: 'deposit',
                        account: 'checking'
                    },
                    {
                        id: 'tx_001_002',
                        date: '2024-12-27',
                        description: 'Online Purchase',
                        amount: -89.99,
                        type: 'withdrawal',
                        account: 'checking'
                    }
                ],
                preferences: {
                    theme: 'dark',
                    notifications: true,
                    language: 'en'
                }
            },
            'bob_johnson': {
                credentials: {
                    username: 'bob.johnson',
                    password: '7552dd66eb5496ddfed93eafe079b50f123c6e13af2967d3d4bc39a7455200a6',
                    email: 'bob.johnson@email.com'
                },
                profile: {
                    firstName: 'Bob',
                    lastName: 'Johnson',
                    fullName: 'Bob Johnson',
                    age: 45,
                    profession: 'Business Owner',
                    phone: '(555) 555-0102',
                    address: '456 Main Street, Chicago, IL 60601',
                    joinDate: '2019-07-10',
                    avatar: 'BJ',
                    accountNumber: '****-5678'
                },
                accounts: {
                    checking: {
                        balance: 12500.67,
                        accountNumber: 'CHK-002-5678',
                        type: 'Business Checking'
                    },
                    savings: {
                        balance: 35000.00,
                        accountNumber: 'SAV-002-5678',
                        type: 'Business Savings'
                    }
                },
                recentTransactions: [
                    {
                        id: 'tx_002_001',
                        date: '2024-12-28',
                        description: 'Business Revenue',
                        amount: 2800.00,
                        type: 'deposit',
                        account: 'checking'
                    }
                ],
                preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                }
            },
            'carol_smith': {
                credentials: {
                    username: 'carol.smith',
                    password: '6320030ac57ad4df03baed0b99b0babf534af7cfb2c601eba9d933f144e9b643',
                    email: 'carol.smith@email.com'
                },
                profile: {
                    firstName: 'Carol',
                    lastName: 'Smith',
                    fullName: 'Carol Smith',
                    age: 62,
                    profession: 'Retired Teacher',
                    phone: '(555) 555-0103',
                    address: '789 Elm Street, Portland, OR 97205',
                    joinDate: '2015-09-22',
                    avatar: 'CS',
                    accountNumber: '****-5678'
                },
                accounts: {
                    checking: {
                        balance: 4200.15,
                        accountNumber: 'CHK-003-5678',
                        type: 'Senior Checking'
                    },
                    savings: {
                        balance: 45000.00,
                        accountNumber: 'SAV-003-5678',
                        type: 'Retirement Savings'
                    }
                },
                recentTransactions: [
                    {
                        id: 'tx_003_001',
                        date: '2024-12-28',
                        description: 'Social Security Deposit',
                        amount: 1845.00,
                        type: 'deposit',
                        account: 'checking'
                    }
                ],
                preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                }
            },
            'david_wilson': {
                credentials: {
                    username: 'david.wilson',
                    password: '2a0841af892abcaf953782cbe8625f107fc59aeb2015f2fa05dbbf256086db7a',
                    email: 'david.wilson@email.com'
                },
                profile: {
                    firstName: 'David',
                    lastName: 'Wilson',
                    fullName: 'David Wilson',
                    age: 20,
                    profession: 'College Student',
                    phone: '(555) 555-0104',
                    address: '321 University Ave, Austin, TX 78705',
                    joinDate: '2023-08-15',
                    avatar: 'DW',
                    accountNumber: '****-9012'
                },
                accounts: {
                    checking: {
                        balance: 850.75,
                        accountNumber: 'CHK-004-9012',
                        type: 'Student Checking'
                    },
                    savings: {
                        balance: 2300.50,
                        accountNumber: 'SAV-004-9012',
                        type: 'Student Savings'
                    }
                },
                recentTransactions: [
                    {
                        id: 'tx_004_001',
                        date: '2024-12-28',
                        description: 'Part-time Job Deposit',
                        amount: 245.00,
                        type: 'deposit',
                        account: 'checking'
                    }
                ],
                preferences: {
                    theme: 'dark',
                    notifications: true,
                    language: 'en'
                }
            },
            'emma_brown': {
                credentials: {
                    username: 'emma.brown',
                    password: '3089f8b268a347b23738dfd1caf39c9c49b607289461d682ba93f317adbd3b5f',
                    email: 'emma.brown@email.com'
                },
                profile: {
                    firstName: 'Emma',
                    lastName: 'Brown',
                    fullName: 'Emma Brown',
                    age: 32,
                    profession: 'Marketing Manager',
                    phone: '(555) 555-0105',
                    address: '654 Oak Street, Denver, CO 80205',
                    joinDate: '2020-11-10',
                    avatar: 'EB',
                    accountNumber: '****-3456'
                },
                accounts: {
                    checking: {
                        balance: 6500.25,
                        accountNumber: 'CHK-005-3456',
                        type: 'Professional Checking'
                    },
                    savings: {
                        balance: 18750.00,
                        accountNumber: 'SAV-005-3456',
                        type: 'High Yield Savings'
                    }
                },
                recentTransactions: [
                    {
                        id: 'tx_005_001',
                        date: '2024-12-28',
                        description: 'Salary Deposit',
                        amount: 4200.00,
                        type: 'deposit',
                        account: 'checking'
                    }
                ],
                preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                }
            },
            'frank_miller': {
                credentials: {
                    username: 'frank.miller',
                    password: '5e3c0a612afee08a6a8a1c395c962dceb069a56ef988a36ab71f87dc2bade904',
                    email: 'frank.miller@email.com'
                },
                profile: {
                    firstName: 'Frank',
                    lastName: 'Miller',
                    fullName: 'Frank Miller',
                    age: 45,
                    profession: 'Construction Foreman',
                    phone: '(555) 555-0106',
                    address: '987 Pine Street, Phoenix, AZ 85001',
                    joinDate: '2018-04-03',
                    avatar: 'FM',
                    accountNumber: '****-7890'
                },
                accounts: {
                    checking: {
                        balance: 3200.80,
                        accountNumber: 'CHK-006-7890',
                        type: 'Working Class Checking'
                    },
                    savings: {
                        balance: 12500.00,
                        accountNumber: 'SAV-006-7890',
                        type: 'Basic Savings'
                    }
                },
                recentTransactions: [
                    {
                        id: 'tx_006_001',
                        date: '2024-12-28',
                        description: 'Weekly Paycheck',
                        amount: 1250.00,
                        type: 'deposit',
                        account: 'checking'
                    }
                ],
                preferences: {
                    theme: 'dark',
                    notifications: false,
                    language: 'en'
                }
            }
        };
    }

    // Upload user data to Azure Blob Storage
    async saveUserData(userId, userData) {
        const blobName = `users/${userId}.json`;
        const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                console.log(`User data saved for ${userId}`);
                return { success: true };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to save user data:', error);
            return { success: false, error: error.message };
        }
    }

    // Load user data from Azure Blob Storage
    async loadUserData(userId) {
        const blobName = `users/${userId}.json`;
        const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;

        try {
            console.log('Loading user data from Azure URL:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

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
            return { success: false, error: error.message };
        }
    }

    // Save transaction data
    async saveTransaction(userId, transaction) {
        const timestamp = new Date().toISOString();
        const blobName = `transactions/${userId}/${timestamp}_${transaction.id || 'tx'}.json`;
        const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;

        try {
            const response = await fetch(url, {
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
            });

            return response.ok ? { success: true } : { success: false, error: 'Failed to save transaction' };
        } catch (error) {
            console.error('Failed to save transaction:', error);
            return { success: false, error: error.message };
        }
    }

    // List transactions for a user
    async getTransactions(userId, limit = 20) {
        const url = `${this.baseUrl}?restype=container&comp=list&prefix=transactions/${userId}/&maxresults=${limit}&${this.sasToken}`;

        try {
            const response = await fetch(url);
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
                const transactionUrl = `${this.baseUrl}/${blobName}${this.sasToken}`;
                
                try {
                    const transactionResponse = await fetch(`${this.baseUrl}/${blobName}?${this.sasToken}`);
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
        const userListUrl = `${this.baseUrl}?restype=container&comp=list&prefix=users/&${this.sasToken}`;
        
        console.log('Fetching user list from Azure...');
        console.log('Azure URL:', userListUrl);
        
        try {
            const response = await fetch(userListUrl);
            
            if (!response.ok) {
                console.error('Failed to fetch user list:', response.status, response.statusText);
                console.error('Response headers:', [...response.headers.entries()]);
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const xmlText = await response.text();
            console.log('User list XML response length:', xmlText.length);
            console.log('First 500 chars of XML:', xmlText.substring(0, 500));
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const blobs = xmlDoc.getElementsByTagName('Blob');
            console.log('Found', blobs.length, 'user files in Azure');
            
            for (let blob of blobs) {
                const blobName = blob.getElementsByTagName('Name')[0].textContent;
                const userId = blobName.split('/')[1].replace('.json', '');
                console.log('Checking user:', userId);
                
                const userData = await this.loadUserData(userId);
                if (userData.success) {
                    console.log('Loaded user data for:', userId);
                    console.log('Stored username:', userData.data.credentials.username);
                    console.log('Username match:', userData.data.credentials.username === username);
                    
                    if (userData.data.credentials.username === username) {
                        const passwordMatch = await this.verifyPassword(password, userData.data.credentials.password);
                        console.log('Password verification result:', passwordMatch);
                        
                        if (passwordMatch) {
                            console.log('Azure authentication successful for:', username);
                            const userWithSource = { ...userData.data, _dataSource: 'Azure' };
                            return { success: true, userId, user: userWithSource, dataSource: 'Azure' };
                        }
                    }
                } else {
                    console.error('Failed to load user data for:', userId);
                }
            }
            
            console.log('No matching user credentials found in Azure');
            return { success: false, message: "Invalid credentials" };
        } catch (error) {
            console.error('Azure authentication error:', error);
            throw error; // Re-throw to trigger fallback
        }
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

    // Hash password for storage (simplified - use bcrypt in production)
    hashPassword(password) {
        // Simple hash for demo - use proper hashing in production
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
}

// Usage example
const azureManager = new AzureStorageManager();

// Export for use
window.AzureStorageManager = AzureStorageManager;
