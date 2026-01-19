// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // FAQ Accordion Functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                // Close other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });

    // Login/Signup Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    if (tabBtns.length > 0 && authForms.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and forms
                tabBtns.forEach(b => b.classList.remove('active'));
                authForms.forEach(form => form.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding form
                this.classList.add('active');
                document.getElementById(targetTab + '-form').classList.add('active');
            });
        });
    }

    // Password Toggle Visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Form Validation and Submission
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff4444';
                    input.addEventListener('input', function() {
                        this.style.borderColor = '#4CAF50';
                    }, { once: true });
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('Form submitted successfully!', 'success');
                form.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    });

    // Smooth Scrolling for Anchor Links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Make sure it's not just a "#" link
            if (targetId.length > 1 && document.querySelector(targetId)) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                const header = document.querySelector('.nav-scroll') || document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'white';
                header.style.backdropFilter = 'none';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature, .testimonial, .meal-card, .pricing-card, .quality-item, .team-member');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Newsletter Subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (email) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }

    // Pricing Plan Selection
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            pricingCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            this.classList.add('selected');
        });
    });

    // Contact Form Enhancement
    const contactForm = document.querySelector('.contact-form .form');
    if (contactForm) {
        const messageTextarea = contactForm.querySelector('#contact-message');
        if (messageTextarea) {
            messageTextarea.addEventListener('input', function() {
                const remainingChars = 500 - this.value.length;
                const charCounter = this.parentElement.querySelector('.char-counter') || 
                    createCharCounter(this.parentElement);
                charCounter.textContent = `${remainingChars} characters remaining`;
                
                if (remainingChars < 50) {
                    charCounter.style.color = '#ff4444';
                } else {
                    charCounter.style.color = '#666';
                }
            });
        }
    }

    // Social Media Links
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Let actual links work, prevent default only for placeholder '#'
            if(this.getAttribute('href') === '#') {
                e.preventDefault();
                const platform = this.querySelector('i').className.includes('facebook') ? 'Facebook' :
                            this.querySelector('i').className.includes('instagram') ? 'Instagram' :
                            this.querySelector('i').className.includes('twitter') ? 'Twitter' :
                            this.querySelector('i').className.includes('whatsapp') ? 'WhatsApp' : 'Social Media';
                
                showNotification(`Redirecting to ${platform}...`, 'info');
                // In a real application, you would redirect to actual social media URLs
            }
        });
    });

    // Loading Animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
});

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#4CAF50';
        case 'error': return '#f44336';
        case 'warning': return '#ff9800';
        default: return '#2196F3';
    }
}

function createCharCounter(parentElement) {
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = `
        font-size: 0.8rem;
        color: #666;
        text-align: right;
        margin-top: 0.5rem;
    `;
    parentElement.appendChild(counter);
    return counter;
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
    }
    
    .pricing-card.selected {
        border-color: #4CAF50;
        transform: scale(1.05);
    }
    
    .nav.active {
        display: block;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 1rem;
    }
    
    .nav.active .nav-list {
        flex-direction: column;
        gap: 1rem;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    body.loaded {
        opacity: 1;
    }
    
    body {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
`;

document.head.appendChild(notificationStyles);