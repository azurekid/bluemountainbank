// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const header = document.querySelector('.header');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .location-card, .about-text, .contact-info');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Parallax effect for background images
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-background::before, .services::before, .locations::before');
    
    parallaxElements.forEach(element => {
        const rate = scrolled * -0.5;
        element.style.transform = `translateY(${rate}px)`;
    });
});

// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Validate form
            if (validateForm(formObject)) {
                // Simulate form submission
                showNotification('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
                contactForm.reset();
            } else {
                showNotification('Please fill in all required fields correctly.', 'error');
            }
        });
    }
});

// Form validation
function validateForm(data) {
    const required = ['name', 'email', 'subject', 'message'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check required fields
    for (let field of required) {
        if (!data[field] || data[field].trim() === '') {
            return false;
        }
    }
    
    // Validate email
    if (!emailRegex.test(data.email)) {
        return false;
    }
    
    return true;
}

// Notification system
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString() + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString() + (element.dataset.suffix || '');
        }
    }, 16);
}

// Initialize counter animation when stats come into view
document.addEventListener('DOMContentLoaded', function() {
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    const number = parseInt(text.replace(/[^\d]/g, ''));
                    const suffix = text.replace(/[\d,]/g, '');
                    
                    stat.dataset.suffix = suffix;
                    animateCounter(stat, number);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    });
    
    const aboutStats = document.querySelector('.about-stats');
    if (aboutStats) {
        statsObserver.observe(aboutStats);
    }
});

// Loading animation
window.addEventListener('load', function() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">
                <img src="img/blue-mountain-logo-small.png" alt="Blue Mountain Bank" style="width: 80px; height: 80px; object-fit: contain;">
            </div>
            <div class="loader-text">Loading Blue Mountain Bank...</div>
            <div class="loader-bar">
                <div class="loader-progress"></div>
            </div>
        </div>
    `;
    
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(30, 64, 175, 0.85) 0%, rgba(59, 130, 246, 0.85) 100%), url('img/blue-mountain-bank.png') center/cover no-repeat;
        backdrop-filter: blur(2px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: 'Inter', sans-serif;
        opacity: 1;
        transition: opacity 0.5s ease;
    `;
    
    const loaderContent = loader.querySelector('.loader-content');
    loaderContent.style.cssText = `
        text-align: center;
        max-width: 300px;
    `;
    
    const loaderLogo = loader.querySelector('.loader-logo');
    loaderLogo.style.cssText = `
        margin-bottom: 20px;
        animation: pulse 2s infinite;
    `;
    
    const loaderText = loader.querySelector('.loader-text');
    loaderText.style.cssText = `
        font-size: 1.2rem;
        margin-bottom: 30px;
        font-weight: 500;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    `;
    
    const loaderBar = loader.querySelector('.loader-bar');
    loaderBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
    `;
    
    const loaderProgress = loader.querySelector('.loader-progress');
    loaderProgress.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #ffffff, #e0e7ff);
        border-radius: 2px;
        transition: width 0.3s ease;
        animation: loadingProgress 2s ease-in-out;
    `;
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes loadingProgress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
    
    // Hide loader after animation
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
            document.head.removeChild(style);
        }, 500);
    }, 2000);
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});

// Authentication functionality
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showLoginError('Please enter both username and password.');
        return;
    }
    
    // Check for admin credentials
    if (username === 'admin' && password === 'admin123') {
        // Redirect to admin dashboard
        window.location.href = 'admin.html';
        return;
    }
    
    // Check user credentials
    const authResult = authenticateUser(username, password);
    
    if (authResult.success) {
        // Store user session
        sessionStorage.setItem('currentUser', authResult.userId);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        // Redirect to dynamic user dashboard
        window.location.href = 'user-dashboard.html';
    } else {
        showLoginError('Invalid username or password. Please try again.');
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('login-error') || createErrorDiv();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function createErrorDiv() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'login-error';
    errorDiv.style.cssText = `
        color: #dc2626;
        background: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        padding: 10px;
        border-radius: 8px;
        margin-top: 15px;
        display: none;
        font-size: 0.9rem;
    `;
    
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.appendChild(errorDiv);
    }
    
    return errorDiv;
}

// Initialize login form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// User session management
function checkUserSession() {
    const currentUser = sessionStorage.getItem('currentUser');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (!currentUser || !loginTime) {
        return false;
    }
    
    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - new Date(loginTime).getTime();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxSessionAge) {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('loginTime');
        return false;
    }
    
    return true;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
}

// Make logout function available globally
window.logout = logout;

// Performance optimization - Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});
