# Azure SQL Database Setup Guide for Blue Mountain Bank

This guide will help you set up a free tier Azure SQL Database and migrate your Blue Mountain Bank application data to a production-ready database.

## Prerequisites

- Azure account (free tier available)
- Node.js 16+ installed
- PowerShell or command line access

## Step 1: Create Azure SQL Database

### 1.1 Create Azure SQL Server and Database

1. **Sign in to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create SQL Database**
   - Click "Create a resource"
   - Search for "SQL Database"
   - Click "Create"

3. **Configure Basic Settings**
   ```
   Subscription: Your subscription
   Resource Group: Create new "BlueMountainBank-RG"
   Database Name: BlueMountainBankDB
   Server: Create new
   ```

4. **Configure SQL Server**
   ```
   Server Name: bluemountainbank (must be globally unique)
   Location: Choose closest region
   Authentication: Use SQL authentication
   Server admin login: bmb_admin
   Password: S3cureP@55w0rd!
   ```

5. **Configure Database**
   ```
   Compute + Storage: Basic (5 DTU, 2GB) - FREE TIER
   Backup storage redundancy: Locally redundant
   ```

6. **Networking**
   ```
   Connectivity method: Public endpoint
   Allow Azure services: Yes
   Add current client IP: Yes
   ```

7. **Review and Create**
   - Review settings and click "Create"
   - Wait for deployment to complete

### 1.2 Configure Firewall

1. Navigate to your SQL server in Azure Portal
2. Go to "Security" → "Networking"
3. Add your current IP address
4. Add rule for your application server IP
5. Save changes

## Step 2: Install Dependencies

### 2.1 Install Python Dependencies (for migration)

```powershell
# Install Python ODBC driver (if not already installed)
# Download from: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

# Install Python packages
pip install pyodbc
```

### 2.2 Install Node.js Dependencies

```powershell
cd /Users/rogier/bluemountainbank/api
npm install
```

This will install:
- `mssql`: SQL Server driver for Node.js
- `jsonwebtoken`: JWT authentication
- `bcrypt`: Password hashing
- Other dependencies

## Step 3: Configure Environment

### 3.1 Create Environment File

Copy `.env.example` to `.env` and update with your Azure SQL details:

```powershell
cd /Users/rogier/bluemountainbank
cp .env.example .env
```

Edit `.env` file:
```env
# Database Connection
AZURE_SQL_SERVER=bluemountainbank.database.windows.net
AZURE_SQL_DATABASE=bluemountainbankdb
AZURE_SQL_USERNAME=bmb_admin
AZURE_SQL_PASSWORD=S3cureP@55w0rd!

# Security
JWT_SECRET=BMB_2025_Super_Secure_JWT_Secret_Key_For_Production_Use_Random_String_a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=production
PORT=3001
```

## Step 4: Create Database Schema

### 4.1 Connect to Azure SQL Database

Use Azure Data Studio, SQL Server Management Studio, or Azure Portal Query Editor:

```sql
-- Connection details:
Server: bluemountainbank.database.windows.net
Database: BlueMountainBankDB
Authentication: SQL Login
Username: bmb_admin
Password: S3cureP@55w0rd!
```

### 4.2 Run Schema Script

Execute the schema creation script:

```powershell
# Using Azure Portal Query Editor or SQL tools
# Copy and paste the contents of database/schema.sql
```

Or via command line:
```powershell
# Install SQL command line tools first
sqlcmd -S bluemountainbank.database.windows.net -d BlueMountainBankDB -U bmb_admin -P S3cureP@55w0rd! -i database/schema.sql
```

## Step 5: Migrate Data

### 5.1 Update Migration Script

Edit `database/migrate_to_azure_sql.py` and update the connection string:

```python
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
```

### 5.2 Run Migration

```powershell
cd /Users/rogier/bluemountainbank
python database/migrate_to_azure_sql.py
```

Expected output:
```
🏦 Blue Mountain Bank - Azure SQL Migration Tool
==================================================
✅ pyodbc package found
✅ Connected to Azure SQL Database

Processing alice_martinez.json...
  Total transactions: 49
  ✅ Successfully migrated user: alice.martinez

Processing bob_johnson.json...
  ✅ Successfully migrated user: bob.johnson

... (all users)

🎉 Migration complete! Successfully migrated: 6/6 users
```

## Step 6: Start the Application

### 6.1 Start API Server

```powershell
cd /Users/rogier/bluemountainbank/api
npm start
```

Expected output:
```
✅ Connected to Azure SQL Database
🚀 Blue Mountain Bank API Server running on port 3001
📊 Environment: production
🗄️  Database: Azure SQL Database
🔐 JWT Authentication: Enabled
🛡️  Security middleware: Enabled
```

### 6.2 Update Frontend

Update your HTML pages to use the new enhanced storage factory:

```html
<!-- Replace existing storage factory script with: -->
<script src="js/enhanced-storage-factory.js"></script>
<script src="js/azure-sql-login.js"></script>
```

## Step 7: Test the Application

### 7.1 Test API Health

Visit: `http://localhost:3001/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-07-07T...",
  "database": "connected",
  "version": "2.0.0"
}
```

### 7.2 Test Login

1. Open `login.html` in your browser
2. Try logging in with demo credentials:
   - Username: `alice.martinez`
   - Password: `password123`

### 7.3 Test Dashboard

After successful login, you should be redirected to the dashboard with data loaded from Azure SQL Database.

## Security Considerations

### 7.1 Production Security

For production deployment:

1. **Use Azure Key Vault** for secrets
2. **Enable SSL/TLS** encryption
3. **Configure VNet** integration
4. **Enable audit logging**
5. **Set up backup policies**
6. **Use managed identity** for authentication

### 7.2 Password Security

The migration script currently uses existing hashed passwords. For new users:

```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 12);
```

## Monitoring and Maintenance

### 8.1 Azure SQL Monitoring

- Monitor DTU usage in Azure Portal
- Set up alerts for high resource usage
- Review query performance insights

### 8.2 Application Monitoring

- Monitor API response times
- Set up logging for errors
- Track authentication attempts

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check firewall settings
   - Verify connection string
   - Ensure Azure allows your IP

2. **Authentication Failed**
   - Verify username/password
   - Check JWT secret configuration
   - Confirm user exists in database

3. **Migration Failed**
   - Check ODBC driver installation
   - Verify database permissions
   - Ensure schema was created

### Support

For additional help:
- Azure SQL Documentation: [docs.microsoft.com/azure/sql-database](https://docs.microsoft.com/azure/sql-database)
- Node.js mssql driver: [github.com/tediousjs/node-mssql](https://github.com/tediousjs/node-mssql)

## Cost Optimization

### Free Tier Limits

Azure SQL Database free tier includes:
- 32 GB storage
- 5 DTU compute
- 500 MB backup storage

### Scaling Options

When you need more resources:
- Basic: $5/month
- Standard S0: $15/month
- Premium P1: $465/month

## Next Steps

1. Deploy to Azure App Service
2. Set up CI/CD pipeline
3. Configure custom domain
4. Enable Azure Application Insights
5. Set up automated backups
