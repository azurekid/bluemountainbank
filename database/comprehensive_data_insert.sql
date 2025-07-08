-- Comprehensive Blue Mountain Bank Data Insert Script
-- Contains ALL actual data from sample-data JSON files
-- Generated based on real user data: Alice Martinez, Bob Johnson, Carol Smith, David Wilson, Emma Brown, Frank Miller

-- Clean existing data (optional - uncomment to clear existing data)
-- DELETE FROM CreditCardTransactions;
-- DELETE FROM BankTransactions;
-- DELETE FROM CreditCards;
-- DELETE FROM BankAccounts;
-- DELETE FROM UserPreferences;
-- DELETE FROM UserProfiles;
-- DELETE FROM Users;

-- ================================================
-- INSERT USERS (with actual credentials from JSON)
-- ================================================
INSERT INTO Users (UserId, Username, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt) VALUES
    (NEWID(), 'alice.martinez', 'alice.martinez@email.com', 'ec4874af59fe23a3f555276a4ebfa20a3e3ccaa5cd535065d6052db5e7bf5d01', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'bob.johnson', 'bob.johnson@email.com', '7552dd66eb5496ddfed93eafe079b50f123c6e13af2967d3d4bc39a7455200a6', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'carol.smith', 'carol.smith@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'david.wilson', 'david.wilson@email.com', '1c142b2d01aa34e9a36bde480645a57fd69c14ad24234b89f6be4d8b29e2e43b', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'emma.brown', 'emma.brown@email.com', 'a4a58e8c8c3c2b6f7d4b8c8e8f7a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'frank.miller', 'frank.miller@email.com', 'b5b69f9d9d4d3c7a8e5c9d9f8a0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b', 1, GETUTCDATE(), GETUTCDATE());

-- Get user IDs for reference
DECLARE @alice_martinez_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'alice.martinez');
DECLARE @bob_johnson_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'bob.johnson');
DECLARE @carol_smith_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'carol.smith');
DECLARE @david_wilson_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'david.wilson');
DECLARE @emma_brown_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'emma.brown');
DECLARE @frank_miller_id UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Username = 'frank.miller');

-- ================================================
-- INSERT USER PROFILES (with actual profile data)
-- ================================================
INSERT INTO UserProfiles (ProfileId, UserId, FirstName, LastName, Age, Profession, Phone, Address, JoinDate, Avatar, AccountNumber, SSN, DateOfBirth, MothersMaidenName, CreatedAt, UpdatedAt) VALUES
    (NEWID(), @alice_martinez_id, 'Alice', 'Martinez', 28, 'Software Engineer', '(555) 123-4567', '1234 Tech Avenue, San Francisco, CA 94105', '2022-03-15', 'AM', '****-1234', '197-99-2337', '1989-01-23', 'Smith', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_johnson_id, 'Bob', 'Johnson', 45, 'Small Business Owner', '(555) 234-5678', '5678 Main Street, Denver, CO 80202', '2019-08-22', 'BJ', '****-5678', '172-34-6515', '1988-05-29', 'Davis', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_smith_id, 'Carol', 'Smith', 42, 'Financial Analyst', '(555) 345-6789', '9012 Finance Street, Chicago, IL 60601', '2020-01-10', 'CS', '****-9012', '345-67-8901', '1981-05-30', 'Miller', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @david_wilson_id, 'David', 'Wilson', 29, 'Graphic Designer', '(555) 456-7890', '3456 Creative Lane, Austin, TX 73301', '2022-09-05', 'DW', '****-3456', '456-78-9012', '1994-08-12', 'Rodriguez', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @emma_brown_id, 'Emma', 'Brown', 31, 'Teacher', '(555) 567-8901', '7890 Education Drive, Seattle, WA 98101', '2021-02-18', 'EB', '****-7890', '567-89-0123', '1992-12-03', 'Anderson', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @frank_miller_id, 'Frank', 'Miller', 38, 'Sales Representative', '(555) 678-9012', '2345 Commerce Road, Miami, FL 33101', '2020-11-30', 'FM', '****-2345', '678-90-1234', '1985-03-20', 'Wilson', GETUTCDATE(), GETUTCDATE());

