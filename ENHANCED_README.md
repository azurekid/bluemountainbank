# Blue Mountain Bank Job Application System - Enhanced Edition

A comprehensive job application system with modern glassmorphism design, Azure Blob Storage integration, email notifications, and admin management capabilities.

## 🚀 Features

### Core Functionality
- **Modern Glassmorphism UI**: Beautiful, transparent glass-like design with blur effects
- **Real Job Application Form**: Professional form with validation and file upload
- **Azure Blob Storage Integration**: Secure file storage with SAS token authentication
- **Email Notifications**: Automated confirmation and HR notification emails
- **Admin Dashboard**: Complete application management interface
- **Enhanced Accessibility**: WCAG 2.1 compliant with screen reader support
- **Mobile Responsive**: Optimized for all device sizes

### Enhanced Features
- **Secure Backend API**: Node.js/Express server with security middleware
- **Rate Limiting**: Protection against abuse and spam
- **Form Validation**: Client and server-side validation
- **File Validation**: Type, size, and duplicate checking
- **Progress Tracking**: Real-time upload progress indicators
- **Error Handling**: User-friendly error messages and recovery
- **Accessibility**: Full keyboard navigation and screen reader support

## 📁 Project Structure

```
bluemountainbank/
├── api/                          # Backend API server
│   ├── server.js                 # Main API server with all endpoints
│   ├── token-service.js          # SAS token generation service
│   ├── email-service.js          # Email notification service
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Environment configuration template
├── css/
│   ├── careers.css               # Enhanced glassmorphism careers page styles
│   └── [other css files]
├── js/
│   ├── azure-blob-storage.js     # Enhanced Azure storage manager
│   ├── job-application.js        # Enhanced application form handler
│   ├── job-applications-admin.js # Admin interface logic
│   ├── job-applications-data-service.js # Sample data service (mimics external storage)
│   └── [other js files]
├── careers.html                  # Enhanced careers page
├── job-application.html          # Professional application form
├── job-applications-admin.html   # Admin management interface
└── [other html files]
```

## 🛠️ Installation & Setup

### Frontend Setup
1. Open the project in VS Code
2. Use Live Server extension to serve the files
3. Navigate to `careers.html` to start

### Backend Setup
1. **Install Dependencies**
   ```bash
   cd api
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Required Environment Variables**
   ```env
   # Azure Storage (Required)
   AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
   AZURE_STORAGE_ACCOUNT_KEY=your_storage_key
   
   # Email Service (Required)
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@company.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=hr@bluemountainbank.com
   HR_EMAIL=hr@bluemountainbank.com
   ```

4. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Azure Storage Setup
1. **Create Storage Account**
   - Go to Azure Portal
   - Create a new Storage Account
   - Note the account name and access key

2. **Create Container**
   - Create a container named `job-applications`
   - Set access level to Private

3. **Configure CORS** (if needed)
   - Allow your domain in CORS settings
   - Set allowed methods: GET, POST, PUT, OPTIONS

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in your `.env` file

### Other Email Providers
Update the SMTP configuration in your `.env` file:
```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

## 🎨 Design Features

### Glassmorphism Effects
- **Ultra-transparent backgrounds** with `rgba(255, 255, 255, 0.08)`
- **Strong blur effects** using `backdrop-filter: blur(25px)`
- **Subtle borders** with `rgba(255, 255, 255, 0.25)`
- **Multi-layered shadows** for depth
- **White text with shadows** for contrast

### Accessibility Features
- **ARIA labels and descriptions** for screen readers
- **Keyboard navigation** support
- **High contrast mode** support
- **Reduced motion** support
- **Focus indicators** for all interactive elements
- **Error announcements** for form validation

## 📱 Mobile Responsiveness

- **Responsive grid layouts** that adapt to screen size
- **Touch-friendly buttons** with adequate tap targets
- **Optimized font sizes** for mobile readability
- **Collapsible navigation** on smaller screens
- **Prevented zoom on iOS** with proper input styling

## 🔒 Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **SAS Token**: 10 requests per 15 minutes
- **Applications**: 5 submissions per hour

