#!/usr/bin/env node

/**
 * Azure SQL Database Migration Script (Node.js)
 * Alternative to Python script for better compatibility with Azure Cloud Shell
 */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Azure SQL Database configuration from environment
const sqlConfig = {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USERNAME,
    password: process.env.AZURE_SQL_PASSWORD,
    pool: {
        max: 2,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: false,
        connectTimeout: 60000,
        requestTimeout: 60000
    }
};

class NodeJSMigrator {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            console.log('🔌 Connecting to Azure SQL Database...');
            this.pool = await sql.connect(sqlConfig);
            this.isConnected = true;
            console.log('✅ Connected to Azure SQL Database');
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            return false;
        }
    }

    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.close();
                this.isConnected = false;
                console.log('🔌 Database connection closed');
            }
        } catch (error) {
            console.error('Error closing connection:', error);
        }
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async migrateUserData(jsonFilePath) {
        try {
            const userData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            const transaction = this.pool.transaction();
            
            await transaction.begin();
            
            try {
                const userId = this.generateUUID();
                
                // 1. Insert User
                const credentials = userData.credentials || {};
                await transaction.request()
                    .input('userId', sql.UniqueIdentifier, userId)
                    .input('username', sql.NVarChar(50), credentials.username || '')
                    .input('email', sql.NVarChar(100), credentials.email || '')
                    .input('passwordHash', sql.NVarChar(255), credentials.password || '')
                    .query(`
                        INSERT INTO Users (UserId, Username, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt)
                        VALUES (@userId, @username, @email, @passwordHash, 1, GETUTCDATE(), GETUTCDATE())
                    `);

                // 2. Insert User Profile
                const profile = userData.profile || {};
                const personalInfo = userData.personalInfo || {};
                
                await transaction.request()
                    .input('profileId', sql.UniqueIdentifier, this.generateUUID())
                    .input('userId', sql.UniqueIdentifier, userId)
                    .input('firstName', sql.NVarChar(50), profile.firstName || '')
                    .input('lastName', sql.NVarChar(50), profile.lastName || '')
                    .input('age', sql.Int, profile.age || null)
                    .input('profession', sql.NVarChar(100), profile.profession || '')
                    .input('phone', sql.NVarChar(20), profile.phone || '')
                    .input('address', sql.NVarChar(500), profile.address || '')
                    .input('joinDate', sql.Date, profile.joinDate || null)
                    .input('avatar', sql.NVarChar(10), profile.avatar || '')
                    .input('accountNumber', sql.NVarChar(20), profile.accountNumber || '')
                    .input('ssn', sql.NVarChar(11), personalInfo.ssn || '')
                    .input('dateOfBirth', sql.Date, personalInfo.dateOfBirth || null)
                    .input('mothersMaidenName', sql.NVarChar(100), personalInfo.mothersMaidenName || '')
                    .query(`
                        INSERT INTO UserProfiles (ProfileId, UserId, FirstName, LastName, Age, Profession, 
                                                Phone, Address, JoinDate, Avatar, AccountNumber, SSN, 
                                                DateOfBirth, MothersMaidenName, CreatedAt, UpdatedAt)
                        VALUES (@profileId, @userId, @firstName, @lastName, @age, @profession, 
                                @phone, @address, @joinDate, @avatar, @accountNumber, @ssn, 
                                @dateOfBirth, @mothersMaidenName, GETUTCDATE(), GETUTCDATE())
                    `);

                // 3. Insert User Preferences
                const preferences = userData.preferences || {};
                await transaction.request()
                    .input('prefId', sql.UniqueIdentifier, this.generateUUID())
                    .input('userId', sql.UniqueIdentifier, userId)
                    .input('theme', sql.NVarChar(20), preferences.theme || 'light')
                    .input('darkMode', sql.Bit, preferences.darkMode || false)
                    .input('language', sql.NVarChar(10), preferences.language || 'en-US')
                    .input('currency', sql.NVarChar(3), preferences.currency || 'USD')
                    .input('notifications', sql.Bit, preferences.notifications !== false)
                    .input('emailAlerts', sql.Bit, preferences.emailAlerts !== false)
                    .input('smsAlerts', sql.Bit, preferences.smsAlerts || false)
                    .query(`
                        INSERT INTO UserPreferences (PreferenceId, UserId, Theme, DarkMode, Language, 
                                                   Currency, Notifications, EmailAlerts, SmsAlerts, 
                                                   CreatedAt, UpdatedAt)
                        VALUES (@prefId, @userId, @theme, @darkMode, @language, 
                                @currency, @notifications, @emailAlerts, @smsAlerts, 
                                GETUTCDATE(), GETUTCDATE())
                    `);

                // 4. Insert Bank Accounts
                const accounts = userData.accounts || {};
                const accountIds = {};
                
                for (const [accountType, accountData] of Object.entries(accounts)) {
                    const accountId = this.generateUUID();
                    accountIds[accountType] = accountId;
                    
                    await transaction.request()
                        .input('accountId', sql.UniqueIdentifier, accountId)
                        .input('userId', sql.UniqueIdentifier, userId)
                        .input('accountType', sql.NVarChar(50), accountType)
                        .input('accountNumber', sql.NVarChar(20), accountData.accountNumber || '')
                        .input('accountName', sql.NVarChar(100), accountData.type || '')
                        .input('balance', sql.Decimal(15, 2), accountData.balance || 0)
                        .input('creditLimit', sql.Decimal(15, 2), accountData.limit || null)
                        .query(`
                            INSERT INTO BankAccounts (AccountId, UserId, AccountType, AccountNumber, 
                                                    AccountName, Balance, CreditLimit, IsActive, 
                                                    CreatedAt, UpdatedAt)
                            VALUES (@accountId, @userId, @accountType, @accountNumber, 
                                    @accountName, @balance, @creditLimit, 1, 
                                    GETUTCDATE(), GETUTCDATE())
                        `);
                }

                // 5. Insert Credit Cards and Transactions
                const creditCards = personalInfo.creditCards || {};
                
                for (const [cardType, cardData] of Object.entries(creditCards)) {
                    const cardId = this.generateUUID();
                    
                    await transaction.request()
                        .input('cardId', sql.UniqueIdentifier, cardId)
                        .input('userId', sql.UniqueIdentifier, userId)
                        .input('cardType', sql.NVarChar(20), cardType)
                        .input('cardBrand', sql.NVarChar(20), cardData.type || '')
                        .input('cardNumber', sql.NVarChar(19), cardData.number || '')
                        .input('expiryMonth', sql.Int, cardData.expiryMonth || 12)
                        .input('expiryYear', sql.Int, cardData.expiryYear || 2025)
                        .input('cvv', sql.NVarChar(4), String(cardData.cvv || 123))
                        .input('cardName', sql.NVarChar(100), cardData.name || '')
                        .input('balance', sql.Decimal(15, 2), cardData.balance || 0)
                        .input('creditLimit', sql.Decimal(15, 2), cardData.limit || 5000)
                        .query(`
                            INSERT INTO CreditCards (CardId, UserId, CardType, CardBrand, CardNumber, 
                                                   ExpiryMonth, ExpiryYear, CVV, CardName, Balance, 
                                                   CreditLimit, IsActive, CreatedAt, UpdatedAt)
                            VALUES (@cardId, @userId, @cardType, @cardBrand, @cardNumber, 
                                    @expiryMonth, @expiryYear, @cvv, @cardName, @balance, 
                                    @creditLimit, 1, GETUTCDATE(), GETUTCDATE())
                        `);
                    
                    // Insert credit card transactions
                    const transactions = cardData.transactions || [];
                    for (const transaction of transactions) {
                        await transaction.request()
                            .input('transactionId', sql.UniqueIdentifier, this.generateUUID())
                            .input('userId', sql.UniqueIdentifier, userId)
                            .input('cardId', sql.UniqueIdentifier, cardId)
                            .input('transactionDate', sql.Date, transaction.date)
                            .input('description', sql.NVarChar(500), transaction.description || '')
                            .input('amount', sql.Decimal(15, 2), transaction.amount || 0)
                            .input('transactionType', sql.NVarChar(50), transaction.type || '')
                            .input('category', sql.NVarChar(50), transaction.category || '')
                            .input('pending', sql.Bit, transaction.pending || false)
                            .query(`
                                INSERT INTO CreditCardTransactions (TransactionId, UserId, CardId, 
                                                                   TransactionDate, Description, Amount, 
                                                                   TransactionType, Category, IsPending, 
                                                                   CreatedAt)
                                VALUES (@transactionId, @userId, @cardId, @transactionDate, 
                                        @description, @amount, @transactionType, @category, 
                                        @pending, GETUTCDATE())
                            `);
                    }
                }

                // 6. Insert Bank Transactions
                const recentTransactions = userData.recentTransactions || [];
                for (const transactionData of recentTransactions) {
                    const accountType = transactionData.account || 'checking';
                    const accountId = accountIds[accountType];
                    
                    if (accountId) {
                        await transaction.request()
                            .input('transactionId', sql.UniqueIdentifier, this.generateUUID())
                            .input('userId', sql.UniqueIdentifier, userId)
                            .input('accountId', sql.UniqueIdentifier, accountId)
                            .input('transactionDate', sql.Date, transactionData.date)
                            .input('description', sql.NVarChar(500), transactionData.description || '')
                            .input('amount', sql.Decimal(15, 2), transactionData.amount || 0)
                            .input('transactionType', sql.NVarChar(50), transactionData.type || '')
                            .input('category', sql.NVarChar(50), transactionData.category || '')
                            .input('icon', sql.NVarChar(50), transactionData.icon || '')
                            .query(`
                                INSERT INTO BankTransactions (TransactionId, UserId, AccountId, 
                                                            TransactionDate, Description, Amount, 
                                                            TransactionType, Category, Icon, IsPending, 
                                                            CreatedAt)
                                VALUES (@transactionId, @userId, @accountId, @transactionDate, 
                                        @description, @amount, @transactionType, @category, 
                                        @icon, 0, GETUTCDATE())
                            `);
                    }
                }

                await transaction.commit();
                console.log(`✅ Successfully migrated user: ${credentials.username || 'Unknown'}`);
                return true;

            } catch (error) {
                await transaction.rollback();
                throw error;
            }

        } catch (error) {
            console.error(`❌ Error migrating user data from ${jsonFilePath}:`, error.message);
            return false;
        }
    }

    async migrateAllUsers() {
        const sampleDataDir = path.join(__dirname, '..', 'sample-data');
        const jsonFiles = fs.readdirSync(sampleDataDir).filter(file => file.endsWith('.json'));
        
        let successCount = 0;
        const totalCount = jsonFiles.length;
        
        console.log(`🚀 Starting migration of ${totalCount} users...`);
        
        for (const jsonFile of jsonFiles) {
            const filePath = path.join(sampleDataDir, jsonFile);
            if (await this.migrateUserData(filePath)) {
                successCount++;
            }
        }
        
        console.log(`\n🎉 Migration complete!`);
        console.log(`✅ Successfully migrated: ${successCount}/${totalCount} users`);
        if (successCount < totalCount) {
            console.log(`❌ Failed to migrate: ${totalCount - successCount} users`);
        }
    }
}

async function main() {
    console.log('🏦 Blue Mountain Bank - Node.js Azure SQL Migration Tool');
    console.log('=' * 60);
    
    // Check environment variables
    if (!sqlConfig.server || !sqlConfig.database || !sqlConfig.user || !sqlConfig.password) {
        console.log('❌ Missing environment variables. Please check your .env file.');
        console.log('Required variables:');
        console.log('  - AZURE_SQL_SERVER');
        console.log('  - AZURE_SQL_DATABASE');
        console.log('  - AZURE_SQL_USERNAME');
        console.log('  - AZURE_SQL_PASSWORD');
        process.exit(1);
    }
    
    const migrator = new NodeJSMigrator();
    
    try {
        const connected = await migrator.connect();
        if (!connected) {
            process.exit(1);
        }
        
        await migrator.migrateAllUsers();
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await migrator.disconnect();
    }
}

// Run migration
main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
