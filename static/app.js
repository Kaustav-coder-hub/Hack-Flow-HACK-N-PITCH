// Application Data (dynamic)
const hackathonData = {
  hackathon: { name: "HACK<N>PITCH 2025", date: "November 7-8, 2025", venue: "Jadavpur University Salt Lake Campus", maxParticipants: 200, maxTeams: 50 },
  tracks: [
    { id: 1, name: "Generative AI", color: "#4F46E5", teams: 14 },
    { id: 2, name: "Agentic AI", color: "#059669", teams: 12 },
    { id: 3, name: "Web3", color: "#DC2626", teams: 11 },
    { id: 4, name: "Cybersecurity", color: "#7C3AED", teams: 9 }
  ],
  participants: [],
  teams: [],
  mentors: [],
  judges: [],
  projects: [],
  activities: [
    { id: 1, type: "registration", message: "New participant registered: Arjun Sharma (Generative AI)", timestamp: "2 minutes ago" },
    { id: 2, type: "team", message: "Team 'AI Innovators' submitted their project", timestamp: "15 minutes ago" },
    { id: 3, type: "mentor", message: "Dr. Amit Verma assigned to help Team 'Cyber Guardians'", timestamp: "32 minutes ago" },
    { id: 4, type: "submission", message: "Project submission deadline reminder sent to all teams", timestamp: "1 hour ago" },
    { id: 5, type: "registration", message: "Team formation completed for 'BlockChain Builders'", timestamp: "1 hour ago" },
    { id: 6, type: "mentor", message: "Sarah Johnson started mentoring session with Team 'Web Warriors'", timestamp: "2 hours ago" }
  ],
  stats: { totalParticipants: 0, maxParticipants: 200, teamsFormed: 0, maxTeams: 50, projectsSubmitted: 0, mentorsAvailable: 0, registrationStartDate: "2025-07-04", eventDate: "2025-11-07" }
};

// Fetch data from backend APIs
async function fetchAllData() {
  const [participants, teams, projects, mentors, judges] = await Promise.all([
    fetch('/api/participants').then(res => res.json()),
    fetch('/api/teams').then(res => res.json()),
    fetch('/api/projects').then(res => res.json()),
    fetch('/api/mentors').then(res => res.json()),
    fetch('/api/judges').then(res => res.json())
  ]);
  hackathonData.participants = participants;
  hackathonData.teams = teams;
  hackathonData.projects = projects;
  hackathonData.mentors = mentors;
  hackathonData.judges = judges;
  hackathonData.stats.totalParticipants = participants.length;
  hackathonData.stats.teamsFormed = teams.length;
  hackathonData.stats.projectsSubmitted = projects.length;
  hackathonData.stats.mentorsAvailable = mentors.length;
}

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const modal = document.getElementById('team-modal');
const closeModal = document.getElementById('close-modal');

// Charts
let registrationChart, trackChart, scoringChart, registrationAnalyticsChart, trackPopularityChart;

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
  await fetchAllData();
  initializeNavigation();
  initializeCharts();
  populateActivityFeed();
  populateParticipants();
  populateTeams();
  populateProjects();
  populateJudges();
  populateMentors();
  initializeFilters();
  initializeModal();
  
  // Start simulated real-time updates
  startRealTimeUpdates();
});

// Navigation
function initializeNavigation() {
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetSection = this.getAttribute('data-section');
      
      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Show target section
      contentSections.forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(targetSection).classList.add('active');
    });
  });
}

// Initialize Charts
function initializeCharts() {
  initializeRegistrationChart();
  initializeTrackChart();
  initializeScoringChart();
  initializeAnalyticsCharts();
}

