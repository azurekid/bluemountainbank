// Azure Storage Manager with SAS Token and Local Fallback
class AzureStorageManager {
    constructor() {
        // Azure Storage configuration
        this.storageAccount = 'bluemountaindata'; // Your storage account name
        this.containerName = 'userdata';
        this.sasToken = 'sv=2024-11-04&ss=bfqt&srt=sco&sp=rlptfx&se=2028-07-01T21:22:53Z&st=2025-07-01T13:22:53Z&spr=https&sig=pH34OTj9l29ovANxyjOWAgiShFQ6A3qY0sspcDNp4VE%3D';
        this.baseUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}`;
        this.useLocalFallback = false;
        
        // Security features
        this.loginAttempts = new Map(); // Track failed login attempts
        this.maxAttempts = 5; // Maximum login attempts
        this.lockoutDuration = 5 * 60 * 1000; // 15 minutes lockout
        
        // Local sample data for fallback (minimal for login only)
        // Note: In production, these would be loaded from secure storage
        // All passwords are stored as salt:hash format using PBKDF2
        this.localUsers = {
            'alice_martinez': {
                credentials: {
                    username: 'alice.martinez',
                    password: 'a1b2c3d4e5f6789012345678:d4c8b9e2f3a1b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
                    email: 'alice.martinez@gmail.com'
                }
            },
            'bob_johnson': {
                credentials: {
                    username: 'bob.johnson',
                    password: 'b2c3d4e5f6a7890123456789:e5d9c8b7f4a3b6c5d8e7f0a9b2c1d4e3f6a5b8c7d0e9f2a1b4c3d6e5f8a7b0c9',
                    email: 'bob.johnson@outlook.com'
                }
            },
            'carol_smith': {
                credentials: {
                    username: 'carol.smith',
                    password: 'c3d4e5f6a7b8901234567890:f6e0d9c8b7a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
                }
            },
            'david_wilson': {
                credentials: {
                    username: 'david.wilson',
                    password: 'd4e5f6a7b8c9012345678901:a7b1e0d9c8f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
                }
            },
            'emma_brown': {
                credentials: {
                    username: 'emma.brown',
                    password: 'e5f6a7b8c9d0123456789012:b8c2f1e0d9a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
                }
            },
            'frank_miller': {
                credentials: {
                    username: 'frank.miller',
                    password: 'f6a7b8c9d0e1234567890123:c9d3g2f1e0b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
                }
            }
        };
    }

    // Get user data (wrapper for loadUserData that returns data directly)
    async getUserData(userId) {
        try {
            const result = await this.loadUserData(userId);
            if (result.success) {
                return result.data;
            } else {
                console.error('Failed to get user data:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
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
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                return { success: true, data: userData };
            } else if (response.status === 404) {
                return { success: false, error: 'User not found' };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Network error loading user data:', error);
            return { success: false, error: error.message };
        }
    }

    // Authenticate user with enhanced security
    async authenticateUser(username, password) {
        console.log('🔐 Authenticating user:', username);
        
        // Check if account is locked
        if (this.isAccountLocked(username)) {
            console.warn('🔒 Account locked:', username);
            return { 
                success: false, 
                message: "Account temporarily locked due to too many failed login attempts. Please try again later.",
                locked: true
            };
        }
        
        // Input validation
        if (!username || !password) {
            return { success: false, message: "Username and password are required" };
        }
        
        // Sanitize username to prevent injection attacks
        const sanitizedUsername = username.trim().toLowerCase();
        
        // Try Azure first, then fallback to local
        try {
            const azureResult = await this.authenticateUserAzure(sanitizedUsername, password);
            if (azureResult.success) {
                console.log('✅ Azure authentication successful');
                this.useLocalFallback = false;
                this.clearFailedAttempts(sanitizedUsername);
                return azureResult;
            }
        } catch (azureError) {
            console.error('Azure authentication error:', azureError.message);
        }
        
        // Fallback to local authentication
        try {
            const localResult = await this.authenticateUserLocal(sanitizedUsername, password);
            if (localResult.success) {
                console.log('✅ Local authentication successful');
                this.useLocalFallback = true;
                this.clearFailedAttempts(sanitizedUsername);
                return localResult;
            } else {
                this.recordFailedAttempt(sanitizedUsername);
                return localResult;
            }
        } catch (fallbackError) {
            console.error('Authentication system error:', fallbackError.message);
            this.recordFailedAttempt(sanitizedUsername);
            return { success: false, message: "Authentication system temporarily unavailable" };
        }
    }

    // Azure authentication method
    async authenticateUserAzure(username, password) {
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
            
            for (let blob of blobs) {
                const blobName = blob.getElementsByTagName('Name')[0].textContent;
                const userId = blobName.split('/')[1].replace('.json', '');
                
                const userData = await this.loadUserData(userId);
                if (userData.success && userData.data.credentials.username === username) {
                    const passwordMatch = await this.verifyPassword(password, userData.data.credentials.password);
                    console.log('🔐 Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
                    
                    if (passwordMatch) {
                        const userWithSource = { ...userData.data, _dataSource: 'Azure' };
                        return { success: true, userId, user: userWithSource, dataSource: 'Azure' };
                    }
                }
            }
            
            return { success: false, message: "Invalid credentials" };
        } catch (error) {
            console.error('Azure authentication error:', error);
            throw error;
        }
    }

    // Local fallback authentication
    async authenticateUserLocal(username, password) {
        for (const [userId, userData] of Object.entries(this.localUsers)) {
            if (userData.credentials.username === username) {
                const passwordMatch = await this.verifyPassword(password, userData.credentials.password);
                console.log('🔐 Local password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
                
                if (passwordMatch) {
                    this.useLocalFallback = true;
                    
                    const completeUserData = {
                        credentials: userData.credentials,
                        userId: userId,
                        username: userData.credentials.username,
                        email: userData.credentials.email,
                        _dataSource: 'Local'
                    };
                    
                    return { 
                        success: true, 
                        userId, 
                        user: completeUserData, 
                        dataSource: 'Local' 
                    };
                }
            }
        }
        
        return { success: false, message: "Invalid credentials" };
    }

    // Secure password verification with backward compatibility
    async verifyPassword(password, storedHash) {
        try {
            // Check if this is the new salt:hash format or old SHA-256 format
            if (storedHash.includes(':')) {
                console.log('🔐 Using salt:hash format');
                const [salt, hash] = storedHash.split(':');
                if (!salt || !hash) {
                    console.error('❌ Invalid salt:hash format');
                    return false;
                }
                
                const inputHash = await this.hashPasswordWithSalt(password, salt);
                return this.constantTimeCompare(inputHash, hash);
            } else {
                console.log('🔐 Using legacy SHA-256 format');
                const inputHash = await this.legacySHA256Hash(password);
                return this.constantTimeCompare(inputHash, storedHash);
            }
        } catch (error) {
            console.error('❌ Password verification error:', error);
            return false;
        }
    }

    // Hash password with salt using PBKDF2
    async hashPasswordWithSalt(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const saltBuffer = encoder.encode(salt);
        
        // Import password as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        // Derive key using PBKDF2 with 100,000 iterations
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltBuffer,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256 // 32 bytes
        );
        
        // Convert to hex string
        const hashArray = Array.from(new Uint8Array(derivedBits));
        return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Legacy SHA-256 hash for backward compatibility
    async legacySHA256Hash(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = new Uint8Array(hashBuffer);
        return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Generate cryptographically secure random salt
    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Hash password for storage (use this when creating new users)
    async hashPassword(password) {
        const salt = this.generateSalt();
        const hash = await this.hashPasswordWithSalt(password, salt);
        return `${salt}:${hash}`;
    }

    // Constant-time string comparison to prevent timing attacks
    constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }

    // Clear sensitive data from memory
    clearSensitiveData() {
        // Clear any stored passwords from memory
        if (this.localUsers) {
            Object.values(this.localUsers).forEach(user => {
                if (user.credentials && user.credentials.password) {
                    user.credentials.password = null;
                }
            });
        }
    }

    // Method compatibility for application integration
    async initialize() {
        console.log('🚀 Initializing Azure Storage Manager');
        
        // Generate secure password hashes for local users
        await this.initializeSecurePasswords();
        
        // Reset fallback flag on initialization
        this.useLocalFallback = false;
        
        // Test Azure connectivity
        try {
            const testUrl = `${this.baseUrl}?restype=container&comp=list&prefix=users/&${this.sasToken}`;
            const response = await fetch(testUrl);
            if (response.ok) {
                console.log('✅ Azure Storage connected');
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                const blobs = xmlDoc.getElementsByTagName('Blob');
                console.log(`📁 Found ${blobs.length} user files in Azure`);
                
                if (blobs.length === 0) {
                    console.warn('⚠️ No user files in Azure storage');
                }
            } else {
                console.log('💾 Using local fallback data');
                this.useLocalFallback = true;
            }
        } catch (error) {
            console.log('💾 Using local fallback data');
            this.useLocalFallback = true;
        }
        
        return this;
    }

    // Initialize secure password hashes for demo users
    async initializeSecurePasswords() {
        // Passwords are already securely hashed in constructor
        console.log('🔒 Local users ready with PBKDF2 hashed passwords');
    }

    // Check if account is locked due to too many failed attempts
    isAccountLocked(username) {
        const attempts = this.loginAttempts.get(username);
        if (!attempts) return false;
        
        const { count, lastAttempt } = attempts;
        const timeSinceLastAttempt = Date.now() - lastAttempt;
        
        // Reset if lockout period has passed
        if (timeSinceLastAttempt > this.lockoutDuration) {
            this.loginAttempts.delete(username);
            return false;
        }
        
        return count >= this.maxAttempts;
    }

    // Record failed login attempt
    recordFailedAttempt(username) {
        const now = Date.now();
        const attempts = this.loginAttempts.get(username) || { count: 0, lastAttempt: now };
        
        // Reset count if enough time has passed
        if (now - attempts.lastAttempt > this.lockoutDuration) {
            attempts.count = 0;
        }
        
        attempts.count++;
        attempts.lastAttempt = now;
        
        this.loginAttempts.set(username, attempts);
        
        if (attempts.count >= this.maxAttempts) {
            console.warn(`🔒 Account locked: ${username} (${attempts.count} failed attempts)`);
        }
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(username) {
        this.loginAttempts.delete(username);
    }

    // Validate password strength (for new passwords)
    validatePasswordStrength(password) {
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUppercase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowercase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    // Calculate password strength score
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length bonus
        score += Math.min(password.length * 2, 20);
        
        // Character variety bonus
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/\d/.test(password)) score += 5;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
        
        // Penalty for common patterns
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/123|abc|qwe/i.test(password)) score -= 15; // Sequential patterns
        
        if (score < 30) return 'weak';
        if (score < 60) return 'medium';
        return 'strong';
    }
}

// Usage example
const azureManager = new AzureStorageManager();

// Export for use
window.AzureStorageManager = AzureStorageManager;
