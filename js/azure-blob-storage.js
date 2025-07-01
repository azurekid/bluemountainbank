/**
 * Azure Blob Storage Manager for Job Applications
 * Handles file uploads to Azure Blob Storage with SAS token authentication
 */

class AzureBlobStorageManager {
    constructor() {
        // Azure Storage configuration
        this.storageAccount = 'bluemountainbank'; // Replace with your storage account name
        this.containerName = 'job-applications';
        this.sasToken = this.getSasToken();
        this.baseUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}`;
    }

    /**
     * Get SAS token for blob storage access
     * In production, this should come from a secure backend endpoint
     */
    getSasToken() {
        // This is a placeholder SAS token
        // In production, you should:
        // 1. Call your backend API to get a fresh SAS token
        // 2. Store SAS tokens securely
        // 3. Implement token refresh logic
        
        const storedToken = localStorage.getItem('azure_sas_token');
        if (storedToken && this.isTokenValid(storedToken)) {
            return storedToken;
        }

        // For demo purposes - replace with actual SAS token
        // Format: ?sv=2021-06-08&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIGNATURE
        const demoToken = this.generateDemoToken();
        localStorage.setItem('azure_sas_token', demoToken);
        return demoToken;
    }

    /**
     * Generate a demo SAS token for testing
     * Replace this with actual token retrieval from your backend
     */
    generateDemoToken() {
        const currentDate = new Date();
        const expiryDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now
        
        // This is a demo token structure - replace with real token from Azure
        return `?sv=2021-06-08&ss=b&srt=co&sp=rwac&se=${expiryDate.toISOString()}&st=${currentDate.toISOString()}&spr=https&sig=DEMO_SIGNATURE`;
    }

    /**
     * Check if SAS token is still valid
     */
    isTokenValid(token) {
        try {
            const params = new URLSearchParams(token.slice(1));
            const expiryTime = params.get('se');
            if (!expiryTime) return false;
            
            const expiry = new Date(expiryTime);
            const now = new Date();
            
            // Token is valid if it expires more than 5 minutes from now
            return expiry.getTime() > (now.getTime() + 5 * 60 * 1000);
        } catch (error) {
            console.error('Error validating SAS token:', error);
            return false;
        }
    }

    /**
     * Upload a single file to Azure Blob Storage
     */
    async uploadFile(file, applicationId, onProgress = null) {
        try {
            // Generate unique blob name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileExtension = file.name.split('.').pop();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const blobName = `${applicationId}/${timestamp}_${sanitizedFileName}`;
            
            // Construct upload URL
            const uploadUrl = `${this.baseUrl}/${blobName}${this.sasToken}`;
            
            // Create upload headers
            const headers = {
                'x-ms-blob-type': 'BlockBlob',
                'x-ms-blob-content-disposition': `attachment; filename="${file.name}"`,
                'Content-Type': file.type || 'application/octet-stream'
            };

            // Upload using fetch with progress tracking
            const response = await this.uploadWithProgress(uploadUrl, file, headers, onProgress);
            
            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status} ${response.statusText}`);
            }

            return {
                success: true,
                blobName: blobName,
                url: `${this.baseUrl}/${blobName}`,
                fileName: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('File upload error:', error);
            return {
                success: false,
                error: error.message,
                fileName: file.name
            };
        }
    }

    /**
     * Upload file with progress tracking
     */
    async uploadWithProgress(url, file, headers, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({
                        ok: true,
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error occurred'));
            });

            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timeout'));
            });

            xhr.open('PUT', url);
            
            // Set headers
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });

            xhr.timeout = 300000; // 5 minutes timeout
            xhr.send(file);
        });
    }

    /**
     * Upload multiple files
     */
    async uploadFiles(files, applicationId, onProgress = null) {
        const results = [];
        let totalFiles = files.length;
        let completedFiles = 0;

        for (const file of files) {
            const fileProgress = (progress) => {
                const overallProgress = ((completedFiles + (progress / 100)) / totalFiles) * 100;
                if (onProgress) {
                    onProgress(overallProgress, `Uploading ${file.name}...`);
                }
            };

            const result = await this.uploadFile(file, applicationId, fileProgress);
            results.push(result);
            completedFiles++;

            if (onProgress) {
                onProgress((completedFiles / totalFiles) * 100, `Uploaded ${completedFiles}/${totalFiles} files`);
            }
        }

        return results;
    }

    /**
     * Save application data to blob storage as JSON
     */
    async saveApplicationData(applicationData, applicationId) {
        try {
            const jsonData = JSON.stringify(applicationData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const file = new File([blob], `application_${applicationId}.json`, { type: 'application/json' });
            
            const result = await this.uploadFile(file, applicationId);
            return result;
        } catch (error) {
            console.error('Error saving application data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get list of uploaded files for an application
     */
    async listApplicationFiles(applicationId) {
        try {
            const listUrl = `${this.baseUrl}${this.sasToken}&comp=list&prefix=${applicationId}/`;
            
            const response = await fetch(listUrl);
            if (!response.ok) {
                throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
            }

            const xmlText = await response.text();
            return this.parseFileListXml(xmlText);
        } catch (error) {
            console.error('Error listing files:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Parse XML response from blob storage list operation
     */
    parseFileListXml(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const blobs = xmlDoc.getElementsByTagName('Blob');
            
            const files = [];
            for (let blob of blobs) {
                const name = blob.getElementsByTagName('Name')[0]?.textContent;
                const lastModified = blob.getElementsByTagName('Last-Modified')[0]?.textContent;
                const size = blob.getElementsByTagName('Content-Length')[0]?.textContent;
                const contentType = blob.getElementsByTagName('Content-Type')[0]?.textContent;
                
                if (name) {
                    files.push({
                        name: name,
                        lastModified: lastModified,
                        size: parseInt(size) || 0,
                        contentType: contentType,
                        url: `${this.baseUrl}/${name}`
                    });
                }
            }
            
            return { success: true, files: files };
        } catch (error) {
            console.error('Error parsing file list XML:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a file from blob storage
     */
    async deleteFile(blobName) {
        try {
            const deleteUrl = `${this.baseUrl}/${blobName}${this.sasToken}`;
            
            const response = await fetch(deleteUrl, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate unique application ID
     */
    generateApplicationId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `app_${timestamp}_${random}`;
    }

    /**
     * Validate file before upload
     */
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Only PDF, DOC, and DOCX files are allowed'
            };
        }

        return { valid: true };
    }

    /**
     * Test connection to Azure Blob Storage
     */
    async testConnection() {
        try {
            const testUrl = `${this.baseUrl}${this.sasToken}&comp=list&maxresults=1`;
            const response = await fetch(testUrl);
            
            return {
                success: response.ok,
                status: response.status,
                message: response.ok ? 'Connection successful' : `Connection failed: ${response.statusText}`
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection error: ${error.message}`
            };
        }
    }
}

// Export for use in other scripts
window.AzureBlobStorageManager = AzureBlobStorageManager;
