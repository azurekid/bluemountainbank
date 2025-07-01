# Azure Blob Storage Setup Guide for Blue Mountain Bank

## 🏗️ Azure Storage Account Requirements

### **Storage Account Specifications**

| Requirement | Recommended Value | Notes |
|-------------|------------------|-------|
| **Account Name** | `bluemountainbankdev` | Must be globally unique, 3-24 characters, lowercase |
| **Account Type** | General Purpose v2 | Latest version with all features |
| **Performance** | Standard | Sufficient for banking app, cost-effective |
| **Replication** | LRS (Local) for demo, GRS for production | LRS = cheaper, GRS = disaster recovery |
| **Access Tier** | Hot | For frequently accessed banking data |
| **Region** | East US / West Europe | Choose closest to your users |
| **Secure Transfer** | Enabled | HTTPS only for security |

## 🔐 Required SAS Token Permissions

### **Essential Permissions for Banking App**

| Permission | Code | Purpose | Example Use Case |
|------------|------|---------|------------------|
| **Read** | `r` | Get user data, view transactions | Load user dashboard, view account balance |
| **Write** | `w` | Update existing data | Update user profile, modify account info |
| **Delete** | `d` | Remove old data | Clean up old transactions, remove inactive users |
| **List** | `l` | Browse directories | Get all users, list transactions |
| **Add** | `a` | Append to existing data | Add new transactions to existing user |
| **Create** | `c` | Create new files | Create new user profiles, new accounts |

### **Minimum Required Permissions String**
```
sp=rwdlac
```

## 🛠️ Step-by-Step Setup Instructions

### **Option 1: Azure CLI (Recommended for Developers)**

```bash
# 1. Login to Azure
az login

# 2. Create Resource Group
az group create \
  --name bluemountain-banking \
  --location eastus

# 3. Create Storage Account
az storage account create \
  --name bluemountainbankdev \
  --resource-group bluemountain-banking \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot \
  --https-only true \
  --allow-blob-public-access false

# 4. Create Container for User Data
az storage container create \
  --name userdata-dev \
  --account-name bluemountainbankdev \
  --public-access off \
  --auth-mode login

# 5. Create Container for Backups
az storage container create \
  --name backups \
  --account-name bluemountainbankdev \
  --public-access off \
  --auth-mode login

# 6. Generate SAS Token (Valid for 1 year)
az storage account generate-sas \
  --account-name bluemountainbankdev \
  --services b \
  --resource-types sco \
  --permissions rwdlac \
  --expiry 2025-12-31T23:59:59Z \
  --start 2024-01-01T00:00:00Z \
  --protocol https \
  --output tsv
```

### **Option 2: Azure Portal (GUI Method)**

1. **Create Storage Account**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → "Storage account"
   - Fill in the details:
     - **Subscription**: Your Azure subscription
     - **Resource Group**: Create new "bluemountain-banking"
     - **Storage Account Name**: `bluemountainbankdev`
     - **Region**: East US (or nearest to you)
     - **Performance**: Standard
     - **Redundancy**: Locally-redundant storage (LRS)

2. **Configure Advanced Settings**
   - **Security**: Enable "Require secure transfer"
   - **Data Lake Storage Gen2**: Disabled
   - **Blob public access**: Disabled
   - **Minimum TLS version**: Version 1.2

3. **Create Containers**
   - Navigate to your storage account
   - Go to "Containers" in the left menu
   - Click "+ Container"
   - Create containers:
     - `userdata-dev` (Private)
     - `backups` (Private)

4. **Generate SAS Token**
   - In your storage account, go to "Shared access signature"
   - Configure the following:
     - **Allowed services**: ✅ Blob
     - **Allowed resource types**: ✅ Service, ✅ Container, ✅ Object
     - **Allowed permissions**: ✅ Read, ✅ Write, ✅ Delete, ✅ List, ✅ Add, ✅ Create
     - **Start time**: Current date
     - **End time**: 1 year from now
     - **Allowed protocols**: HTTPS only
   - Click "Generate SAS and connection string"
   - Copy the **SAS token** (starts with `sv=`)

## 🔧 Configuration in Blue Mountain Bank App

### **1. Update Azure Configuration**

Edit `js/azure-config.js`:

