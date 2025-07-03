# Blue Mountain Bank - Enhanced Security & Management

This repository contains the Blue Mountain Bank web application with enhanced security features and user management capabilities.

## Recent Enhancements

### Secure Credential Management

1. **Separate Credential Storage**:
   - User credentials are now stored in a dedicated `credentials` container
   - Improved security by isolating authentication data from user profiles

2. **Credential Migration Tool**:
   - New tool at `/admin/migrate-credentials.html` to move credentials to the secure container
   - Helps transition existing users to the new security model

3. **Enhanced User Creation**:
   - User creator now automatically saves credentials to the secure container
   - Provides credential download functionality for administrators

4. **Improved Authentication Flow**:
   - First checks the secure credentials container
   - Falls back to the user data container if needed
   - Provides detailed authentication source tracking

### CORS & Connectivity Improvements

1. **CORS Implementation Status**:
   - Detailed documentation at `/docs/CORS_IMPLEMENTATION_STATUS.md`
   - Clear roadmap for production-ready CORS configuration

2. **Client-Side Proxy**:
   - Implemented at `/js/azure-proxy.js`
   - Automatically routes requests through public CORS proxies
   - Provides fallback options when primary proxy fails

3. **CORS Configuration Guide**:
   - Step-by-step guide at `/docs/CORS_CONFIGURATION_GUIDE.md`
   - Azure portal configuration instructions

### User Experience Improvements

1. **Enhanced Login Process**:
   - Better error handling and user feedback
   - Visual loading states during authentication
   - Improved password handling and security

2. **Admin Dashboard Updates**:
   - New credential migration tool added to the admin dashboard
   - Consistent styling and navigation throughout admin tools

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser
3. Login with:
   - Regular users: Refer to the credentials in the `/sample-data` directory
   - Admin: username `admin`, password `admin123`

## Azure Setup

To use Azure Blob Storage:

1. Create an Azure Storage account
2. Create containers named `userdata` and `credentials`
3. Generate a SAS token with appropriate permissions
4. Update the token in `/js/azure-storage-manager.js`
5. Configure CORS settings following `/docs/CORS_CONFIGURATION_GUIDE.md`

## Security Notes

- For production, replace the public CORS proxies with your own proxy server
- Implement server-side authentication instead of client-side validation
- Use HTTPS for all communication with Azure Storage
- Regularly rotate SAS tokens
- Consider implementing multi-factor authentication

## Tools & Features

### Admin Tools

- **Create User** (`/admin/create-user.html`): Create new users with complete profiles
- **Manage Credentials** (`/admin/manage-credentials.html`): View and edit user credentials
- **Migrate Credentials** (`/admin/migrate-credentials.html`): Move credentials to secure storage
- **Debug User Data** (`/admin/debug-userdata.html`): Test user authentication and connectivity
- **Error Debug Console** (`/admin/error-debug.html`): Advanced error debugging
- **Azure Upload Tool** (`/admin/azure-upload-tool.html`): Upload sample data to Azure
- **Azure Blob Manager** (`/admin/azure-blob-uploader.html`): Manage blob storage
- **Storage Test Lab** (`/admin/test-storage.html`): Test local storage functionality
- **Azure Live Demo** (`/admin/azure-demo.html`): Interactive Azure functionality demo
- **Password Hash Generator** (`/admin/hash-passwords.html`): Generate SHA-256 hashes

### User Features

- **Login** (`/login.html`): Secure user authentication
- **User Dashboard** (`/user-dashboard.html`): Account overview and management
- **Rates** (`/rates.html`): Current interest rates
- **Security** (`/security.html`): Security information

## Documentation

- `/docs/CORS_CONFIGURATION_GUIDE.md`: Azure CORS setup guide
- `/docs/CORS_IMPLEMENTATION_STATUS.md`: CORS implementation status and security improvements
- `/docs/ENHANCED_README.md`: Enhanced project documentation
- `/docs/AZURE_IMPLEMENTATION_SUMMARY.md`: Azure implementation summary
- `/docs/AZURE_SETUP_GUIDE.md`: Azure setup guide
