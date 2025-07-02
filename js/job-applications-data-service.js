/**
 * Job Applications Sample Data Service
 * Provides realistic sample data for the admin interface demonstration
 * Simulates external storage account integration similar to user dashboard
 */

class JobApplicationsDataService {
    constructor() {
        this.storageEndpoint = 'https://bluemountainbankstorage.blob.core.windows.net';
        this.containerName = 'job-applications';
        this.initialized = false;
        this.applications = [];
        
        this.initializeData();
    }

    /**
     * Initialize with comprehensive sample data
     */
    initializeData() {
        this.applications = [
            {
                id: 'app_2025070101',
                applicationId: 'BMB-JA-2025-001',
                timestamp: '2025-07-01T09:15:32.000Z',
                status: 'new',
                applicant: {
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    email: 'sarah.johnson@gmail.com',
                    phone: '(555) 123-4567',
                    address: '1234 Oak Street, Apartment 4B\nSan Francisco, CA 94102',
                    ssn: '***-**-4521', // Partially masked for security
                    dateOfBirth: '1992-03-15'
                },
                position: {
                    title: 'Senior Loan Officer',
                    department: 'Lending',
                    location: 'San Francisco Main Branch',
                    type: 'Full-time',
                    salaryRange: '$75,000 - $95,000'
                },
                experience: '6-10 years',
                expectedSalary: '$85,000 - $90,000',
                coverLetter: 'I am excited to apply for the Senior Loan Officer position at Blue Mountain Bank. With over 7 years of experience in commercial lending and a proven track record of exceeding targets, I believe I would be a valuable addition to your team...',
                files: [
                    { name: 'sarah_johnson_resume.pdf', size: 245760, uploadedAt: '2025-07-01T09:12:15.000Z' },
                    { name: 'cover_letter.pdf', size: 89432, uploadedAt: '2025-07-01T09:13:22.000Z' },
                    { name: 'references.pdf', size: 156890, uploadedAt: '2025-07-01T09:14:45.000Z' }
                ],
                backgroundCheck: {
                    requested: false,
                    status: 'pending'
                },
                notes: [],
                priority: 'high'
            },
            {
                id: 'app_2025063001',
                applicationId: 'BMB-JA-2025-002',
                timestamp: '2025-06-30T14:22:18.000Z',
                status: 'reviewed',
                applicant: {
                    firstName: 'Michael',
                    lastName: 'Chen',
                    email: 'michael.chen.dev@outlook.com',
                    phone: '(555) 234-5678',
                    address: '789 Pine Avenue, Unit 12\nOakland, CA 94601',
                    ssn: '***-**-7892',
                    dateOfBirth: '1988-11-22'
                },
                position: {
                    title: 'Customer Service Representative',
                    department: 'Customer Experience',
                    location: 'Oakland Branch',
                    type: 'Full-time',
                    salaryRange: '$45,000 - $55,000'
                },
                experience: '2-5 years',
                expectedSalary: '$48,000 - $52,000',
                coverLetter: 'Dear Hiring Manager, I am writing to express my strong interest in the Customer Service Representative position. My background in retail banking and customer relations has prepared me well for this role...',
                files: [
                    { name: 'michael_chen_resume.pdf', size: 198432, uploadedAt: '2025-06-30T14:18:33.000Z' },
                    { name: 'certifications.pdf', size: 334521, uploadedAt: '2025-06-30T14:20:12.000Z' }
                ],
                backgroundCheck: {
                    requested: true,
                    status: 'in_progress',
                    requestedAt: '2025-07-01T08:30:00.000Z'
                },
                notes: [
                    { author: 'Jennifer Walsh - HR Manager', date: '2025-06-30T16:45:00.000Z', content: 'Strong candidate, excellent customer service background. Schedule for phone screening.' },
                    { author: 'System', date: '2025-07-01T08:30:00.000Z', content: 'Background check initiated through TalentGuard Services.' }
                ],
                priority: 'medium'
            },
            {
                id: 'app_2025062901',
                applicationId: 'BMB-JA-2025-003',
                timestamp: '2025-06-29T11:33:45.000Z',
                status: 'interview',
                applicant: {
                    firstName: 'Emily',
                    lastName: 'Rodriguez',
                    email: 'emily.rodriguez.finance@protonmail.com',
                    phone: '(555) 345-6789',
                    address: '456 Elm Street\nBerkeley, CA 94704',
                    ssn: '***-**-1234',
                    dateOfBirth: '1994-08-07'
                },
                position: {
                    title: 'Financial Analyst',
                    department: 'Finance & Risk Management',
                    location: 'Corporate Headquarters',
                    type: 'Full-time',
                    salaryRange: '$65,000 - $80,000'
                },
                experience: '2-5 years',
                expectedSalary: '$70,000 - $75,000',
                coverLetter: 'I am thrilled to submit my application for the Financial Analyst position. With my CFA Level II candidacy and experience at both startup and enterprise environments...',
                files: [
                    { name: 'emily_rodriguez_resume.pdf', size: 287654, uploadedAt: '2025-06-29T11:29:12.000Z' },
                    { name: 'portfolio_analysis_samples.pdf', size: 1245890, uploadedAt: '2025-06-29T11:31:33.000Z' },
                    { name: 'cfa_transcript.pdf', size: 445621, uploadedAt: '2025-06-29T11:32:55.000Z' }
                ],
                backgroundCheck: {
                    requested: true,
                    status: 'completed',
                    requestedAt: '2025-06-29T16:00:00.000Z',
                    completedAt: '2025-06-30T10:15:00.000Z',
                    result: 'clear'
                },
                interviews: [
                    {
                        type: 'phone_screening',
                        scheduledAt: '2025-07-02T10:00:00.000Z',
                        interviewer: 'Jennifer Walsh - HR Manager',
                        status: 'scheduled',
                        notes: 'Initial screening - assess culture fit and basic qualifications'
                    }
                ],
                notes: [
                    { author: 'Jennifer Walsh - HR Manager', date: '2025-06-29T15:20:00.000Z', content: 'Impressive credentials. CFA candidate with relevant experience. Fast-track for interview.' },
                    { author: 'David Kim - Finance Director', date: '2025-06-30T09:45:00.000Z', content: 'Reviewed portfolio samples. Strong analytical skills evident. Recommend technical interview after phone screening.' }
                ],
                priority: 'high'
            },
            {
                id: 'app_2025062801',
                applicationId: 'BMB-JA-2025-004',
                timestamp: '2025-06-28T16:47:29.000Z',
                status: 'interview',
                applicant: {
                    firstName: 'David',
                    lastName: 'Wilson',
                    email: 'd.wilson.banking@gmail.com',
                    phone: '(555) 456-7890',
                    address: '321 Maple Drive\nSan Mateo, CA 94403',
                    ssn: '***-**-9876',
                    dateOfBirth: '1975-04-12'
                },
                position: {
                    title: 'Branch Manager',
                    department: 'Branch Operations',
                    location: 'Palo Alto Branch',
                    type: 'Full-time',
                    salaryRange: '$90,000 - $110,000'
                },
                experience: '16+ years',
                expectedSalary: '$95,000 - $105,000',
                coverLetter: 'With over 18 years of progressive banking experience and a proven track record of branch performance improvement, I am excited to bring my leadership skills to Blue Mountain Bank...',
                files: [
                    { name: 'david_wilson_resume.pdf', size: 312890, uploadedAt: '2025-06-28T16:42:15.000Z' },
                    { name: 'performance_reviews_redacted.pdf', size: 567432, uploadedAt: '2025-06-28T16:44:33.000Z' },
                    { name: 'management_references.pdf', size: 234567, uploadedAt: '2025-06-28T16:45:44.000Z' },
                    { name: 'banking_certifications.pdf', size: 445123, uploadedAt: '2025-06-28T16:46:22.000Z' }
                ],
                backgroundCheck: {
                    requested: true,
                    status: 'completed',
                    requestedAt: '2025-06-29T09:00:00.000Z',
                    completedAt: '2025-06-30T14:30:00.000Z',
                    result: 'clear'
                },
                interviews: [
                    {
                        type: 'panel_interview',
                        scheduledAt: '2025-07-03T14:00:00.000Z',
                        interviewer: 'Regional Management Team',
                        status: 'scheduled',
                        notes: 'Panel interview with Regional VP, HR Director, and current Branch Manager'
                    }
                ],
                notes: [
                    { author: 'Jennifer Walsh - HR Manager', date: '2025-06-28T17:30:00.000Z', content: 'Excellent candidate for Branch Manager role. Extensive experience and strong references.' },
                    { author: 'Robert Martinez - Regional VP', date: '2025-06-29T11:15:00.000Z', content: 'Reviewed application. Impressed by track record. Schedule for panel interview ASAP.' }
                ],
                priority: 'high'
            },
            {
                id: 'app_2025062701',
                applicationId: 'BMB-JA-2025-005',
                timestamp: '2025-06-27T13:28:17.000Z',
                status: 'rejected',
                applicant: {
                    firstName: 'Lisa',
                    lastName: 'Thompson',
                    email: 'lisa.thompson.career@yahoo.com',
                    phone: '(555) 567-8901',
                    address: '654 Cedar Lane\nFremont, CA 94536',
                    ssn: '***-**-5432',
                    dateOfBirth: '2001-09-14'
                },
                position: {
                    title: 'Bank Teller',
                    department: 'Customer Experience',
                    location: 'Fremont Branch',
                    type: 'Part-time',
                    salaryRange: '$18 - $22 per hour'
                },
                experience: '0-1 years',
                expectedSalary: '$20 - $22 per hour',
                coverLetter: 'I am very interested in the Bank Teller position. Although I am new to banking, I have strong math skills and excellent customer service experience from my retail jobs...',
                files: [
                    { name: 'lisa_thompson_resume.pdf', size: 167432, uploadedAt: '2025-06-27T13:25:45.000Z' }
                ],
                backgroundCheck: {
                    requested: false,
                    status: 'not_required'
                },
                notes: [
                    { author: 'Jennifer Walsh - HR Manager', date: '2025-06-27T16:00:00.000Z', content: 'Entry-level candidate. Lacks banking experience but shows enthusiasm.' },
                    { author: 'Susan Garcia - Fremont Branch Manager', date: '2025-06-28T09:30:00.000Z', content: 'Currently overstaffed for part-time positions. Will keep on file for future openings.' }
                ],
                rejectionReason: 'Position filled - will keep application on file for future opportunities',
                rejectedAt: '2025-06-28T10:00:00.000Z',
                priority: 'low'
            },
            {
                id: 'app_2025062601',
                applicationId: 'BMB-JA-2025-006',
                timestamp: '2025-06-26T10:15:43.000Z',
                status: 'reviewed',
                applicant: {
                    firstName: 'James',
                    lastName: 'Anderson',
                    email: 'j.anderson.security@protonmail.com',
                    phone: '(555) 678-9012',
                    address: '987 Birch Street, Suite 3A\nSan Jose, CA 95128',
                    ssn: '***-**-8765',
                    dateOfBirth: '1985-12-03',
                    securityClearance: 'Secret (Active)'
                },
                position: {
                    title: 'Information Security Analyst',
                    department: 'IT Security & Compliance',
                    location: 'Corporate Headquarters',
                    type: 'Full-time',
                    salaryRange: '$85,000 - $105,000'
                },
                experience: '6-10 years',
                expectedSalary: '$95,000 - $100,000',
                coverLetter: 'With my background in cybersecurity for financial institutions and active security clearance, I am well-positioned to contribute to Blue Mountain Bank\'s security posture...',
                files: [
                    { name: 'james_anderson_resume.pdf', size: 298765, uploadedAt: '2025-06-26T10:11:22.000Z' },
                    { name: 'security_certifications.pdf', size: 445678, uploadedAt: '2025-06-26T10:13:15.000Z' },
                    { name: 'clearance_verification.pdf', size: 123456, uploadedAt: '2025-06-26T10:14:33.000Z' }
                ],
                backgroundCheck: {
                    requested: true,
                    status: 'in_progress',
                    requestedAt: '2025-06-26T15:00:00.000Z'
                },
                notes: [
                    { author: 'Jennifer Walsh - HR Manager', date: '2025-06-26T11:30:00.000Z', content: 'Strong security background. Active clearance is valuable asset.' },
                    { author: 'Thomas Chen - CISO', date: '2025-06-26T14:45:00.000Z', content: 'Excellent credentials. CISSP certified with banking sector experience. High priority for interview.' }
                ],
                priority: 'high'
            }
        ];

        this.initialized = true;
        this.lastUpdated = new Date().toISOString();
    }

