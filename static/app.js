// Application Data
const hackathonData = {
  hackathon: {},
  publicStats: {},
  adminUsers: [],
  tracks: [],
  timeline: [],
  publicActivities: [],
  faq: [],
  participants: [],
  teams: [],
  mentors: [],
  judges: [],
  projects: []
};

// Global variables
let currentAdmin = null;
let currentMode = 'public'; // 'public' or 'admin'
let sessionTimeout = null;
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Charts
let registrationChart;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing integrated app...');
  
  // Initialize data
  initializeData();
  
  // Check for existing session
  checkSession();
  
  // Set up authentication and navigation
  setupPublicApp();
  setupAdminApp();
  setupModals();
  
  // Start in appropriate mode
  if (currentAdmin) {
    showPublicMode(); // Start in public mode even if logged in
  } else {
    showPublicMode();
  }

  console.log('Integrated app initialized successfully');
});

// Initialize sample data
function initializeData() {
  // Fetch all data from backend
  fetchAllData();
}

async function fetchAllData() {
  try {
    // Fetch participants
    const participantsRes = await fetch('/api/participants');
    hackathonData.participants = await participantsRes.json();

    // Fetch teams
    const teamsRes = await fetch('/api/teams');
    hackathonData.teams = await teamsRes.json();

    // Fetch mentors
    const mentorsRes = await fetch('/api/mentors');
    hackathonData.mentors = await mentorsRes.json();

    // Fetch judges
    const judgesRes = await fetch('/api/judges');
    hackathonData.judges = await judgesRes.json();

    // Fetch projects
    const projectsRes = await fetch('/api/projects');
    hackathonData.projects = await projectsRes.json();

    // Fetch hackathon info
    const hackathonRes = await fetch('/api/hackathon');
    hackathonData.hackathon = await hackathonRes.json();

    // Fetch public stats
    const statsRes = await fetch('/api/public_stats');
    hackathonData.publicStats = await statsRes.json();

    // Fetch tracks
    const tracksRes = await fetch('/api/tracks');
    hackathonData.tracks = await tracksRes.json();

    // Fetch timeline
    const timelineRes = await fetch('/api/timeline');
    hackathonData.timeline = await timelineRes.json();

    // Fetch public activities
    const activitiesRes = await fetch('/api/public_activities');
    hackathonData.publicActivities = await activitiesRes.json();

    // Fetch FAQ
    const faqRes = await fetch('/api/faq');
    hackathonData.faq = await faqRes.json();

    // Fetch admin users
    const adminRes = await fetch('/api/admin_users');
    hackathonData.adminUsers = await adminRes.json();

    // After all data is loaded, populate content
    populatePublicContent();
    if (currentAdmin) {
      populateAdminContent();
    }
    console.log('All data fetched from backend');
  } catch (err) {
    console.error('Error fetching data:', err);
    showNotification('Error loading data from server', 'error');
  }
}

// Setup public app
function setupPublicApp() {
  console.log('Setting up public app...');
  
  // Setup public navigation
  const publicNavLinks = document.querySelectorAll('.public-nav .nav-link');
  const publicSections = document.querySelectorAll('.public-section');
  
  publicNavLinks.forEach(link => {
    if (link.getAttribute('data-section')) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetSection = this.getAttribute('data-section');
        
        // Update active nav link
        publicNavLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Show target section
        publicSections.forEach(section => section.classList.remove('active'));
        const targetEl = document.getElementById(targetSection);
        if (targetEl) targetEl.classList.add('active');
      });
    }
  });
  
  // Setup admin login button - will be configured in showPublicMode
  
  // Populate public content
  populatePublicContent();
}

