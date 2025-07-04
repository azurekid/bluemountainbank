/**
 * Azure Blob Storage Manager for Job Applications
 * Handles file uploads to Azure Blob Storage with SAS token authentication
 */

class AzureBlobStorageManager {
    constructor() {
        // Azure Storage configuration - updated to match the working storage account
        this.storageAccount = 'bluemountaindata'; // Use the existing working storage account
        this.containerName = 'job-applications';
        this.baseUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}`;
        
        // Use the existing working SAS token from the azure-storage-manager
        this.sasToken = 'sv=2024-11-04&ss=b&srt=sco&sp=rwlactfx&se=2028-07-03T02:59:11Z&st=2025-07-01T18:59:11Z&spr=https&sig=4SpC5AFMit2tivoHPxJN%2F63%2BgpmiEPbcYw3XFiNFUv0%3D';
        
        // Initialize proxy for CORS handling
        this.proxy = window.AzureStorageProxy ? new window.AzureStorageProxy() : null;
    }

    /**
     * Get SAS token for blob storage access
     */
    async getSasToken(applicationId, fileCount) {
        try {
            // Return the pre-configured SAS token since we have a working one
            return this.sasToken;
        } catch (error) {
            console.error('Error getting SAS token:', error);
            throw new Error('Unable to authenticate with storage service. Please try again later.');
        }
    }

    /**
     * Generate a unique application ID
     */
    generateApplicationId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `app_${timestamp}_${random}`;
    }

    /**
     * Upload a single file to Azure Blob Storage
     */
    async uploadFile(file, applicationId, onProgress = null) {
        try {
            // Get secure SAS token
            const sasToken = await this.getSasToken(applicationId, 1);
            
            // Generate unique blob name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileExtension = file.name.split('.').pop();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const blobName = `${applicationId}/${timestamp}_${sanitizedFileName}`;
            
            // Construct upload URL
            const uploadUrl = `${this.baseUrl}/${blobName}?${sasToken}`;
            
            // Create upload headers
            const headers = {
                'x-ms-blob-type': 'BlockBlob',
                'x-ms-blob-content-disposition': `attachment; filename="${file.name}"`,
                'Content-Type': file.type || 'application/octet-stream'
            };

            // Upload using proxy if available, otherwise direct upload
            let response;
            if (this.proxy) {
                console.log('Using proxy for file upload');
                response = await this.uploadWithProxy(uploadUrl, file, headers, onProgress);
            } else {
                console.log('Using direct upload (no proxy available)');
                response = await this.uploadWithProgress(uploadUrl, file, headers, onProgress);
            }
            
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
            
            // Provide user-friendly error messages
            let errorMessage = 'Upload failed. Please try again.';
            
            if (error.message.includes('authentication') || error.message.includes('403')) {
                errorMessage = 'Authentication failed. Please refresh the page and try again.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (file.size > 10 * 1024 * 1024) {
                errorMessage = 'File is too large. Please select a file under 10MB.';
            }
            
            return {
                success: false,
                error: errorMessage,
                fileName: file.name
            };
        }
    }

    /**
     * Upload file using Azure proxy for CORS handling
     */
    async uploadWithProxy(url, file, headers, onProgress) {
        try {
            const options = {
                method: 'PUT',
                headers: headers,
                body: file
            };
            
            // Use proxy to send the request
            const response = await this.proxy.sendRequest(url, options);
            
            // Simulate progress since proxy doesn't support progress tracking
            if (onProgress) {
                onProgress(100);
            }
            
            return response;
        } catch (error) {
            console.error('Proxy upload failed:', error);
            throw error;
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
            const listUrl = `${this.baseUrl}?restype=container&comp=list&prefix=${applicationId}/&${this.sasToken}`;
            
            let response;
            if (this.proxy) {
                console.log('Using proxy for file listing');
                response = await this.proxy.sendRequest(listUrl, { method: 'GET' });
            } else {
                console.log('Using direct request for file listing');
                response = await fetch(listUrl);
            }
            
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
