/**
 * Job Applications Admin Interface
 * Manages viewing, filtering, and downloading job applications
 */

class JobApplicationsAdmin {
    constructor() {
        this.dataService = new JobApplicationsDataService();
        this.applications = [];
        this.filteredApplications = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        
        this.initializeAdmin();
    }

    /**
     * Initialize admin interface
     */
    async initializeAdmin() {
        try {
            this.showLoading('Loading applications...');
            
            // Load initial data
            await this.loadApplications();
            await this.updateStatistics();
            await this.populateFilterOptions();
            
            this.hideLoading();
            this.renderApplications();
            this.renderPagination();
            
        } catch (error) {
            console.error('Error initializing admin interface:', error);
            this.showError('Failed to load application data. Please refresh the page.');
            this.hideLoading();
        }
    }

    /**
     * Load applications from data service
     */
    async loadApplications(filters = {}) {
        try {
            const result = await this.dataService.getApplications(filters);
            
            if (result.success) {
                this.applications = result.applications;
                this.filteredApplications = [...this.applications];
                this.currentFilters = filters;
            } else {
                throw new Error(result.error || 'Failed to load applications');
            }
            
        } catch (error) {
            console.error('Error loading applications:', error);
            throw error;
        }
    }

    /**
     * Update statistics dashboard
     */
    async updateStatistics() {
        try {
            const result = await this.dataService.getStatistics();
            
            if (result.success) {
                const stats = result.stats;
                document.getElementById('totalApplications').textContent = stats.total;
                document.getElementById('newApplications').textContent = stats.new;
                document.getElementById('interviewScheduled').textContent = stats.interview;
                document.getElementById('thisWeekApplications').textContent = stats.thisWeek;
            }
            
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    /**
     * Populate filter dropdown options
     */
    async populateFilterOptions() {
        try {
            // Populate department filter
            const departments = this.dataService.getDepartments();
            const departmentSelect = document.getElementById('departmentFilter');
            
            if (departmentSelect) {
                departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept;
                    option.textContent = dept;
                    departmentSelect.appendChild(option);
                });
            }

            // Populate position filter
            const positions = this.dataService.getPositions();
            const positionSelect = document.getElementById('positionFilter');
            
            if (positionSelect) {
                positions.forEach(position => {
                    const option = document.createElement('option');
                    option.value = position;
                    option.textContent = position;
                    positionSelect.appendChild(option);
                });
            }
            
        } catch (error) {
            console.error('Error populating filter options:', error);
        }
    }

    /**
     * Filter applications based on current filter settings
     */
    async filterApplications() {
        try {
            this.showLoading('Filtering applications...');
            
            const filters = {
                status: document.getElementById('statusFilter').value,
                department: document.getElementById('departmentFilter') ? document.getElementById('departmentFilter').value : '',
                position: document.getElementById('positionFilter').value,
                search: document.getElementById('searchFilter').value,
                dateFrom: document.getElementById('dateFromFilter') ? document.getElementById('dateFromFilter').value : '',
                dateTo: document.getElementById('dateToFilter') ? document.getElementById('dateToFilter').value : ''
            };

            // Remove empty filters
            Object.keys(filters).forEach(key => {
                if (!filters[key]) {
                    delete filters[key];
                }
            });

            await this.loadApplications(filters);
            this.currentPage = 1;
            this.hideLoading();
            this.renderApplications();
            this.renderPagination();
            
        } catch (error) {
            console.error('Error filtering applications:', error);
            this.showError('Failed to filter applications. Please try again.');
            this.hideLoading();
        }
    }