// Setup admin app
function setupAdminApp() {
  console.log('Setting up admin app...');
  
  // Setup admin navigation
  const adminNavLinks = document.querySelectorAll('.sidebar .nav-link');
  const adminSections = document.querySelectorAll('.content-section');
  
  adminNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (this.classList.contains('permission-denied')) {
        showNotification('Access denied. Insufficient permissions.', 'error');
        return;
      }
      
      const targetSection = this.getAttribute('data-section');
      
      if (targetSection === 'public-view') {
        switchToPublicMode();
        return;
      }
      
      // Update active nav link
      adminNavLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Show target section
      adminSections.forEach(section => section.classList.remove('active'));
      const targetEl = document.getElementById(targetSection);
      if (targetEl) targetEl.classList.add('active');
      
      // Reset session timeout
      if (currentAdmin) resetSessionTimeout();
    });
  });
  
  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Setup admin action buttons
  setupAdminActions();
}

// Setup modals
function setupModals() {
  const loginModal = document.getElementById('login-modal');
  const formModal = document.getElementById('form-modal');
  
  // Login modal
  const closeLoginModal = document.getElementById('close-login-modal');
  const loginForm = document.getElementById('login-form');
  
  if (closeLoginModal) {
    closeLoginModal.addEventListener('click', hideLoginModal);
  }
  
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) hideLoginModal();
    });
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Form modal
  const closeFormModal = document.getElementById('close-form-modal');
  if (closeFormModal) {
    closeFormModal.addEventListener('click', hideFormModal);
  }
  
  if (formModal) {
    formModal.addEventListener('click', (e) => {
      if (e.target === formModal) hideFormModal();
    });
  }
}

// Authentication functions
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('username').focus();
  }
}

function hideLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('hidden');
  hideError();
}

function handleLogin(e) {
  e.preventDefault();
  console.log('Handling login...');
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const rememberMe = document.getElementById('remember-me').checked;
  
  if (!username || !password) {
    showError('Please enter both username and password.');
    return;
  }
  
  // Find admin user (normalize for case and trim)
  const admin = hackathonData.adminUsers.find(u =>
    u.username && u.password &&
    u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
    u.password.trim() === password.trim()
  );

  if (admin) {
    performLogin(admin, rememberMe);
  } else {
    showError('Invalid username or password. Please try again.');
  }
}

function performLogin(admin, rememberMe) {
  console.log('Performing login for:', admin.name);
  
  currentAdmin = admin;
  
  // Store session data
  const sessionData = {
    adminId: admin.id,
    loginTime: new Date().toISOString(),
    rememberMe: rememberMe
  };
  
  try {
    if (rememberMe) {
      localStorage.setItem('hackflow_session', JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem('hackflow_session', JSON.stringify(sessionData));
    }
  } catch (error) {
    console.warn('Could not store session:', error);
  }
  
  // Hide login modal and show admin interface
  hideLoginModal();
  showAdminMode();
  
  // Show success notification
  showNotification('Login successful! Welcome ' + admin.name, 'success');
  
  // Set session timeout
  resetSessionTimeout();
  
  console.log('Login completed successfully');
}

function handleLogout() {
  if (currentAdmin) {
    console.log('Logging out:', currentAdmin.name);
  }
  
  currentAdmin = null;
  clearTimeout(sessionTimeout);
  
  try {
    localStorage.removeItem('hackflow_session');
    sessionStorage.removeItem('hackflow_session');
  } catch (error) {
    console.warn('Could not clear session:', error);
  }
  
  showPublicMode();
  showNotification('Logged out successfully', 'success');
}

function checkSession() {
  console.log('Checking for existing session...');
  
  try {
    const session = localStorage.getItem('hackflow_session') || 
                    sessionStorage.getItem('hackflow_session');
    
    if (session) {
      const sessionData = JSON.parse(session);
      const admin = hackathonData.adminUsers.find(u => u.id === sessionData.adminId);
      
      if (admin) {
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        
        if (now - loginTime < SESSION_DURATION || sessionData.rememberMe) {
          console.log('Valid session found for:', admin.name);
          currentAdmin = admin;
          resetSessionTimeout();
          return;
        }
      }
    }
  } catch (error) {
    console.error('Error checking session:', error);
  }
}

function resetSessionTimeout() {
  clearTimeout(sessionTimeout);
  
  sessionTimeout = setTimeout(() => {
    showNotification('Session expired. Please login again.', 'warning');
    handleLogout();
  }, SESSION_DURATION);
}

// Mode switching functions
function showPublicMode() {
  console.log('Switching to public mode');
  currentMode = 'public';
  
  const publicApp = document.getElementById('public-app');
  const adminApp = document.getElementById('admin-app');
  
  if (publicApp) publicApp.classList.remove('hidden');
  if (adminApp) adminApp.classList.add('hidden');
  
  // Configure admin login button based on session
  configureAdminLoginButton();
  
  // Refresh public content
  populatePublicContent();
}

function showAdminMode() {
  console.log('Switching to admin mode');
  currentMode = 'admin';
  
  const publicApp = document.getElementById('public-app');
  const adminApp = document.getElementById('admin-app');
  
  if (publicApp) publicApp.classList.add('hidden');
  if (adminApp) adminApp.classList.remove('hidden');
  
  // Initialize admin interface
  initializeAdminInterface();
}

function switchToPublicMode() {
  showPublicMode();
}

function configureAdminLoginButton() {
  const adminLoginBtn = document.getElementById('admin-login-btn');
  if (!adminLoginBtn) return;
  
  // Remove existing event listeners by cloning the button
  const newBtn = adminLoginBtn.cloneNode(true);
  adminLoginBtn.parentNode.replaceChild(newBtn, adminLoginBtn);
  
  if (currentAdmin) {
    newBtn.textContent = 'Back to Admin';
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showAdminMode();
    });
  } else {
    newBtn.textContent = 'Admin Login';
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showLoginModal();
    });
  }
}

