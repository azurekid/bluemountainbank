// IndexedDB Manager for Better Client-Side Storage
class IndexedDBManager {
    constructor() {
        this.dbName = 'BlueMountainBankDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('username', 'credentials.username', { unique: true });
                    userStore.createIndex('email', 'credentials.email', { unique: true });
                }

                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    transactionStore.createIndex('userId', 'userId', { unique: false });
                    transactionStore.createIndex('date', 'date', { unique: false });
                    transactionStore.createIndex('category', 'category', { unique: false });
                }

                if (!db.objectStoreNames.contains('accounts')) {
                    const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
                    accountStore.createIndex('userId', 'userId', { unique: false });
                    accountStore.createIndex('accountNumber', 'accountNumber', { unique: true });
                }
            };
        });
    }

    // Add user to database
    async addUser(userData) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        // Hash password before storing
        userData.credentials.password = await this.hashPassword(userData.credentials.password);
        
        return new Promise((resolve, reject) => {
            const request = store.add(userData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get user by username
    async getUserByUsername(username) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('username');
        
        return new Promise((resolve, reject) => {
            const request = index.get(username);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Add transaction
    async addTransaction(userId, transactionData) {
        transactionData.userId = userId;
        transactionData.timestamp = new Date().toISOString();
        
        const transaction = this.db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        
        return new Promise((resolve, reject) => {
            const request = store.add(transactionData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get transactions for user
    async getTransactions(userId, limit = 20) {
        const transaction = this.db.transaction(['transactions'], 'readonly');
        const store = transaction.objectStore('transactions');
        const index = store.index('userId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => {
                const transactions = request.result
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, limit);
                resolve(transactions);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Authenticate user
    async authenticateUser(username, password) {
        try {
            const user = await this.getUserByUsername(username);
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const isValid = await this.verifyPassword(password, user.credentials.password);
            if (isValid) {
                return { success: true, userId: user.id, user: user };
            } else {
                return { success: false, message: "Invalid password" };
            }
        } catch (error) {
            return { success: false, message: "Authentication error" };
        }
    }

    // Hash password using Web Crypto API
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Verify password
    async verifyPassword(password, hashedPassword) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hashedPassword;
    }
}

// Export for use
window.IndexedDBManager = IndexedDBManager;
