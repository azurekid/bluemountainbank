#!/usr/bin/env node

/**
 * Azure SQL Database Connection Test
 * Tests connectivity and basic operations for Blue Mountain Bank
 */

const AzureSQLManager = require('./js/azure-sql-manager');
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
        trustServerCertificate: false
    }
};

async function testAzureSQLConnection() {
    console.log('🏦 Blue Mountain Bank - Azure SQL Connection Test');
    console.log('=' * 55);
    
    if (!sqlConfig.server || !sqlConfig.database || !sqlConfig.user || !sqlConfig.password) {
        console.log('❌ Missing environment variables. Please check your .env file.');
        console.log('Required variables:');
        console.log('  - AZURE_SQL_SERVER');
        console.log('  - AZURE_SQL_DATABASE'); 
        console.log('  - AZURE_SQL_USERNAME');
        console.log('  - AZURE_SQL_PASSWORD');
        process.exit(1);
    }
    
    const dbManager = new AzureSQLManager(sqlConfig);
    
    try {
        // Test 1: Connection
        console.log('\n🔌 Test 1: Database Connection');
        const connected = await dbManager.connect();
        
        if (!connected) {
            console.log('❌ Failed to connect to Azure SQL Database');
            process.exit(1);
        }
        
        // Test 2: Check tables exist
        console.log('\n📋 Test 2: Database Schema');
        try {
            const request = dbManager.pool.request();
            const result = await request.query(`
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
            `);
            
            const expectedTables = [
                'BankAccounts',
                'BankTransactions', 
                'CreditCards',
                'CreditCardTransactions',
                'UserPreferences',
                'UserProfiles',
                'Users'
            ];
            
            const existingTables = result.recordset.map(row => row.TABLE_NAME);
            
            console.log('📊 Found tables:');
            existingTables.forEach(table => {
                const exists = expectedTables.includes(table);
                console.log(`  ${exists ? '✅' : '⚠️'} ${table}`);
            });
            
            const missingTables = expectedTables.filter(table => !existingTables.includes(table));
            if (missingTables.length > 0) {
                console.log('\n❌ Missing tables:');
                missingTables.forEach(table => console.log(`  - ${table}`));
                console.log('\nPlease run the database schema script first.');
            } else {
                console.log('✅ All required tables found');
            }
            
        } catch (error) {
            console.log('❌ Failed to check database schema:', error.message);
        }
        
        // Test 3: Check for sample data
        console.log('\n👥 Test 3: Sample Data');
        try {
            const request = dbManager.pool.request();
            const result = await request.query('SELECT COUNT(*) as UserCount FROM Users');
            const userCount = result.recordset[0].UserCount;
            
            console.log(`📊 Users in database: ${userCount}`);
            
            if (userCount === 0) {
                console.log('⚠️  No users found. Consider running the data migration script.');
            } else {
                console.log('✅ Sample data found');
                
                // Show sample user
                const userRequest = dbManager.pool.request();
                const userResult = await userRequest.query(`
                    SELECT TOP 1 u.Username, u.Email, p.FirstName, p.LastName
                    FROM Users u
                    LEFT JOIN UserProfiles p ON u.UserId = p.UserId
                `);
                
                if (userResult.recordset.length > 0) {
                    const user = userResult.recordset[0];
                    console.log(`📝 Sample user: ${user.FirstName} ${user.LastName} (${user.Username})`);
                }
            }
            
        } catch (error) {
            console.log('❌ Failed to check sample data:', error.message);
        }
        
        // Test 4: Test authentication query
        console.log('\n🔐 Test 4: Authentication Query');
        try {
            // Test with a known username (if exists)
            const authRequest = dbManager.pool.request();
            authRequest.input('username', 'alice.martinez');
            
            const authResult = await authRequest.query(`
                SELECT u.UserId, u.Username, u.Email, u.PasswordHash,
                       p.FirstName, p.LastName
                FROM Users u
                LEFT JOIN UserProfiles p ON u.UserId = p.UserId
                WHERE u.Username = @username AND u.IsActive = 1
            `);
            
            if (authResult.recordset.length > 0) {
                console.log('✅ Authentication query successful');
                console.log(`📝 Found user: ${authResult.recordset[0].Username}`);
            } else {
                console.log('⚠️  No users found for authentication test');
            }
            
        } catch (error) {
            console.log('❌ Authentication query failed:', error.message);
        }
        
        // Test 5: Performance test
        console.log('\n⚡ Test 5: Performance Test');
        try {
            const startTime = Date.now();
            
            const perfRequest = dbManager.pool.request();
            await perfRequest.query('SELECT 1 as TestValue');
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`📊 Simple query took: ${duration}ms`);
            
            if (duration < 100) {
                console.log('✅ Excellent performance');
            } else if (duration < 500) {
                console.log('✅ Good performance');
            } else {
                console.log('⚠️  Slow performance - check network connection');
            }
            
        } catch (error) {
            console.log('❌ Performance test failed:', error.message);
        }
        
        // Summary
        console.log('\n📋 Test Summary');
        console.log('✅ Connection test completed');
        console.log('\n🚀 Next steps:');
        console.log('1. Start the API server: npm start');
        console.log('2. Test the health endpoint: http://localhost:3001/health');
        console.log('3. Open login.html and test authentication');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        process.exit(1);
    } finally {
        await dbManager.disconnect();
    }
}

// Run the test
testAzureSQLConnection().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