// Public content population
function populatePublicContent() {
  console.log('Populating public content...');
  
  // Update public statistics
  updatePublicStats();
  
  // Populate activity feed
  populateActivityFeed();
  
  // Populate tracks
  populateTracksGrid();
  
  // Populate timeline
  populateTimeline();
  
  // Populate FAQ
  populateFAQ();
}

function updatePublicStats() {
  const stats = hackathonData.publicStats;
  
  const elements = {
    'public-participants': stats.totalParticipants,
    'public-teams': stats.teamsFormed,
    'public-projects': stats.projectsSubmitted,
    'public-days': stats.daysUntilEvent
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function populateActivityFeed() {
  const feedEl = document.getElementById('public-activity-feed');
  if (!feedEl) return;
  
  feedEl.innerHTML = '';
  
  hackathonData.publicActivities.forEach(activity => {
    const activityEl = document.createElement('div');
    activityEl.className = 'activity-item';
    
    activityEl.innerHTML = `
      <div class="activity-icon">${getActivityIcon(activity.type)}</div>
      <div class="activity-content">
        <p>${activity.message}</p>
        <small>${activity.timestamp}</small>
      </div>
    `;
    
    feedEl.appendChild(activityEl);
  });
}

function populateTracksGrid() {
  const gridEl = document.getElementById('public-tracks-grid');
  if (!gridEl) return;
  
  gridEl.innerHTML = '';
  
  hackathonData.tracks.forEach(track => {
    const trackEl = document.createElement('div');
    trackEl.className = 'track-card';
    
    trackEl.innerHTML = `
      <div class="track-header">
        <h3 class="track-name">${track.name}</h3>
        <span class="track-teams">${track.teams} teams</span>
      </div>
      <p class="track-description">${track.description}</p>
    `;
    
    gridEl.appendChild(trackEl);
  });
}

function populateTimeline() {
  const timelineEl = document.getElementById('public-timeline');
  if (!timelineEl) return;
  
  timelineEl.innerHTML = '';
  
  hackathonData.timeline.forEach(item => {
    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item ${item.status}`;
    
    timelineItem.innerHTML = `
      <div class="timeline-content">
        <p class="timeline-date">${item.date}</p>
        <h4 class="timeline-event">${item.event}</h4>
        <p class="timeline-time">${item.time}</p>
      </div>
    `;
    
    timelineEl.appendChild(timelineItem);
  });
}

function populateFAQ() {
  const faqEl = document.getElementById('public-faq-grid');
  if (!faqEl) return;
  
  faqEl.innerHTML = '';
  
  hackathonData.faq.forEach(item => {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';
    
    faqItem.innerHTML = `
      <h4 class="faq-question">${item.question}</h4>
      <p class="faq-answer">${item.answer}</p>
    `;
    
    faqEl.appendChild(faqItem);
  });
}

// Admin interface initialization
function initializeAdminInterface() {
  console.log('Initializing admin interface...');
  
  updateAdminBadge();
  setupPermissions();
  populateAdminContent();
  
  // Initialize charts after a short delay
  setTimeout(() => {
    initializeCharts();
  }, 500);
}

function updateAdminBadge() {
  if (!currentAdmin) return;
  
  const adminRole = document.getElementById('admin-role');
  const adminName = document.getElementById('admin-name');
  
  if (adminRole) adminRole.textContent = currentAdmin.role;
  if (adminName) adminName.textContent = currentAdmin.name;
}

function setupPermissions() {
  if (!currentAdmin) return;
  
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  navLinks.forEach(link => {
    const requiredPermission = link.getAttribute('data-permission');
    
    if (requiredPermission && requiredPermission !== '') {
      if (!hasPermission(requiredPermission)) {
        link.classList.add('permission-denied');
      } else {
        link.classList.remove('permission-denied');
      }
    }
  });
}

function hasPermission(permission) {
  if (!currentAdmin) return false;
  return currentAdmin.permissions.includes('all') || 
         currentAdmin.permissions.includes(permission);
}

function populateAdminContent() {
  console.log('Populating admin content...');
  
  // Update admin statistics
  updateAdminStats();
  
  // Populate admin notifications
  populateAdminNotifications();
  
  // Populate participants
  populateParticipants();
  
  // Populate teams
  populateTeams();
  
  // Populate projects
  populateProjects();
  
  // Populate judges
  populateJudges();
  
  // Populate mentors
  populateMentors();
  
  // Populate announcements
  populateAnnouncements();
}

function updateAdminStats() {
  const stats = hackathonData.publicStats;
  
  const elements = {
    'admin-participants': stats.totalParticipants,
    'admin-teams': stats.teamsFormed,
    'admin-projects': stats.projectsSubmitted,
    'pending-tasks': 5
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function populateAdminNotifications() {
  const notificationsEl = document.getElementById('admin-notifications-list');
  if (!notificationsEl) return;
  
  const notifications = [
    { icon: '🔴', priority: 'high', message: '<strong>High Priority:</strong> 3 teams need manual review', time: '15 minutes ago' },
    { icon: '🟡', priority: 'medium', message: 'Submission deadline approaching in 2 hours', time: '30 minutes ago' },
    { icon: '🟢', priority: 'low', message: 'System backup completed successfully', time: '1 hour ago' }
  ];
  
  notificationsEl.innerHTML = '';
  
  notifications.forEach(notification => {
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification-item priority-${notification.priority}`;
    
    notificationEl.innerHTML = `
      <span class="notification-icon">${notification.icon}</span>
      <div class="notification-content">
        <p>${notification.message}</p>
        <small>${notification.time}</small>
      </div>
    `;
    
    notificationsEl.appendChild(notificationEl);
  });
}

function setupAdminActions() {
  // Quick action buttons
  const addParticipantQuick = document.getElementById('add-participant-quick');
  const addParticipantBtn = document.getElementById('add-participant-btn');
  
  if (addParticipantQuick) {
    addParticipantQuick.addEventListener('click', showAddParticipantForm);
  }
  
  if (addParticipantBtn) {
    addParticipantBtn.addEventListener('click', showAddParticipantForm);
  }
  
  // Other action buttons would be set up here
  const createTeamQuick = document.getElementById('create-team-quick');
  if (createTeamQuick) {
    createTeamQuick.addEventListener('click', () => showNotification('Create team functionality would open here', 'info'));
  }
  
  const sendAnnouncementQuick = document.getElementById('send-announcement-quick');
  if (sendAnnouncementQuick) {
    sendAnnouncementQuick.addEventListener('click', () => showNotification('Send announcement functionality would open here', 'info'));
  }
  
  const exportDataQuick = document.getElementById('export-data-quick');
  if (exportDataQuick) {
    exportDataQuick.addEventListener('click', () => showNotification('Export data functionality would start here', 'info'));
  }
}

// Data population functions
function populateParticipants() {
  const participantsGrid = document.getElementById('participants-grid');
  if (!participantsGrid) return;
  
  participantsGrid.innerHTML = '';
  const maxToShow = 30;
  const participantsToShow = hackathonData.participants.slice(0, maxToShow);
  participantsToShow.forEach(participant => {
    const participantCard = document.createElement('div');
    participantCard.className = 'participant-card';
    participantCard.innerHTML = `
      <div class="participant-header">
        <div>
          <h3 class="participant-name">${participant.name}</h3>
          <p class="participant-email">${participant.email}</p>
        </div>
        <span class="participant-track">${participant.track}</span>
      </div>
      <div class="participant-meta">
        <span>${participant.experience}</span>
        <span class="status status--${getStatusClass(participant.status)}">${participant.status}</span>
      </div>
    `;
    participantsGrid.appendChild(participantCard);
  });
  if (hackathonData.participants.length > maxToShow) {
    const showMoreBtn = document.createElement('button');
    showMoreBtn.textContent = 'Show More';
    showMoreBtn.className = 'btn btn--primary show-more-btn';
    showMoreBtn.onclick = function() {
      showAllParticipants();
      showMoreBtn.remove();
    };
    participantsGrid.appendChild(showMoreBtn);
  }
}

function showAllParticipants() {
  const participantsGrid = document.getElementById('participants-grid');
  if (!participantsGrid) return;
  participantsGrid.innerHTML = '';
  hackathonData.participants.forEach(participant => {
    const participantCard = document.createElement('div');
    participantCard.className = 'participant-card';
    participantCard.innerHTML = `
      <div class="participant-header">
        <div>
          <h3 class="participant-name">${participant.name}</h3>
          <p class="participant-email">${participant.email}</p>
        </div>
        <span class="participant-track">${participant.track}</span>
      </div>
      <div class="participant-meta">
        <span>${participant.experience}</span>
        <span class="status status--${getStatusClass(participant.status)}">${participant.status}</span>
      </div>
    `;
    participantsGrid.appendChild(participantCard);
  });
}


function populateTeams() {
  const teamsGrid = document.getElementById('teams-grid');
  if (!teamsGrid) return;
  
  teamsGrid.innerHTML = '';
  const maxToShow = 30;
  const teamsToShow = hackathonData.teams.slice(0, maxToShow);
  teamsToShow.forEach(team => {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    teamCard.innerHTML = `
      <div class="team-header">
        <div>
          <h3 class="team-name">${team.name}</h3>
        </div>
        <span class="team-track">${team.track}</span>
      </div>
      <div class="team-project">
        <h4>${team.projectName}</h4>
      </div>
      <div class="team-footer">
        <span class="status status--${getStatusClass(team.submissionStatus)}">${team.submissionStatus}</span>
        <a href="https://${team.githubUrl}" target="_blank" class="project-link">GitHub</a>
      </div>
    `;
    teamsGrid.appendChild(teamCard);
  });
  if (hackathonData.teams.length > maxToShow) {
    const showMoreBtn = document.createElement('button');
    showMoreBtn.textContent = 'Show More';
    showMoreBtn.className = 'btn btn--primary show-more-btn';
    showMoreBtn.onclick = function() {
      showAllTeams();
      showMoreBtn.remove();
    };
    teamsGrid.appendChild(showMoreBtn);
  }
}

function showAllTeams() {
  const teamsGrid = document.getElementById('teams-grid');
  if (!teamsGrid) return;
  teamsGrid.innerHTML = '';
  hackathonData.teams.forEach(team => {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    teamCard.innerHTML = `
      <div class="team-header">
        <div>
          <h3 class="team-name">${team.name}</h3>
        </div>
        <span class="team-track">${team.track}</span>
      </div>
      <div class="team-project">
        <h4>${team.projectName}</h4>
      </div>
      <div class="team-footer">
        <span class="status status--${getStatusClass(team.submissionStatus)}">${team.submissionStatus}</span>
        <a href="https://${team.githubUrl}" target="_blank" class="project-link">GitHub</a>
      </div>
    `;
    teamsGrid.appendChild(teamCard);
  });
}


function populateProjects() {
  const projectsGrid = document.getElementById('projects-grid');
  if (!projectsGrid) return;
  
  projectsGrid.innerHTML = '';
  const maxToShow = 30;
  const projectsToShow = hackathonData.projects.slice(0, maxToShow);
  projectsToShow.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.innerHTML = `
      <div class="project-header">
        <div>
          <h3 class="project-title">${project.projectName}</h3>
          <p class="project-team">by ${project.teamName}</p>
        </div>
        <span class="status status--${getStatusClass(project.status)}">${project.status}</span>
      </div>
      <p class="project-description">${project.description}</p>
    `;
    projectsGrid.appendChild(projectCard);
  });
  if (hackathonData.projects.length > maxToShow) {
    const showMoreBtn = document.createElement('button');
    showMoreBtn.textContent = 'Show More';
    showMoreBtn.className = 'btn btn--primary show-more-btn';
    showMoreBtn.onclick = function() {
      showAllProjects();
      showMoreBtn.remove();
    };
    projectsGrid.appendChild(showMoreBtn);
  }
}

