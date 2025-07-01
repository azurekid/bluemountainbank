/**
 * Job Application Form Handler
 * Manages form submission, file uploads, and Azure Blob Storage integration
 */

class JobApplicationManager {
    constructor() {
        this.azureStorage = new AzureBlobStorageManager();
        this.applicationId = this.azureStorage.generateApplicationId();
        this.uploadedFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedFileTypes = ['.pdf', '.doc', '.docx'];
        
        this.initializeForm();
        this.setupEventListeners();
        this.loadJobInfo();
    }

    /**
     * Initialize form elements
     */
    initializeForm() {
        this.form = document.getElementById('jobApplicationForm');
        this.fileInput = document.getElementById('fileInput');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.uploadedFilesContainer = document.getElementById('uploadedFiles');
        this.submitBtn = document.getElementById('submitBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // File upload area click
        this.fileUploadArea.addEventListener('click', () => this.fileInput.click());

        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Drag and drop events
        this.fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileUploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Prevent default drag behaviors on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    /**
     * Load job information from URL parameters or localStorage
     */
    loadJobInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        const jobTitle = urlParams.get('position') || localStorage.getItem('selectedJobTitle') || 'General Application';
        const jobLocation = urlParams.get('location') || localStorage.getItem('selectedJobLocation') || 'Multiple Locations';
        const jobType = urlParams.get('type') || localStorage.getItem('selectedJobType') || 'Full-time';

        document.getElementById('jobTitle').textContent = jobTitle;
        document.getElementById('jobLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${jobLocation}`;
        document.getElementById('jobType').textContent = jobType;

        // Clear stored job info
        localStorage.removeItem('selectedJobTitle');
        localStorage.removeItem('selectedJobLocation');
        localStorage.removeItem('selectedJobType');
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.setLoading(true);
        this.hideMessages();

        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Upload files if any
            let fileUploadResults = [];
            if (this.uploadedFiles.length > 0) {
                this.showProgress();
                fileUploadResults = await this.uploadFiles();
            }

            // Save application data
            const applicationData = {
                ...formData,
                applicationId: this.applicationId,
                submittedAt: new Date().toISOString(),
                files: fileUploadResults.filter(result => result.success)
            };

            const saveResult = await this.azureStorage.saveApplicationData(applicationData, this.applicationId);
            
            if (saveResult.success) {
                this.showSuccessMessage();
                this.resetForm();
            } else {
                throw new Error(saveResult.error || 'Failed to save application');
            }

        } catch (error) {
            console.error('Application submission error:', error);
            this.showErrorMessage(error.message);
        } finally {
            this.setLoading(false);
            this.hideProgress();
        }
    }

    /**
     * Collect form data
     */
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add job information
        data.position = document.getElementById('jobTitle').textContent;
        data.location = document.getElementById('jobLocation').textContent.replace('📍 ', '');
        data.employmentType = document.getElementById('jobType').textContent;
        
        return data;
    }

    /**
     * Validate form data
     */
    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                this.showFieldError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        // Validate email format
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailRegex.test(emailInput.value)) {
            this.showFieldError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(input, message) {
        input.style.borderColor = 'rgba(239, 68, 68, 0.8)';
        input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.3)';
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    /**
     * Clear field error
     */
    clearFieldError(input) {
        input.style.borderColor = '';
        input.style.boxShadow = '';
        
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Handle file selection
     */
    handleFileSelect(files) {
        this.addFiles(Array.from(files));
    }

    /**
     * Handle drag over event
     */
    handleDragOver(event) {
        event.preventDefault();
        this.fileUploadArea.classList.add('dragover');
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
    }

    /**
     * Handle drop event
     */
    handleDrop(event) {
        event.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        this.addFiles(files);
    }

    /**
     * Add files to upload queue
     */
    addFiles(files) {
        files.forEach(file => {
            const validation = this.azureStorage.validateFile(file);
            if (validation.valid) {
                // Check if file already exists
                const existingFile = this.uploadedFiles.find(f => f.name === file.name && f.size === file.size);
                if (!existingFile) {
                    this.uploadedFiles.push(file);
                    this.renderUploadedFile(file);
                }
            } else {
                this.showErrorMessage(validation.error);
            }
        });

        // Clear file input
        this.fileInput.value = '';
    }

    /**
     * Render uploaded file in the UI
     */
    renderUploadedFile(file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file';
        fileDiv.setAttribute('data-file-name', file.name);

        const fileInfo = document.createElement('div');
        fileInfo.className = 'uploaded-file-info';

        const icon = this.getFileIcon(file.type);
        const fileSize = this.formatFileSize(file.size);

        fileInfo.innerHTML = `
            <i class="${icon}"></i>
            <div>
                <div class="uploaded-file-name">${file.name}</div>
                <div class="uploaded-file-size">${fileSize}</div>
            </div>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
        removeBtn.onclick = () => this.removeFile(file.name);

        fileDiv.appendChild(fileInfo);
        fileDiv.appendChild(removeBtn);
        this.uploadedFilesContainer.appendChild(fileDiv);
    }

    /**
     * Remove file from upload queue
     */
    removeFile(fileName) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== fileName);
        
        const fileDiv = this.uploadedFilesContainer.querySelector(`[data-file-name="${fileName}"]`);
        if (fileDiv) {
            fileDiv.remove();
        }
    }

    /**
     * Upload all files to Azure Blob Storage
     */
    async uploadFiles() {
        const results = await this.azureStorage.uploadFiles(
            this.uploadedFiles,
            this.applicationId,
            (progress, message) => this.updateProgress(progress, message)
        );

        return results;
    }

    /**
     * Get file icon based on file type
     */
    getFileIcon(fileType) {
        if (fileType === 'application/pdf') {
            return 'fas fa-file-pdf';
        } else if (fileType.includes('word')) {
            return 'fas fa-file-word';
        } else {
            return 'fas fa-file';
        }
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show upload progress
     */
    showProgress() {
        this.uploadProgress.style.display = 'block';
    }

    /**
     * Hide upload progress
     */
    hideProgress() {
        this.uploadProgress.style.display = 'none';
    }

    /**
     * Update progress bar
     */
    updateProgress(progress, message) {
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = message || `${Math.round(progress)}% complete`;
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.submitBtn.disabled = loading;
        this.submitBtn.innerHTML = loading 
            ? '<i class="fas fa-spinner fa-spin"></i> Submitting...'
            : '<i class="fas fa-paper-plane"></i> Submit Application';
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        this.successMessage.style.display = 'block';
        this.successMessage.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        document.getElementById('errorText').textContent = message;
        this.errorMessage.style.display = 'block';
        this.errorMessage.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Hide all messages
     */
    hideMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        this.form.reset();
        this.uploadedFiles = [];
        this.uploadedFilesContainer.innerHTML = '';
        this.applicationId = this.azureStorage.generateApplicationId();
    }

    /**
     * Test Azure connection on page load
     */
    async testAzureConnection() {
        try {
            const result = await this.azureStorage.testConnection();
            if (!result.success) {
                console.warn('Azure Blob Storage connection test failed:', result.message);
                // You might want to show a warning to the user or fall back to local storage
            }
        } catch (error) {
            console.error('Error testing Azure connection:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobApplicationManager = new JobApplicationManager();
    
    // Test Azure connection
    window.jobApplicationManager.testAzureConnection();
});

// Helper function to set job info when navigating from careers page
window.setJobInfo = function(title, location, type) {
    localStorage.setItem('selectedJobTitle', title);
    localStorage.setItem('selectedJobLocation', location);
    localStorage.setItem('selectedJobType', type);
};
