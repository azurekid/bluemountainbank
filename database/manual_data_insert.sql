-- Manual Data Insert Script for Blue Mountain Bank
-- Run this script in Azure Portal Query Editor or SQL Server Management Studio
-- This will insert all sample user data into your Azure SQL Database

-- Disable foreign key checks temporarily (if needed)
-- ALTER TABLE UserProfiles NOCHECK CONSTRAINT ALL;
-- ALTER TABLE UserPreferences NOCHECK CONSTRAINT ALL;
-- ALTER TABLE BankAccounts NOCHECK CONSTRAINT ALL;
-- ALTER TABLE CreditCards NOCHECK CONSTRAINT ALL;
-- ALTER TABLE BankTransactions NOCHECK CONSTRAINT ALL;
-- ALTER TABLE CreditCardTransactions NOCHECK CONSTRAINT ALL;

-- Clean existing data (optional - remove if you want to keep existing data)
-- DELETE FROM CreditCardTransactions;
-- DELETE FROM BankTransactions;
-- DELETE FROM CreditCards;
-- DELETE FROM BankAccounts;
-- DELETE FROM UserPreferences;
-- DELETE FROM UserProfiles;
-- DELETE FROM Users;

-- Insert Users
INSERT INTO Users (UserId, Username, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt) VALUES
    (NEWID(), 'alice.martinez', 'alice.martinez@email.com', 'ec4874af59fe23a3f555276a4ebfa20a3e3ccaa5cd535065d6052db5e7bf5d01', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'bob.johnson', 'bob.johnson@email.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'carol.smith', 'carol.smith@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'david.wilson', 'david.wilson@email.com', '1c142b2d01aa34e9a36bde480645a57fd69c14ad24234b89f6be4d8b29e2e43b', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'emma.brown', 'emma.brown@email.com', 'a4a58e8c8c3c2b6f7d4b8c8e8f7a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'frank.miller', 'frank.miller@email.com', 'b5b69f9d9d4d3c7a8e5c9d9f8a0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b', 1, GETUTCDATE(), GETUTCDATE());

-- Get user IDs for reference
DECLARE @alice_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'alice.martinez');
DECLARE @bob_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'bob.johnson');
DECLARE @carol_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'carol.smith');
DECLARE @david_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'david.wilson');
DECLARE @emma_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'emma.brown');
DECLARE @frank_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'frank.miller');

-- Insert User Profiles
INSERT INTO UserProfiles (ProfileId, UserId, FirstName, LastName, Age, Profession, Phone, Address, JoinDate, Avatar, AccountNumber, SSN, DateOfBirth, MothersMaidenName, CreatedAt, UpdatedAt) VALUES
    (NEWID(), @alice_id, 'Alice', 'Martinez', 28, 'Software Engineer', '(555) 123-4567', '1234 Tech Avenue, San Francisco, CA 94105', '2022-03-15', 'AM', '****-1234', '197-99-2337', '1989-01-23', 'Smith', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_id, 'Bob', 'Johnson', 35, 'Marketing Manager', '(555) 234-5678', '5678 Business Blvd, New York, NY 10001', '2021-07-22', 'BJ', '****-5678', '234-56-7890', '1988-11-15', 'Williams', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_id, 'Carol', 'Smith', 42, 'Financial Analyst', '(555) 345-6789', '9012 Finance Street, Chicago, IL 60601', '2020-01-10', 'CS', '****-9012', '345-67-8901', '1981-05-30', 'Davis', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @david_id, 'David', 'Wilson', 29, 'Graphic Designer', '(555) 456-7890', '3456 Creative Lane, Austin, TX 73301', '2022-09-05', 'DW', '****-3456', '456-78-9012', '1994-08-12', 'Miller', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @emma_id, 'Emma', 'Brown', 31, 'Teacher', '(555) 567-8901', '7890 Education Drive, Seattle, WA 98101', '2021-02-18', 'EB', '****-7890', '567-89-0123', '1992-12-03', 'Anderson', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @frank_id, 'Frank', 'Miller', 38, 'Sales Representative', '(555) 678-9012', '2345 Commerce Road, Miami, FL 33101', '2020-11-30', 'FM', '****-2345', '678-90-1234', '1985-03-20', 'Wilson', GETUTCDATE(), GETUTCDATE());

-- Insert User Preferences
INSERT INTO UserPreferences (PreferenceId, UserId, Theme, DarkMode, Language, Currency, Notifications, EmailAlerts, SmsAlerts, CreatedAt, UpdatedAt) VALUES
    (NEWID(), @alice_id, 'light', 0, 'en-US', 'USD', 1, 1, 0, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_id, 'dark', 1, 'en-US', 'USD', 1, 1, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_id, 'light', 0, 'en-US', 'USD', 1, 1, 0, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @david_id, 'dark', 1, 'en-US', 'USD', 1, 0, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @emma_id, 'light', 0, 'en-US', 'USD', 1, 1, 0, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @frank_id, 'light', 0, 'en-US', 'USD', 1, 1, 1, GETUTCDATE(), GETUTCDATE());

