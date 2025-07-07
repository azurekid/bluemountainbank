/**
 * Azure SQL Database Manager for Blue Mountain Bank
 * Provides data access layer for SQL Server operations
 */

const sql = require('mssql');
const crypto = require('crypto');

class AzureSQLManager {
    constructor(config) {
        this.config = config;
        this.pool = null;
        this.isConnected = false;
    }

    /**
     * Initialize connection pool to Azure SQL Database
     */
    async connect() {
        try {
            this.pool = await sql.connect(this.config);
            this.isConnected = true;
            console.log('✅ Connected to Azure SQL Database');
            return true;
        } catch (error) {
            console.error('❌ Azure SQL connection failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Close database connection
     */
    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.close();
                this.isConnected = false;
                console.log('🔌 Azure SQL connection closed');
            }
        } catch (error) {
            console.error('Error closing connection:', error);
        }
    }

    /**
     * Get user by username for authentication
     */
    async getUserByUsername(username) {
        try {
            const request = this.pool.request();
            request.input('username', sql.NVarChar(50), username);
            
            const result = await request.query(`
                SELECT u.UserId, u.Username, u.Email, u.PasswordHash,
                       p.FirstName, p.LastName, p.Age, p.Profession, p.Phone, 
                       p.Address, p.JoinDate, p.Avatar, p.AccountNumber
                FROM Users u
                LEFT JOIN UserProfiles p ON u.UserId = p.UserId
                WHERE u.Username = @username AND u.IsActive = 1
            `);
            
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    /**
     * Get complete user data including accounts and transactions
     */
    async getUserData(userId) {
        try {
            const userData = {};
            
            // Get user and profile data
            const userRequest = this.pool.request();
            userRequest.input('userId', sql.UniqueIdentifier, userId);
            
            const userResult = await userRequest.query(`
                SELECT u.UserId, u.Username, u.Email,
                       p.FirstName, p.LastName, p.Age, p.Profession, p.Phone, 
                       p.Address, p.JoinDate, p.Avatar, p.AccountNumber,
                       p.SSN, p.DateOfBirth, p.MothersMaidenName
                FROM Users u
                LEFT JOIN UserProfiles p ON u.UserId = p.UserId
                WHERE u.UserId = @userId AND u.IsActive = 1
            `);
            
            if (userResult.recordset.length === 0) {
                return null;
            }
            
            const user = userResult.recordset[0];
            
            // Structure user data
            userData.credentials = {
                username: user.Username,
                email: user.Email
            };
            
            userData.profile = {
                firstName: user.FirstName,
                lastName: user.LastName,
                fullName: `${user.FirstName} ${user.LastName}`,
                age: user.Age,
                profession: user.Profession,
                phone: user.Phone,
                address: user.Address,
                joinDate: user.JoinDate,
                avatar: user.Avatar,
                accountNumber: user.AccountNumber
            };
            
            userData.personalInfo = {
                ssn: user.SSN,
                dateOfBirth: user.DateOfBirth,
                mothersMaidenName: user.MothersMaidenName,
                creditCards: {}
            };
            
            // Get user preferences
            const prefRequest = this.pool.request();
            prefRequest.input('userId', sql.UniqueIdentifier, userId);
            
            const prefResult = await prefRequest.query(`
                SELECT Theme, DarkMode, Language, Currency, Notifications, EmailAlerts, SmsAlerts
                FROM UserPreferences
                WHERE UserId = @userId
            `);
            
            if (prefResult.recordset.length > 0) {
                const pref = prefResult.recordset[0];
                userData.preferences = {
                    theme: pref.Theme,
                    darkMode: pref.DarkMode,
                    language: pref.Language,
                    currency: pref.Currency,
                    notifications: pref.Notifications,
                    emailAlerts: pref.EmailAlerts,
                    smsAlerts: pref.SmsAlerts
                };
            }
            
            // Get bank accounts
            const accountsRequest = this.pool.request();
            accountsRequest.input('userId', sql.UniqueIdentifier, userId);
            
            const accountsResult = await accountsRequest.query(`
                SELECT AccountId, AccountType, AccountNumber, AccountName, Balance, CreditLimit
                FROM BankAccounts
                WHERE UserId = @userId AND IsActive = 1
            `);
            
            userData.accounts = {};
            const accountIds = {};
            
            accountsResult.recordset.forEach(account => {
                accountIds[account.AccountType] = account.AccountId;
                userData.accounts[account.AccountType] = {
                    balance: parseFloat(account.Balance),
                    accountNumber: account.AccountNumber,
                    type: account.AccountName
                };
                
                if (account.CreditLimit) {
                    userData.accounts[account.AccountType].limit = parseFloat(account.CreditLimit);
                }
            });
            
            // Get credit cards and their transactions
            const cardsRequest = this.pool.request();
            cardsRequest.input('userId', sql.UniqueIdentifier, userId);
            
            const cardsResult = await cardsRequest.query(`
                SELECT CardId, CardType, CardBrand, CardNumber, ExpiryMonth, ExpiryYear, 
                       CVV, CardName, Balance, CreditLimit
                FROM CreditCards
                WHERE UserId = @userId AND IsActive = 1
            `);
            
            for (const card of cardsResult.recordset) {
                // Get credit card transactions
                const transRequest = this.pool.request();
                transRequest.input('cardId', sql.UniqueIdentifier, card.CardId);
                
                const transResult = await transRequest.query(`
                    SELECT TransactionDate, Description, Amount, TransactionType, Category, IsPending
                    FROM CreditCardTransactions
                    WHERE CardId = @cardId
                    ORDER BY TransactionDate DESC
                `);
                
                userData.personalInfo.creditCards[card.CardType] = {
                    type: card.CardBrand,
                    number: card.CardNumber,
                    expiryMonth: card.ExpiryMonth,
                    expiryYear: card.ExpiryYear,
                    cvv: parseInt(card.CVV),
                    name: card.CardName,
                    isActive: true,
                    balance: parseFloat(card.Balance),
                    limit: parseFloat(card.CreditLimit),
                    transactions: transResult.recordset.map(t => ({
                        id: `cc_${card.CardType}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                        date: t.TransactionDate,
                        description: t.Description,
                        amount: parseFloat(t.Amount),
                        type: t.TransactionType,
                        category: t.Category,
                        cardType: card.CardType,
                        pending: t.IsPending
                    }))
                };
            }
            
            // Get bank transactions
            const bankTransRequest = this.pool.request();
            bankTransRequest.input('userId', sql.UniqueIdentifier, userId);
            
            const bankTransResult = await bankTransRequest.query(`
                SELECT bt.TransactionDate, bt.Description, bt.Amount, bt.TransactionType, 
                       bt.Category, bt.Icon, bt.IsPending, ba.AccountType
                FROM BankTransactions bt
                JOIN BankAccounts ba ON bt.AccountId = ba.AccountId
                WHERE bt.UserId = @userId
                ORDER BY bt.TransactionDate DESC
            `);
            
            userData.recentTransactions = bankTransResult.recordset.map(t => ({
                id: `bank_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                date: t.TransactionDate,
                description: t.Description,
                amount: parseFloat(t.Amount),
                type: t.TransactionType,
                account: t.AccountType,
                category: t.Category,
                icon: t.Icon
            }));
            
            return userData;
            
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    /**
     * Update user preferences
     */
    async updateUserPreferences(userId, preferences) {
        try {
            const request = this.pool.request();
            request.input('userId', sql.UniqueIdentifier, userId);
            request.input('theme', sql.NVarChar(20), preferences.theme || 'light');
            request.input('darkMode', sql.Bit, preferences.darkMode || false);
            request.input('language', sql.NVarChar(10), preferences.language || 'en-US');
            request.input('currency', sql.NVarChar(3), preferences.currency || 'USD');
            request.input('notifications', sql.Bit, preferences.notifications !== false);
            request.input('emailAlerts', sql.Bit, preferences.emailAlerts !== false);
            request.input('smsAlerts', sql.Bit, preferences.smsAlerts || false);
            
            await request.query(`
                UPDATE UserPreferences 
                SET Theme = @theme, DarkMode = @darkMode, Language = @language, 
                    Currency = @currency, Notifications = @notifications, 
                    EmailAlerts = @emailAlerts, SmsAlerts = @smsAlerts,
                    UpdatedAt = GETUTCDATE()
                WHERE UserId = @userId
            `);
            
            return true;
        } catch (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }
    }

    /**
     * Add a new transaction
     */
    async addTransaction(userId, transactionData) {
        try {
            const request = this.pool.request();
            const transactionId = crypto.randomUUID();
            
            if (transactionData.type === 'credit_card') {
                // Add credit card transaction
                request.input('transactionId', sql.UniqueIdentifier, transactionId);
                request.input('userId', sql.UniqueIdentifier, userId);
                request.input('cardId', sql.UniqueIdentifier, transactionData.cardId);
                request.input('date', sql.Date, transactionData.date);
                request.input('description', sql.NVarChar(500), transactionData.description);
                request.input('amount', sql.Decimal(15, 2), transactionData.amount);
                request.input('transactionType', sql.NVarChar(50), transactionData.transactionType);
                request.input('category', sql.NVarChar(50), transactionData.category);
                request.input('pending', sql.Bit, transactionData.pending || false);
                
                await request.query(`
                    INSERT INTO CreditCardTransactions (TransactionId, UserId, CardId, TransactionDate, 
                                                       Description, Amount, TransactionType, Category, 
                                                       IsPending, CreatedAt)
                    VALUES (@transactionId, @userId, @cardId, @date, @description, @amount, 
                            @transactionType, @category, @pending, GETUTCDATE())
                `);
                
                // Update credit card balance
                const balanceRequest = this.pool.request();
                balanceRequest.input('cardId', sql.UniqueIdentifier, transactionData.cardId);
                balanceRequest.input('amount', sql.Decimal(15, 2), transactionData.amount);
                
                await balanceRequest.query(`
                    UPDATE CreditCards 
                    SET Balance = Balance + @amount, UpdatedAt = GETUTCDATE()
                    WHERE CardId = @cardId
                `);
                
            } else {
                // Add bank account transaction
                request.input('transactionId', sql.UniqueIdentifier, transactionId);
                request.input('userId', sql.UniqueIdentifier, userId);
                request.input('accountId', sql.UniqueIdentifier, transactionData.accountId);
                request.input('date', sql.Date, transactionData.date);
                request.input('description', sql.NVarChar(500), transactionData.description);
                request.input('amount', sql.Decimal(15, 2), transactionData.amount);
                request.input('transactionType', sql.NVarChar(50), transactionData.transactionType);
                request.input('category', sql.NVarChar(50), transactionData.category);
                request.input('icon', sql.NVarChar(50), transactionData.icon);
                request.input('pending', sql.Bit, transactionData.pending || false);
                
                await request.query(`
                    INSERT INTO BankTransactions (TransactionId, UserId, AccountId, TransactionDate, 
                                                Description, Amount, TransactionType, Category, 
                                                Icon, IsPending, CreatedAt)
                    VALUES (@transactionId, @userId, @accountId, @date, @description, @amount, 
                            @transactionType, @category, @icon, @pending, GETUTCDATE())
                `);
                
                // Update bank account balance
                const balanceRequest = this.pool.request();
                balanceRequest.input('accountId', sql.UniqueIdentifier, transactionData.accountId);
                balanceRequest.input('amount', sql.Decimal(15, 2), transactionData.amount);
                
                await balanceRequest.query(`
                    UPDATE BankAccounts 
                    SET Balance = Balance + @amount, UpdatedAt = GETUTCDATE()
                    WHERE AccountId = @accountId
                `);
            }
            
            return transactionId;
            
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }

    /**
     * Create a new user account
     */
    async createUser(userData) {
        try {
            const transaction = this.pool.transaction();
            await transaction.begin();
            
            try {
                const userId = crypto.randomUUID();
                
                // Insert user
                const userRequest = transaction.request();
                userRequest.input('userId', sql.UniqueIdentifier, userId);
                userRequest.input('username', sql.NVarChar(50), userData.username);
                userRequest.input('email', sql.NVarChar(100), userData.email);
                userRequest.input('passwordHash', sql.NVarChar(255), userData.passwordHash);
                
                await userRequest.query(`
                    INSERT INTO Users (UserId, Username, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt)
                    VALUES (@userId, @username, @email, @passwordHash, 1, GETUTCDATE(), GETUTCDATE())
                `);
                
                // Insert user profile
                const profileRequest = transaction.request();
                profileRequest.input('profileId', sql.UniqueIdentifier, crypto.randomUUID());
                profileRequest.input('userId', sql.UniqueIdentifier, userId);
                profileRequest.input('firstName', sql.NVarChar(50), userData.firstName);
                profileRequest.input('lastName', sql.NVarChar(50), userData.lastName);
                
                await profileRequest.query(`
                    INSERT INTO UserProfiles (ProfileId, UserId, FirstName, LastName, CreatedAt, UpdatedAt)
                    VALUES (@profileId, @userId, @firstName, @lastName, GETUTCDATE(), GETUTCDATE())
                `);
                
                // Insert default preferences
                const prefRequest = transaction.request();
                prefRequest.input('prefId', sql.UniqueIdentifier, crypto.randomUUID());
                prefRequest.input('userId', sql.UniqueIdentifier, userId);
                
                await prefRequest.query(`
                    INSERT INTO UserPreferences (PreferenceId, UserId, CreatedAt, UpdatedAt)
                    VALUES (@prefId, @userId, GETUTCDATE(), GETUTCDATE())
                `);
                
                await transaction.commit();
                return userId;
                
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
            
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
}

module.exports = AzureSQLManager;
