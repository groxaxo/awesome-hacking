// Global state
let state = {
    selectedMentor: null,
    currentRoadmap: 'beginner',
    progress: 0,
    visitedSections: new Set()
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadStateFromStorage();
    createParticles();
    updateProgress();
});

// Initialize application
function initializeApp() {
    // Show home section by default
    showSection('home');
    
    // Set up event listeners
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', () => {
            incrementProgress(5);
        });
    });
    
    // Track section visits for progress
    document.querySelectorAll('.section').forEach(section => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    state.visitedSections.add(entry.target.id);
                    updateProgress();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(section);
    });
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--primary-color)';
        });
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Track visit
        state.visitedSections.add(sectionId);
        incrementProgress(10);
    }
}

// Character Selection
function selectCharacter(characterName) {
    state.selectedMentor = characterName;
    
    // Update UI
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-character="${characterName}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Update progress tracker
    document.getElementById('selected-mentor').textContent = formatCharacterName(characterName);
    
    // Show celebration
    showNotification(`${formatCharacterName(characterName)} is now your mentor! 🎉`);
    
    // Increment progress
    incrementProgress(15);
    
    // Save state
    saveStateToStorage();
    
    // Suggest next step
    setTimeout(() => {
        if (confirm('Great choice! Would you like to explore roadmaps now?')) {
            showSection('roadmaps');
        }
    }, 1500);
}

