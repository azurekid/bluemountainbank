/**
 * Azure SAS Token Service - Backend API
 * Provides secure SAS token generation for Azure Blob Storage
 */

const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting for SAS token requests
const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many token requests, please try again later.'
});

// Azure Storage configuration (use environment variables in production)
const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'bluemountainbank';
const STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || 'your-storage-key';
const CONTAINER_NAME = 'job-applications';

/**
 * Generate a secure SAS token for blob storage uploads
 */
app.post('/api/generate-sas-token', tokenLimiter, async (req, res) => {
    try {
        const { applicationId, fileCount } = req.body;
        
        // Validate request
        if (!applicationId || !fileCount || fileCount > 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request parameters'
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
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Token service running on port ${port}`);
});

module.exports = app;
