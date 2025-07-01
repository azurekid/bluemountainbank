// Storage Factory - Dynamically choose storage solution
class StorageFactory {
    constructor() {
        this.storageType = this.detectStorageType();
        this.manager = null;
    }

    detectStorageType() {
        // Check for Azure storage manager availability
        if (typeof AzureStorageManager !== 'undefined') {
            return 'azure';
        }

        // Check for environment variable or URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const storageParam = urlParams.get('storage');
        if (storageParam) {
            return storageParam;
        }

        // Default to localStorage
        return 'localStorage';
    }

    async initialize() {
        switch (this.storageType) {
            case 'azure':
                await this.initializeAzure();
                break;
            case 'indexeddb':
                await this.initializeIndexedDB();
                break;
            case 'localStorage':
            default:
                this.initializeLocalStorage();
                break;
        }
        return this.manager;
    }

    initializeLocalStorage() {
        console.log('🗄️ Using LocalStorage for data persistence');
        this.manager = new LocalStorageManager();
    }

    async initializeAzure() {
        try {
            console.log('☁️ Using Azure Blob Storage for data persistence');
            this.manager = new AzureStorageManager();
            await this.manager.initializeData();
        } catch (error) {
            console.error('Failed to initialize Azure storage, falling back to localStorage:', error);
            this.storageType = 'localStorage';
            this.initializeLocalStorage();
        }
    }

    async initializeIndexedDB() {
        try {
            console.log('💾 Using IndexedDB for data persistence');
            this.manager = new IndexedDBManager();
            await this.manager.initializeData();
        } catch (error) {
            console.error('Failed to initialize IndexedDB, falling back to localStorage:', error);
            this.storageType = 'localStorage';
            this.initializeLocalStorage();
        }
    }

    getManager() {
        return this.manager;
    }

    getStorageType() {
        return this.storageType;
    }

    // Switch storage type dynamically
    async switchStorageType(newType, config = null) {
        console.log(`🔄 Switching storage from ${this.storageType} to ${newType}`);
        
        // Save current data for migration
        let currentData = null;
        if (this.manager) {
            try {
                currentData = await this.manager.getAllUsers();
            } catch (error) {
                console.warn('Could not retrieve current data for migration:', error);
            }
        }

        // Initialize new storage
        this.storageType = newType;
        if (config) {
            localStorage.setItem('azureConfig', JSON.stringify(config));
        }
        
        await this.initialize();

        // Migrate data if available
        if (currentData && Object.keys(currentData).length > 0) {
            console.log('📦 Migrating data to new storage system...');
            try {
                for (const [userId, userData] of Object.entries(currentData)) {
                    await this.manager.saveUserData(userId, userData);
                }
                console.log('✅ Data migration completed successfully');
            } catch (error) {
                console.error('❌ Data migration failed:', error);
                throw new Error('Migration failed: ' + error.message);
            }
        }

        return this.manager;
    }

    // Get storage information
    getStorageInfo() {
        return {
            type: this.storageType,
            manager: this.manager ? this.manager.constructor.name : null,
            capabilities: this.getCapabilities(),
            isOnline: navigator.onLine
        };
    }

    getCapabilities() {
        switch (this.storageType) {
            case 'azure':
                return {
                    persistent: true,
                    offline: false,
                    multiDevice: true,
                    backup: true,
                    scalable: true,
                    secure: true
                };
            case 'indexeddb':
                return {
                    persistent: true,
                    offline: true,
                    multiDevice: false,
                    backup: false,
                    scalable: true,
                    secure: false
                };
            case 'localStorage':
            default:
                return {
                    persistent: true,
                    offline: true,
                    multiDevice: false,
                    backup: false,
                    scalable: false,
                    secure: false
                };
        }
    }

    // Health check for current storage
    async healthCheck() {
        if (!this.manager) {
            return { healthy: false, error: 'No storage manager initialized' };
        }

        try {
            // Test basic operations
            const testUserId = 'health_check_test';
            const testData = {
                credentials: { username: 'test', passwordHash: 'test' },
                profile: { fullName: 'Health Check Test' },
                accounts: {},
                transactions: []
            };

            // Test write
            const writeSuccess = await this.manager.saveUserData(testUserId, testData);
            if (!writeSuccess) {
                return { healthy: false, error: 'Write operation failed' };
            }

            // Test read
            const readData = await this.manager.getUserData(testUserId);
            if (!readData || readData.profile.fullName !== 'Health Check Test') {
                return { healthy: false, error: 'Read operation failed' };
            }

            // Cleanup test data (if delete is supported)
            if (typeof this.manager.deleteUser === 'function') {
                await this.manager.deleteUser(testUserId);
            }

            return { 
                healthy: true, 
                storageType: this.storageType,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return { 
                healthy: false, 
                error: error.message,
                storageType: this.storageType 
            };
        }
    }
}

// Global storage factory instance
window.StorageFactory = StorageFactory;