function showAllProjects() {
  const projectsGrid = document.getElementById('projects-grid');
  if (!projectsGrid) return;
  projectsGrid.innerHTML = '';
  hackathonData.projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.innerHTML = `
      <div class="project-header">
        <div>
          <h3 class="project-title">${project.projectName}</h3>
          <p class="project-team">by ${project.teamName}</p>
        </div>
        <span class="status status--${getStatusClass(project.status)}">${project.status}</span>
      </div>
      <p class="project-description">${project.description}</p>
    `;
    projectsGrid.appendChild(projectCard);
  });
}


function populateJudges() {
  const judgesList = document.getElementById('judges-list');
  if (!judgesList) return;
  
  judgesList.innerHTML = '';
  const maxToShow = 30;
  const judgesToShow = hackathonData.judges.slice(0, maxToShow);
  judgesToShow.forEach(judge => {
    const judgeItem = document.createElement('div');
    judgeItem.className = 'judge-item';
    judgeItem.innerHTML = `
      <div class="judge-info">
        <h4>${judge.name}</h4>
        <p>${judge.organization}</p>
        <div>Tracks: ${judge.tracksAssigned.join(', ')}</div>
      </div>
    `;
    judgesList.appendChild(judgeItem);
  });
  if (hackathonData.judges.length > maxToShow) {
    const showMoreBtn = document.createElement('button');
    showMoreBtn.textContent = 'Show More';
    showMoreBtn.className = 'btn btn--primary show-more-btn';
    showMoreBtn.onclick = function() {
      showAllJudges();
      showMoreBtn.remove();
    };
    judgesList.appendChild(showMoreBtn);
  }
}

