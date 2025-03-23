// Project page specific functionality
async function loadProjectData() {
    try {
        const [projectsResponse, timelinesResponse] = await Promise.all([
            fetch('/src/data/data.json'),
            fetch('/src/data/project-timelines.json')
        ]);
        
        const projectsData = await projectsResponse.json();
        const timelinesData = await timelinesResponse.json();
        
        return {
            projects: projectsData.projects,
            timelines: timelinesData['project-timelines']
        };
    } catch (error) {
        console.error('Error loading project data:', error);
        return { projects: [], timelines: {} };
    }
}

function createProjectTimeline(timelineData) {
    const timelineContainer = document.getElementById('projectTimeline');
    if (!timelineContainer || !timelineData) return;

    timelineContainer.innerHTML = ''; // Clear existing timeline

    timelineData.forEach((event, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const content = document.createElement('div');
        content.className = `timeline-content ${index % 2 === 0 ? 'left' : 'right'}`;
        
        const date = new Date(event.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        content.innerHTML = `
            <div class="timeline-date">${formattedDate}</div>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            ${event.artifacts ? `
                <div class="timeline-artifacts">
                    <h4>Artifacts:</h4>
                    <ul>
                        ${event.artifacts.map(artifact => `<li>${artifact}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${event.status ? `<span class="status-badge">${event.status}</span>` : ''}
        `;
        
        if (event.type === 'milestone') {
            content.classList.add('milestone');
        }
        
        timelineItem.appendChild(content);
        timelineContainer.appendChild(timelineItem);
    });
}

function createProjectCards(projects) {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card-mini';
        card.dataset.projectId = project.id;
        
        card.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description.substring(0, 100)}...</p>
            <span class="status-badge">${project.status}</span>
        `;
        
        card.addEventListener('click', () => showProjectDetails(project));
        projectsList.appendChild(card);
    });
}

function showProjectDetails(project, timelines) {
    const projectContent = document.getElementById('projectContent');
    if (!projectContent) return;

    // Update active state of project cards
    document.querySelectorAll('.project-card-mini').forEach(card => {
        card.classList.toggle('active', card.dataset.projectId === project.id.toString());
    });

    // Get project timeline
    const projectKey = project.title.toLowerCase().replace(/\s+/g, '-');
    const timeline = timelines[projectKey];

    // Update timeline
    if (timeline) {
        createProjectTimeline(timeline.timeline);
    }

    projectContent.innerHTML = `
        <div class="project-header">
            <h2>${project.title}</h2>
            <div class="project-meta">
                <span class="status-badge">${project.status}</span>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        </div>
        <div class="project-documentation">
            <h3>Overview</h3>
            <p>${project.documentation.overview}</p>
            
            <h3>Key Features</h3>
            <ul>
                ${project.documentation.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            
            <h3>Technical Challenges</h3>
            <ul>
                ${project.documentation.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
            </ul>
            
            ${project.demoUrl ? `
                <h3>Demo</h3>
                <p><a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer">View Live Demo</a></p>
            ` : ''}
            ${project.sourceUrl ? `
                <h3>Source Code</h3>
                <p><a href="${project.sourceUrl}" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>
            ` : ''}
        </div>
    `;
}

// Theme handling
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const themes = {
        dark: {
            background: '#1A1A2E',
            surface: '#2A2A3E',
            primary: '#6E44FF',
            secondary: '#FF44E3',
            accent: '#44FFD1',
            text: '#FFFFFF'
        },
        light: {
            background: '#F0F0F5',
            surface: '#FFFFFF',
            primary: '#6E44FF',
            secondary: '#FF44E3',
            accent: '#44FFD1',
            text: '#1A1A2E'
        },
        retro: {
            background: '#FFFDE8',
            surface: '#FFFFFF',
            primary: '#FF7700',
            secondary: '#003366',
            accent: '#FF9900',
            text: '#000000'
        }
    };

    let currentTheme = localStorage.getItem('theme') || 'dark';

    function applyTheme(themeName) {
        const theme = themes[themeName];
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(`--${property}`, value);
        });
        localStorage.setItem('theme', themeName);
        
        // Update button icon
        themeToggle.textContent = themeName === 'dark' ? '🌙' : themeName === 'light' ? '☀️' : '🎨';
    }

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 
                      currentTheme === 'light' ? 'retro' : 'dark';
        applyTheme(currentTheme);
    });

    // Apply saved theme on load
    applyTheme(currentTheme);
}

// Initialize projects page
async function initializeProjectsPage() {
    const { projects, timelines } = await loadProjectData();
    if (projects.length === 0) return;

    createProjectCards(projects);
    setupThemeToggle();

    // Show first project by default
    showProjectDetails(projects[0], timelines);
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProjectsPage); 