### Data Protection
- **Input validation** on client and server
- **File type restrictions** (PDF, DOC, DOCX only)
- **File size limits** (10MB maximum)
- **Secure SAS tokens** with 2-hour expiry
- **CORS protection** for cross-origin requests

## 📊 Admin Features

### Application Management
- **View all applications** with filtering and search
- **Update application status** (New, Reviewed, Interview, Rejected)
- **Download application files** from Azure storage
- **Export applications** to CSV format
- **Real-time statistics** dashboard

### Filtering Options
- Filter by status, position, date range
- Search by applicant name or email
- Pagination for large datasets
- Sort by various criteria

### Sensitive Data Handling
- **Secure Display**: SSN and date of birth shown with special highlighting
- **Role-based Access**: Admin-only access to sensitive personal information
- **Security Clearance**: Track and display government clearance levels
- **Background Check Results**: Complete status tracking and result display
- **Audit Trails**: Notes and comments tracked with timestamps and author
- **Data Protection**: Follows privacy best practices for sensitive information display

### Admin Interface & Sample Data Service
- **Comprehensive Admin Dashboard**: Complete application management interface
- **Sample Data Service**: Realistic demonstration data including sensitive information
- **External Storage Simulation**: Mimics Azure Blob Storage integration for demo purposes
- **Sensitive Data Display**: SSN, date of birth, and security clearance information
- **Background Check Tracking**: Complete status and result management
- **Interview Scheduling**: Track interview types, dates, and notes
- **Advanced Filtering**: Filter by status, department, position, priority, and search
- **File Management**: Download individual files or bulk export
- **Application Notes**: HR team can add and track internal notes

## 🚀 API Endpoints

### Authentication & Tokens
- `POST /api/generate-sas-token` - Generate secure SAS token for file uploads

### Email Notifications
- `POST /api/send-confirmation-email` - Send confirmation to applicant
- `POST /api/send-hr-notification` - Send notification to HR team

### Application Management
- `GET /api/applications/stats` - Get application statistics
- `GET /api/health` - Health check endpoint

## 🧪 Testing

### Manual Testing Checklist
- [ ] Form validation works correctly
- [ ] File upload functionality
- [ ] Email notifications sent
- [ ] Admin interface displays data
- [ ] Mobile responsiveness
- [ ] Accessibility with screen reader
- [ ] Keyboard navigation
- [ ] Error handling

### Automated Testing
```bash
cd api
npm test
```

## 🔧 Customization

### Styling
- Modify `css/careers.css` for glassmorphism effects
- Update colors in CSS custom properties
- Adjust blur and transparency values

### Email Templates
- Edit templates in `api/server.js`
- Customize branding and content
- Add additional email types

### File Validation
- Update allowed file types in `js/job-application.js`
- Modify file size limits
- Add custom validation rules

## 📈 Performance Optimization

### Frontend
- **Optimized images** with proper formats and sizes
- **Minified CSS/JS** for production
- **Lazy loading** for images
- **Efficient animations** with CSS transforms

### Backend
- **Connection pooling** for database connections
- **Caching** for frequently accessed data
- **Compression** for API responses
- **CDN integration** for static assets

## 🚦 Deployment

### Frontend Deployment
1. Build and minify assets
2. Deploy to CDN or static hosting (Netlify, Vercel, Azure Static Web Apps)
3. Configure domain and SSL

### Backend Deployment
1. Deploy to cloud platform (Azure App Service, Heroku, AWS)
2. Set environment variables
3. Configure database and Redis (if using)
4. Set up monitoring and logging

### Environment-Specific Configurations
- **Development**: Full error messages, debug logging
- **Staging**: Similar to production with test data
- **Production**: Minimal error exposure, performance monitoring

## 🐛 Troubleshooting

### Common Issues
1. **SAS Token Errors**: Check Azure credentials and container permissions
2. **Email Not Sending**: Verify SMTP configuration and credentials
3. **File Upload Fails**: Check file size, type, and Azure storage access
4. **CORS Errors**: Configure Azure storage CORS settings

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 📚 Documentation

- [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: hr@bluemountainbank.com
- Documentation: Check the README and inline code comments
- Issues: Create an issue in the repository

---

**Blue Mountain Bank Job Application System** - Providing a modern, accessible, and secure application experience for job seekers and HR teams.
