#!/usr/bin/env python3

"""
Blue Mountain Bank - Azure SQL Quick Setup Script
This script helps automate the setup process for Azure SQL Database integration.
"""

import os
import json
import subprocess
import sys
from pathlib import Path

class AzureSQLSetup:
    def __init__(self):
        self.project_root = Path('/Users/rogier/bluemountainbank')
        self.api_dir = self.project_root / 'api'
        self.database_dir = self.project_root / 'database'
        
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")
    
    def print_step(self, step, description):
        print(f"\n🔧 Step {step}: {description}")
        print("-" * 40)
    
    def check_dependencies(self):
        """Check if required dependencies are installed"""
        self.print_step(1, "Checking Dependencies")
        
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            print(f"✅ Node.js: {result.stdout.strip()}")
        except FileNotFoundError:
            print("❌ Node.js not found. Please install Node.js 16+")
            return False
        
        # Check npm
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            print(f"✅ npm: {result.stdout.strip()}")
        except FileNotFoundError:
            print("❌ npm not found")
            return False
        
        # Check Python
        try:
            result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
            print(f"✅ Python: {result.stdout.strip()}")
        except FileNotFoundError:
            print("❌ Python not found")
            return False
        
        return True
    
    def setup_environment(self):
        """Create environment configuration"""
        self.print_step(2, "Setting up Environment Configuration")
        
        env_file = self.project_root / '.env'
        env_example = self.project_root / '.env.example'
        
        if env_file.exists():
            print("⚠️  .env file already exists")
            response = input("Do you want to overwrite it? (y/n): ")
            if response.lower() != 'y':
                print("Skipping environment setup")
                return
        
        if env_example.exists():
            # Copy example to .env
            with open(env_example, 'r') as f:
                env_content = f.read()
            
            # Get user input for database configuration
            print("\n📝 Please provide your Azure SQL Database details:")
            server = input("Azure SQL Server (e.g., myserver.database.windows.net): ")
            database = input("Database Name [BlueMountainBankDB]: ") or "BlueMountainBankDB"
            username = input("Username [bmb_admin]: ") or "bmb_admin"
            password = input("Password: ")
            jwt_secret = input("JWT Secret (leave blank for auto-generation): ")
            
            if not jwt_secret:
                import secrets
                jwt_secret = secrets.token_urlsafe(64)
                print(f"Generated JWT Secret: {jwt_secret}")
            
            # Replace placeholders
            env_content = env_content.replace("bluemountainbank.database.windows.net", server)
            env_content = env_content.replace("BlueMountainBankDB", database)
            env_content = env_content.replace("bmb_admin", username)
            env_content = env_content.replace("YourSecurePassword123!", password)
            env_content = env_content.replace("your-super-secret-jwt-key-here", jwt_secret)
            
            with open(env_file, 'w') as f:
                f.write(env_content)
            
            print("✅ Environment configuration created")
        else:
            print("❌ .env.example not found")
    
    def install_dependencies(self):
        """Install Node.js dependencies"""
        self.print_step(3, "Installing Node.js Dependencies")
        
        try:
            os.chdir(self.api_dir)
            result = subprocess.run(['npm', 'install'], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Node.js dependencies installed successfully")
            else:
                print(f"❌ Failed to install dependencies: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error installing dependencies: {e}")
            return False
        
        return True
    
    def install_python_dependencies(self):
        """Install Python dependencies for migration"""
        self.print_step(4, "Installing Python Dependencies")
        
        try:
            # Check if pyodbc is already installed
            import pyodbc
            print("✅ pyodbc already installed")
            return True
        except ImportError:
            pass
        
        try:
            result = subprocess.run([sys.executable, '-m', 'pip', 'install', 'pyodbc'], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ pyodbc installed successfully")
                return True
            else:
                print(f"❌ Failed to install pyodbc: {result.stderr}")
                print("📝 You may need to install Microsoft ODBC Driver for SQL Server")
                print("   Download from: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server")
                return False
                
        except Exception as e:
            print(f"❌ Error installing pyodbc: {e}")
            return False
    
    def create_database_schema(self):
        """Guide user through database schema creation"""
        self.print_step(5, "Database Schema Creation")
        
        schema_file = self.database_dir / 'schema.sql'
        
        if schema_file.exists():
            print("✅ Database schema file found")
            print("\n📋 Next steps:")
            print("1. Connect to your Azure SQL Database using:")
            print("   - Azure Portal Query Editor")
            print("   - Azure Data Studio")
            print("   - SQL Server Management Studio")
            print(f"2. Execute the SQL script: {schema_file}")
            print("3. Verify all tables are created successfully")
            
            input("\nPress Enter when you have completed the database schema creation...")
            print("✅ Database schema setup completed")
        else:
            print(f"❌ Schema file not found: {schema_file}")
    
    def prepare_migration(self):
        """Prepare data migration"""
        self.print_step(6, "Preparing Data Migration")
        
        migration_file = self.database_dir / 'migrate_to_azure_sql.py'
        
        if migration_file.exists():
            print("✅ Migration script found")
            print("\n⚠️  Before running migration:")
            print("1. Ensure your Azure SQL Database is accessible")
            print("2. Verify firewall rules allow your IP address")
            print("3. Confirm database schema has been created")
            print("4. Update connection string in migrate_to_azure_sql.py if needed")
            
            response = input("\nDo you want to run the migration now? (y/n): ")
            if response.lower() == 'y':
                try:
                    os.chdir(self.database_dir.parent)
                    result = subprocess.run([sys.executable, str(migration_file)], 
                                          capture_output=True, text=True)
                    
                    print(result.stdout)
                    if result.stderr:
                        print("Errors:", result.stderr)
                    
                    if result.returncode == 0:
                        print("✅ Data migration completed successfully")
                    else:
                        print("❌ Migration failed. Check the output above.")
                        
                except Exception as e:
                    print(f"❌ Error running migration: {e}")
            else:
                print("⏭️  Migration skipped. Run manually when ready:")
                print(f"   python {migration_file}")
        else:
            print(f"❌ Migration script not found: {migration_file}")
    
    def start_server(self):
        """Start the API server"""
        self.print_step(7, "Starting API Server")
        
        server_file = self.api_dir / 'azure-sql-server.js'
        
        if server_file.exists():
            print("✅ Azure SQL server file found")
            
            response = input("Do you want to start the server now? (y/n): ")
            if response.lower() == 'y':
                print("\n🚀 Starting server...")
                print("Press Ctrl+C to stop the server")
                
                try:
                    os.chdir(self.api_dir)
                    subprocess.run(['node', 'azure-sql-server.js'])
                except KeyboardInterrupt:
                    print("\n🛑 Server stopped")
                except Exception as e:
                    print(f"❌ Error starting server: {e}")
            else:
                print("⏭️  Server start skipped. Start manually when ready:")
                print(f"   cd {self.api_dir}")
                print("   node azure-sql-server.js")
        else:
            print(f"❌ Server file not found: {server_file}")
    
    def run_setup(self):
        """Run the complete setup process"""
        self.print_header("Blue Mountain Bank - Azure SQL Database Setup")
        print("This script will help you set up Azure SQL Database integration.")
        print("Make sure you have already created your Azure SQL Database.")
        
        if not self.check_dependencies():
            print("\n❌ Setup failed due to missing dependencies")
            return
        
        self.setup_environment()
        
        if not self.install_dependencies():
            print("\n❌ Setup failed during Node.js dependency installation")
            return
        
        if not self.install_python_dependencies():
            print("\n⚠️  Python dependencies installation failed, but setup can continue")
        
        self.create_database_schema()
        self.prepare_migration()
        self.start_server()
        
        self.print_header("Setup Complete!")
        print("🎉 Azure SQL Database setup is complete!")
        print("\n📋 Next steps:")
        print("1. Test your application at: http://localhost:3001/health")
        print("2. Open login.html in your browser")
        print("3. Try logging in with demo credentials")
        print("4. Verify data is loading from Azure SQL Database")
        
        print("\n📚 For detailed documentation, see:")
        print("   docs/AZURE_SQL_SETUP_GUIDE.md")

if __name__ == "__main__":
    setup = AzureSQLSetup()
    setup.run_setup()