-- Insert Bank Accounts
INSERT INTO BankAccounts (AccountId, UserId, AccountType, AccountNumber, AccountName, Balance, CreditLimit, IsActive, CreatedAt, UpdatedAt) VALUES
    -- Alice's accounts
    (NEWID(), @alice_id, 'checking', '1234567890', 'Primary Checking', 15420.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @alice_id, 'savings', '1234567891', 'High Yield Savings', 45000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @alice_id, 'investment', '1234567892', 'Investment Account', 25000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Bob's accounts
    (NEWID(), @bob_id, 'checking', '2345678901', 'Primary Checking', 8750.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_id, 'savings', '2345678902', 'Emergency Savings', 32000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_id, 'investment', '2345678903', 'Investment Account', 18500.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Carol's accounts
    (NEWID(), @carol_id, 'checking', '3456789012', 'Primary Checking', 12300.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_id, 'savings', '3456789013', 'Savings Account', 67000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_id, 'investment', '3456789014', 'Investment Portfolio', 95000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- David's accounts
    (NEWID(), @david_id, 'checking', '4567890123', 'Primary Checking', 6800.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @david_id, 'savings', '4567890124', 'Savings Account', 15000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Emma's accounts
    (NEWID(), @emma_id, 'checking', '5678901234', 'Primary Checking', 4200.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @emma_id, 'savings', '5678901235', 'Teacher Savings', 28000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Frank's accounts
    (NEWID(), @frank_id, 'checking', '6789012345', 'Primary Checking', 9500.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @frank_id, 'savings', '6789012346', 'Vacation Fund', 12000.00, NULL, 1, GETUTCDATE(), GETUTCDATE());

-- Insert Credit Cards
INSERT INTO CreditCards (CardId, UserId, CardType, CardBrand, CardNumber, ExpiryMonth, ExpiryYear, CVV, CardName, Balance, CreditLimit, IsActive, CreatedAt, UpdatedAt) VALUES
    -- Alice's cards
    (NEWID(), @alice_id, 'primary', 'Visa', '4000000000000101', 10, 2028, '682', 'Primary Visa Card', 1250.00, 15000.00, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @alice_id, 'rewards', 'Mastercard', '5000000000000102', 8, 2027, '458', 'Rewards Mastercard', 890.00, 10000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Bob's cards
    (NEWID(), @bob_id, 'primary', 'Visa', '4000000000000201', 12, 2026, '123', 'Business Visa', 2100.00, 20000.00, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_id, 'cashback', 'Amex', '3000000000000202', 6, 2027, '456', 'Cashback Amex', 650.00, 8000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Carol's cards
    (NEWID(), @carol_id, 'primary', 'Visa', '4000000000000301', 4, 2029, '789', 'Premium Visa', 3200.00, 25000.00, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_id, 'platinum', 'Mastercard', '5000000000000302', 11, 2028, '234', 'Platinum Mastercard', 1800.00, 15000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- David's cards
    (NEWID(), @david_id, 'primary', 'Visa', '4000000000000401', 9, 2026, '567', 'Student Visa', 450.00, 5000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Emma's cards
    (NEWID(), @emma_id, 'primary', 'Mastercard', '5000000000000501', 3, 2027, '890', 'Teacher Mastercard', 320.00, 7500.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Frank's cards
    (NEWID(), @frank_id, 'primary', 'Visa', '4000000000000601', 7, 2028, '345', 'Travel Visa', 1100.00, 12000.00, 1, GETUTCDATE(), GETUTCDATE());

-- Sample Bank Transactions (recent transactions for checking accounts)
DECLARE @alice_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @alice_id AND AccountType = 'checking');
DECLARE @bob_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @bob_id AND AccountType = 'checking');
DECLARE @carol_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @carol_id AND AccountType = 'checking');

INSERT INTO BankTransactions (TransactionId, UserId, AccountId, TransactionDate, Description, Amount, TransactionType, Category, Icon, IsPending, CreatedAt) VALUES
    -- Alice's transactions
    (NEWID(), @alice_id, @alice_checking, '2025-01-05', 'Salary Deposit', 5200.00, 'deposit', 'salary', '💰', 0, GETUTCDATE()),
    (NEWID(), @alice_id, @alice_checking, '2025-01-04', 'Grocery Store', -89.50, 'debit', 'groceries', '🛒', 0, GETUTCDATE()),
    (NEWID(), @alice_id, @alice_checking, '2025-01-03', 'Coffee Shop', -12.75, 'debit', 'dining', '☕', 0, GETUTCDATE()),
    (NEWID(), @alice_id, @alice_checking, '2025-01-02', 'Gas Station', -45.20, 'debit', 'transportation', '⛽', 0, GETUTCDATE()),
    
    -- Bob's transactions
    (NEWID(), @bob_id, @bob_checking, '2025-01-05', 'Client Payment', 3200.00, 'deposit', 'business', '💼', 0, GETUTCDATE()),
    (NEWID(), @bob_id, @bob_checking, '2025-01-04', 'Restaurant', -67.80, 'debit', 'dining', '🍽️', 0, GETUTCDATE()),
    (NEWID(), @bob_id, @bob_checking, '2025-01-03', 'Office Supplies', -156.30, 'debit', 'business', '📋', 0, GETUTCDATE()),
    
    -- Carol's transactions
    (NEWID(), @carol_id, @carol_checking, '2025-01-05', 'Consulting Fee', 4500.00, 'deposit', 'consulting', '💰', 0, GETUTCDATE()),
    (NEWID(), @carol_id, @carol_checking, '2025-01-04', 'Utility Bill', -234.50, 'debit', 'utilities', '⚡', 0, GETUTCDATE()),
    (NEWID(), @carol_id, @carol_checking, '2025-01-03', 'Pharmacy', -28.95, 'debit', 'healthcare', '💊', 0, GETUTCDATE());

-- Sample Credit Card Transactions
DECLARE @alice_visa UNIQUEIDENTIFIER = (SELECT TOP 1 CardId FROM CreditCards WHERE UserId = @alice_id AND CardType = 'primary');
DECLARE @bob_visa UNIQUEIDENTIFIER = (SELECT TOP 1 CardId FROM CreditCards WHERE UserId = @bob_id AND CardType = 'primary');

INSERT INTO CreditCardTransactions (TransactionId, UserId, CardId, TransactionDate, Description, Amount, TransactionType, Category, IsPending, CreatedAt) VALUES
    -- Alice's credit card transactions
    (NEWID(), @alice_id, @alice_visa, '2025-01-05', 'Amazon Purchase', -89.99, 'purchase', 'shopping', 0, GETUTCDATE()),
    (NEWID(), @alice_id, @alice_visa, '2025-01-04', 'Netflix Subscription', -15.99, 'subscription', 'entertainment', 0, GETUTCDATE()),
    (NEWID(), @alice_id, @alice_visa, '2025-01-03', 'Uber Ride', -23.50, 'transport', 'transportation', 0, GETUTCDATE()),
    
    -- Bob's credit card transactions
    (NEWID(), @bob_id, @bob_visa, '2025-01-05', 'Hotel Booking', -245.00, 'travel', 'travel', 0, GETUTCDATE()),
    (NEWID(), @bob_id, @bob_visa, '2025-01-04', 'Business Lunch', -78.50, 'dining', 'business', 0, GETUTCDATE()),
    (NEWID(), @bob_id, @bob_visa, '2025-01-03', 'Software License', -299.00, 'subscription', 'business', 0, GETUTCDATE());

-- Re-enable foreign key checks
-- ALTER TABLE UserProfiles CHECK CONSTRAINT ALL;
-- ALTER TABLE UserPreferences CHECK CONSTRAINT ALL;
-- ALTER TABLE BankAccounts CHECK CONSTRAINT ALL;
-- ALTER TABLE CreditCards CHECK CONSTRAINT ALL;
-- ALTER TABLE BankTransactions CHECK CONSTRAINT ALL;
-- ALTER TABLE CreditCardTransactions CHECK CONSTRAINT ALL;

-- Verify data insertion
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM Users
UNION ALL
SELECT 'UserProfiles', COUNT(*) FROM UserProfiles
UNION ALL
SELECT 'UserPreferences', COUNT(*) FROM UserPreferences
UNION ALL
SELECT 'BankAccounts', COUNT(*) FROM BankAccounts
UNION ALL
SELECT 'CreditCards', COUNT(*) FROM CreditCards
UNION ALL
SELECT 'BankTransactions', COUNT(*) FROM BankTransactions
UNION ALL
SELECT 'CreditCardTransactions', COUNT(*) FROM CreditCardTransactions;

-- Test query to verify user data
SELECT 
    u.Username,
    up.FirstName + ' ' + up.LastName as FullName,
    up.Profession,
    COUNT(DISTINCT ba.AccountId) as NumberOfAccounts,
    COUNT(DISTINCT cc.CardId) as NumberOfCards
FROM Users u
JOIN UserProfiles up ON u.UserId = up.UserId
LEFT JOIN BankAccounts ba ON u.UserId = ba.UserId
LEFT JOIN CreditCards cc ON u.UserId = cc.UserId
GROUP BY u.Username, up.FirstName, up.LastName, up.Profession
ORDER BY u.Username;
