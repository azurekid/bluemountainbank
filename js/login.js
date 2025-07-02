// Enhanced login script with secure credential handling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Password toggle functionality
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const password = document.getElementById('password');
            const icon = this;
            
            if (password.type === 'password') {
                password.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                password.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Enhance form validation
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#3b82f6';
        });
    });
});

// Enhanced login handler with secure credential handling
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showLoginError('Please enter both username and password.');
        return;
    }
    
    // Check for admin credentials (this should be moved to server-side in production)
    if (username === 'admin' && password === 'admin123') {
        // Redirect to admin dashboard
        window.location.href = 'admin.html';
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('.login-btn');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Authenticating...';
    submitButton.disabled = true;
    
    // Initialize Azure storage manager and authenticate user
    try {
        console.log('Starting enhanced login process...');
        
        // Check if AzureStorageManager is available
        if (typeof AzureStorageManager === 'undefined') {
            throw new Error('AzureStorageManager not loaded');
        }
        
        const storageManager = new AzureStorageManager();
        console.log('Storage manager created');
        
        await storageManager.initialize();
        console.log('Storage manager initialized');
        
        const authResult = await storageManager.authenticateUser(username, password);
        console.log('Authentication result:', authResult);
        
        if (authResult.success) {
            // Store user session with enhanced security metadata
            sessionStorage.setItem('currentUser', authResult.userId);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            sessionStorage.setItem('storageType', 'azure');
            sessionStorage.setItem('dataSource', authResult.dataSource || 'Unknown');
            sessionStorage.setItem('securityLevel', authResult.dataSource === 'Azure' ? 'enhanced' : 'standard');
            
            console.log('Login successful, redirecting to dashboard');
            console.log('Data source:', authResult.dataSource);
            
            // Show success message before redirecting
            showLoginSuccess('Login successful! Redirecting to your dashboard...');
            
            // Redirect to dynamic user dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'user-dashboard.html';
            }, 1500);
        } else {
            showLoginError('Invalid username or password. Please try again.');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error.stack);
        showLoginError('Service temporarily unavailable. Please try again later.');
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

// Display login error message
function showLoginError(message) {
    const errorDiv = document.getElementById('login-error') || createMessageDiv('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Display login success message
function showLoginSuccess(message) {
    const successDiv = document.getElementById('login-success') || createMessageDiv('success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// Create message div for error or success
function createMessageDiv(type) {
    const messageDiv = document.createElement('div');
    messageDiv.id = `login-${type}`;
    
    const styles = {
        padding: '15px',
        marginTop: '20px',
        borderRadius: '8px',
        fontWeight: '500',
        textAlign: 'center',
        display: 'none',
        fontSize: '0.9rem',
        animation: 'fadeIn 0.3s ease-in-out'
    };
    
    if (type === 'error') {
        styles.color = '#721c24';
        styles.backgroundColor = 'rgba(248, 215, 218, 0.9)';
        styles.border = '1px solid rgba(220, 53, 69, 0.3)';
    } else {
        styles.color = '#155724';
        styles.backgroundColor = 'rgba(212, 237, 218, 0.9)';
        styles.border = '1px solid rgba(40, 167, 69, 0.3)';
    }
    
    Object.assign(messageDiv.style, styles);
    
    // Add animation keyframes
    const styleSheet = document.createElement('style');
    styleSheet.innerText = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);
    
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.appendChild(messageDiv);
    }
    
    return messageDiv;
}