function showAllJudges() {
  const judgesList = document.getElementById('judges-list');
  if (!judgesList) return;
  judgesList.innerHTML = '';
  hackathonData.judges.forEach(judge => {
    const judgeItem = document.createElement('div');
    judgeItem.className = 'judge-item';
    judgeItem.innerHTML = `
      <div class="judge-info">
        <h4>${judge.name}</h4>
        <p>${judge.organization}</p>
        <div>Tracks: ${judge.tracksAssigned.join(', ')}</div>
      </div>
    `;
    judgesList.appendChild(judgeItem);
  });
}


function populateMentors() {
  const mentorsGrid = document.getElementById('mentors-grid');
  if (!mentorsGrid) return;
  
  mentorsGrid.innerHTML = '';
  const maxToShow = 30;
  const mentorsToShow = hackathonData.mentors.slice(0, maxToShow);
  mentorsToShow.forEach(mentor => {
    const mentorCard = document.createElement('div');
    mentorCard.className = 'mentor-card';
    mentorCard.innerHTML = `
      <div class="mentor-header">
        <div>
          <h3 class="mentor-name">${mentor.name}</h3>
          <p class="mentor-company">${mentor.company}</p>
        </div>
        <span class="status status--${mentor.availability === 'Available' ? 'success' : 'warning'}">
          ${mentor.availability}
        </span>
      </div>
    `;
    mentorsGrid.appendChild(mentorCard);
  });
  if (hackathonData.mentors.length > maxToShow) {
    const showMoreBtn = document.createElement('button');
    showMoreBtn.textContent = 'Show More';
    showMoreBtn.className = 'btn btn--primary show-more-btn';
    showMoreBtn.onclick = function() {
      showAllMentors();
      showMoreBtn.remove();
    };
    mentorsGrid.appendChild(showMoreBtn);
  }
}

