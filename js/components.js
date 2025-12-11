/**
 * ============================================
 * UI COMPONENTS & UTILITIES
 * Modals, Tabs, Accordions, and Helpers
 * ============================================
 */

// ============================================
// MODAL COMPONENT
// ============================================

class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.backdrop = document.querySelector('.modal-backdrop');
        this.isOpen = false;
        
        if (this.modal) {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        // Close button
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Backdrop click
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    open() {
        if (this.modal && this.backdrop) {
            this.modal.classList.add('active');
            this.backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.isOpen = true;
        }
    }
    
    close() {
        if (this.modal && this.backdrop) {
            this.modal.classList.remove('active');
            this.backdrop.classList.remove('active');
            document.body.style.overflow = '';
            this.isOpen = false;
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// ============================================
// TAB COMPONENT
// ============================================

class TabSystem {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        const tabButtons = this.container.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Activate first tab by default
        const firstTab = this.container.querySelector('.tab-button');
        if (firstTab) {
            this.switchTab(firstTab.dataset.tab);
        }
    }
    
    switchTab(tabId) {
        // Deactivate all tabs
        this.container.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        this.container.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Activate selected tab
        const activeButton = this.container.querySelector(`[data-tab="${tabId}"]`);
        const activePanel = this.container.querySelector(`#${tabId}`);
        
        if (activeButton) activeButton.classList.add('active');
        if (activePanel) activePanel.classList.add('active');
    }
}

// ============================================
// ACCORDION COMPONENT
// ============================================

class Accordion {
    constructor(containerSelector, allowMultiple = false) {
        this.container = document.querySelector(containerSelector);
        this.allowMultiple = allowMultiple;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        const headers = this.container.querySelectorAll('.accordion-header');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.accordion-item');
                this.toggleItem(item);
            });
        });
    }
    
    toggleItem(item) {
        const isActive = item.classList.contains('active');
        
        // Close others if not allowing multiple
        if (!this.allowMultiple) {
            this.container.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });
        }
        
        // Toggle current
        if (!isActive) {
            item.classList.add('active');
        }
    }
    
    openItem(index) {
        const items = this.container.querySelectorAll('.accordion-item');
        if (items[index]) {
            this.toggleItem(items[index]);
        }
    }
    
    closeAll() {
        this.container.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
        });
    }
}

// ============================================
// TOOLTIP COMPONENT
// ============================================

class Tooltip {
    static init() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltipText = element.dataset.tooltip;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            element.classList.add('tooltip-trigger');
            element.appendChild(tooltip);
        });
    }
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

class ProgressBar {
    constructor(selector) {
        this.container = document.querySelector(selector);
        this.fill = this.container?.querySelector('.progress-fill');
    }
    
    setProgress(percentage) {
        if (this.fill) {
            this.fill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        }
    }
    
    animate(targetPercentage, duration = 500) {
        if (!this.fill) return;
        
        const start = parseFloat(this.fill.style.width) || 0;
        const diff = targetPercentage - start;
        const startTime = performance.now();
        
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeOutCubic(progress);
            
            this.fill.style.width = `${start + diff * eased}%`;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

class ScrollAnimator {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate]');
        this.observer = null;
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
            );
            
            this.elements.forEach(el => {
                el.style.opacity = '0';
                this.observer.observe(el);
            });
        } else {
            // Fallback: show all elements
            this.elements.forEach(el => {
                el.style.opacity = '1';
            });
        }
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const animation = el.dataset.animate || 'fadeInUp';
                const delay = el.dataset.animateDelay || '0';
                
                el.style.animationDelay = `${delay}ms`;
                el.classList.add('animate-in', animation);
                el.style.opacity = '1';
                
                this.observer.unobserve(el);
            }
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // Format percentage
    formatPercent(num, decimals = 1) {
        return num.toFixed(decimals) + '%';
    },
    
    // Format currency
    formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Smooth scroll to element
    scrollTo(selector, offset = 0) {
        const element = document.querySelector(selector);
        if (element) {
            const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    },
    
    // Get URL parameter
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    // Set URL parameter
    setUrlParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    },
    
    // Generate unique ID
    generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }
};

// ============================================
// DOM READY HELPER
// ============================================

function onDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// ============================================
// INITIALIZE GLOBAL COMPONENTS
// ============================================

onDOMReady(() => {
    // Initialize tooltips
    Tooltip.init();
    
    // Initialize scroll animations
    new ScrollAnimator();
    
    // Initialize any tabs
    document.querySelectorAll('.tabs').forEach((tabContainer, index) => {
        new TabSystem(`#${tabContainer.id || 'tabs-' + index}`);
    });
    
    // Initialize any accordions
    document.querySelectorAll('.accordion').forEach((accordion, index) => {
        new Accordion(`#${accordion.id || 'accordion-' + index}`);
    });
    
    console.log('UI components initialized');
});

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Modal,
        TabSystem,
        Accordion,
        Tooltip,
        ProgressBar,
        ScrollAnimator,
        Utils,
        onDOMReady
    };
}
