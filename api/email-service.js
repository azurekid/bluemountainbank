/**
 * Email Notification Service
 * Handles sending email notifications for job applications
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailNotificationService {
    constructor() {
        // Configure email transporter (using environment variables in production)
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'your-email@bluemountainbank.com',
                pass: process.env.SMTP_PASS || 'your-app-password'
            }
        });

        this.fromEmail = process.env.FROM_EMAIL || 'hr@bluemountainbank.com';
        this.hrEmail = process.env.HR_EMAIL || 'hr@bluemountainbank.com';
    }

    /**
     * Send application confirmation email to applicant
     */
    async sendApplicationConfirmation(applicationData) {
        try {
            const emailTemplate = this.getConfirmationTemplate(applicationData);
            
            const mailOptions = {
                from: `"Blue Mountain Bank HR" <${this.fromEmail}>`,
                to: applicationData.email,
                subject: `Application Received - ${applicationData.position}`,
                html: emailTemplate,
                text: this.stripHtml(emailTemplate)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`Confirmation email sent to ${applicationData.email}:`, result.messageId);
            
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('Error sending confirmation email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send new application notification to HR team
     */
    async sendHRNotification(applicationData) {
        try {
            const emailTemplate = this.getHRNotificationTemplate(applicationData);
            
            const mailOptions = {
                from: `"Blue Mountain Bank System" <${this.fromEmail}>`,
                to: this.hrEmail,
                subject: `New Job Application - ${applicationData.position}`,
                html: emailTemplate,
                text: this.stripHtml(emailTemplate)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`HR notification sent:`, result.messageId);
            
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('Error sending HR notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send status update email to applicant
     */
    async sendStatusUpdate(applicationData, newStatus) {
        try {
            const emailTemplate = this.getStatusUpdateTemplate(applicationData, newStatus);
            
            const mailOptions = {
                from: `"Blue Mountain Bank HR" <${this.fromEmail}>`,
                to: applicationData.email,
                subject: `Application Update - ${applicationData.position}`,
                html: emailTemplate,
                text: this.stripHtml(emailTemplate)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`Status update email sent to ${applicationData.email}:`, result.messageId);
            
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('Error sending status update email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get application confirmation email template
     */
    getConfirmationTemplate(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .highlight { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; }
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
                    
                    <p>We have successfully received your application for the <strong>${data.position}</strong> position. Thank you for your interest in joining our team at Blue Mountain Bank.</p>
                    
                    <div class="highlight">
                        <h3>Application Details:</h3>
                        <ul>
                            <li><strong>Position:</strong> ${data.position}</li>
                            <li><strong>Application ID:</strong> ${data.applicationId}</li>
                            <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
                            <li><strong>Files Received:</strong> ${data.fileCount || 0} document(s)</li>
                        </ul>
                    </div>
                    
                    <p>Our HR team will review your application and contact you within 5-7 business days if your qualifications match our requirements.</p>
                    
                    <p>In the meantime, feel free to explore more about our company culture and values on our website.</p>
                    
                    <a href="https://bluemountainbank.com/careers" class="button">View All Positions</a>
                    
                    <p>Best regards,<br>
                    <strong>Blue Mountain Bank HR Team</strong></p>
                </div>
                <div class="footer">
                    <p>Blue Mountain Bank | 123 Main Street | Mountain View, CA 94041</p>
                    <p>This email was sent regarding your job application. Please do not reply to this automated message.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get HR notification email template
     */
    getHRNotificationTemplate(data) {
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
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                .urgent { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 New Job Application</h1>
                    <p>A new application has been submitted</p>
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
                            <li><strong>Expected Salary:</strong> ${data.salary || 'Not specified'}</li>
                            <li><strong>Application ID:</strong> ${data.applicationId}</li>
                            <li><strong>Files Uploaded:</strong> ${data.fileCount || 0} document(s)</li>
                            <li><strong>Submitted:</strong> ${new Date().toLocaleString()}</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="/job-applications-admin.html" class="button">Review Application</a>
                        <a href="/job-applications-admin.html?filter=${data.applicationId}" class="button">View Details</a>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ol>
                        <li>Review the application and uploaded documents</li>
                        <li>Update the application status in the admin panel</li>
                        <li>Schedule interview if candidate meets requirements</li>
                        <li>Send follow-up communication to the applicant</li>
                    </ol>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get status update email template
     */
    getStatusUpdateTemplate(data, status) {
        const statusMessages = {
            reviewed: {
                subject: 'Application Under Review',
                message: 'Your application is currently being reviewed by our hiring team.',
                next: 'We will contact you within the next few days with an update.'
            },
            interview: {
                subject: 'Interview Invitation',
                message: 'Congratulations! We would like to invite you for an interview.',
                next: 'Our HR team will contact you shortly to schedule your interview.'
            },
            rejected: {
                subject: 'Application Status Update',
                message: 'Thank you for your interest in Blue Mountain Bank. While your qualifications are impressive, we have decided to move forward with other candidates.',
                next: 'We encourage you to apply for future positions that match your skills.'
            }
        };

        const statusInfo = statusMessages[status] || statusMessages.reviewed;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-badge { display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
                .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${statusInfo.subject}</h1>
                    <p>Update on your application for ${data.position}</p>
                </div>
                <div class="content">
                    <p>Dear ${data.firstName} ${data.lastName},</p>
                    
                    <p>We wanted to provide you with an update on your application for the <strong>${data.position}</strong> position at Blue Mountain Bank.</p>
                    
                    <p><strong>Current Status:</strong> <span class="status-badge">${status.toUpperCase()}</span></p>
                    
                    <p>${statusInfo.message}</p>
                    
                    <p>${statusInfo.next}</p>
                    
                    <p>If you have any questions, please don't hesitate to contact our HR department at hr@bluemountainbank.com.</p>
                    
                    <p>Best regards,<br>
                    <strong>Blue Mountain Bank HR Team</strong></p>
                </div>
                <div class="footer">
                    <p>Blue Mountain Bank | 123 Main Street | Mountain View, CA 94041</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Strip HTML tags for plain text version
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Test email configuration
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return { success: true };
        } catch (error) {
            console.error('Email service error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailNotificationService;
