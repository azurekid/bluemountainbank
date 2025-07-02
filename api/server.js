/**
 * Complete Backend API for Blue Mountain Bank Job Applications
 * Integrates token service, email notifications, and application management
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 token requests per windowMs
    message: { success: false, error: 'Too many token requests, please try again later.' }
});

const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 applications per hour
    message: { success: false, error: 'Too many applications submitted. Please try again later.' }
});

app.use(generalLimiter);

// Azure Storage configuration
const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || 'job-applications';

// Email configuration
const emailTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify email configuration
emailTransporter.verify()
    .then(() => console.log('Email service is ready'))
    .catch(error => console.error('Email service error:', error));

/**
 * Generate secure SAS token for file uploads
 */
app.post('/api/generate-sas-token', tokenLimiter, async (req, res) => {
    try {
        const { applicationId, fileCount } = req.body;
        
        // Validate request
        if (!applicationId || !fileCount || fileCount > 5 || fileCount < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request parameters. File count must be between 1 and 5.'
            });
        }

        // Validate application ID format
        if (!/^app_[a-zA-Z0-9]{8,}$/.test(applicationId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid application ID format'
            });
        }

        // Create storage credentials
        const sharedKeyCredential = new StorageSharedKeyCredential(
            STORAGE_ACCOUNT_NAME, 
            STORAGE_ACCOUNT_KEY
        );

        // Set permissions and expiry
        const permissions = new BlobSASPermissions();
        permissions.write = true;
        permissions.create = true;

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 2); // Token expires in 2 hours

        // Generate SAS token
        const sasToken = generateBlobSASQueryParameters({
            containerName: CONTAINER_NAME,
            permissions: permissions,
            startsOn: new Date(),
            expiresOn: expiryDate,
        }, sharedKeyCredential).toString();

        // Log token generation for audit
        console.log(`SAS token generated for application: ${applicationId} at ${new Date().toISOString()}`);

        res.json({
            success: true,
            sasToken: sasToken,
            expiresAt: expiryDate.toISOString(),
            containerUrl: `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}`
        });

    } catch (error) {
        console.error('Error generating SAS token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate SAS token'
        });
    }
});

/**
 * Send confirmation email to applicant
 */
app.post('/api/send-confirmation-email', async (req, res) => {
    try {
        const { email, firstName, lastName, position, applicationId, fileCount } = req.body;
        
        // Validate required fields
        if (!email || !firstName || !lastName || !position || !applicationId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const emailTemplate = generateConfirmationEmail({
            firstName,
            lastName,
            position,
            applicationId,
            fileCount: fileCount || 0
        });

        const mailOptions = {
            from: `"Blue Mountain Bank HR" <${process.env.FROM_EMAIL}>`,
            to: email,
            subject: `Application Received - ${position}`,
            html: emailTemplate,
            text: stripHtml(emailTemplate)
        };

        const result = await emailTransporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error sending confirmation email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send confirmation email'
        });
    }
});

/**
 * Send HR notification email
 */
app.post('/api/send-hr-notification', async (req, res) => {
    try {
        const applicationData = req.body;
        
        // Validate required fields
        if (!applicationData.firstName || !applicationData.lastName || !applicationData.email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required application data'
            });
        }

        const emailTemplate = generateHRNotificationEmail(applicationData);

        const mailOptions = {
            from: `"Blue Mountain Bank System" <${process.env.FROM_EMAIL}>`,
            to: process.env.HR_EMAIL,
            subject: `New Job Application - ${applicationData.position || 'General Application'}`,
            html: emailTemplate,
            text: stripHtml(emailTemplate)
        };

        const result = await emailTransporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error sending HR notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send HR notification'
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            email: emailTransporter ? 'ready' : 'unavailable',
            storage: STORAGE_ACCOUNT_NAME ? 'configured' : 'not configured'
        }
    });
});

/**
 * Get application statistics (for admin dashboard)
 */
app.get('/api/applications/stats', async (req, res) => {
    try {
        // In production, this would query your database
        // For now, return mock statistics
        res.json({
            success: true,
            stats: {
                total: 25,
                new: 8,
                reviewed: 12,
                interview: 3,
                hired: 2,
                thisWeek: 5
            }
        });
    } catch (error) {
        console.error('Error getting application stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get application statistics'
        });
    }
});

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

/**
 * Email template functions
 */
function generateConfirmationEmail(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Application Received</h1>
                <p>Thank you for your interest in Blue Mountain Bank</p>
            </div>
            <div class="content">
                <p>Dear ${data.firstName} ${data.lastName},</p>
                
                <p>We have successfully received your application for the <strong>${data.position}</strong> position.</p>
                
                <div class="highlight">
                    <h3>Application Details:</h3>
                    <ul>
                        <li><strong>Position:</strong> ${data.position}</li>
                        <li><strong>Application ID:</strong> ${data.applicationId}</li>
                        <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
                        <li><strong>Files Received:</strong> ${data.fileCount} document(s)</li>
                    </ul>
                </div>
                
                <p>Our HR team will review your application and contact you within 5-7 business days.</p>
                
                <p>Best regards,<br><strong>Blue Mountain Bank HR Team</strong></p>
            </div>
            <div class="footer">
                <p>Blue Mountain Bank | 123 Main Street | Mountain View, CA 94041</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

function generateHRNotificationEmail(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .applicant-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .urgent { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 New Job Application</h1>
            </div>
            <div class="content">
                <div class="urgent">
                    <strong>⚡ Action Required:</strong> New application needs review
                </div>
                
                <div class="applicant-info">
                    <h3>Applicant Information</h3>
                    <ul>
                        <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
                        <li><strong>Email:</strong> ${data.email}</li>
                        <li><strong>Phone:</strong> ${data.phone}</li>
                        <li><strong>Position:</strong> ${data.position}</li>
                        <li><strong>Experience:</strong> ${data.experience}</li>
                        <li><strong>Application ID:</strong> ${data.applicationId}</li>
                        <li><strong>Submitted:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Start server
app.listen(port, () => {
    console.log(`Blue Mountain Bank API server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