    /**
     * Render applications table
     */
    renderApplications() {
        const container = document.getElementById('applicationsContainer');
        
        if (this.filteredApplications.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-inbox"></i>
                    <p>No applications found matching the current filters.</p>
                </div>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageApplications = this.filteredApplications.slice(startIndex, endIndex);

        const html = pageApplications.map(app => `
            <div class="application-row" data-priority="${app.priority}">
                <div class="applicant-info">
                    <div class="applicant-name">
                        ${app.applicant.firstName} ${app.applicant.lastName}
                        ${app.priority === 'high' ? '<i class="fas fa-star" style="color: #f59e0b; margin-left: 5px;" title="High Priority"></i>' : ''}
                    </div>
                    <div class="applicant-email">${app.applicant.email}</div>
                    <div class="applicant-details" style="font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 3px;">
                        📞 ${app.applicant.phone} | SSN: ${app.applicant.ssn}
                        ${app.applicant.securityClearance ? `<br>🔐 ${app.applicant.securityClearance}` : ''}
                    </div>
                </div>
                <div class="position-info">
                    <div class="position-title">${app.position.title}</div>
                    <div class="position-department">${app.position.department}</div>
                    <div class="position-location" style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                        📍 ${app.position.location}
                    </div>
                </div>
                <div class="application-date">
                    <div>${this.formatDate(app.timestamp)}</div>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                        ID: ${app.applicationId}
                    </div>
                </div>
                <div class="experience-info">
                    <div>${app.experience}</div>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                        Expected: ${app.expectedSalary}
                    </div>
                </div>
                <div class="status-info">
                    <div class="status-badge status-${app.status}">${this.capitalizeFirst(app.status)}</div>
                    ${app.backgroundCheck.status !== 'not_required' ? `
                        <div style="font-size: 0.8rem; margin-top: 3px;">
                            <span class="bg-check-badge bg-check-${app.backgroundCheck.status}">
                                🔍 ${this.capitalizeFirst(app.backgroundCheck.status.replace('_', ' '))}
                            </span>
                        </div>
                    ` : ''}
                    ${app.interviews && app.interviews.length > 0 ? `
                        <div style="font-size: 0.8rem; margin-top: 3px; color: rgba(255,255,255,0.7);">
                            📅 Interview: ${this.formatDate(app.interviews[0].scheduledAt)}
                        </div>
                    ` : ''}
                </div>
                <div class="actions">
                    <button class="action-btn view-btn" onclick="adminManager.viewApplication('${app.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download-btn" onclick="adminManager.downloadFiles('${app.id}')" title="Download Files">
                        <i class="fas fa-download"></i> ${app.files.length}
                    </button>
                    <div class="action-dropdown">
                        <button class="action-btn" onclick="adminManager.toggleActionMenu('${app.id}')" title="More Actions">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu" id="menu-${app.id}" style="display: none;">
                            <button onclick="adminManager.updateStatus('${app.id}', 'reviewed')">Mark Reviewed</button>
                            <button onclick="adminManager.updateStatus('${app.id}', 'interview')">Schedule Interview</button>
                            <button onclick="adminManager.updateStatus('${app.id}', 'rejected')">Reject</button>
                            <button onclick="adminManager.requestBackgroundCheck('${app.id}')">Background Check</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * Render pagination controls
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        
        // Previous button
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="adminManager.goToPage(${this.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            html += `<button class="page-btn ${activeClass}" onclick="adminManager.goToPage(${i})">${i}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages) {
            html += `<button class="page-btn" onclick="adminManager.goToPage(${this.currentPage + 1})">Next</button>`;
        }

        paginationContainer.innerHTML = html;
    }

    /**
     * Navigate to specific page
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderApplications();
        this.renderPagination();
    }

    /**
     * View detailed application with sensitive information
     */
    async viewApplication(applicationId) {
        try {
            const result = await this.dataService.getApplication(applicationId);
            
            if (!result.success) {
                this.showError('Application not found');
                return;
            }

            const app = result.application;
            
            // Create comprehensive modal with sensitive data
            const detailHtml = `
                <div style="background: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; display: flex; align-items: center; justify-content: center; overflow-y: auto;" onclick="this.remove()">
                    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-radius: 20px; padding: 40px; max-width: 800px; max-height: 90vh; overflow-y: auto; border: 1px solid rgba(255,255,255,0.2); margin: 20px;" onclick="event.stopPropagation()">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                            <h2 style="color: white; margin: 0;">${app.applicant.firstName} ${app.applicant.lastName}</h2>
                            <div style="display: flex; gap: 10px;">
                                <span class="status-badge status-${app.status}">${this.capitalizeFirst(app.status)}</span>
                                ${app.priority === 'high' ? '<span style="background: rgba(245,158,11,0.8); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">🌟 High Priority</span>' : ''}
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; color: rgba(255,255,255,0.9); line-height: 1.6;">
                            <div>
                                <h3 style="color: white; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">📋 Personal Information</h3>
                                <p><strong>Name:</strong> ${app.applicant.firstName} ${app.applicant.lastName}</p>
                                <p><strong>Email:</strong> ${app.applicant.email}</p>
                                <p><strong>Phone:</strong> ${app.applicant.phone}</p>
                                <p><strong>Address:</strong><br>${app.applicant.address.replace(/\n/g, '<br>')}</p>
                                <p style="color: #fbbf24;"><strong>🔒 SSN:</strong> ${app.applicant.ssn}</p>
                                <p style="color: #fbbf24;"><strong>🔒 DOB:</strong> ${new Date(app.applicant.dateOfBirth).toLocaleDateString()}</p>
                                ${app.applicant.securityClearance ? `<p style="color: #10b981;"><strong>🛡️ Security Clearance:</strong> ${app.applicant.securityClearance}</p>` : ''}
                            </div>
                            
                            <div>
                                <h3 style="color: white; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">💼 Position Details</h3>
                                <p><strong>Position:</strong> ${app.position.title}</p>
                                <p><strong>Department:</strong> ${app.position.department}</p>
                                <p><strong>Location:</strong> ${app.position.location}</p>
                                <p><strong>Employment Type:</strong> ${app.position.type}</p>
                                <p><strong>Salary Range:</strong> ${app.position.salaryRange}</p>
                                <p><strong>Expected Salary:</strong> ${app.expectedSalary}</p>
                                <p><strong>Experience:</strong> ${app.experience}</p>
                            </div>
                        </div>
                        
                        <div style="margin: 30px 0;">
                            <h3 style="color: white; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">📄 Cover Letter</h3>
                            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; color: rgba(255,255,255,0.8); max-height: 150px; overflow-y: auto;">
                                ${app.coverLetter}
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0;">
                            <div>
                                <h3 style="color: white; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">📁 Uploaded Files</h3>
                                ${app.files.map(file => `
                                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="color: white; font-weight: 500;">${file.name}</div>
                                            <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">${this.formatFileSize(file.size)} • ${this.formatDate(file.uploadedAt)}</div>
                                        </div>
                                        <button class="action-btn download-btn" style="padding: 6px 10px;" onclick="adminManager.downloadFile('${app.id}', '${file.name}')">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div>
                                <h3 style="color: white; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">🔍 Background Check</h3>
                                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                                    <p><strong>Status:</strong> <span class="bg-check-badge bg-check-${app.backgroundCheck.status}">${this.capitalizeFirst(app.backgroundCheck.status.replace('_', ' '))}</span></p>
                                    ${app.backgroundCheck.requestedAt ? `<p><strong>Requested:</strong> ${this.formatDate(app.backgroundCheck.requestedAt)}</p>` : ''}
                                    ${app.backgroundCheck.completedAt ? `<p><strong>Completed:</strong> ${this.formatDate(app.backgroundCheck.completedAt)}</p>` : ''}
                                    ${app.backgroundCheck.result ? `<p><strong>Result:</strong> <span style="color: ${app.backgroundCheck.result === 'clear' ? '#10b981' : '#ef4444'};">${app.backgroundCheck.result.toUpperCase()}</span></p>` : ''}
                                </div>
                                
                                ${app.interviews && app.interviews.length > 0 ? `
                                    <h3 style="color: white; margin: 20px 0 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">📅 Interviews</h3>
                                    ${app.interviews.map(interview => `
                                        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                            <p><strong>Type:</strong> ${interview.type.replace('_', ' ').toUpperCase()}</p>
                                            <p><strong>Scheduled:</strong> ${this.formatDate(interview.scheduledAt)}</p>
                                            <p><strong>Interviewer:</strong> ${interview.interviewer}</p>
                                            <p><strong>Status:</strong> <span class="status-badge status-${interview.status}">${interview.status}</span></p>
                                            ${interview.notes ? `<p style="font-size: 0.9rem; color: rgba(255,255,255,0.7);"><em>${interview.notes}</em></p>` : ''}
                                        </div>
                                    `).join('')}
                                ` : ''}
                            </div>
                        </div>
                        
                        ${app.notes && app.notes.length > 0 ? `
                            <div style="margin: 30px 0;">
                                <h3 style="color: white; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">📝 Notes & Comments</h3>
                                <div style="max-height: 200px; overflow-y: auto;">
                                    ${app.notes.map(note => `
                                        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                                <strong style="color: #60a5fa;">${note.author}</strong>
                                                <span style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">${this.formatDate(note.date)}</span>
                                            </div>
                                            <div style="color: rgba(255,255,255,0.9);">${note.content}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div style="margin-top: 30px; display: flex; gap: 15px; flex-wrap: wrap;">
                            <button class="action-btn view-btn" onclick="adminManager.updateStatus('${app.id}', 'reviewed', 'Application reviewed in detail')">Mark Reviewed</button>
                            <button class="action-btn" style="background: rgba(245,158,11,0.8)" onclick="adminManager.updateStatus('${app.id}', 'interview', 'Scheduling interview')">Schedule Interview</button>
                            <button class="action-btn" style="background: rgba(34,197,94,0.8)" onclick="adminManager.updateStatus('${app.id}', 'hired', 'Candidate hired')">Mark Hired</button>
                            <button class="action-btn" style="background: rgba(239,68,68,0.8)" onclick="adminManager.updateStatus('${app.id}', 'rejected', 'Application rejected')">Reject</button>
                            ${!app.backgroundCheck.requested ? `<button class="action-btn" style="background: rgba(168,85,247,0.8)" onclick="adminManager.requestBackgroundCheck('${app.id}')">Request Background Check</button>` : ''}
                            <button class="action-btn download-btn" onclick="adminManager.downloadAllFiles('${app.id}')">Download All Files</button>
                            <button class="action-btn" style="background: rgba(156,163,175,0.8)" onclick="this.closest('[style*=\"position: fixed\"]').remove()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', detailHtml);
            
        } catch (error) {
            console.error('Error viewing application:', error);
            this.showError('Failed to load application details');
        }
    }

    /**
     * Update application status with notes
     */
    async updateStatus(applicationId, newStatus, note = '') {
        try {
            const result = await this.dataService.updateApplicationStatus(applicationId, newStatus, note);
            
            if (result.success) {
                // Refresh the display
                await this.loadApplications(this.currentFilters);
                await this.updateStatistics();
                this.renderApplications();
                
                // Close modal if open
                const modal = document.querySelector('[style*="position: fixed"]');
                if (modal) modal.remove();
                
                this.showSuccess(`Application status updated to ${this.capitalizeFirst(newStatus)}`);
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Error updating status:', error);
            this.showError('Failed to update application status');
        }
    }

    /**
     * Request background check
     */
    async requestBackgroundCheck(applicationId) {
        try {
            // In a real system, this would integrate with a background check service
            await this.dataService.updateApplicationStatus(applicationId, '', 'Background check requested');
            
            this.showSuccess('Background check request submitted');
            
            // Refresh the view
            if (document.querySelector('[style*="position: fixed"]')) {
                this.viewApplication(applicationId);
            }
            
        } catch (error) {
            console.error('Error requesting background check:', error);
            this.showError('Failed to request background check');
        }
    }

    /**
     * Download single file
     */
    async downloadFile(applicationId, fileName) {
        try {
            const result = await this.dataService.getFileDownloadUrl(applicationId, fileName);
            
            if (result.success) {
                // Create download link
                const link = document.createElement('a');
                link.href = result.downloadUrl;
                link.download = result.fileName;
                link.click();
                
                this.showSuccess(`Downloading ${fileName}`);
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Error downloading file:', error);
            this.showError(`Failed to download ${fileName}`);
        }
    }

    /**
     * Download all files for an application
     */
    async downloadAllFiles(applicationId) {
        try {
            const result = await this.dataService.getApplication(applicationId);
            
            if (result.success && result.application.files.length > 0) {
                // Download each file sequentially
                for (const file of result.application.files) {
                    await this.downloadFile(applicationId, file.name);
                    // Small delay between downloads
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                this.showSuccess(`Downloading ${result.application.files.length} files`);
            } else {
                throw new Error('No files found for this application');
            }
            
        } catch (error) {
            console.error('Error downloading files:', error);
            this.showError('Failed to download application files');
        }
    }

    /**
     * Toggle action dropdown menu
     */
    toggleActionMenu(applicationId) {
        const menu = document.getElementById(`menu-${applicationId}`);
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
        
        // Close other open menus
        const allMenus = document.querySelectorAll('.dropdown-menu');
        allMenus.forEach(m => {
            if (m.id !== `menu-${applicationId}`) {
                m.style.display = 'none';
            }
        });
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Enhanced export with current filters
     */
    async exportApplications() {
        try {
            this.showLoading('Preparing export...');
            
            const result = await this.dataService.exportApplications(this.currentFilters);
            
            if (result.success) {
                // Create and download CSV file
                const blob = new Blob([result.csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = result.filename;
                link.click();
                
                window.URL.revokeObjectURL(url);
                this.showSuccess('Applications exported successfully');
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Error exporting applications:', error);
            this.showError('Failed to export applications');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        const container = document.getElementById('applicationsContainer');
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        // Loading is hidden when content is rendered
    }

    /**
     * Utility functions
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            ${type === 'success' ? 'background: rgba(34,197,94,0.8);' : 'background: rgba(239,68,68,0.8);'}
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions for onclick handlers
function filterApplications() {
    if (window.adminManager) {
        window.adminManager.filterApplications();
    }
}

function exportApplications() {
    if (window.adminManager) {
        window.adminManager.exportApplications();
    }
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new JobApplicationsAdmin();
});