```javascript
const azureConfig = {
    storageAccount: 'bluemountainbankdev',  // Your storage account name
    containerName: 'userdata-dev',         // Your container name
    sasToken: 'sv=2021-06-08&ss=b&srt=sco&sp=rwdlac&se=2025-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=YOUR_SIGNATURE_HERE'
};
```

### **2. Initialize Storage Manager**

```javascript
// Initialize with your Azure configuration
const storageManager = new AzureBlobStorageManager({
    storageAccount: 'bluemountainbankdev',
    containerName: 'userdata-dev',
    sasToken: 'your-sas-token-here'
});

// The manager will automatically initialize with sample data
await storageManager.initializeData();
```

### **3. Test Your Setup**

Open `azure-demo.html` in your browser and:
1. Enter your Azure configuration
2. Click "Test Connection"
3. If successful, click "Initialize Azure Storage"
4. Test authentication and data operations

## 💰 Cost Estimation

### **Development/Demo Usage**
- **Storage**: ~1 GB for user data = $0.02/month
- **Transactions**: ~10,000 operations = $0.01/month
- **Total**: **~$0.03/month** for development

### **Production Usage (1000 users)**
- **Storage**: ~10 GB = $0.20/month
- **Transactions**: ~1M operations = $0.40/month
- **Bandwidth**: ~50 GB = $4.50/month
- **Total**: **~$5.10/month** for production

## 🔒 Security Best Practices

### **SAS Token Security**
```javascript
// ✅ Good: Store in environment variables
const sasToken = process.env.AZURE_SAS_TOKEN;

// ❌ Bad: Hardcode in source code
const sasToken = 'sv=2021-06-08&ss=b&srt=sco...';
```

### **Production Security Checklist**
- [ ] Enable Azure Storage encryption
- [ ] Use managed identities instead of SAS tokens
- [ ] Implement Azure Key Vault for secrets
- [ ] Enable Storage Analytics logging
- [ ] Set up Azure Monitor alerts
- [ ] Configure CORS for web applications
- [ ] Implement rate limiting
- [ ] Regular SAS token rotation (every 90 days)

## 🚨 Troubleshooting Common Issues

### **"Container not found" Error**
```bash
# Check if container exists
az storage container list \
  --account-name bluemountainbankdev \
  --auth-mode login
```

### **"Access Denied" Error**
- Verify SAS token has correct permissions (`rwdlac`)
- Check token expiration date
- Ensure HTTPS is used for all requests

### **CORS Issues (Web Apps)**
```bash
# Enable CORS for your domain
az storage cors add \
  --services b \
  --methods GET PUT POST DELETE \
  --origins "https://yourdomain.com" \
  --allowed-headers "*" \
  --account-name bluemountainbankdev
```

## 📊 Monitoring and Analytics

### **Enable Storage Analytics**
```bash
# Enable logging
az storage logging update \
  --services b \
  --log rwd \
  --retention 7 \
  --account-name bluemountainbankdev

# Enable metrics
az storage metrics update \
  --services b \
  --hour true \
  --minute false \
  --retention 7 \
  --account-name bluemountainbankdev
```

### **Set Up Alerts**
- **High storage usage** (>80% of limit)
- **Unusual access patterns** (many failed requests)
- **SAS token near expiry** (30 days before)

## 🔄 Migration from LocalStorage

To migrate existing LocalStorage data to Azure:

```javascript
// Migration script
async function migrateToAzure() {
    const localManager = new LocalStorageManager();
    const azureManager = new AzureBlobStorageManager(azureConfig);
    
    const localUsers = localManager.getAllUsers();
    
    for (const [userId, userData] of Object.entries(localUsers)) {
        await azureManager.saveUserData(userId, userData);
        console.log(`Migrated user: ${userId}`);
    }
    
    console.log('Migration complete!');
}
```

## ✅ Verification Steps

After setup, verify everything works:

1. **Connection Test**: SAS token connects successfully
2. **Read Test**: Load user data from Azure
3. **Write Test**: Save new transaction
4. **List Test**: Get all users
5. **Delete Test**: Remove test data
6. **Backup Test**: Create backup file

Your Azure Blob Storage is now ready for the Blue Mountain Bank application!

## 📞 Support

If you encounter issues:
- Check Azure Portal for error messages
- Review Storage Analytics logs
- Verify SAS token permissions and expiry
- Test with Azure Storage Explorer tool

For production deployments, consider Azure Support plans for additional assistance.
