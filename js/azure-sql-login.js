/**
 * Enhanced Login Manager for Azure SQL Authentication
 */

class AzureSQLLoginManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3001/api';
        this.authManager = new AuthenticationManager(this.apiBaseUrl);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Handle login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Handle demo user buttons
        const demoButtons = document.querySelectorAll('[data-demo-user]');
        demoButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleDemoLogin(e));
        });

        // Check if user is already authenticated
        this.checkExistingAuth();
    }

    async checkExistingAuth() {
        try {
            const token = sessionStorage.getItem('authToken');
            const userId = sessionStorage.getItem('currentUser');
            
            if (token && userId) {
                // Verify token is still valid
                const response = await fetch(`${this.apiBaseUrl}/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Token is valid, redirect to dashboard
                    const redirectUrl = this.getRedirectUrl();
                    window.location.href = redirectUrl;
                    return;
                }
            }
        } catch (error) {
            console.log('No valid existing session found');
        }

        // Clear any invalid tokens
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('currentUser');
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const submitButton = event.target.querySelector('button[type="submit"]');
        const errorElement = document.getElementById('error-message');

        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        // Show loading state
        this.setLoadingState(submitButton, true);
        this.clearError();

        try {
            const result = await this.authManager.login(username, password);

            if (result.success) {
                // Login successful
                this.showSuccess('Login successful! Redirecting...');
                
                // Redirect after a short delay
                setTimeout(() => {
                    const redirectUrl = this.getRedirectUrl();
                    window.location.href = redirectUrl;
                }, 1000);

            } else {
                this.showError(result.error || 'Login failed. Please check your credentials.');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Connection failed. Please check your internet connection and try again.');
        } finally {
            this.setLoadingState(submitButton, false);
        }
    }

    async handleDemoLogin(event) {
        event.preventDefault();
        
        const demoUser = event.target.getAttribute('data-demo-user');
        const demoCredentials = this.getDemoCredentials(demoUser);
        
        if (!demoCredentials) {
            this.showError('Demo user not found');
            return;
        }

        // Show loading state
        this.setLoadingState(event.target, true);
        this.clearError();

        try {
            const result = await this.authManager.login(demoCredentials.username, demoCredentials.password);

            if (result.success) {
                this.showSuccess(`Logged in as ${demoCredentials.displayName}! Redirecting...`);
                
                setTimeout(() => {
                    const redirectUrl = this.getRedirectUrl();
                    window.location.href = redirectUrl;
                }, 1000);

            } else {
                this.showError(result.error || 'Demo login failed');
            }

        } catch (error) {
            console.error('Demo login error:', error);
            this.showError('Demo login failed. Please try again.');
        } finally {
            this.setLoadingState(event.target, false);
        }
    }

    getDemoCredentials(demoUser) {
        const demoUsers = {
            'alice': {
                username: 'alice.martinez',
                password: 'password123', // This will be hashed on the server
                displayName: 'Alice Martinez'
            },
            'bob': {
                username: 'bob.johnson',
                password: 'password123',
                displayName: 'Bob Johnson'
            },
            'carol': {
                username: 'carol.smith',
                password: 'password123',
                displayName: 'Carol Smith'
            },
            'david': {
                username: 'david.wilson',
                password: 'password123',
                displayName: 'David Wilson'
            },
            'emma': {
                username: 'emma.brown',
                password: 'password123',
                displayName: 'Emma Brown'
            },
            'frank': {
                username: 'frank.miller',
                password: 'password123',
                displayName: 'Frank Miller'
            }
        };

        return demoUsers[demoUser];
    }

    getRedirectUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        return redirect || 'user-dashboard.html';
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.className = 'error-message show';
        }
    }

    showSuccess(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.className = 'success-message show';
        }
    }

    clearError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.className = 'error-message';
        }
    }

    setLoadingState(button, isLoading) {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        } else {
            button.disabled = false;
            const isDemoButton = button.hasAttribute('data-demo-user');
            button.innerHTML = isDemoButton ? 
                '<i class="fas fa-user"></i> Demo Login' : 
                '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    }

    // Method to check API health
    async checkApiHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl.replace('/api', '')}/health`);
            const health = await response.json();
            
            console.log('API Health:', health);
            return health.status === 'ok';
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have the required authentication manager
    if (typeof AuthenticationManager === 'undefined') {
        console.error('AuthenticationManager not found. Loading enhanced storage factory...');
        
        // Load the enhanced storage factory if not already loaded
        const script = document.createElement('script');
        script.src = 'js/enhanced-storage-factory.js';
        script.onload = () => {
            window.azureSQLLoginManager = new AzureSQLLoginManager();
        };
        document.head.appendChild(script);
    } else {
        window.azureSQLLoginManager = new AzureSQLLoginManager();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AzureSQLLoginManager;
}