// Format character name for display
function formatCharacterName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Roadmap Navigation
function showRoadmap(roadmapId) {
    state.currentRoadmap = roadmapId;
    
    // Update tabs
    document.querySelectorAll('.roadmap-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.roadmap-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetRoadmap = document.getElementById(`roadmap-${roadmapId}`);
    if (targetRoadmap) {
        targetRoadmap.classList.add('active');
    }
    
    // Update progress tracker
    document.getElementById('current-path').textContent = 
        roadmapId.charAt(0).toUpperCase() + roadmapId.slice(1) + ' Path';
    
    // Increment progress
    incrementProgress(10);
    
    // Save state
    saveStateToStorage();
}

// Resource Filtering
function filterResources(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter cards
    const cards = document.querySelectorAll('.resource-card');
    
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'flex';
            card.classList.add('fade-in');
        } else {
            const categories = card.getAttribute('data-category') || '';
            if (categories.includes(category)) {
                card.style.display = 'flex';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Increment progress
    incrementProgress(3);
}

// Progress Tracker
function toggleProgressTracker() {
    const tracker = document.getElementById('progress-tracker');
    tracker.classList.toggle('active');
}

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${state.progress}%`;
    }
}

function incrementProgress(amount) {
    state.progress = Math.min(state.progress + amount, 100);
    updateProgress();
    saveStateToStorage();
    
    // Show achievement notifications
    if (state.progress === 25) {
        showNotification('🌱 Great start! Keep exploring!');
    } else if (state.progress === 50) {
        showNotification('🚀 Halfway there! You\'re doing awesome!');
    } else if (state.progress === 75) {
        showNotification('⚡ Almost a hero! Keep it up!');
    } else if (state.progress === 100) {
        showNotification('🏆 Congratulations! You\'re a cybersecurity hero!');
        celebrateCompletion();
    }
}

// Notification System
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: var(--dark-bg);
        padding: 1rem 2rem;
        border-radius: 30px;
        box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        z-index: 9999;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Celebration for 100% completion
function celebrateCompletion() {
    // Create confetti effect
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 50);
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    const colors = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-1)', 'var(--accent-3)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 9999;
        border-radius: 50%;
        animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 4000);
}

// Add confetti animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
    
    .notification {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Particles Background
function createParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: var(--primary-color);
        border-radius: 50%;
        top: ${y}%;
        left: ${x}%;
        opacity: ${Math.random() * 0.5 + 0.2};
        animation: particleFloat ${duration}s ${delay}s infinite ease-in-out;
    `;
    
    container.appendChild(particle);
}

// Add particle animation
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes particleFloat {
        0%, 100% {
            transform: translate(0, 0) scale(1);
        }
        25% {
            transform: translate(20px, -20px) scale(1.2);
        }
        50% {
            transform: translate(-20px, -40px) scale(0.8);
        }
        75% {
            transform: translate(20px, -20px) scale(1.1);
        }
    }
`;
document.head.appendChild(particleStyle);

// Local Storage Functions
function saveStateToStorage() {
    try {
        localStorage.setItem('hackingAcademyState', JSON.stringify({
            selectedMentor: state.selectedMentor,
            currentRoadmap: state.currentRoadmap,
            progress: state.progress,
            visitedSections: Array.from(state.visitedSections)
        }));
    } catch (e) {
        console.log('Could not save state to localStorage');
    }
}

function loadStateFromStorage() {
    try {
        const saved = localStorage.getItem('hackingAcademyState');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.selectedMentor = parsed.selectedMentor;
            state.currentRoadmap = parsed.currentRoadmap;
            state.progress = parsed.progress || 0;
            state.visitedSections = new Set(parsed.visitedSections || []);
            
            // Restore UI state
            if (state.selectedMentor) {
                const card = document.querySelector(`[data-character="${state.selectedMentor}"]`);
                if (card) {
                    card.classList.add('selected');
                }
                document.getElementById('selected-mentor').textContent = 
                    formatCharacterName(state.selectedMentor);
            }
            
            if (state.currentRoadmap) {
                document.getElementById('current-path').textContent = 
                    state.currentRoadmap.charAt(0).toUpperCase() + state.currentRoadmap.slice(1) + ' Path';
            }
            
            updateProgress();
        }
    } catch (e) {
        console.log('Could not load state from localStorage');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('home');
                break;
            case '2':
                e.preventDefault();
                showSection('characters');
                break;
            case '3':
                e.preventDefault();
                showSection('roadmaps');
                break;
            case '4':
                e.preventDefault();
                showSection('resources');
                break;
            case 'p':
                e.preventDefault();
                toggleProgressTracker();
                break;
        }
    }
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        showNotification('🎮 Konami Code Activated! You\'re a true hacker! +50 Progress!');
        incrementProgress(50);
        celebrateCompletion();
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Track resource clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('resource-link') || 
        e.target.closest('.resource-links a')) {
        incrementProgress(2);
        showNotification('📚 Great! Keep learning!');
    }
});

// Add hover effects for better UX
document.querySelectorAll('.character-card, .resource-card, .specialized-card, .phase-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Console welcome message
console.log(`
%c🛡️ Welcome to Awesome Hacking Academy! 🛡️

%cYou've found the console! Here are some keyboard shortcuts:

Ctrl/Cmd + 1: Home
Ctrl/Cmd + 2: Choose Mentor
Ctrl/Cmd + 3: Roadmaps
Ctrl/Cmd + 4: Resources
Ctrl/Cmd + P: Toggle Progress Tracker

%cTry the Konami Code for a surprise! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️ B A

%cHappy Hacking! 🚀
`, 
'color: #00ff88; font-size: 20px; font-weight: bold;',
'color: #0099ff; font-size: 14px;',
'color: #ff006e; font-size: 14px; font-style: italic;',
'color: #00ff88; font-size: 16px; font-weight: bold;'
);

// Performance optimization: Lazy load images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Auto-save progress every 30 seconds
setInterval(() => {
    saveStateToStorage();
}, 30000);

// Warn before leaving if progress exists
window.addEventListener('beforeunload', (e) => {
    if (state.progress > 0 && state.progress < 100) {
        saveStateToStorage();
    }
});

// Initialize tooltips (if needed in future)
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--card-bg);
                color: var(--text-primary);
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.85rem;
                z-index: 10000;
                border: 1px solid var(--primary-color);
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            
            this.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        });
    });
}

initTooltips();

// Export functions for HTML inline handlers
window.showSection = showSection;
window.selectCharacter = selectCharacter;
window.showRoadmap = showRoadmap;
window.filterResources = filterResources;
window.toggleProgressTracker = toggleProgressTracker;
