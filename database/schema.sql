-- Blue Mountain Bank Azure SQL Database Schema
-- This script creates all necessary tables for the banking application

-- Drop tables if they exist (for development/testing)
IF OBJECT_ID('CreditCardTransactions', 'U') IS NOT NULL DROP TABLE CreditCardTransactions;
IF OBJECT_ID('BankTransactions', 'U') IS NOT NULL DROP TABLE BankTransactions;
IF OBJECT_ID('CreditCards', 'U') IS NOT NULL DROP TABLE CreditCards;
IF OBJECT_ID('BankAccounts', 'U') IS NOT NULL DROP TABLE BankAccounts;
IF OBJECT_ID('UserPreferences', 'U') IS NOT NULL DROP TABLE UserPreferences;
IF OBJECT_ID('UserProfiles', 'U') IS NOT NULL DROP TABLE UserProfiles;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Users table (authentication and basic info)
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- User profiles (personal information)
CREATE TABLE UserProfiles (
    ProfileId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    FullName AS (FirstName + ' ' + LastName) PERSISTED,
    Age INT,
    Profession NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(500),
    JoinDate DATE,
    Avatar NVARCHAR(10),
    AccountNumber NVARCHAR(20),
    
    -- Sensitive personal information (encrypted in real production)
    SSN NVARCHAR(11), -- XXX-XX-XXXX format
    DateOfBirth DATE,
    MothersMaidenName NVARCHAR(100),
    
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- User preferences (theme, settings, etc.)
CREATE TABLE UserPreferences (
    PreferenceId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    Theme NVARCHAR(20) DEFAULT 'light', -- 'light' or 'dark'
    DarkMode BIT DEFAULT 0,
    Language NVARCHAR(10) DEFAULT 'en-US',
    Currency NVARCHAR(3) DEFAULT 'USD',
    Notifications BIT DEFAULT 1,
    EmailAlerts BIT DEFAULT 1,
    SmsAlerts BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Bank accounts (checking, savings, etc.)
CREATE TABLE BankAccounts (
    AccountId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    AccountType NVARCHAR(50) NOT NULL, -- 'checking', 'savings', 'credit'
    AccountNumber NVARCHAR(20) UNIQUE NOT NULL,
    AccountName NVARCHAR(100) NOT NULL,
    Balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    CreditLimit DECIMAL(15,2) NULL, -- For credit accounts
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Credit cards
CREATE TABLE CreditCards (
    CardId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    CardType NVARCHAR(20) NOT NULL, -- 'primary', 'secondary', etc.
    CardBrand NVARCHAR(20) NOT NULL, -- 'visa', 'mastercard', 'amex'
    CardNumber NVARCHAR(19) NOT NULL, -- Encrypted in production
    ExpiryMonth INT NOT NULL,
    ExpiryYear INT NOT NULL,
    CVV NVARCHAR(4) NOT NULL, -- Encrypted in production
    CardName NVARCHAR(100) NOT NULL,
    Balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    CreditLimit DECIMAL(15,2) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Bank transactions (checking, savings account transactions)
CREATE TABLE BankTransactions (
    TransactionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    AccountId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES BankAccounts(AccountId) ON DELETE CASCADE,
    TransactionDate DATE NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'transfer', 'payment'
    Category NVARCHAR(50), -- 'payment', 'groceries', 'entertainment', etc.
    Icon NVARCHAR(50), -- CSS class for icon
    IsPending BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Credit card transactions
CREATE TABLE CreditCardTransactions (
    TransactionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    CardId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES CreditCards(CardId) ON DELETE CASCADE,
    TransactionDate DATE NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- 'purchase', 'payment', 'refund'
    Category NVARCHAR(50), -- 'restaurants', 'gas', 'groceries', 'shopping', etc.
    IsPending BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Create indexes for better performance
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_UserProfiles_UserId ON UserProfiles(UserId);
CREATE INDEX IX_UserPreferences_UserId ON UserPreferences(UserId);
CREATE INDEX IX_BankAccounts_UserId ON BankAccounts(UserId);
CREATE INDEX IX_BankAccounts_AccountNumber ON BankAccounts(AccountNumber);
CREATE INDEX IX_CreditCards_UserId ON CreditCards(UserId);
CREATE INDEX IX_BankTransactions_UserId ON BankTransactions(UserId);
CREATE INDEX IX_BankTransactions_AccountId ON BankTransactions(AccountId);
CREATE INDEX IX_BankTransactions_Date ON BankTransactions(TransactionDate);
CREATE INDEX IX_CreditCardTransactions_UserId ON CreditCardTransactions(UserId);
CREATE INDEX IX_CreditCardTransactions_CardId ON CreditCardTransactions(CardId);
CREATE INDEX IX_CreditCardTransactions_Date ON CreditCardTransactions(TransactionDate);

-- Add triggers for UpdatedAt timestamps
CREATE TRIGGER tr_Users_UpdatedAt ON Users
AFTER UPDATE AS
BEGIN
    UPDATE Users 
    SET UpdatedAt = GETUTCDATE() 
    WHERE UserId IN (SELECT UserId FROM inserted);
END;

CREATE TRIGGER tr_UserProfiles_UpdatedAt ON UserProfiles
AFTER UPDATE AS
BEGIN
    UPDATE UserProfiles 
    SET UpdatedAt = GETUTCDATE() 
    WHERE ProfileId IN (SELECT ProfileId FROM inserted);
END;

CREATE TRIGGER tr_UserPreferences_UpdatedAt ON UserPreferences
AFTER UPDATE AS
BEGIN
    UPDATE UserPreferences 
    SET UpdatedAt = GETUTCDATE() 
    WHERE PreferenceId IN (SELECT PreferenceId FROM inserted);
END;

CREATE TRIGGER tr_BankAccounts_UpdatedAt ON BankAccounts
AFTER UPDATE AS
BEGIN
    UPDATE BankAccounts 
    SET UpdatedAt = GETUTCDATE() 
    WHERE AccountId IN (SELECT AccountId FROM inserted);
END;

CREATE TRIGGER tr_CreditCards_UpdatedAt ON CreditCards
AFTER UPDATE AS
BEGIN
    UPDATE CreditCards 
    SET UpdatedAt = GETUTCDATE() 
    WHERE CardId IN (SELECT CardId FROM inserted);
END;

PRINT 'Blue Mountain Bank database schema created successfully!';