    /**
     * Get all applications with optional filtering
     */
    async getApplications(filters = {}) {
        // Simulate API delay
        await this.delay(500);

        let filteredApplications = [...this.applications];

        // Apply filters
        if (filters.status) {
            filteredApplications = filteredApplications.filter(app => app.status === filters.status);
        }

        if (filters.position) {
            filteredApplications = filteredApplications.filter(app => 
                app.position.title.toLowerCase().includes(filters.position.toLowerCase())
            );
        }

        if (filters.department) {
            filteredApplications = filteredApplications.filter(app => app.position.department === filters.department);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredApplications = filteredApplications.filter(app => 
                app.applicant.firstName.toLowerCase().includes(searchTerm) ||
                app.applicant.lastName.toLowerCase().includes(searchTerm) ||
                app.applicant.email.toLowerCase().includes(searchTerm) ||
                app.position.title.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.dateFrom) {
            filteredApplications = filteredApplications.filter(app => 
                new Date(app.timestamp) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            filteredApplications = filteredApplications.filter(app => 
                new Date(app.timestamp) <= new Date(filters.dateTo)
            );
        }

        return {
            success: true,
            applications: filteredApplications,
            total: filteredApplications.length,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Get application statistics
     */
    async getStatistics() {
        await this.delay(300);

        const total = this.applications.length;
        const statusCounts = this.applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        // Calculate this week's applications
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeek = this.applications.filter(app => 
            new Date(app.timestamp) >= oneWeekAgo
        ).length;

        return {
            success: true,
            stats: {
                total: total,
                new: statusCounts.new || 0,
                reviewed: statusCounts.reviewed || 0,
                interview: statusCounts.interview || 0,
                hired: statusCounts.hired || 0,
                rejected: statusCounts.rejected || 0,
                thisWeek: thisWeek,
                averageTimeToHire: '12 days',
                topPositions: [
                    { position: 'Customer Service Representative', count: 8 },
                    { position: 'Bank Teller', count: 6 },
                    { position: 'Loan Officer', count: 4 }
                ]
            }
        };
    }

    /**
     * Get single application by ID
     */
    async getApplication(applicationId) {
        await this.delay(200);

        const application = this.applications.find(app => app.id === applicationId || app.applicationId === applicationId);
        
        if (!application) {
            return {
                success: false,
                error: 'Application not found'
            };
        }

        return {
            success: true,
            application: application
        };
    }

    /**
     * Update application status
     */
    async updateApplicationStatus(applicationId, newStatus, note = '') {
        await this.delay(300);

        const application = this.applications.find(app => app.id === applicationId || app.applicationId === applicationId);
        
        if (!application) {
            return {
                success: false,
                error: 'Application not found'
            };
        }

        application.status = newStatus;
        
        if (note) {
            application.notes.push({
                author: 'HR Administrator',
                date: new Date().toISOString(),
                content: note
            });
        }

        return {
            success: true,
            application: application
        };
    }

    /**
     * Get file download URL (simulated)
     */
    async getFileDownloadUrl(applicationId, fileName) {
        await this.delay(200);

        const application = this.applications.find(app => app.id === applicationId || app.applicationId === applicationId);
        
        if (!application) {
            return {
                success: false,
                error: 'Application not found'
            };
        }

        const file = application.files.find(f => f.name === fileName);
        
        if (!file) {
            return {
                success: false,
                error: 'File not found'
            };
        }

        // Simulate secure download URL
        const downloadUrl = `${this.storageEndpoint}/${this.containerName}/${applicationId}/${fileName}?sv=2021-06-08&se=2025-07-01T16:00:00Z&sr=b&sp=r&sig=SAMPLE_SIGNATURE`;

        return {
            success: true,
            downloadUrl: downloadUrl,
            fileName: fileName,
            fileSize: file.size
        };
    }

    /**
     * Export applications to CSV format
     */
    async exportApplications(filters = {}) {
        const result = await this.getApplications(filters);
        
        if (!result.success) {
            return result;
        }

        const csvHeaders = [
            'Application ID',
            'Applicant Name',
            'Email',
            'Phone',
            'Position',
            'Department',
            'Status',
            'Applied Date',
            'Experience',
            'Expected Salary',
            'Priority',
            'Background Check Status'
        ];

        const csvRows = result.applications.map(app => [
            app.applicationId,
            `${app.applicant.firstName} ${app.applicant.lastName}`,
            app.applicant.email,
            app.applicant.phone,
            app.position.title,
            app.position.department,
            app.status,
            new Date(app.timestamp).toLocaleDateString(),
            app.experience,
            app.expectedSalary,
            app.priority,
            app.backgroundCheck.status
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return {
            success: true,
            csvContent: csvContent,
            filename: `job_applications_export_${new Date().toISOString().split('T')[0]}.csv`
        };
    }

    /**
     * Utility method to simulate async delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get unique departments
     */
    getDepartments() {
        const departments = [...new Set(this.applications.map(app => app.position.department))];
        return departments.sort();
    }

    /**
     * Get unique positions
     */
    getPositions() {
        const positions = [...new Set(this.applications.map(app => app.position.title))];
        return positions.sort();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobApplicationsDataService;
} else {
    window.JobApplicationsDataService = JobApplicationsDataService;
}
