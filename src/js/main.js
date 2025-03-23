// Fetch and load data from data.json
async function loadData() {
    try {
        const response = await fetch('/src/data/data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

// Terminal typing effect
function typeText(text, element, speed = 50) {
    let index = 0;
    element.textContent = '';
    
    return new Promise(resolve => {
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// Terminal commands sequence
const commands = [
    'whoami',
    'cat skills.txt',
    'ls projects/',
    './start_journey.sh'
];

async function runTerminalSequence() {
    const typingElement = document.getElementById('typingText');
    for (const command of commands) {
        await typeText(command, typingElement);
        await new Promise(resolve => setTimeout(resolve, 1000));
        typingElement.textContent = '';
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    runTerminalSequence(); // Loop the sequence
}

// Modal handling
function setupModals() {
    const modalContainer = document.getElementById('modalContainer');
    const mainContainer = document.getElementById('mainContainer');
    const navButtons = document.querySelectorAll('.nav-btn');
    const closeButtons = document.querySelectorAll('.close-btn');

    function openModal(modalId) {
        const modal = document.getElementById(modalId + 'Modal');
        if (!modal) return;

        modalContainer.style.display = 'block';
        modal.style.display = 'block';
        mainContainer.classList.add('blur');
        
        // Add active class after a small delay for animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function closeModal() {
        const activeModal = document.querySelector('.modal.active');
        if (!activeModal) return;

        activeModal.classList.remove('active');
        mainContainer.classList.remove('blur');
        
        // Hide elements after animation
        setTimeout(() => {
            modalContainer.style.display = 'none';
            activeModal.style.display = 'none';
        }, 300);
    }

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal;
            openModal(modalId);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Render projects with enhanced animations
function renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-status">
                <span class="status-badge">${project.status}</span>
            </div>
        `;
        container.appendChild(projectCard);
    });
}

// Render skills with progress bars
function renderSkills(skills) {
    const container = document.getElementById('skillsContainer');
    if (!container) return;

    Object.entries(skills).forEach(([category, skillList]) => {
        const skillCategory = document.createElement('div');
        skillCategory.className = 'skill-category';
        skillCategory.innerHTML = `
            <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <ul class="skill-list">
                ${skillList.map(skill => `
                    <li>
                        <span class="skill-name">${skill}</span>
                        <div class="skill-bar">
                            <div class="skill-progress"></div>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
        container.appendChild(skillCategory);

        // Animate skill bars
        const progressBars = skillCategory.querySelectorAll('.skill-progress');
        progressBars.forEach(bar => {
            const progress = Math.random() * (95 - 75) + 75; // Random progress between 75-95%
            bar.style.width = `${progress}%`;
        });
    });
}

// Render social links with icons
function renderSocialLinks(contact) {
    const container = document.getElementById('socialLinks');
    if (!container) return;

    const { social } = contact;
    const iconMap = {
        twitter: '🐦',
        mastodon: '🐘',
        reddit: '👽'
    };

    Object.entries(social).forEach(([platform, url]) => {
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = `${iconMap[platform]} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
            container.appendChild(link);
        }
    });
}

// Initialize the page
async function initializePage() {
    const data = await loadData();
    if (!data) return;

    // Update hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const bioText = document.createElement('p');
        bioText.className = 'neo-text';
        bioText.textContent = data.personalInfo.bio;
        heroContent.appendChild(bioText);
    }

    // Setup modals and interactions
    setupModals();
    runTerminalSequence();

    // Render dynamic content
    renderProjects(data.projects);
    renderSkills(data.skills);
    renderSocialLinks(data.contact);

    // Add scroll animations
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 