function initializeRegistrationChart() {
  const ctx = document.getElementById('registrationChart').getContext('2d');
  const days = generateRegistrationData();
  
  registrationChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days.map(d => d.date),
      datasets: [{
        label: 'Registrations',
        data: days.map(d => d.count),
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
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function initializeTrackChart() {
  const ctx = document.getElementById('trackChart').getContext('2d');
  
  trackChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: hackathonData.tracks.map(track => track.name),
      datasets: [{
        data: hackathonData.tracks.map(track => track.teams),
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function initializeScoringChart() {
  const ctx = document.getElementById('scoringChart').getContext('2d');
  const projects = hackathonData.projects;
  const avgScores = {
    innovation: projects.reduce((sum, p) => sum + ((p.judgeScores && p.judgeScores.innovation) || 0), 0) / projects.length,
    technical: projects.reduce((sum, p) => sum + ((p.judgeScores && p.judgeScores.technical) || 0), 0) / projects.length,
    impact: projects.reduce((sum, p) => sum + ((p.judgeScores && p.judgeScores.impact) || 0), 0) / projects.length,
    presentation: projects.reduce((sum, p) => sum + ((p.judgeScores && p.judgeScores.presentation) || 0), 0) / projects.length
  };
  
  scoringChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Innovation', 'Technical', 'Impact', 'Presentation'],
      datasets: [{
        label: 'Average Scores',
        data: Object.values(avgScores),
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.2)',
        pointBackgroundColor: '#1FB8CD'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

function initializeAnalyticsCharts() {
  // Registration Analytics Chart
  const regCtx = document.getElementById('registrationAnalyticsChart').getContext('2d');
  const regData = generateRegistrationData();
  
  registrationAnalyticsChart = new Chart(regCtx, {
    type: 'bar',
    data: {
      labels: regData.slice(-7).map(d => d.date),
      datasets: [{
        label: 'Daily Registrations',
        data: regData.slice(-7).map(d => d.dailyCount || 5),
        backgroundColor: '#1FB8CD'
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
  
  // Track Popularity Chart
  const trackPopCtx = document.getElementById('trackPopularityChart').getContext('2d');
  
  trackPopularityChart = new Chart(trackPopCtx, {
    type: 'bar',
    data: {
      labels: hackathonData.tracks.map(t => t.name),
      datasets: [{
        label: 'Participants',
        data: [52, 48, 44, 43],
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F']
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

function generateRegistrationData() {
  const days = [];
  let totalCount = 0;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dailyCount = Math.floor(Math.random() * 15) + 2;
    totalCount += dailyCount;
    
    days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: Math.min(totalCount, 187),
      dailyCount: dailyCount
    });
  }
  
  return days;
}

// Populate Activity Feed
function populateActivityFeed() {
  const activityList = document.getElementById('activity-list');
  
  hackathonData.activities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    activityItem.innerHTML = `
      <div class="activity-icon ${activity.type}">
        ${getActivityIcon(activity.type)}
      </div>
      <div class="activity-content">
        <p>${activity.message}</p>
        <small>${activity.timestamp}</small>
      </div>
    `;
    
    activityList.appendChild(activityItem);
  });
}

function getActivityIcon(type) {
  const icons = {
    registration: '👤',
    team: '🚀',
    mentor: '🧠',
    submission: '📋'
  };
  return icons[type] || '📝';
}

// Populate Participants
function populateParticipants() {
  const participantsGrid = document.getElementById('participants-grid');
  participantsGrid.innerHTML = '';
  hackathonData.participants.forEach(participant => {
    const participantCard = document.createElement('div');
    participantCard.className = 'participant-card';
    participantCard.setAttribute('data-track', participant.track);
    participantCard.innerHTML = `
      <div class="participant-header">
        <div>
          <h3 class="participant-name">${participant.name}</h3>
          <p class="participant-email">${participant.email}</p>
        </div>
        <span class="participant-track">${participant.track}</span>
      </div>
      <div class="participant-skills">
        ${(participant.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
      <div class="participant-meta">
        <span>${participant.experience || ''}</span>
        <span>${participant.university || ''}</span>
      </div>
    `;
    participantsGrid.appendChild(participantCard);
  });
}

// Populate Teams
function populateTeams() {
  const teamsGrid = document.getElementById('teams-grid');
  teamsGrid.innerHTML = '';
  hackathonData.teams.forEach(team => {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    teamCard.setAttribute('data-team-id', team.id);
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
      <div class="team-members">
        ${(team.members || []).map(member => `<span class="member-tag">${member}</span>`).join('')}
      </div>
      <div class="team-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${team.progress}%"></div>
        </div>
        <small>Progress: ${team.progress}%</small>
      </div>
      <div class="team-footer">
        <span class="status status--${getStatusClass(team.submissionStatus)}">${team.submissionStatus}</span>
        <a href="https://${team.githubUrl}" target="_blank" class="project-link">GitHub</a>
      </div>
    `;
    teamCard.addEventListener('click', () => showTeamModal(team));
    teamsGrid.appendChild(teamCard);
  });
}

// Populate Projects
function populateProjects() {
  const projectsGrid = document.getElementById('projects-grid');
  projectsGrid.innerHTML = '';
  hackathonData.projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.setAttribute('data-track', project.track);
    const judgeScores = project.judgeScores || {};
    projectCard.innerHTML = `
      <div class="project-header">
        <div>
          <h3 class="project-title">${project.projectName}</h3>
          <p class="project-team">by ${project.teamName}</p>
        </div>
        <span class="participant-track">${project.track}</span>
      </div>
      <p class="project-description">${project.description || ''}</p>
      <div class="project-links">
        <a href="https://${project.githubUrl}" target="_blank" class="project-link">GitHub</a>
        <a href="https://${project.demoUrl}" target="_blank" class="project-link">Demo</a>
      </div>
      <div class="project-scores">
        <div class="score-item">
          <span class="score-label">Innovation:</span>
          <span class="score-value">${judgeScores.innovation || '-'} / 10</span>
        </div>
        <div class="score-item">
          <span class="score-label">Technical:</span>
          <span class="score-value">${judgeScores.technical || '-'} / 10</span>
        </div>
        <div class="score-item">
          <span class="score-label">Impact:</span>
          <span class="score-value">${judgeScores.impact || '-'} / 10</span>
        </div>
        <div class="score-item">
          <span class="score-label">Presentation:</span>
          <span class="score-value">${judgeScores.presentation || '-'} / 10</span>
        </div>
      </div>
    `;
    projectsGrid.appendChild(projectCard);
  });
}

// Populate Judges
function populateJudges() {
  const judgesList = document.getElementById('judges-list');
  if (!judgesList) return;
  judgesList.innerHTML = '';
  hackathonData.judges.forEach(judge => {
    const judgeItem = document.createElement('div');
    judgeItem.className = 'judge-item';
    judgeItem.innerHTML = `
      <div class="judge-info">
        <h4>${judge.name}</h4>
        <p>${judge.organization || ''}</p>
        <div class="judge-tracks">Tracks: ${(judge.tracksAssigned || []).join(', ')}</div>
      </div>
      <span class="status status--success">Active</span>
    `;
    judgesList.appendChild(judgeItem);
  });
}

// Populate Mentors
function populateMentors() {
  const mentorsGrid = document.getElementById('mentors-grid');
  mentorsGrid.innerHTML = '';
  hackathonData.mentors.forEach(mentor => {
    const mentorCard = document.createElement('div');
    mentorCard.className = 'mentor-card';
    mentorCard.innerHTML = `
      <div class="mentor-header">
        <div>
          <h3 class="mentor-name">${mentor.name}</h3>
          <p class="mentor-company">${mentor.company || ''}</p>
        </div>
        <span class="status status--${mentor.availability === 'Available' ? 'success' : 'warning'}">
          ${mentor.availability}
        </span>
      </div>
      <div class="mentor-expertise">
        ${(mentor.expertise || []).map(skill => `<span class="expertise-tag">${skill}</span>`).join('')}
      </div>
      <div class="mentor-stats">
        <span>Teams: ${mentor.teamsAssigned || '-'}</span>
        <span>Experience: Senior</span>
      </div>
    `;
    mentorsGrid.appendChild(mentorCard);
  });
}

// Initialize Filters
function initializeFilters() {
  const participantSearch = document.getElementById('participant-search');
  const participantFilter = document.getElementById('participant-filter');
  const projectFilter = document.getElementById('project-filter');
  const submissionFilter = document.getElementById('submission-filter');
  
  if (participantSearch) {
    participantSearch.addEventListener('input', filterParticipants);
  }
  
  if (participantFilter) {
    participantFilter.addEventListener('change', filterParticipants);
  }
  
  if (projectFilter) {
    projectFilter.addEventListener('change', filterProjects);
  }
  
  if (submissionFilter) {
    submissionFilter.addEventListener('change', filterProjects);
  }
}

function filterParticipants() {
  const searchTerm = document.getElementById('participant-search').value.toLowerCase();
  const trackFilter = document.getElementById('participant-filter').value;
  const participantCards = document.querySelectorAll('.participant-card');
  
  participantCards.forEach(card => {
    const name = card.querySelector('.participant-name').textContent.toLowerCase();
    const track = card.getAttribute('data-track');
    
    const matchesSearch = name.includes(searchTerm);
    const matchesTrack = !trackFilter || track === trackFilter;
    
    card.style.display = (matchesSearch && matchesTrack) ? 'block' : 'none';
  });
}

function filterProjects() {
  const trackFilter = document.getElementById('project-filter').value;
  const submissionFilter = document.getElementById('submission-filter').value;
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    const track = card.getAttribute('data-track');
    const status = card.querySelector('.status').textContent;
    
    const matchesTrack = !trackFilter || track === trackFilter;
    const matchesSubmission = !submissionFilter || status === submissionFilter;
    
    card.style.display = (matchesTrack && matchesSubmission) ? 'block' : 'none';
  });
}

// Modal functionality
function initializeModal() {
  if (closeModal) {
    closeModal.addEventListener('click', hideTeamModal);
  }
  
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideTeamModal();
      }
    });
  }
}

function showTeamModal(team) {
  const modalTeamName = document.getElementById('modal-team-name');
  const modalTeamContent = document.getElementById('modal-team-content');
  
  if (modalTeamName) modalTeamName.textContent = team.name;
  
  if (modalTeamContent) {
    modalTeamContent.innerHTML = `
      <div class="team-detail">
        <h4>Project: ${team.projectName}</h4>
        <p><strong>Track:</strong> ${team.track}</p>
        <p><strong>Status:</strong> ${team.submissionStatus}</p>
        <p><strong>Progress:</strong> ${team.progress}%</p>
        
        <h5>Team Members:</h5>
        <ul>
          ${team.members.map(member => `<li>${member}</li>`).join('')}
        </ul>
        
        <h5>Repository:</h5>
        <a href="https://${team.githubUrl}" target="_blank" class="btn btn--outline">View on GitHub</a>
      </div>
    `;
  }
  
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function hideTeamModal() {
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Utility functions
function getStatusClass(status) {
  switch (status) {
    case 'Submitted':
      return 'success';
    case 'In Progress':
      return 'warning';
    case 'Planning':
      return 'info';
    default:
      return 'info';
  }
}

// Real-time updates simulation
function startRealTimeUpdates() {
  setInterval(() => {
    updateStatistics();
    addNewActivity();
  }, 30000); // Update every 30 seconds
}

function updateStatistics() {
  // Simulate small increments in statistics
  const totalParticipants = document.getElementById('total-participants');
  const teamsFormed = document.getElementById('teams-formed');
  const projectsSubmitted = document.getElementById('projects-submitted');
  
  if (Math.random() > 0.8 && parseInt(totalParticipants.textContent) < 200) {
    totalParticipants.textContent = parseInt(totalParticipants.textContent) + 1;
  }
  
  if (Math.random() > 0.9 && parseInt(projectsSubmitted.textContent) < 46) {
    projectsSubmitted.textContent = parseInt(projectsSubmitted.textContent) + 1;
  }
}

function addNewActivity() {
  const activities = [
    "New participant registered: Sarah Wilson (Web3)",
    "Team 'Data Dragons' submitted their project",
    "Dr. Amit Verma started mentoring Team 'Neural Networks'",
    "Judge assigned to review 'Smart Contracts' track submissions",
    "Team 'Quantum Coders' completed their project setup"
  ];
  
  const activityList = document.getElementById('activity-list');
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  
  const newActivity = document.createElement('div');
  newActivity.className = 'activity-item';
  newActivity.innerHTML = `
    <div class="activity-icon registration">👤</div>
    <div class="activity-content">
      <p>${randomActivity}</p>
      <small>Just now</small>
    </div>
  `;
  
  activityList.insertBefore(newActivity, activityList.firstChild);
  
  // Remove old activities (keep only 6)
  while (activityList.children.length > 6) {
    activityList.removeChild(activityList.lastChild);
  }
}

// Event listeners for buttons
document.addEventListener('click', function(e) {
  if (e.target.id === 'add-team-btn') {
    alert('Add Team functionality would open a modal form here');
  }
  
  if (e.target.id === 'send-announcement-btn') {
    alert('Send Announcement functionality would open a modal form here');
  }
  
  if (e.target.id === 'export-report-btn') {
    alert('Export Report functionality would generate and download a PDF report');
  }
});

console.log('HackFlow Dashboard initialized successfully!');