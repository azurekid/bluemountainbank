// Azure Storage Configuration
class AzureConfig {
    constructor() {
        this.environments = {
            development: {
                storageAccount: 'bluemountainbankdev',
                containerName: 'userdata-dev',
                // Demo SAS token (replace with your actual token)
                sasToken: 'sv=2021-06-08&ss=b&srt=sco&sp=rwdlac&se=2025-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https,http&sig=DEMO_SIGNATURE',
                endpoint: 'https://bluemountainbankdev.blob.core.windows.net'
            },
            staging: {
                storageAccount: 'bluemountainbankstg',
                containerName: 'userdata-staging',
                sasToken: process.env.AZURE_SAS_TOKEN_STAGING,
                endpoint: 'https://bluemountainbankstg.blob.core.windows.net'
            },
            production: {
                storageAccount: 'bluemountainbank',
                containerName: 'userdata',
                sasToken: process.env.AZURE_SAS_TOKEN_PROD,
                endpoint: 'https://bluemountainbank.blob.core.windows.net',
                features: {
                    encryption: true,
                    auditLogging: true,
                    backup: true
                }
            }
        };

        this.currentEnvironment = this.detectEnvironment();
    }

    detectEnvironment() {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    getConfig() {
        return this.environments[this.currentEnvironment];
    }

    // Generate SAS token instructions
    static getSetupInstructions() {
        return {
            azureCLI: {
                title: "Azure CLI Setup Commands",
                commands: [
                    "# 1. Create Resource Group",
                    "az group create --name bluemountain-banking --location eastus",
                    "",
                    "# 2. Create Storage Account",
                    "az storage account create \\",
                    "  --name bluemountainbankdev \\",
                    "  --resource-group bluemountain-banking \\",
                    "  --location eastus \\",
                    "  --sku Standard_LRS \\",
                    "  --kind StorageV2 \\",
                    "  --access-tier Hot",
                    "",
                    "# 3. Create Container",
                    "az storage container create \\",
                    "  --name userdata-dev \\",
                    "  --account-name bluemountainbankdev \\",
                    "  --public-access off",
                    "",
                    "# 4. Generate SAS Token (valid for 1 year)",
                    "az storage container generate-sas \\",
                    "  --name userdata-dev \\",
                    "  --account-name bluemountainbankdev \\",
                    "  --permissions rwdlac \\",
                    "  --expiry 2025-12-31T23:59:59Z \\",
                    "  --start 2024-01-01T00:00:00Z \\",
                    "  --protocol https,http"
                ]
            },
            azurePortal: {
                title: "Azure Portal Setup Steps",
                steps: [
                    "1. Go to Azure Portal (portal.azure.com)",
                    "2. Create a new Storage Account:",
                    "   - Name: bluemountainbankdev",
                    "   - Performance: Standard",
                    "   - Replication: LRS (Locally Redundant Storage)",
                    "   - Access tier: Hot",
                    "3. Create a container named 'userdata-dev'",
                    "4. Generate SAS token:",
                    "   - Go to Storage Account > Shared access signature",
                    "   - Select services: Blob",
                    "   - Select resource types: Service, Container, Object",
                    "   - Select permissions: Read, Write, Delete, List, Add, Create",
                    "   - Set expiry date: 2025-12-31",
                    "   - Generate SAS token and copy it"
                ]
            },
            permissions: {
                title: "Required SAS Token Permissions",
                permissions: [
                    "Read (r) - Get user data, transactions",
                    "Write (w) - Update user profiles, transactions",
                    "Delete (d) - Remove old data, cleanup",
                    "List (l) - Browse user directories",
                    "Add (a) - Add new transactions",
                    "Create (c) - Create new user files"
                ]
            },
            security: {
                title: "Security Best Practices",
                practices: [
                    "1. Use HTTPS-only for SAS tokens",
                    "2. Set expiry dates (max 1 year for demo)",
                    "3. Limit permissions to minimum required",
                    "4. Use environment variables for tokens",
                    "5. Rotate tokens regularly",
                    "6. Monitor access logs",
                    "7. Enable Azure Storage encryption"
                ]
            }
        };
    }

    // Validate SAS token format
    static validateSasToken(token) {
        const requiredParams = ['sv', 'ss', 'srt', 'sp', 'se', 'sig'];
        const tokenParams = new URLSearchParams(token);

        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check required parameters
        requiredParams.forEach(param => {
            if (!tokenParams.has(param)) {
                validation.isValid = false;
                validation.errors.push(`Missing required parameter: ${param}`);
            }
        });

        // Check expiry date
        if (tokenParams.has('se')) {
            const expiryDate = new Date(tokenParams.get('se'));
            const now = new Date();
            
            if (expiryDate <= now) {
                validation.isValid = false;
                validation.errors.push('SAS token has expired');
            } else if (expiryDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
                validation.warnings.push('SAS token expires within 7 days');
            }
        }

        // Check permissions
        if (tokenParams.has('sp')) {
            const permissions = tokenParams.get('sp');
            const requiredPerms = ['r', 'w', 'd', 'l'];
            
            requiredPerms.forEach(perm => {
                if (!permissions.includes(perm)) {
                    validation.warnings.push(`Missing recommended permission: ${perm}`);
                }
            });
        }

        return validation;
    }
}

// Export for use
window.AzureConfig = AzureConfig;
