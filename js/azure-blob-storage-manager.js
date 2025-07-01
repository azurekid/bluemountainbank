// Azure Blob Storage Manager with SAS Token Authentication
class AzureBlobStorageManager {
    constructor(config) {
        this.storageAccount = config.storageAccount;
        this.containerName = config.containerName;
        this.sasToken = config.sasToken;
        this.baseUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}`;
        this.initialized = false;
        
        // Initialize with sample data if needed
        this.initializeData();
    }

    // Initialize with sample data
    async initializeData() {
        try {
            // Check if users directory exists
            const exists = await this.checkContainerExists();
            if (!exists) {
                console.log('Initializing Azure storage with sample data...');
                await this.createInitialData();
            }
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Azure storage:', error);
            // Fallback to localStorage for demo
            this.fallbackToLocalStorage();
        }
    }

    async checkContainerExists() {
        try {
            const response = await fetch(`${this.baseUrl}?${this.sasToken}&restype=container`, {
                method: 'HEAD'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async createInitialData() {
        const initialUsers = {
            alice_martinez: {
                credentials: {
                    username: "alice.martinez",
                    passwordHash: this.hashPassword("AliceM2024!"),
                    email: "alice.martinez@email.com"
                },
                profile: {
                    firstName: "Alice",
                    lastName: "Martinez",
                    fullName: "Alice Martinez",
                    age: 28,
                    profession: "Software Engineer",
                    phone: "(555) 123-4567",
                    address: "1234 Tech Avenue, San Francisco, CA 94105",
                    joinDate: "2022-03-15",
                    avatar: "AM",
                    accountNumber: "****-1234"
                },
                accounts: {
                    checking: {
                        balance: 8750.43,
                        accountNumber: "CHK-001-1234",
                        type: "Premium Checking"
                    },
                    savings: {
                        balance: 25300.89,
                        accountNumber: "SAV-001-1234",
                        type: "High Yield Savings"
                    },
                    credit: {
                        balance: -1234.56,
                        limit: 15000,
                        accountNumber: "CC-001-1234",
                        type: "Rewards Credit Card"
                    }
                },
                transactions: [
                    {
                        id: "tx_2024_001",
                        date: "2024-06-28T10:30:00Z",
                        description: "Software License Renewal",
                        amount: -299.99,
                        category: "business",
                        icon: "fas fa-laptop-code"
                    },
                    {
                        id: "tx_2024_002",
                        date: "2024-06-27T14:15:00Z",
                        description: "Salary Deposit",
                        amount: 4200.00,
                        category: "income",
                        icon: "fas fa-money-check-alt"
                    },
                    {
                        id: "tx_2024_003",
                        date: "2024-06-26T09:45:00Z",
                        description: "Grocery Shopping",
                        amount: -127.83,
                        category: "food",
                        icon: "fas fa-shopping-cart"
                    }
                ]
            },
            bob_johnson: {
                credentials: {
                    username: "bob.johnson",
                    passwordHash: this.hashPassword("BobJ2024!"),
                    email: "bob.johnson@email.com"
                },
                profile: {
                    firstName: "Bob",
                    lastName: "Johnson",
                    fullName: "Bob Johnson",
                    age: 45,
                    profession: "Business Owner",
                    phone: "(555) 234-5678",
                    address: "5678 Business Blvd, Austin, TX 78701",
                    joinDate: "2020-08-22",
                    avatar: "BJ",
                    accountNumber: "****-5678"
                },
                accounts: {
                    checking: {
                        balance: 15420.67,
                        accountNumber: "CHK-002-5678",
                        type: "Business Checking"
                    },
                    savings: {
                        balance: 45890.12,
                        accountNumber: "SAV-002-5678",
                        type: "Business Savings"
                    },
                    credit: {
                        balance: -2567.80,
                        limit: 25000,
                        accountNumber: "CC-002-5678",
                        type: "Business Credit Card"
                    }
                },
                transactions: [
                    {
                        id: "tx_2024_004",
                        date: "2024-06-28T16:20:00Z",
                        description: "Business Equipment Purchase",
                        amount: -3200.00,
                        category: "business",
                        icon: "fas fa-tools"
                    },
                    {
                        id: "tx_2024_005",
                        date: "2024-06-27T11:30:00Z",
                        description: "Client Payment Received",
                        amount: 8500.00,
                        category: "income",
                        icon: "fas fa-handshake"
                    }
                ]
            }
        };

        // Upload each user's data as a separate blob
        for (const [userId, userData] of Object.entries(initialUsers)) {
            await this.saveUserData(userId, userData);
        }
    }

    // Save user data to Azure Blob Storage
    async saveUserData(userId, userData) {
        try {
            const blobName = `users/${userId}.json`;
            const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-ms-blob-type': 'BlockBlob'
                },
                body: JSON.stringify(userData, null, 2)
            });

            if (!response.ok) {
                throw new Error(`Azure Storage error: ${response.status} ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error saving user data to Azure:', error);
            return false;
        }
    }

    // Load user data from Azure Blob Storage
    async getUserData(userId) {
        try {
            const blobName = `users/${userId}.json`;
            const url = `${this.baseUrl}/${blobName}?${this.sasToken}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // User not found
                }
                throw new Error(`Azure Storage error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error loading user data from Azure:', error);
            return null;
        }
    }

    // Get all users (list blobs in users directory)
    async getAllUsers() {
        try {
            const url = `${this.baseUrl}?${this.sasToken}&restype=container&comp=list&prefix=users/`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Azure Storage error: ${response.status} ${response.statusText}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const blobs = xmlDoc.getElementsByTagName('Blob');
            const users = {};

            // Load each user's data
            for (let i = 0; i < blobs.length; i++) {
                const blobName = blobs[i].getElementsByTagName('Name')[0].textContent;
                const userId = blobName.replace('users/', '').replace('.json', '');
                
                const userData = await this.getUserData(userId);
                if (userData) {
                    users[userId] = userData;
                }
            }

            return users;
        } catch (error) {
            console.error('Error loading all users from Azure:', error);
            return {};
        }
    }

    // Authenticate user
    async authenticateUser(username, password) {
        try {
            const hashedPassword = this.hashPassword(password);
            const allUsers = await this.getAllUsers();
            
            for (const [userId, userData] of Object.entries(allUsers)) {
                if (userData.credentials.username === username && 
                    userData.credentials.passwordHash === hashedPassword) {
                    return { success: true, userId: userId, user: userData };
                }
            }
            
            return { success: false, message: "Invalid username or password" };
        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, message: "Authentication service error" };
        }
    }

    // Add transaction to user
    async addTransaction(userId, transaction) {
        try {
            const userData = await this.getUserData(userId);
            if (!userData) {
                return false;
            }

            userData.transactions.unshift(transaction);
            return await this.saveUserData(userId, userData);
        } catch (error) {
            console.error('Error adding transaction:', error);
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
            return await this.saveUserData(userId, userData);
        } catch (error) {
            console.error('Error updating account balance:', error);
            return false;
        }
    }

    // Create backup of all user data
    async createBackup() {
        try {
            const allUsers = await this.getAllUsers();
            const backup = {
                timestamp: new Date().toISOString(),
                version: "1.0",
                users: allUsers
            };

            const backupName = `backups/backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const url = `${this.baseUrl}/${backupName}?${this.sasToken}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-ms-blob-type': 'BlockBlob'
                },
                body: JSON.stringify(backup, null, 2)
            });

            return response.ok;
        } catch (error) {
            console.error('Error creating backup:', error);
            return false;
        }
    }

    // Simple hash function (use bcrypt in production)
    hashPassword(password) {
        return btoa(password); // Base64 encoding - use proper hashing in production
    }

    // Fallback to localStorage if Azure is not available
    fallbackToLocalStorage() {
        console.warn('Falling back to LocalStorage due to Azure connection issues');
        this.localStorageManager = new LocalStorageManager();
        
        // Proxy methods to localStorage
        this.getUserData = this.localStorageManager.getUserData.bind(this.localStorageManager);
        this.getAllUsers = this.localStorageManager.getAllUsers.bind(this.localStorageManager);
        this.authenticateUser = this.localStorageManager.authenticateUser.bind(this.localStorageManager);
        this.addTransaction = this.localStorageManager.addTransaction.bind(this.localStorageManager);
        this.updateAccountBalance = this.localStorageManager.updateAccountBalance.bind(this.localStorageManager);
    }

    // Get storage statistics
    async getStorageStats() {
        try {
            const url = `${this.baseUrl}?${this.sasToken}&restype=container&comp=list`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Azure Storage error: ${response.status} ${response.statusText}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const blobs = xmlDoc.getElementsByTagName('Blob');
            let totalSize = 0;
            let fileCount = 0;

            for (let i = 0; i < blobs.length; i++) {
                const sizeElement = blobs[i].getElementsByTagName('Content-Length')[0];
                if (sizeElement) {
                    totalSize += parseInt(sizeElement.textContent);
                    fileCount++;
                }
            }

            return {
                fileCount,
                totalSize,
                totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return { fileCount: 0, totalSize: 0, totalSizeMB: '0.00' };
        }
    }
}

// Export for use
window.AzureBlobStorageManager = AzureBlobStorageManager;
