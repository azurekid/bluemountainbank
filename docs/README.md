# Blue Mountain Bank Job Application System - Enhanced Edition

A comprehensive job application system with modern glassmorphism design, Azure Blob Storage integration, email notifications, and admin management capabilities.

## 🚀 Features

### Core Functionality
- **Modern Glassmorphism UI**: Beautiful, transparent glass-like design with blur effects
- **Real Job Application Form**: Professional form with validation and file upload
- **Azure Blob Storage Integration**: Secure file storage with SAS token authentication
- **Email Notifications**: Automated confirmation and HR notification emails
- **Admin Dashboard**: Complete application management interface with secure authentication
- **Enhanced Accessibility**: WCAG 2.1 compliant with screen reader support
- **Mobile Responsive**: Optimized for all device sizes

### Enhanced Features
- **Secure Backend API**: Node.js/Express server with security middleware
- **Admin Authentication**: Session-based admin access control with timeout
- **CDN Integration**: Content Delivery Network support with automatic fallback
- **Rate Limiting**: Protection against abuse and spam
- **Form Validation**: Client and server-side validation
- **File Validation**: Type, size, and duplicate checking
- **Progress Tracking**: Real-time upload progress indicators
- **Error Handling**: User-friendly error messages and recovery
- **Accessibility**: Full keyboard navigation and screen reader support

## 📁 Project Structure

```
bluemountainbank/
├── admin/                        # Admin tools and utilities
│   ├── index.html                # Main admin tools dashboard
│   ├── create-user.html          # User creation tool
│   ├── manage-credentials.html   # Credential management interface
│   ├── migrate-credentials.html  # Credential migration tool
│   └── [other admin tools]
├── api/                          # Backend API server
│   ├── server.js                 # Main API server with all endpoints
│   ├── token-service.js          # SAS token generation service
│   ├── email-service.js          # Email notification service
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Environment configuration template
├── css/
│   ├── careers.css               # Enhanced glassmorphism careers page styles
│   └── [other css files]
├── docs/
│   ├── ADMIN_AUTHENTICATION_GUIDE.md # Admin security documentation
│   ├── AZURE_IMPLEMENTATION_SUMMARY.md # Azure integration overview
│   ├── AZURE_SETUP_GUIDE.md      # Detailed Azure setup instructions
│   ├── CDN_CONFIGURATION_GUIDE.md # CDN setup and integration instructions
│   ├── CORS_CONFIGURATION_GUIDE.md # CORS setup guidelines
│   └── CORS_IMPLEMENTATION_STATUS.md # Current CORS implementation status
├── js/
│   ├── api-manager.js            # Centralized API request handling
│   ├── azure-blob-storage.js     # Core Azure Blob Storage functionality
│   ├── azure-config.js           # Azure configuration and credentials
│   ├── azure-proxy.js            # CORS proxy for Azure requests
│   ├── azure-storage-manager.js  # Enhanced storage management
│   ├── cdn-helper.js             # CDN asset loading with fallback
│   ├── job-application.js        # Job application form logic
│   └── [other js files]
├── admin.html                    # Main admin dashboard (protected)
├── careers.html                  # Enhanced careers page
├── job-application.html          # Professional application form
├── job-applications-admin.html   # Admin management interface
├── login.html                    # User and admin login page
├── health/
│   └── cdn-status.json           # CDN availability status and configuration
└── [other html files]
```

## 🔒 Admin Authentication

The system includes a secure admin authentication system:

- **Protected Admin Areas**: All admin pages (`/admin.html` and `/admin/*`) require login
- **Session Management**: 30-minute session timeout with visual countdown
- **Automatic Redirect**: Unauthorized access redirects to login page
- **Session Persistence**: Admin session preserved across admin tools

Default admin credentials (change before production):
- Username: `admin`
- Password: `admin123`

See `docs/ADMIN_AUTHENTICATION_GUIDE.md` for details.


## 🆘 Support

For support and questions:
- Email: hr@bluemountainbank.com
- Documentation: Check the README and inline code comments
- Issues: Create an issue in the repository

---

**Blue Mountain Bank Job Application System** - Providing a modern, accessible, and secure application experience for job seekers and HR teams.