function showAllMentors() {
  const mentorsGrid = document.getElementById('mentors-grid');
  if (!mentorsGrid) return;
  mentorsGrid.innerHTML = '';
  hackathonData.mentors.forEach(mentor => {
    const mentorCard = document.createElement('div');
    mentorCard.className = 'mentor-card';
    mentorCard.innerHTML = `
      <div class="mentor-header">
        <div>
          <h3 class="mentor-name">${mentor.name}</h3>
          <p class="mentor-company">${mentor.company}</p>
        </div>
        <span class="status status--${mentor.availability === 'Available' ? 'success' : 'warning'}">
          ${mentor.availability}
        </span>
      </div>
    `;
    mentorsGrid.appendChild(mentorCard);
  });
}


function populateAnnouncements() {
  const announcementsList = document.getElementById('announcements-list');
  if (!announcementsList) return;
  
  const announcements = [
    { title: "Project Submission Deadline Reminder", message: "Don't forget to submit your projects by November 8th, 6:00 PM!", timestamp: "1 hour ago" },
    { title: "Welcome to HACK<N>PITCH 2025", message: "We're excited to have you join us for this amazing hackathon!", timestamp: "2 days ago" }
  ];
  
  announcementsList.innerHTML = '';
  
  announcements.forEach(announcement => {
    const item = document.createElement('div');
    item.innerHTML = `
      <div>
        <h4>${announcement.title}</h4>
        <p>${announcement.message}</p>
        <small>${announcement.timestamp}</small>
      </div>
    `;
    
    announcementsList.appendChild(item);
  });
}