-- ================================================
-- INSERT USER PREFERENCES (with actual preferences)
-- ================================================
INSERT INTO UserPreferences (PreferenceId, UserId, Theme, DarkMode, Language, Currency, Notifications, EmailAlerts, SmsAlerts, CreatedAt, UpdatedAt) VALUES
    (NEWID(), @alice_martinez_id, 'dark', 1, 'en-US', 'USD', 1, 1, 0, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_johnson_id, 'light', 0, 'en-US', 'USD', 1, 1, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_smith_id, 'light', 0, 'en-US', 'USD', 1, 1, 0, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @david_wilson_id, 'dark', 1, 'en-US', 'USD', 1, 0, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @emma_brown_id, 'light', 0, 'en-US', 'USD', 1, 1, 0, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @frank_miller_id, 'light', 0, 'en-US', 'USD', 1, 1, 1, GETUTCDATE(), GETUTCDATE());

-- ================================================
-- INSERT BANK ACCOUNTS (with actual account data)
-- ================================================
INSERT INTO BankAccounts (AccountId, UserId, AccountType, AccountNumber, AccountName, Balance, CreditLimit, IsActive, CreatedAt, UpdatedAt) VALUES
    -- Alice Martinez accounts
    (NEWID(), @alice_martinez_id, 'checking', 'CHK-001-1234', 'Premium Checking', 8750.43, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @alice_martinez_id, 'savings', 'SAV-001-1234', 'High Yield Savings', 25300.89, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Bob Johnson accounts
    (NEWID(), @bob_johnson_id, 'checking', 'CHK-002-5678', 'Business Checking', 12450.67, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_johnson_id, 'savings', 'SAV-002-5678', 'Business Savings', 45000.23, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Carol Smith accounts
    (NEWID(), @carol_smith_id, 'checking', 'CHK-003-9012', 'Premium Checking', 18750.90, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_smith_id, 'savings', 'SAV-003-9012', 'Investment Savings', 67000.50, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_smith_id, 'investment', 'INV-003-9012', 'Portfolio Account', 125000.75, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- David Wilson accounts
    (NEWID(), @david_wilson_id, 'checking', 'CHK-004-3456', 'Student Checking', 3200.45, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @david_wilson_id, 'savings', 'SAV-004-3456', 'Emergency Fund', 8500.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Emma Brown accounts
    (NEWID(), @emma_brown_id, 'checking', 'CHK-005-7890', 'Teacher Checking', 4200.30, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @emma_brown_id, 'savings', 'SAV-005-7890', 'Vacation Fund', 12000.00, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Frank Miller accounts
    (NEWID(), @frank_miller_id, 'checking', 'CHK-006-2345', 'Sales Checking', 9500.85, NULL, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @frank_miller_id, 'savings', 'SAV-006-2345', 'Commission Savings', 28000.60, NULL, 1, GETUTCDATE(), GETUTCDATE());

-- ================================================
-- INSERT CREDIT CARDS (with actual card data)
-- ================================================
INSERT INTO CreditCards (CardId, UserId, CardType, CardBrand, CardNumber, ExpiryMonth, ExpiryYear, CVV, CardName, Balance, CreditLimit, IsActive, CreatedAt, UpdatedAt) VALUES
    -- Alice Martinez cards
    (NEWID(), @alice_martinez_id, 'primary', 'Visa', '4000000000000101', 10, 2028, '682', 'Primary Visa Card', 3207.54, 5000.00, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @alice_martinez_id, 'rewards', 'Mastercard', '5424000000000015', 2, 2025, '618', 'Rewards Mastercard', 3339.43, 8000.00, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @alice_martinez_id, 'backup', 'Amex', '371449635398431', 5, 2030, '5693', 'Travel Amex Card', 3866.58, 10000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Bob Johnson cards
    (NEWID(), @bob_johnson_id, 'primary', 'Visa', '4000000000000002', 9, 2030, '206', 'Primary Visa Card', 2655.09, 5000.00, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @bob_johnson_id, 'business', 'Mastercard', '5424000000000023', 12, 2026, '345', 'Business Mastercard', 4200.75, 15000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Carol Smith cards
    (NEWID(), @carol_smith_id, 'primary', 'Visa', '4000000000000003', 4, 2029, '789', 'Premium Visa', 1850.25, 25000.00, 1, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @carol_smith_id, 'platinum', 'Amex', '371449635398432', 11, 2028, '234', 'Platinum Amex', 3500.50, 20000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- David Wilson cards
    (NEWID(), @david_wilson_id, 'primary', 'Visa', '4000000000000004', 9, 2026, '567', 'Student Visa', 850.30, 2500.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Emma Brown cards
    (NEWID(), @emma_brown_id, 'primary', 'Mastercard', '5424000000000031', 3, 2027, '890', 'Teacher Mastercard', 650.75, 5000.00, 1, GETUTCDATE(), GETUTCDATE()),
    
    -- Frank Miller cards
    (NEWID(), @frank_miller_id, 'primary', 'Visa', '4000000000000005', 7, 2028, '345', 'Travel Visa', 1850.40, 12000.00, 1, GETUTCDATE(), GETUTCDATE());

-- ================================================
-- SAMPLE BANK TRANSACTIONS (Recent Real Transactions)
-- ================================================

-- Get account IDs for transactions
DECLARE @alice_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @alice_martinez_id AND AccountType = 'checking');
DECLARE @alice_savings UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @alice_martinez_id AND AccountType = 'savings');
DECLARE @bob_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @bob_johnson_id AND AccountType = 'checking');
DECLARE @carol_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @carol_smith_id AND AccountType = 'checking');
DECLARE @david_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @david_wilson_id AND AccountType = 'checking');
DECLARE @emma_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @emma_brown_id AND AccountType = 'checking');
DECLARE @frank_checking UNIQUEIDENTIFIER = (SELECT TOP 1 AccountId FROM BankAccounts WHERE UserId = @frank_miller_id AND AccountType = 'checking');

INSERT INTO BankTransactions (TransactionId, UserId, AccountId, TransactionDate, Description, Amount, TransactionType, Category, Icon, IsPending, CreatedAt) VALUES
    -- Alice Martinez recent transactions (from JSON)
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-07-15', 'Credit Card Payment', -915.00, 'withdrawal', 'payment', 'fas fa-credit-card', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-07-04', 'Rent Payment - Bay Area Apartments', -2607.00, 'withdrawal', 'housing', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-07-01', 'Salary Deposit - Software Engineer', 8500.00, 'deposit', 'income', 'fas fa-money-bill-wave', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-06-27', 'Phone - Verizon', -75.00, 'withdrawal', 'utilities', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-06-22', 'Health Insurance', -263.00, 'withdrawal', 'insurance', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-06-16', 'Electric Bill - PG&E', -85.00, 'withdrawal', 'utilities', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-06-15', 'Credit Card Payment', -1338.00, 'withdrawal', 'payment', 'fas fa-credit-card', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-06-14', 'Internet - Comcast', -89.00, 'withdrawal', 'utilities', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-06-14', 'Car Insurance', -158.00, 'withdrawal', 'insurance', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_checking, '2025-06-07', 'Spotify Premium', -9.99, 'withdrawal', 'entertainment', 'fas fa-exchange-alt', 0, GETUTCDATE()),
    
    -- Bob Johnson transactions
    (NEWID(), @bob_johnson_id, @bob_checking, '2025-07-01', 'Business Revenue Deposit', 12500.00, 'deposit', 'business', 'fas fa-money-bill-wave', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_checking, '2025-06-28', 'Office Rent', -3200.00, 'withdrawal', 'business', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_checking, '2025-06-25', 'Business Insurance', -450.00, 'withdrawal', 'insurance', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_checking, '2025-06-20', 'Equipment Purchase', -1850.00, 'withdrawal', 'business', 'fas fa-exchange-alt', 0, GETUTCDATE()),
    
    -- Carol Smith transactions
    (NEWID(), @carol_smith_id, @carol_checking, '2025-07-01', 'Consulting Fee', 8500.00, 'deposit', 'consulting', 'fas fa-money-bill-wave', 0, GETUTCDATE()),
    (NEWID(), @carol_smith_id, @carol_checking, '2025-06-30', 'Investment Transfer', -15000.00, 'withdrawal', 'investment', 'fas fa-exchange-alt', 0, GETUTCDATE()),
    (NEWID(), @carol_smith_id, @carol_checking, '2025-06-25', 'Mortgage Payment', -2800.00, 'withdrawal', 'housing', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    
    -- David Wilson transactions
    (NEWID(), @david_wilson_id, @david_checking, '2025-07-01', 'Freelance Design Payment', 2500.00, 'deposit', 'freelance', 'fas fa-money-bill-wave', 0, GETUTCDATE()),
    (NEWID(), @david_wilson_id, @david_checking, '2025-06-28', 'Student Loan Payment', -350.00, 'withdrawal', 'education', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    (NEWID(), @david_wilson_id, @david_checking, '2025-06-25', 'Rent Payment', -1200.00, 'withdrawal', 'housing', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    
    -- Emma Brown transactions
    (NEWID(), @emma_brown_id, @emma_checking, '2025-07-01', 'Teacher Salary', 3800.00, 'deposit', 'salary', 'fas fa-money-bill-wave', 0, GETUTCDATE()),
    (NEWID(), @emma_brown_id, @emma_checking, '2025-06-25', 'School Supplies', -245.00, 'withdrawal', 'education', 'fas fa-exchange-alt', 0, GETUTCDATE()),
    (NEWID(), @emma_brown_id, @emma_checking, '2025-06-20', 'Rent Payment', -1100.00, 'withdrawal', 'housing', 'fas fa-file-invoice-dollar', 0, GETUTCDATE()),
    
    -- Frank Miller transactions
    (NEWID(), @frank_miller_id, @frank_checking, '2025-07-01', 'Sales Commission', 5200.00, 'deposit', 'commission', 'fas fa-money-bill-wave', 0, GETUTCDATE()),
    (NEWID(), @frank_miller_id, @frank_checking, '2025-06-28', 'Travel Expenses', -890.00, 'withdrawal', 'travel', 'fas fa-exchange-alt', 0, GETUTCDATE()),
    (NEWID(), @frank_miller_id, @frank_checking, '2025-06-25', 'Car Payment', -485.00, 'withdrawal', 'transportation', 'fas fa-file-invoice-dollar', 0, GETUTCDATE());

-- ================================================
-- SAMPLE CREDIT CARD TRANSACTIONS (Real Recent Transactions)
-- ================================================

-- Get credit card IDs
DECLARE @alice_primary_card UNIQUEIDENTIFIER = (SELECT TOP 1 CardId FROM CreditCards WHERE UserId = @alice_martinez_id AND CardType = 'primary');
DECLARE @alice_rewards_card UNIQUEIDENTIFIER = (SELECT TOP 1 CardId FROM CreditCards WHERE UserId = @alice_martinez_id AND CardType = 'rewards');
DECLARE @bob_primary_card UNIQUEIDENTIFIER = (SELECT TOP 1 CardId FROM CreditCards WHERE UserId = @bob_johnson_id AND CardType = 'primary');
DECLARE @carol_primary_card UNIQUEIDENTIFIER = (SELECT TOP 1 CardId FROM CreditCards WHERE UserId = @carol_smith_id AND CardType = 'primary');

INSERT INTO CreditCardTransactions (TransactionId, UserId, CardId, TransactionDate, Description, Amount, TransactionType, Category, IsPending, CreatedAt) VALUES
    -- Alice Martinez primary card transactions (from JSON)
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-07-05', 'Arco', -55.96, 'purchase', 'gas', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-07-04', 'Costco Wholesale', -71.57, 'purchase', 'groceries', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-07-03', 'Starbucks', -27.61, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-07-03', 'Disney+', -44.55, 'purchase', 'entertainment', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-06-29', 'Walmart Supercenter', -164.16, 'purchase', 'groceries', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-06-28', 'McDonalds', -61.57, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-06-26', 'Taco Bell', -35.70, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-06-05', 'Amazon.com', -316.76, 'purchase', 'shopping', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_primary_card, '2025-05-16', 'Payment - Thank You', 1064.00, 'payment', 'payment', 0, GETUTCDATE()),
    
    -- Alice Martinez rewards card transactions
    (NEWID(), @alice_martinez_id, @alice_rewards_card, '2025-07-04', 'Marriott Hotels', -218.26, 'purchase', 'hotels', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_rewards_card, '2025-07-01', 'Exxon Mobil', -58.67, 'purchase', 'gas', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_rewards_card, '2025-06-30', 'McDonalds', -46.50, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_rewards_card, '2025-06-25', 'Subway', -72.67, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @alice_martinez_id, @alice_rewards_card, '2025-06-15', 'Payment - Thank You', 1193.00, 'payment', 'payment', 0, GETUTCDATE()),
    
    -- Bob Johnson primary card transactions
    (NEWID(), @bob_johnson_id, @bob_primary_card, '2025-07-01', 'McDonalds', -44.35, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_primary_card, '2025-07-01', 'Hampton Inn', -337.67, 'purchase', 'hotels', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_primary_card, '2025-06-30', 'Walmart Supercenter', -39.73, 'purchase', 'groceries', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_primary_card, '2025-06-29', 'Olive Garden', -31.23, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_primary_card, '2025-06-28', 'Taco Bell', -22.26, 'purchase', 'restaurants', 0, GETUTCDATE()),
    (NEWID(), @bob_johnson_id, @bob_primary_card, '2025-06-28', 'Texaco', -58.31, 'purchase', 'gas', 0, GETUTCDATE()),
    
    -- Carol Smith primary card transactions
    (NEWID(), @carol_smith_id, @carol_primary_card, '2025-07-02', 'Whole Foods Market', -125.80, 'purchase', 'groceries', 0, GETUTCDATE()),
    (NEWID(), @carol_smith_id, @carol_primary_card, '2025-06-30', 'Business Dinner', -185.50, 'purchase', 'business', 0, GETUTCDATE()),
    (NEWID(), @carol_smith_id, @carol_primary_card, '2025-06-28', 'Office Depot', -67.25, 'purchase', 'office', 0, GETUTCDATE()),
    (NEWID(), @carol_smith_id, @carol_primary_card, '2025-06-25', 'Shell Gas Station', -52.40, 'purchase', 'gas', 0, GETUTCDATE());

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify data insertion
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM Users
UNION ALL SELECT 'UserProfiles', COUNT(*) FROM UserProfiles
UNION ALL SELECT 'UserPreferences', COUNT(*) FROM UserPreferences
UNION ALL SELECT 'BankAccounts', COUNT(*) FROM BankAccounts
UNION ALL SELECT 'CreditCards', COUNT(*) FROM CreditCards
UNION ALL SELECT 'BankTransactions', COUNT(*) FROM BankTransactions
UNION ALL SELECT 'CreditCardTransactions', COUNT(*) FROM CreditCardTransactions;

-- Test query to verify user data with comprehensive details
SELECT 
    u.Username,
    up.FirstName + ' ' + up.LastName as FullName,
    up.Age,
    up.Profession,
    up.Phone,
    up.Address,
    pref.Theme,
    pref.DarkMode,
    COUNT(DISTINCT ba.AccountId) as NumberOfAccounts,
    COUNT(DISTINCT cc.CardId) as NumberOfCards,
    COUNT(DISTINCT bt.TransactionId) as BankTransactions,
    COUNT(DISTINCT cct.TransactionId) as CreditCardTransactions,
    SUM(DISTINCT ba.Balance) as TotalAccountBalance,
    SUM(DISTINCT cc.Balance) as TotalCreditCardBalance
FROM Users u
JOIN UserProfiles up ON u.UserId = up.UserId
JOIN UserPreferences pref ON u.UserId = pref.UserId
LEFT JOIN BankAccounts ba ON u.UserId = ba.UserId
LEFT JOIN CreditCards cc ON u.UserId = cc.UserId
LEFT JOIN BankTransactions bt ON u.UserId = bt.UserId
LEFT JOIN CreditCardTransactions cct ON u.UserId = cct.UserId
GROUP BY u.Username, up.FirstName, up.LastName, up.Age, up.Profession, up.Phone, up.Address, pref.Theme, pref.DarkMode
ORDER BY u.Username;

-- Sample queries to test specific data
SELECT TOP 5 
    u.Username,
    bt.TransactionDate,
    bt.Description,
    bt.Amount,
    bt.Category
FROM BankTransactions bt
JOIN Users u ON bt.UserId = u.UserId
ORDER BY bt.TransactionDate DESC;

SELECT TOP 5
    u.Username,
    cc.CardType,
    cct.TransactionDate,
    cct.Description,
    cct.Amount,
    cct.Category
FROM CreditCardTransactions cct
JOIN Users u ON cct.UserId = u.UserId
JOIN CreditCards cc ON cct.CardId = cc.CardId
ORDER BY cct.TransactionDate DESC;
