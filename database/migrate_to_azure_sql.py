#!/usr/bin/env python3

import json
import os
import pyodbc
from datetime import datetime
import uuid
import hashlib

class AzureSQLMigrator:
    def __init__(self, connection_string):
        """Initialize the migrator with Azure SQL connection string"""
        self.connection_string = connection_string
        self.conn = None
        
    def connect(self):
        """Connect to Azure SQL Database"""
        try:
            self.conn = pyodbc.connect(self.connection_string)
            print("✅ Connected to Azure SQL Database")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to database: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("🔌 Database connection closed")
    
    def migrate_user_data(self, json_file_path):
        """Migrate a single user's JSON data to Azure SQL"""
        try:
            with open(json_file_path, 'r') as f:
                user_data = json.load(f)
            
            cursor = self.conn.cursor()
            
            # Generate a unique user ID
            user_id = str(uuid.uuid4())
            
            # 1. Insert User (credentials)
            credentials = user_data.get('credentials', {})
            cursor.execute("""
                INSERT INTO Users (UserId, Username, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt)
                VALUES (?, ?, ?, ?, ?, GETUTCDATE(), GETUTCDATE())
            """, (
                user_id,
                credentials.get('username', ''),
                credentials.get('email', ''),
                credentials.get('password', ''),  # Already hashed
                1
            ))
            
            # 2. Insert User Profile
            profile = user_data.get('profile', {})
            personal_info = user_data.get('personalInfo', {})
            
            cursor.execute("""
                INSERT INTO UserProfiles (ProfileId, UserId, FirstName, LastName, Age, Profession, 
                                        Phone, Address, JoinDate, Avatar, AccountNumber, SSN, 
                                        DateOfBirth, MothersMaidenName, CreatedAt, UpdatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE(), GETUTCDATE())
            """, (
                str(uuid.uuid4()),
                user_id,
                profile.get('firstName', ''),
                profile.get('lastName', ''),
                profile.get('age'),
                profile.get('profession', ''),
                profile.get('phone', ''),
                profile.get('address', ''),
                profile.get('joinDate'),
                profile.get('avatar', ''),
                profile.get('accountNumber', ''),
                personal_info.get('ssn', ''),
                personal_info.get('dateOfBirth'),
                personal_info.get('mothersMaidenName', '')
            ))
            
            # 3. Insert User Preferences
            preferences = user_data.get('preferences', {})
            cursor.execute("""
                INSERT INTO UserPreferences (PreferenceId, UserId, Theme, DarkMode, Language, 
                                           Currency, Notifications, EmailAlerts, SmsAlerts, 
                                           CreatedAt, UpdatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE(), GETUTCDATE())
            """, (
                str(uuid.uuid4()),
                user_id,
                preferences.get('theme', 'light'),
                preferences.get('darkMode', False),
                preferences.get('language', 'en-US'),
                preferences.get('currency', 'USD'),
                preferences.get('notifications', True),
                preferences.get('emailAlerts', True),
                preferences.get('smsAlerts', False)
            ))
            
            # 4. Insert Bank Accounts
            accounts = user_data.get('accounts', {})
            account_ids = {}
            
            for account_type, account_data in accounts.items():
                account_id = str(uuid.uuid4())
                account_ids[account_type] = account_id
                
                credit_limit = None
                if account_type == 'credit':
                    credit_limit = account_data.get('limit', 0)
                
                cursor.execute("""
                    INSERT INTO BankAccounts (AccountId, UserId, AccountType, AccountNumber, 
                                            AccountName, Balance, CreditLimit, IsActive, 
                                            CreatedAt, UpdatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE(), GETUTCDATE())
                """, (
                    account_id,
                    user_id,
                    account_type,
                    account_data.get('accountNumber', ''),
                    account_data.get('type', ''),
                    account_data.get('balance', 0),
                    credit_limit,
                    True
                ))
            
            # 5. Insert Credit Cards
            credit_cards = personal_info.get('creditCards', {})
            card_ids = {}
            
            for card_type, card_data in credit_cards.items():
                card_id = str(uuid.uuid4())
                card_ids[card_type] = card_id
                
                cursor.execute("""
                    INSERT INTO CreditCards (CardId, UserId, CardType, CardBrand, CardNumber, 
                                           ExpiryMonth, ExpiryYear, CVV, CardName, Balance, 
                                           CreditLimit, IsActive, CreatedAt, UpdatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE(), GETUTCDATE())
                """, (
                    card_id,
                    user_id,
                    card_type,
                    card_data.get('type', ''),
                    card_data.get('number', ''),
                    card_data.get('expiryMonth', 12),
                    card_data.get('expiryYear', 2025),
                    str(card_data.get('cvv', 123)),
                    card_data.get('name', ''),
                    card_data.get('balance', 0),
                    card_data.get('limit', 5000),
                    card_data.get('isActive', True)
                ))
                
                # Insert credit card transactions
                transactions = card_data.get('transactions', [])
                for transaction in transactions:
                    cursor.execute("""
                        INSERT INTO CreditCardTransactions (TransactionId, UserId, CardId, 
                                                           TransactionDate, Description, Amount, 
                                                           TransactionType, Category, IsPending, 
                                                           CreatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE())
                    """, (
                        str(uuid.uuid4()),
                        user_id,
                        card_id,
                        transaction.get('date'),
                        transaction.get('description', ''),
                        transaction.get('amount', 0),
                        transaction.get('type', ''),
                        transaction.get('category', ''),
                        transaction.get('pending', False)
                    ))
            
            # 6. Insert Bank Transactions
            recent_transactions = user_data.get('recentTransactions', [])
            for transaction in recent_transactions:
                # Map account type to account ID
                account_type = transaction.get('account', 'checking')
                account_id = account_ids.get(account_type)
                
                if account_id:
                    cursor.execute("""
                        INSERT INTO BankTransactions (TransactionId, UserId, AccountId, 
                                                    TransactionDate, Description, Amount, 
                                                    TransactionType, Category, Icon, IsPending, 
                                                    CreatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE())
                    """, (
                        str(uuid.uuid4()),
                        user_id,
                        account_id,
                        transaction.get('date'),
                        transaction.get('description', ''),
                        transaction.get('amount', 0),
                        transaction.get('type', ''),
                        transaction.get('category', ''),
                        transaction.get('icon', ''),
                        False
                    ))
            
            # Commit the transaction
            self.conn.commit()
            print(f"✅ Successfully migrated user: {credentials.get('username', 'Unknown')}")
            return True
            
        except Exception as e:
            if self.conn:
                self.conn.rollback()
            print(f"❌ Error migrating user data from {json_file_path}: {e}")
            return False
    
    def migrate_all_users(self, sample_data_dir):
        """Migrate all users from the sample data directory"""
        json_files = [f for f in os.listdir(sample_data_dir) if f.endswith('.json')]
        
        success_count = 0
        total_count = len(json_files)
        
        print(f"🚀 Starting migration of {total_count} users...")
        
        for json_file in json_files:
            file_path = os.path.join(sample_data_dir, json_file)
            if self.migrate_user_data(file_path):
                success_count += 1
        
        print(f"\n🎉 Migration complete!")
        print(f"✅ Successfully migrated: {success_count}/{total_count} users")
        if success_count < total_count:
            print(f"❌ Failed to migrate: {total_count - success_count} users")

def main():
    """Main migration function"""
    # Azure SQL Database connection string
    # Replace with your actual Azure SQL Database connection details
    connection_string = """
Driver={ODBC Driver 17 for SQL Server};
Server=tcp:bluemountainbank.database.windows.net,1433;
Database=BlueMountainBankDB;
Uid=bmb_admin;
Pwd=S3cureP@55w0rd!;
Encrypt=yes;
TrustServerCertificate=no;
Connection Timeout=30;
    """
    
    # Sample data directory
    sample_data_dir = '/Users/rogier/bluemountainbank/sample-data'
    
    # Create migrator instance
    migrator = AzureSQLMigrator(connection_string)
    
    try:
        # Connect to database
        if migrator.connect():
            # Run migration
            migrator.migrate_all_users(sample_data_dir)
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        # Close connection
        migrator.close()

if __name__ == "__main__":
    print("🏦 Blue Mountain Bank - Azure SQL Migration Tool")
    print("=" * 50)
    
    # Check if required packages are installed
    try:
        import pyodbc
        print("✅ pyodbc package found")
    except ImportError:
        print("❌ pyodbc package not found. Install it with: pip install pyodbc")
        exit(1)
    
    main()