// Charts
function initializeCharts() {
  fetch('/api/analytics')
    .then(res => res.json())
    .then(data => {
      // Registration Analytics Chart
      const ctx = document.getElementById('registrationChart')?.getContext('2d');
      if (ctx) {
        registrationChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.registrationAnalytics.labels,
            datasets: [{
              label: 'Daily Registrations',
              data: data.registrationAnalytics.counts,
              borderColor: '#1FB8CD',
              backgroundColor: 'rgba(31, 184, 205, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }

      // Track Popularity Chart
      const trackCtx = document.getElementById('trackPopularityChart')?.getContext('2d');
      if (trackCtx) {
        new Chart(trackCtx, {
          type: 'bar',
          data: {
            labels: data.trackPopularity.tracks,
            datasets: [{
              label: 'Track Popularity',
              data: data.trackPopularity.counts,
              backgroundColor: ['#1FB8CD', '#F9C846', '#F96B6B', '#7C8DF9']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }

      // Engagement Metrics
      document.getElementById('avg-team-size').textContent = `${data.engagementMetrics.avgTeamSize} members`;
      document.getElementById('submission-rate').textContent = `${data.engagementMetrics.submissionRate}% (${data.engagementMetrics.totalProjects}/${data.engagementMetrics.totalTeams} teams)`;
      document.getElementById('mentor-utilization').textContent = `${data.engagementMetrics.mentorUtilization}% (${Math.round(data.engagementMetrics.mentorUtilization * data.engagementMetrics.totalMentors / 100)}/${data.engagementMetrics.totalMentors} mentors)`;
      document.getElementById('active-participants').textContent = `${data.engagementMetrics.activeParticipants}% (${Math.round(data.engagementMetrics.activeParticipants * data.engagementMetrics.totalParticipants / 100)}/${data.engagementMetrics.totalParticipants})`;

      // University Distribution
      const uniList = document.getElementById('university-distribution-list');
      if (uniList) {
        uniList.innerHTML = '';
        data.universityDistribution.forEach(u => {
          const li = document.createElement('li');
          li.innerHTML = `<span>${u.university}</span> <span style="color:#1FB8CD;float:right;">${u.percent}%</span>`;
          uniList.appendChild(li);
        });
      }
    })
    .catch(err => {
      console.error('Error loading analytics:', err);
    });
}

// Form functions
function showAddParticipantForm() {
  const formContent = `
    <form class="config-form" onsubmit="addParticipant(event)">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" name="name" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" name="email" class="form-control" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Track</label>
          <select name="track" class="form-control" required>
            <option value="">Select Track</option>
            <option value="Generative AI">Generative AI</option>
            <option value="Agentic AI">Agentic AI</option>
            <option value="Web3">Web3</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Experience Level</label>
          <select name="experience" class="form-control" required>
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn--outline" onclick="hideFormModal()">Cancel</button>
        <button type="submit" class="btn btn--primary">Add Participant</button>
      </div>
    </form>
  `;
  
  showFormModal('Add New Participant', formContent);
}

function addParticipant(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const newParticipant = {
    name: formData.get('name'),
    email: formData.get('email'),
    track: formData.get('track'),
    experience: formData.get('experience'),
    status: 'Active',
    registrationDate: new Date().toISOString().split('T')[0]
  };
  fetch('/api/participants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newParticipant)
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to add participant');
      return res.json();
    })
    .then(data => {
      showNotification('Participant added successfully!', 'success');
      hideFormModal();
      // Re-fetch participants and stats
      fetchAllData();
    })
    .catch(err => {
      showNotification('Error adding participant', 'error');
      console.error(err);
    });
}

function showFormModal(title, content) {
  const modal = document.getElementById('form-modal');
  const titleEl = document.getElementById('form-modal-title');
  const contentEl = document.getElementById('form-modal-content');
  
  if (titleEl) titleEl.textContent = title;
  if (contentEl) contentEl.innerHTML = content;
  
  if (modal) modal.classList.remove('hidden');
}

function hideFormModal() {
  const modal = document.getElementById('form-modal');
  if (modal) modal.classList.add('hidden');
}

// Utility functions
function getActivityIcon(type) {
  const icons = {
    registration: '👥',
    milestone: '🎉',
    update: '📢',
    announcement: '📣'
  };
  return icons[type] || '📝';
}

function getStatusClass(status) {
  switch (status) {
    case 'Active':
    case 'Submitted':
    case 'Approved':
      return 'success';
    case 'In Progress':
    case 'Under Review':
      return 'warning';
    case 'Planning':
    case 'Needs Changes':
      return 'info';
    case 'Inactive':
      return 'error';
    default:
      return 'info';
  }
}

function showError(message) {
  const loginError = document.getElementById('login-error');
  if (loginError) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }
}

function hideError() {
  const loginError = document.getElementById('login-error');
  if (loginError) {
    loginError.classList.add('hidden');
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Data generation functions
// ...existing code...

console.log('Integrated HackFlow application loaded successfully');