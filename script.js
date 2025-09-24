// ==================== POCKETBASE SETUP ====================
const pb = new PocketBase('http://127.0.0.1:8090');

// Authentication functions
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        console.log('Logged in!', authData);
        closeAuthModal();
        loadDashboard(); // Refresh the page with user data
        showNotification('Welcome back!', 'success');
    } catch (error) {
        console.error('Login failed:', error);
        showNotification('Login failed. Check your email/password.', 'error');
    }
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const data = {
            username: username,
            email: email,
            password: password,
            passwordConfirm: password,
            emailVisibility: true
        };
        
        await pb.collection('users').create(data);
        console.log('Registered!');
        showNotification('Account created! Please login.', 'success');
        showLoginForm(); // Switch to login form
    } catch (error) {
        console.error('Registration failed:', error);
        showNotification('Registration failed. Try different email.', 'error');
    }
}

function logout() {
    pb.authStore.clear();
    showNotification('Logged out successfully', 'success');
    loadDashboard(); // Refresh page
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    showLoginForm();
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function isLoggedIn() {
    return pb.authStore.isValid;
}

function getCurrentUser() {
    return pb.authStore.model;
}

function showNotification(message, type = 'info') {
    // Simple notification - you can improve this later
    alert(message);
}
// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.getElementById('content-area');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarFab = document.getElementById('sidebarFab');
    const userAvatar = document.getElementById('userAvatar');
    const profileDropdown = document.getElementById('profileDropdown');
    const floatingAskAI = document.getElementById('floatingAskAI');
    const aiChatPanel = document.getElementById('aiChatPanel');
    const aiChatClose = document.getElementById('aiChatClose');
    const aiChatSend = document.getElementById('aiChatSend');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatBody = document.getElementById('aiChatBody');
    
    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
            sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
            if (sidebarFab) sidebarFab.classList.add('show');
        } else {
            sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            if (sidebarFab) sidebarFab.classList.remove('show');
        }
    });
    if (sidebarFab) {
        sidebarFab.addEventListener('click', ()=>{
            sidebar.classList.remove('collapsed');
            sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            sidebarFab.classList.remove('show');
        });
    }
    
    // User profile dropdown functionality
userAvatar.addEventListener('click', function(e) {
    e.stopPropagation();
    
    if (!isLoggedIn()) {
        showAuthModal(); // Show login if not logged in
        return;
    }
    
    profileDropdown.classList.toggle('show');
});
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userAvatar.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });
    
// Profile dropdown actions
profileDropdown.addEventListener('click', function(e) {
    const action = e.target.closest('.profile-action');
    if (!action) return;
    
    const label = action.querySelector('span') ? action.querySelector('span').textContent.trim().toLowerCase() : '';
    
    if (label === 'profile') {
        handleNavigation('profile-view');
    } else if (label === 'settings') {
        handleNavigation('settings');
    } else if (label === 'logout') {
        logout();
    }
    
    profileDropdown.classList.remove('show');
    e.preventDefault();
    e.stopPropagation();
});
    
    // Floating Ask AI button functionality -> open floating chat panel
    floatingAskAI.addEventListener('click', function() {
        if (aiChatPanel) {
            aiChatPanel.classList.add('open');
            aiChatPanel.setAttribute('aria-hidden', 'false');
            if (aiChatInput) aiChatInput.focus();
        }
    });
    if (aiChatClose) {
        aiChatClose.addEventListener('click', ()=>{
            aiChatPanel.classList.remove('open');
            aiChatPanel.setAttribute('aria-hidden', 'true');
        });
    }
    if (aiChatSend && aiChatInput && aiChatBody) {
        const sendAiMessage = ()=>{
            const text = aiChatInput.value.trim();
            if (!text) return;
            const userMsg = document.createElement('div');
            userMsg.className = 'message user-message';
            userMsg.innerHTML = `
                <div class="message-avatar"><i class="fas fa-user"></i></div>
                <div class="message-content"><p>${text}</p></div>
            `;
            aiChatBody.appendChild(userMsg);
            aiChatInput.value = '';
            aiChatBody.scrollTop = aiChatBody.scrollHeight;
            setTimeout(()=>{
                const aiMsg = document.createElement('div');
                aiMsg.className = 'message ai-message';
                aiMsg.innerHTML = `
                    <div class="message-avatar"><i class="fas fa-robot"></i></div>
                    <div class="message-content"><p>Thanks! Here's a helpful tip: break problems into smaller steps and tackle them one by one.</p></div>
                `;
                aiChatBody.appendChild(aiMsg);
                aiChatBody.scrollTop = aiChatBody.scrollHeight;
            }, 700);
        };
        aiChatSend.addEventListener('click', sendAiMessage);
        aiChatInput.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') sendAiMessage(); });
    }
    
    // Sidebar navigation functionality
    const sidebarItems = document.querySelectorAll('.progress-item, .action-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                // Remove active class from all sidebar items
                sidebarItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                this.classList.add('active');
                
                // Handle navigation
                handleSidebarNavigation(page);
            }
        });
    });
    
    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Get the target section
            const target = this.getAttribute('href').substring(1);
            
            // Handle different sections
            handleNavigation(target);
        });
    });
    
    // Load dashboard by default
    loadDashboard();

    // Simple profile storage helpers
    function getStoredProfile() {
        try { return JSON.parse(localStorage.getItem('studentProfile') || '{}'); } catch { return {}; }
    }
    function saveStoredProfile(profile) {
        localStorage.setItem('studentProfile', JSON.stringify(profile));
    }
    
    // Handle sidebar navigation
    function handleSidebarNavigation(page) {
        switch(page) {
            case 'streaks':
                loadStreaks();
                break;
            case 'badges':
                loadBadges();
                break;
            case 'syllabus':
                loadSyllabus();
                break;
            case 'portfolio':
                loadPortfolio();
                break;
            case 'documents':
                loadDocuments();
                break;
            case 'notes':
                loadNotes();
                break;
            case 'overview':
                loadOverview();
                break;
            case 'settings':
                loadSettings();
                break;
        }
    }
    
    // Handle navigation to different sections
    function handleNavigation(section) {
        // Show/hide floating Ask AI button
        if (section === 'quizzes' || section === 'contests') {
            floatingAskAI.classList.add('hidden');
        } else {
            floatingAskAI.classList.remove('hidden');
        }
        if (section === 'profile-view') { loadProfileView(); return; }
        switch(section) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'documents':
                loadDocuments();
                break;
            case 'ai-mentor':
                loadAIMentor();
                break;
            case 'quizzes':
                loadQuizzes();
                break;
            case 'focus':
                loadFocus();
                break;
            case 'labs':
                loadLabs();
                break;
            case 'social':
                loadSocial();
                break;
            case 'notes':
                loadNotes();
                break;
        }
    }
    
    // Dashboard Page
    function loadDashboard() {
        const user = isLoggedIn() ? getCurrentUser() : null;
const welcomeMessage = user ? `Welcome Back, ${user.username}!` : 'Welcome to NextHorizon!';
const loginPrompt = user ? '' : '<p style="text-align: center; margin-top: 1rem;"><a href="#" onclick="showAuthModal()" style="color: #3B82F6;">Login to save your progress</a></p>';

contentArea.innerHTML = `
    <div class="dashboard-header">
        <h1 class="dashboard-title">${welcomeMessage}</h1>
        ${loginPrompt}
    </div>
            
            <div class="dashboard-carousel" id="dashboardCarousel">
                <div class="carousel-track">
                    <div class="carousel-slide active" style="background-image: url('https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1600&auto=format&fit=crop'); background-size: cover; background-position: center;">
                        <div class="slide-content">
                            <h3>Boost your streak today</h3>
                            <p>Complete a quick focus session to keep momentum.</p>
                            <button class="btn-secondary">Start Focus</button>
                        </div>
                    </div>
                    <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop'); background-size: cover; background-position: center;">
                        <div class="slide-content">
                            <h3>Contests this week</h3>
                            <p>Join coding and math contests to climb the leaderboard.</p>
                            <button class="btn-secondary">View Contests</button>
                        </div>
                    </div>
                    <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1600&auto=format&fit=crop'); background-size: cover; background-position: center;">
                        <div class="slide-content">
                            <h3>Leaderboard highlights</h3>
                            <p>You are 3rd with 1,980 XP. Keep going to take the lead!</p>
                            <button class="btn-secondary">Open Leaderboard</button>
                        </div>
                    </div>
                </div>
                <div class="carousel-dots"></div>
            </div>
            
            <div class="journey-section">
                <h2 class="section-title">Your Journey</h2>
                <div class="journey-cards">
                    <div class="journey-card">
                        <div class="card-icon target">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <div class="card-number">3</div>
                        <div class="card-title">Current Goals</div>
                        <button class="card-button">View Details</button>
                    </div>
                    <div class="journey-card">
                        <div class="card-icon sparkle">
                            <i class="fas fa-sparkles"></i>
                        </div>
                        <div class="card-number">5</div>
                        <div class="card-title">New Challenges</div>
                        <button class="card-button">Explore Challenges</button>
                    </div>
                    <div class="journey-card">
                        <div class="card-icon trophy">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="card-number">2</div>
                        <div class="card-title">Ongoing Contests</div>
                        <button class="card-button">Join Contest</button>
                    </div>
                </div>
            </div>
            
            <div class="journey-section">
                <h2 class="section-title">Continue Learning</h2>
                <div class="learning-cards">
                    <div class="learning-card">
                        <div class="learning-card-header">
                            <div class="learning-card-icon chat">
                                <i class="fas fa-comments"></i>
                            </div>
                            <h3 class="learning-card-title">AI Mentor Session</h3>
                        </div>
                        <p class="learning-card-description">Dive into an interactive Q&A or Socratic dialogue with your personal AI tutor.</p>
                        <button class="learning-card-button">Chat Now</button>
                    </div>
                    <div class="learning-card">
                        <div class="learning-card-header">
                            <div class="learning-card-icon book">
                                <i class="fas fa-book-open"></i>
                            </div>
                            <h3 class="learning-card-title">Latest Quizzes</h3>
                        </div>
                        <p class="learning-card-description">Test your knowledge on recent topics and track your improvements instantly.</p>
                        <button class="learning-card-button">Take Quiz</button>
                    </div>
                    <div class="learning-card">
                        <div class="learning-card-header">
                            <div class="learning-card-icon lab">
                                <i class="fas fa-flask"></i>
                            </div>
                            <h3 class="learning-card-title">Explore 3D Labs</h3>
                        </div>
                        <p class="learning-card-description">Engage with immersive simulations and virtual experiments. Bring theory to life!</p>
                        <button class="learning-card-button">Launch Lab</button>
                    </div>
                </div>
            </div>
            
            <div class="progress-overview">
                <h2 class="section-title">Your Progress Overview</h2>
                <div class="progress-cards">
                    <div class="progress-card">
                        <div class="progress-card-icon blue">
                            <i class="fas fa-calculator"></i>
                        </div>
                        <div class="progress-card-content">
                            <h3 class="progress-card-title">Complete Calculus Module</h3>
                            <p class="progress-card-description">Finish all lessons and quizzes in the Advanced Calculus module.</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                            <button class="progress-card-button">Continue Learning</button>
                        </div>
                    </div>
                    <div class="progress-card">
                        <div class="progress-card-icon green">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="progress-card-content">
                            <h3 class="progress-card-title">Master Python Basics</h3>
                            <p class="progress-card-description">Complete the introductory Python programming course.</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 50%"></div>
                            </div>
                            <button class="progress-card-button">Resume Course</button>
                        </div>
                    </div>
                    <div class="progress-card">
                        <div class="progress-card-icon yellow">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="progress-card-content">
                            <h3 class="progress-card-title">Read 5 Research Papers</h3>
                            <p class="progress-card-description">Dive deeper into quantum computing concepts.</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 20%"></div>
                            </div>
                            <button class="progress-card-button">Find Papers</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="recent-activity">
                <h2 class="section-title">Recent Activity</h2>
                <div class="activity-grid">
                    <div class="activity-item">
                        <div class="activity-icon blue">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Completed 'Algebra I Quiz'</div>
                            <div class="activity-time">2 hours ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon green">
                            <i class="fas fa-upload"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Uploaded 'History_Notes.pdf'</div>
                            <div class="activity-time">Yesterday</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon green">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Explored 'Virtual Human Anatomy Lab'</div>
                            <div class="activity-time">3 days ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon yellow">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Set new goal: 'Prepare for Midterms'</div>
                            <div class="activity-time">4 days ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon blue">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Chatted with AI Mentor about 'Thermodynamics'</div>
                            <div class="activity-time">2 days ago</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Initialize carousel behaviour
        setupCarousel('dashboardCarousel');

        // Wire carousel buttons to requested pages
        const slidesRoot = document.getElementById('dashboardCarousel');
        if (slidesRoot) {
            const btns = Array.from(slidesRoot.querySelectorAll('.carousel-slide .btn-secondary'));
            btns.forEach(btn => {
                const label = btn.textContent.trim().toLowerCase();
                if (label.includes('start focus')) {
                    btn.addEventListener('click', ()=> handleNavigation('focus'));
                } else if (label.includes('view contests')) {
                    btn.addEventListener('click', ()=> handleNavigation('social'));
                } else if (label.includes('open leaderboard')) {
                    btn.addEventListener('click', ()=> {
                        // Open overview and scroll to leaderboard card
                        loadOverview();
                        setTimeout(()=>{
                            const lb = document.querySelector('.overview-card.leaderboard');
                            if (lb) lb.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                    });
                }
            });
        }
    }

    // Simple auto-rotating carousel
    function setupCarousel(id) {
        const root = document.getElementById(id);
        if (!root) return;
        const slides = Array.from(root.querySelectorAll('.carousel-slide'));
        const dotsWrap = root.querySelector('.carousel-dots');
        let index = 0;
        let timer = null;

        // Build dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => go(i));
            dotsWrap.appendChild(dot);
        });
        const dots = Array.from(dotsWrap.querySelectorAll('.dot'));

        function show(i) {
            slides.forEach((s, si) => s.classList.toggle('active', si === i));
            dots.forEach((d, di) => d.classList.toggle('active', di === i));
        }

        function next() { index = (index + 1) % slides.length; show(index); }
        function go(i) { index = i; show(index); reset(); }

        function start() { timer = setInterval(next, 4000); }
        function stop() { if (timer) clearInterval(timer); }
        function reset() { stop(); start(); }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);

        start();
    }
    
    // Documents Page
    function loadDocuments() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Upload Syllabus</h1>
            </div>
            
            <div class="card">
                <div class="upload-area">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <h3>Upload Your Syllabus or Documents</h3>
                    <p>Drag and drop your files here, or click to browse</p>
                    <button class="btn-primary">Choose Files</button>
                </div>
            </div>
            
            <div class="action-cards">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-graduation-cap"></i>
                        <h3 class="card-title">Syllabus Upload</h3>
                    </div>
                    <p class="card-content">Upload your course syllabus to get AI-generated study plans, quiz recommendations, and personalized learning paths.</p>
                    <button class="btn-primary">Upload Syllabus</button>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-file-alt"></i>
                        <h3 class="card-title">Document Analysis</h3>
                    </div>
                    <p class="card-content">Upload any document for AI-powered analysis, quiz generation, and learning recommendations.</p>
                    <button class="btn-secondary">Upload Document</button>
                </div>
            </div>
            
            <div class="recent-uploads">
                <h2 class="section-title">Recent Uploads</h2>
                <div class="upload-list">
                    <div class="upload-item">
                        <i class="fas fa-file-pdf"></i>
                        <div class="upload-info">
                            <h4>Computer Science Syllabus.pdf</h4>
                            <p>75% complete • Uploaded 2024-01-15</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                        <div class="upload-actions">
                            <i class="fas fa-eye"></i>
                            <i class="fas fa-download"></i>
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                    <div class="upload-item">
                        <i class="fas fa-file-word"></i>
                        <div class="upload-info">
                            <h4>Mathematics Notes.docx</h4>
                            <p>45% complete • Uploaded 2024-01-10</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 45%"></div>
                            </div>
                        </div>
                        <div class="upload-actions">
                            <i class="fas fa-eye"></i>
                            <i class="fas fa-download"></i>
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                    <div class="upload-item">
                        <i class="fas fa-file-pdf"></i>
                        <div class="upload-info">
                            <h4>Physics Lab Report.pdf</h4>
                            <p>Completed • Uploaded 2024-01-20</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                        <div class="upload-actions">
                            <i class="fas fa-eye"></i>
                            <i class="fas fa-download"></i>
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                    <div class="upload-item">
                        <i class="fas fa-file-powerpoint"></i>
                        <div class="upload-info">
                            <h4>Chemistry Exam Prep.pptx</h4>
                            <p>Completed • Uploaded 2024-01-22</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                        <div class="upload-actions">
                            <i class="fas fa-eye"></i>
                            <i class="fas fa-download"></i>
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // AI Mentor Page
    function loadAIMentor() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">AI Mentor Chat</h1>
                <p class="page-subtitle">Engage in Socratic or Q&A learning</p>
            </div>
            
            <div class="ai-mentor-container">
                <div class="chat-section">
                    <div class="mode-toggle">
                        <button class="mode-btn active">Socratic</button>
                        <button class="mode-btn">Q&A</button>
                    </div>
                    
                    <div class="chat-messages">
                        <div class="message ai-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <p>Hello! I'm your AI Mentor. How can I assist you with your learning today? We can explore topics in a Socratic style or a direct Q&A.</p>
                                <span class="message-time">10:00 AM</span>
                            </div>
                        </div>
                        
                        <div class="message user-message">
                            <div class="message-content">
                                <p>Hi! I'm struggling with the concept of quantum entanglement. Can you explain it in a Socratic way?</p>
                                <span class="message-time">10:05 AM</span>
                            </div>
                            <div class="message-avatar">
                                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="User">
                            </div>
                        </div>
                        
                        <div class="message ai-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <p>Excellent question! Before we dive in, what are your initial thoughts on what 'entanglement' might mean in a scientific context?</p>
                                <span class="message-time">10:06 AM</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input">
                        <i class="fas fa-paperclip"></i>
                        <input type="text" placeholder="Type your message...">
                        <i class="fas fa-microphone"></i>
                        <i class="fas fa-paper-plane"></i>
                    </div>
                </div>
                
                <div class="suggestions-section">
                    <h3>AI Suggested Resources</h3>
                    <p>Tailored for your learning journey</p>
                    
                    <div class="resource-cards">
                        <div class="resource-card">
                            <i class="fas fa-atom"></i>
                            <h4>Quantum Physics Lab</h4>
                            <p>Explore the basics of quantum mechanics in a virtual 3D lab environment.</p>
                            <button class="btn-secondary">Explore</button>
                        </div>
                        
                        <div class="resource-card">
                            <i class="fas fa-play"></i>
                            <h4>Understanding Entanglement</h4>
                            <p>Watch a simplified video explanation of quantum entanglement and its implications.</p>
                            <button class="btn-secondary">Explore</button>
                        </div>
                        
                        <div class="resource-card">
                            <i class="fas fa-question-circle"></i>
                            <h4>Particle Interactions Quiz</h4>
                            <p>Test your knowledge on particle physics and quantum interactions with this quiz.</p>
                            <button class="btn-secondary">Explore</button>
                        </div>
                        
                        <div class="resource-card">
                            <i class="fas fa-brain"></i>
                            <h4>Foundations of AI</h4>
                            <p>Dive into the core principles and historical milestones of artificial intelligence.</p>
                            <button class="btn-secondary">Explore</button>
                        </div>
                        
                        <div class="resource-card">
                            <i class="fas fa-gem"></i>
                            <h4>Advanced Algorithms</h4>
                            <p>Learn about complex algorithms and their applications in various computational problems.</p>
                            <button class="btn-secondary">Explore</button>
                        </div>
                    </div>
                    
                    <div class="progress-chart">
                        <h4>Daily Learning Progress</h4>
                        <p>Your activity over the last week</p>
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                <div class="bar" style="height: 60%"></div>
                                <div class="bar" style="height: 80%"></div>
                                <div class="bar" style="height: 40%"></div>
                                <div class="bar" style="height: 90%"></div>
                                <div class="bar" style="height: 70%"></div>
                                <div class="bar" style="height: 85%"></div>
                                <div class="bar" style="height: 95%"></div>
                            </div>
                            <div class="chart-labels">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Quizzes Page
    function loadQuizzes() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Quizzes</h1>
            </div>
            
            <div class="quiz-section">
                <div class="quiz-section-header">
                    <i class="fas fa-graduation-cap"></i>
                    <h2>On-Demand Quizzes</h2>
                </div>
                <p>Explore our curated collection of quizzes across various subjects.</p>
                
                <div class="quiz-grid">
                    <div class="quiz-card">
                        <div class="quiz-image">
                            <img src="https://images.unsplash.com/photo-1509228468518-180ad4862e4d?w=300&h=200&fit=crop" alt="Algebra">
                        </div>
                        <div class="quiz-content">
                            <h3>Algebra Fundamentals</h3>
                            <p>Test your basic algebraic knowledge including equations, inequalities, and functions.</p>
                            <div class="quiz-meta">
                                <span class="difficulty easy">Easy</span>
                                <span class="duration">20 min</span>
                                <span class="score">Last Score: 92%</span>
                            </div>
                            <button class="btn-primary">Take Quiz</button>
                        </div>
                    </div>
                    
                    <div class="quiz-card">
                        <div class="quiz-image">
                            <img src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop" alt="History">
                        </div>
                        <div class="quiz-content">
                            <h3>World History: Ancient Civilizations</h3>
                            <p>Explore the major ancient civilizations, their cultures, and historical significance.</p>
                            <div class="quiz-meta">
                                <span class="difficulty medium">Medium</span>
                                <span class="duration">30 min</span>
                                <span class="score">Last Score: 78%</span>
                            </div>
                            <button class="btn-primary">Take Quiz</button>
                        </div>
                    </div>
                    
                    <div class="quiz-card">
                        <div class="quiz-image">
                            <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop" alt="Biology">
                        </div>
                        <div class="quiz-content">
                            <h3>Introduction to Biology</h3>
                            <p>A comprehensive quiz on fundamental biological concepts and processes.</p>
                            <div class="quiz-meta">
                                <span class="difficulty medium">Medium</span>
                                <span class="duration">25 min</span>
                                <span class="score">Last Score: 85%</span>
                            </div>
                            <button class="btn-primary">Take Quiz</button>
                        </div>
                    </div>
                    
                    <div class="quiz-card">
                        <div class="quiz-image">
                            <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop" alt="Literature">
                        </div>
                        <div class="quiz-content">
                            <h3>English Literature: Romanticism</h3>
                            <p>Examine the key authors, themes, and works of the Romantic period in literature.</p>
                            <div class="quiz-meta">
                                <span class="difficulty hard">Hard</span>
                                <span class="duration">40 min</span>
                                <span class="score">Last Score: 67%</span>
                            </div>
                            <button class="btn-primary">Take Quiz</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quiz-section">
                <div class="quiz-section-header">
                    <i class="fas fa-brain"></i>
                    <h2>AI-Suggested Quizzes</h2>
                </div>
                <p>Personalized quizzes tailored to your learning needs and progress, powered by AI.</p>
                
                <div class="quiz-grid">
                    <div class="quiz-card ai-suggested">
                        <div class="quiz-image">
                            <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop" alt="Calculus">
                        </div>
                        <div class="quiz-content">
                            <h3>Calculus: Derivatives</h3>
                            <p>AI-identified knowledge gap: Practice problems on derivative rules and applications.</p>
                            <div class="quiz-meta">
                                <span class="difficulty hard">Hard</span>
                                <span class="duration">35 min</span>
                                <div class="ai-relevance">
                                    <span>AI-Suggested 75% relevance</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 75%"></div>
                                    </div>
                                </div>
                            </div>
                            <button class="btn-primary">Take Quiz</button>
                        </div>
                    </div>
                    
                    <div class="quiz-card ai-suggested">
                        <div class="quiz-image">
                            <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&h=200&fit=crop" alt="Chemistry">
                        </div>
                        <div class="quiz-content">
                            <h3>Chemistry: Stoichiometry</h3>
                            <p>Recommended by AI: Master the quantitative relationships in chemical reactions.</p>
                            <div class="quiz-meta">
                                <span class="difficulty medium">Medium</span>
                                <span class="duration">25 min</span>
                                <div class="ai-relevance">
                                    <span>AI-Suggested 50% relevance</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 50%"></div>
                                    </div>
                                </div>
                            </div>
                            <button class="btn-primary">Take Quiz</button>
                        </div>
                    </div>
                    
                    <div class="quiz-card ai-suggested">
                        <div class="quiz-image">
                            <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop" alt="AI">
                        </div>
                        <div class="quiz-content">
                            <h3>AI & Machine Learning Basics</h3>
                            <p>Personalized for your interests: Fundamental concepts of AI and machine learning.</p>
                            <div class="quiz-meta">
                                <span class="difficulty medium">Medium</span>
                                <span class="duration">30 min</span>
                                <div class="ai-relevance">
                                    <span>AI-Suggested 90% relevance</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 90%"></div>
                                    </div>
                                </div>
                            </div>
                            <button class="btn-primary">Take Quiz</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quiz-history-link">
                <a href="#">View My Quiz History & Scores</a>
            </div>
        `;
    }
    
    // Focus Page
    function loadFocus() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Focus Sessions</h1>
            </div>
            
            <div class="focus-container">
                <div class="current-session">
                    <div class="session-header">
                        <h2>Current Session</h2>
                        <p>Stay focused, stay productive.</p>
                    </div>
                    <div class="timer-display">
                        <div class="timer-circle">
                            <span class="timer-text">00:00:00</span>
                        </div>
                    </div>
                    <button class="btn-primary start-btn">▶ Start Session</button>
                </div>
                
                <div class="focus-stats">
                    <div class="stat-card">
                        <h3>Daily Focus</h3>
                        <p>Target: 60 minutes</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%"></div>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">45 min</span>
                            <span class="stat-goal">60 min Goal</span>
                        </div>
                        <div class="streak-info">
                            <span class="streak-number">5 Day Streak</span>
                            <p>Keep up the great work!</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Weekly Focus Goal</h3>
                        <p>Target: 10 hours</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 50%"></div>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">5 hrs</span>
                            <span class="stat-goal">10 hrs Goal</span>
                        </div>
                        <div class="streak-info">
                            <span class="streak-number">3 Week Streak</span>
                            <p>Almost there, just a few more hours!</p>
                        </div>
                    </div>
                </div>
                
                <div class="session-history">
                    <h3>Session History</h3>
                    <p>Your past focus sessions.</p>
                    <div class="history-list">
                        <div class="history-item">
                            <span class="history-date">Oct 26, 2023</span>
                            <span class="history-duration">1h 15m</span>
                            <span class="history-status">Focused</span>
                        </div>
                        <div class="history-item">
                            <span class="history-date">Oct 25, 2023</span>
                            <span class="history-duration">45m</span>
                            <span class="history-status">Challenging</span>
                        </div>
                        <div class="history-item">
                            <span class="history-date">Oct 24, 2023</span>
                            <span class="history-duration">1h 30m</span>
                            <span class="history-status">Productive</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Social Page
    function loadSocial() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Friend Groups & Mentor Chats</h1>
            </div>
            
            <div class="social-container">
                <div class="groups-section">
                    <div class="section-header">
                        <h2>Your Groups</h2>
                        <div class="group-actions">
                            <button class="btn-primary">Create Group</button>
                            <button class="btn-secondary">Join Group</button>
                        </div>
                    </div>
                    
                    <div class="groups-list">
                        <div class="group-card">
                            <div class="group-avatars">
                                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="User">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="User">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User">
                                <div class="more-count">+1</div>
                            </div>
                            <div class="group-info">
                                <h3>AI Study Group</h3>
                                <p>4 Members</p>
                            </div>
                            <span class="group-status active">Active</span>
                        </div>
                        
                        <div class="group-card">
                            <div class="group-avatars">
                                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="User">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="User">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User">
                                <div class="more-count">+3</div>
                            </div>
                            <div class="group-info">
                                <h3>History Buffs</h3>
                                <p>6 Members</p>
                            </div>
                            <span class="group-status planning">Planning Session</span>
                        </div>
                    </div>
                </div>
                
                <div class="mentors-section">
                    <h2>Mentor Chats</h2>
                    <div class="mentors-list">
                        <div class="mentor-card">
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="Mentor">
                            <div class="mentor-info">
                                <h3>Dr. Anya Sharma</h3>
                                <p>Sure, let's connect later this week to discuss your thesis progress.</p>
                            </div>
                            <span class="mentor-status online">Online</span>
                        </div>
                        
                        <div class="mentor-card">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Mentor">
                            <div class="mentor-info">
                                <h3>Prof. David Lee</h3>
                                <p>I'll review your questions and get back to you by tomorrow morning.</p>
                            </div>
                            <span class="mentor-status away">Away</span>
                        </div>
                    </div>
                </div>
                
                <div class="chat-section">
                    <div class="chat-header">
                        <h3>AI Study Group</h3>
                        <p>4 Members</p>
                        <span class="chat-status active">Active</span>
                    </div>
                    
                    <div class="chat-messages">
                        <div class="message">
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="Alice">
                            <div class="message-content">
                                <span class="sender">Alice</span>
                                <p>Hey everyone, any updates on the AI project?</p>
                                <span class="message-time">10:00 AM</span>
                            </div>
                        </div>
                        
                        <div class="message">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" alt="Bob">
                            <div class="message-content">
                                <span class="sender">Bob</span>
                                <p>I'm focusing on data preprocessing today. Anyone free for a quick call later?</p>
                                <span class="message-time">10:05 AM</span>
                            </div>
                        </div>
                        
                        <div class="message">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="Charlie">
                            <div class="message-content">
                                <span class="sender">Charlie</span>
                                <p>I'll be available after 3 PM. Just finished my daily focus session!</p>
                                <span class="message-time">10:15 AM</span>
                            </div>
                        </div>
                        
                        <div class="message user-message">
                            <div class="message-content">
                                <span class="sender">You</span>
                                <p>Great, Bob! I can join a call after 4 PM. Charlie, nice work!</p>
                                <span class="message-time">10:20 AM</span>
                            </div>
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="You">
                        </div>
                    </div>
                    
                    <div class="chat-input">
                        <input type="text" placeholder="Type your message here...">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                </div>
                
                <div class="focus-times">
                    <h3>Daily Focus Times</h3>
                    <div class="focus-list">
                        <div class="focus-item">
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="Alice">
                            <span class="focus-name">Alice</span>
                            <span class="focus-time">2h 30m</span>
                        </div>
                        <div class="focus-item">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" alt="Bob">
                            <span class="focus-name">Bob</span>
                            <span class="focus-time">1h 45m</span>
                        </div>
                        <div class="focus-item">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="Charlie">
                            <span class="focus-name">Charlie</span>
                            <span class="focus-time">3h 10m</span>
                        </div>
                        <div class="focus-item">
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="You">
                            <span class="focus-name">You</span>
                            <span class="focus-time">1h 0m</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Labs Page
    function loadLabs() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Explore Interactive 3D Labs</h1>
            </div>
            
            <div class="labs-container">
                <div class="featured-labs">
                    <h2>Featured Labs</h2>
                    <div class="featured-grid">
                        <div class="lab-card featured">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop" alt="Chemistry Lab">
                                <span class="ai-tag">AI Suggested</span>
                            </div>
                            <div class="lab-content">
                                <h3>Virtual Chemistry Lab: Acids & Bases</h3>
                                <p>Conduct experiments with various acids and bases, observe reactions, and understand pH changes in a safe virtual environment.</p>
                                <div class="lab-tags">
                                    <span class="tag">Chemistry</span>
                                    <span class="tag">Simulation</span>
                                    <span class="tag">Interactive</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card featured">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop" alt="Physics Lab">
                            </div>
                            <div class="lab-content">
                                <h3>Physics: Electromagnetism Basics</h3>
                                <p>Explore the fundamental principles of electromagnetism, build simple circuits, and visualize magnetic fields with interactive tools.</p>
                                <div class="lab-tags">
                                    <span class="tag">Physics</span>
                                    <span class="tag">Circuits</span>
                                    <span class="tag">Beginner</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card featured">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop" alt="Biology Lab">
                                <span class="ai-tag">AI Suggested</span>
                            </div>
                            <div class="lab-content">
                                <h3>Biology: Cell Structure & Function</h3>
                                <p>Dissect a virtual cell, identify organelles, and understand their functions in a detailed 3D model.</p>
                                <div class="lab-tags">
                                    <span class="tag">Biology</span>
                                    <span class="tag">Anatomy</span>
                                    <span class="tag">3D Model</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="all-labs">
                    <h2>All Labs</h2>
                    <div class="labs-grid">
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop" alt="Genetics Lab">
                            </div>
                            <div class="lab-content">
                                <h3>Molecular Genetics Lab</h3>
                                <p>Simulate DNA extraction, PCR, and gel electrophoresis to understand genetic processes.</p>
                                <div class="lab-tags">
                                    <span class="tag">Biology</span>
                                    <span class="tag">Genetics</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=200&fit=crop" alt="Astronomy Lab">
                                <span class="ai-tag">AI Suggested</span>
                            </div>
                            <div class="lab-content">
                                <h3>Astronomy: Planetary Orbits</h3>
                                <p>Manipulate planetary masses and velocities to observe gravitational effects and orbital mechanics.</p>
                                <div class="lab-tags">
                                    <span class="tag">Astronomy</span>
                                    <span class="tag">Physics</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop" alt="Robotics Lab">
                            </div>
                            <div class="lab-content">
                                <h3>Robotics: Basic Programming</h3>
                                <p>Program a virtual robot arm to perform simple tasks and learn foundational robotics concepts.</p>
                                <div class="lab-tags">
                                    <span class="tag">Engineering</span>
                                    <span class="tag">Programming</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop" alt="Geology Lab">
                                <span class="ai-tag">AI Suggested</span>
                            </div>
                            <div class="lab-content">
                                <h3>Earth Science: Plate Tectonics</h3>
                                <p>Visualize and interact with geological processes like continental drift, earthquakes, and volcanism.</p>
                                <div class="lab-tags">
                                    <span class="tag">Geology</span>
                                    <span class="tag">Simulation</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop" alt="Neuroscience Lab">
                            </div>
                            <div class="lab-content">
                                <h3>Neuroscience: Brain Anatomy</h3>
                                <p>Explore a detailed 3D model of the human brain, identifying different regions and their functions.</p>
                                <div class="lab-tags">
                                    <span class="tag">Neuroscience</span>
                                    <span class="tag">Anatomy</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop" alt="Ecology Lab">
                            </div>
                            <div class="lab-content">
                                <h3>Environmental Science: Ecosystem Dynamics</h3>
                                <p>Simulate population changes, resource depletion, and climate effects on different ecosystems.</p>
                                <div class="lab-tags">
                                    <span class="tag">Ecology</span>
                                    <span class="tag">Environment</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&h=200&fit=crop" alt="Chemistry Lab">
                            </div>
                            <div class="lab-content">
                                <h3>Chemical Reactions Lab</h3>
                                <p>Experiment with various chemical reactions, balancing equations and predicting products.</p>
                                <div class="lab-tags">
                                    <span class="tag">Chemistry</span>
                                    <span class="tag">Reactions</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                        
                        <div class="lab-card">
                            <div class="lab-image">
                                <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop" alt="Optics Lab">
                                <span class="ai-tag">AI Suggested</span>
                            </div>
                            <div class="lab-content">
                                <h3>Optics: Light and Lenses</h3>
                                <p>Investigate light refraction, reflection, and the properties of different lenses and mirrors.</p>
                                <div class="lab-tags">
                                    <span class="tag">Physics</span>
                                    <span class="tag">Light</span>
                                </div>
                                <button class="btn-primary">Launch Lab</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Notes Page
    function loadNotes() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">My Notes & To-Do List</h1>
                <p class="page-subtitle">Keep track of your academic tasks, personal reminders, and study notes all in one organized place.</p>
            </div>
            
            <div class="notes-container">
                <div class="create-note">
                    <h2>Create New Note</h2>
                    <div class="note-form">
                        <input type="text" placeholder="Note title..." class="note-title-input">
                        <textarea placeholder="Write your note here..." class="note-content-input"></textarea>
                        <div class="note-actions">
                            <select class="priority-select">
                                <option>Select Priority</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                            <button class="btn-primary">Add Note</button>
                        </div>
                    </div>
                </div>
                
                <div class="notes-tabs">
                    <button class="tab-btn active">All</button>
                    <button class="tab-btn">To-Dos</button>
                    <button class="tab-btn">Notes</button>
                    <button class="tab-btn">Completed</button>
                </div>
                
                <div class="todos-section">
                    <div class="section-header">
                        <i class="fas fa-tasks"></i>
                        <h2>Your Active To-Dos</h2>
                    </div>
                    <p>Manage your academic and personal tasks efficiently.</p>
                    
                    <div class="todos-list">
                        <div class="todo-item">
                            <input type="checkbox" id="todo1">
                            <label for="todo1">Finish calculus homework by Friday.</label>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" id="todo2" checked>
                            <label for="todo2">Read 'The Martian' for book club discussion.</label>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" id="todo3">
                            <label for="todo3">Schedule study group meeting for biology.</label>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" id="todo4">
                            <label for="todo4">Practice Python coding challenges.</label>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" id="todo5" checked>
                            <label for="todo5">Update resume for internship applications.</label>
                        </div>
                    </div>
                </div>
                
                <div class="personal-notes">
                    <div class="section-header">
                        <i class="fas fa-sticky-note"></i>
                        <h2>Your Personal Notes</h2>
                    </div>
                    <p>Jot down important ideas, summaries, or reminders.</p>
                    
                    <div class="notes-grid">
                        <div class="note-card">
                            <div class="note-header">
                                <h3>React Hooks Study</h3>
                                <span class="priority-tag high">High Priority</span>
                            </div>
                            <p class="note-date">2024-01-15</p>
                            <p class="note-content">useState, useEffect, useContext for state and side effects. Important for component lifecycle management.</p>
                        </div>
                        
                        <div class="note-card">
                            <div class="note-header">
                                <h3>JavaScript ES6+</h3>
                                <span class="priority-tag medium">Medium Priority</span>
                            </div>
                            <p class="note-date">2024-01-14</p>
                            <p class="note-content">Arrow functions, destructuring, async/await, template literals. Modern JavaScript features.</p>
                        </div>
                        
                        <div class="note-card">
                            <div class="note-header">
                                <h3>CSS Grid Layout</h3>
                                <span class="priority-tag low">Low Priority</span>
                            </div>
                            <p class="note-date">2024-01-13</p>
                            <p class="note-content">grid-template-columns, justify-items, align-items, grid-gap. Two-dimensional layout system.</p>
                        </div>
                        
                        <div class="note-card">
                            <div class="note-header">
                                <h3>Advanced Algorithms Research</h3>
                                <span class="priority-tag high">High Priority</span>
                            </div>
                            <p class="note-date">2024-01-12</p>
                            <p class="note-content">Dynamic programming and greedy algorithms. Focus on optimization problems and time complexity.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Portfolio Page (read-only showcase)
    function loadPortfolio() {
        const profile = getStoredProfile();
        const name = profile.name || 'Student';
        const achievements = profile.achievements || ['Top 5 in Weekly Leaderboard', 'Completed 12 Courses', 'Won AI Hackathon (Campus)'];
        const contests = profile.contests || ['Coding Sprint #12', 'Math Marathon', 'AI Quiz Bowl'];
        const work = profile.work || 'Intern, NextHorizon Labs — Built a quiz generator using NLP.';

        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">${name}'s Portfolio</h1>
                <p class="page-subtitle">Achievements, progress, contests, and experience</p>
            </div>

            <div class="profile-form-container">
                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-trophy" style="color:#10B981;"></i>
                        <h3>Achievements</h3>
                    </div>
                    <ul>
                        ${achievements.map(a=>`<li>${a}</li>`).join('')}
                    </ul>
                </div>

                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-chart-line" style="color:#5680E9;"></i>
                        <h3>Day-to-day Progress</h3>
                    </div>
                    <div id="portfolioLineChart" style="height:180px"></div>
                </div>

                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-medal" style="color:#F59E0B;"></i>
                        <h3>Contest Participations</h3>
                    </div>
                    <ul>
                        ${contests.map(c=>`<li>${c}</li>`).join('')}
                    </ul>
                </div>

                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-briefcase" style="color:#8B5CF6;"></i>
                        <h3>Work Experience</h3>
                    </div>
                    <p>${work}</p>
                </div>
            </div>
        `;

        const data = profile.progress || [3,5,4,7,6,8,9,7,8,10,9,11];
        const root = document.getElementById('portfolioLineChart');
        const w = root.clientWidth || 700, h = 180, pad = 24;
        const max = Math.max(...data) || 1;
        const dx = (w - pad*2) / (data.length - 1);
        const points = data.map((v,i)=>{
            const x = pad + i*dx; const y = h - pad - (v/max)*(h - pad*2);
            return `${x},${y}`;
        }).join(' ');
        root.innerHTML = `
            <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">
                <polyline fill="none" stroke="#5680E9" stroke-width="3" points="${points}" />
                ${data.map((v,i)=>{
                    const x = pad + i*dx; const y = h - pad - (v/max)*(h - pad*2);
                    return `<circle cx="${x}" cy="${y}" r="3" fill="#8860D0" />`;
                }).join('')}
            </svg>`;
    }
    
    // Overview Page
    function loadOverview() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Overview</h1>
            </div>
            
            <div class="overview-container">
                <div class="overview-grid">
                    <div class="overview-card">
                        <div class="card-header">
                            <i class="fas fa-fire"></i>
                            <h3>Highest Streak</h3>
                        </div>
                        <div class="streak-display">
                            <div class="streak-number">12</div>
                            <div class="streak-label">Days</div>
                        </div>
                        <p class="streak-date">Achieved on March 15, 2024</p>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-header">
                            <i class="fas fa-bolt"></i>
                            <h3>Current Streak</h3>
                        </div>
                        <div class="streak-display">
                            <div class="streak-number">5</div>
                            <div class="streak-label">Days</div>
                        </div>
                        <p class="streak-date">Started on March 20, 2024</p>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-header">
                            <i class="fas fa-medal"></i>
                            <h3>Total Badges</h3>
                        </div>
                        <div class="badges-display">
                            <div class="badge-count">23</div>
                            <div class="badge-grid">
                                <div class="badge-item gold">🏆</div>
                                <div class="badge-item silver">🥈</div>
                                <div class="badge-item bronze">🥉</div>
                                <div class="badge-item special">⭐</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="overview-card leaderboard">
                        <div class="card-header">
                            <i class="fas fa-trophy"></i>
                            <h3>Leaderboard</h3>
                        </div>
                        <div class="leaderboard-list">
                            <div class="leaderboard-item">
                                <div class="rank">1</div>
                                <div class="player-info">
                                    <div class="player-name">Alex Johnson</div>
                                    <div class="player-score">2,450 XP</div>
                                </div>
                            </div>
                            <div class="leaderboard-item">
                                <div class="rank">2</div>
                                <div class="player-info">
                                    <div class="player-name">Emma Wilson</div>
                                    <div class="player-score">2,100 XP</div>
                                </div>
                            </div>
                            <div class="leaderboard-item current">
                                <div class="rank">3</div>
                                <div class="player-info">
                                    <div class="player-name">You</div>
                                    <div class="player-score">1,980 XP</div>
                                </div>
                            </div>
                            <div class="leaderboard-item">
                                <div class="rank">4</div>
                                <div class="player-info">
                                    <div class="player-name">Sarah Davis</div>
                                    <div class="player-score">1,750 XP</div>
                                </div>
                            </div>
                            <div class="leaderboard-item">
                                <div class="rank">5</div>
                                <div class="player-info">
                                    <div class="player-name">David Kim</div>
                                    <div class="player-score">1,650 XP</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="overview-card heatmap-card">
                        <div class="card-header">
                            <i class="fas fa-fire"></i>
                            <h3>Focus Heat Map</h3>
                        </div>
                        <div id="focusHeatmap" class="heatmap-grid"></div>
                        <div style="margin-top:8px; color:#64748b; font-size:0.9rem;">Last 6 months</div>
                    </div>
                </div>
            </div>
        `;
        const weeks = 26, days = 7;
        const container = document.getElementById('focusHeatmap');
        if (container) {
            const total = weeks * days;
            // Derive pseudo data from localStorage focus minutes if available
            const stored = parseInt(localStorage.getItem('focusMinutesToday')||'45', 10);
            for (let i = 0; i < total; i++) {
                const rand = Math.random();
                const intensity = (rand * 0.6) + (stored/120)*0.4; // blend in stored focus
                const alpha = Math.min(0.85, 0.15 + intensity*0.6);
                const cell = document.createElement('div');
                cell.style.width = '12px';
                cell.style.height = '12px';
                cell.style.borderRadius = '3px';
                cell.style.background = `rgba(16, 185, 129, ${alpha})`;
                container.appendChild(cell);
            }
        }
    }
    
    // Other sidebar pages (placeholder functions)
    function loadStreaks() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Streaks</h1>
            </div>
            <div class="card">
                <h3>Your Learning Streaks</h3>
                <p>Track your daily learning progress and maintain your streak!</p>
            </div>
        `;
    }
    
    function loadBadges() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Badges</h1>
            </div>
            <div class="card">
                <h3>Your Achievements</h3>
                <p>View all your earned badges and achievements!</p>
            </div>
        `;
    }
    
    function loadSyllabus() {
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Syllabus Progress</h1>
            </div>
            <div class="card">
                <h3>Course Progress</h3>
                <p>Track your progress through different courses and subjects!</p>
            </div>
        `;
    }
    
    function loadSettings() {
        const p = getStoredProfile();
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Student Learning Profile</h1>
                <p class="page-subtitle">Edit your preferences and save</p>
            </div>
            <form class="profile-form-container" id="settingsForm">
                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-user" style="color: #8B5CF6;"></i>
                        <h3>Profile</h3>
                    </div>
                    <div class="form-group">
                        <label>Name</label>
                        <input name="name" value="${p.name||''}" type="text" placeholder="Enter your name" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Age</label>
                        <input name="age" value="${p.age||''}" type="text" placeholder="Enter your age" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Grade</label>
                        <input name="grade" value="${p.grade||''}" type="text" placeholder="Enter your grade" class="form-input">
                    </div>
                </div>

                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-brain" style="color: #8B5CF6;"></i>
                        <h3>Learning Style</h3>
                    </div>
                    <div class="radio-group">
                        ${['visual','auditory','reading-writing','kinesthetic'].map(v=>`
                        <label class=\"radio-label\">
                            <input ${p.learningStyle===v?'checked':''} type=\"radio\" name=\"learningStyle\" value=\"${v}\">
                            <span class=\"radio-custom\"></span>
                            ${v.replace('-', ' ')}
                        </label>`).join('')}
                    </div>
                </div>

                <div class="form-section">
                    <h3>Pace</h3>
                    <div class="radio-group">
                        ${['fast','moderate','slow'].map(v=>`
                        <label class=\"radio-label\">
                            <input ${p.pace===v?'checked':''} type=\"radio\" name=\"pace\" value=\"${v}\">
                            <span class=\"radio-custom\"></span>
                            ${v}
                        </label>`).join('')}
                    </div>
                </div>

                <div class="form-section">
                    <h3>Focus time</h3>
                    <div class="radio-group">
                        ${['short','medium','long'].map(v=>`
                        <label class=\"radio-label\">
                            <input ${p.focusTime===v?'checked':''} type=\"radio\" name=\"focusTime\" value=\"${v}\">
                            <span class=\"radio-custom\"></span>
                            ${v}
                        </label>`).join('')}
                    </div>
                </div>

                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-clock" style="color: #8B5CF6;"></i>
                        <h3>Learning Habits</h3>
                    </div>
                    <p>Best time to learn:</p>
                    <div class="radio-group">
                        ${['morning','30-60-mins','evening'].map(v=>`
                        <label class=\"radio-label\">
                            <input ${p.learningTime===v?'checked':''} type=\"radio\" name=\"learningTime\" value=\"${v}\">
                            <span class=\"radio-custom\"></span>
                            ${v}
                        </label>`).join('')}
                    </div>
                </div>

                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-briefcase" style="color:#8B5CF6;"></i>
                        <h3>Portfolio Extras</h3>
                    </div>
                    <div class="form-group">
                        <label>Achievements (comma separated)</label>
                        <input name="achievements" value="${(p.achievements||[]).join(', ')}" class="form-input" type="text" placeholder="e.g., Won Hackathon, 12 Badges">
                    </div>
                    <div class="form-group">
                        <label>Contest Participations (comma separated)</label>
                        <input name="contests" value="${(p.contests||[]).join(', ')}" class="form-input" type="text" placeholder="e.g., Coding Sprint, AI Quiz">
                    </div>
                    <div class="form-group">
                        <label>Work Experience</label>
                        <input name="work" value="${p.work||''}" class="form-input" type="text" placeholder="e.g., Intern at ...">
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn-primary submit-btn" type="submit">Save</button>
                </div>
            </form>
        `;

        const form = document.getElementById('settingsForm');
        form.addEventListener('submit', (e)=>{
            e.preventDefault();
            const fd = new FormData(form);
            const profile = {
                name: fd.get('name')||'',
                age: fd.get('age')||'',
                grade: fd.get('grade')||'',
                learningStyle: fd.get('learningStyle')||'',
                pace: fd.get('pace')||'',
                focusTime: fd.get('focusTime')||'',
                learningTime: fd.get('learningTime')||'',
                achievements: (fd.get('achievements')||'').split(',').map(s=>s.trim()).filter(Boolean),
                contests: (fd.get('contests')||'').split(',').map(s=>s.trim()).filter(Boolean),
                work: fd.get('work')||'',
            };
            saveStoredProfile(profile);
            alert('Saved!');
        });
    }

    // Non-editable profile view
    function loadProfileView() {
        const p = getStoredProfile();
        contentArea.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Profile</h1>
            </div>
            <div class="profile-form-container">
                <div class="form-section">
                    <div class="section-header">
                        <i class="fas fa-user"></i>
                        <h3>${p.name||'Student'} — ${p.grade||''}</h3>
                    </div>
                    <p>Age: ${p.age||'-'}</p>
                    <p>Learning Style: ${p.learningStyle||'-'}</p>
                    <p>Pace: ${p.pace||'-'} | Focus time: ${p.focusTime||'-'}</p>
                    <p>Best time: ${p.learningTime||'-'}</p>
                </div>
            </div>
        `;
    }
    
    // Dashboard view
    function showDashboard() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>Welcome back, John!</h1>
                <p>Ready to continue your learning journey?</p>
            </div>
            <div class="header-right">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search courses, topics...">
                </div>
                <div class="notifications">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge">3</span>
                </div>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="stat-info">
                        <h3>12</h3>
                        <p>Courses Completed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>48h</h3>
                        <p>Study Time</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="stat-info">
                        <h3>8</h3>
                        <p>Achievements</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>85%</h3>
                        <p>Progress</p>
                    </div>
                </div>
            </div>

            <div class="content-grid">
                <div class="content-card">
                    <div class="card-header">
                        <h2>Recent Activity</h2>
                        <a href="#" class="view-all">View All</a>
                    </div>
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="activity-content">
                                <h4>Completed JavaScript Basics</h4>
                                <p>2 hours ago</p>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="activity-content">
                                <h4>Quiz: React Fundamentals</h4>
                                <p>Score: 95%</p>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-file"></i>
                            </div>
                            <div class="activity-content">
                                <h4>New document uploaded</h4>
                                <p>Advanced CSS Techniques</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div class="quick-actions">
                        <button class="action-btn" onclick="showNotes()">
                            <i class="fas fa-plus"></i>
                            <span>New Note</span>
                        </button>
                        <button class="action-btn" onclick="showFocus()">
                            <i class="fas fa-video"></i>
                            <span>Start Focus</span>
                        </button>
                        <button class="action-btn" onclick="showQuizzes()">
                            <i class="fas fa-question"></i>
                            <span>Take Quiz</span>
                        </button>
                        <button class="action-btn" onclick="showAIMentor()">
                            <i class="fas fa-comments"></i>
                            <span>Ask AI Mentor</span>
                        </button>
                    </div>
                </div>

                <div class="content-card featured-courses">
                    <div class="card-header">
                        <h2>Featured Courses</h2>
                        <a href="#" class="view-all">View All</a>
                    </div>
                    <div class="courses-grid">
                        <div class="course-card">
                            <div class="course-image">
                                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop" alt="Web Development">
                            </div>
                            <div class="course-content">
                                <h3>Web Development</h3>
                                <p>Master HTML, CSS, and JavaScript</p>
                                <div class="course-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 75%"></div>
                                    </div>
                                    <span>75% Complete</span>
                                </div>
                            </div>
                        </div>
                        <div class="course-card">
                            <div class="course-image">
                                <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop" alt="Data Science">
                            </div>
                            <div class="course-content">
                                <h3>Data Science</h3>
                                <p>Python, Machine Learning, Analytics</p>
                                <div class="course-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 45%"></div>
                                    </div>
                                    <span>45% Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-card ai-mentor">
                    <div class="card-header">
                        <h2>AI Mentor</h2>
                        <div class="status-indicator online">Online</div>
                    </div>
                    <div class="chat-container">
                        <div class="chat-messages">
                            <div class="message ai-message">
                                <div class="message-avatar">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <div class="message-content">
                                    <p>Hi! I'm here to help you with your studies. What would you like to learn today?</p>
                                </div>
                            </div>
                        </div>
                        <div class="chat-input">
                            <input type="text" placeholder="Ask me anything...">
                            <button><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Re-attach event listeners
        attachEventListeners();
    }
    
    // Documents view
    function showDocuments() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>Documents</h1>
                <p>Manage your learning materials and resources</p>
            </div>
            <div class="header-right">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search documents...">
                </div>
                <button class="btn-primary">
                    <i class="fas fa-upload"></i>
                    Upload Document
                </button>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="documents-grid">
                <div class="document-card">
                    <div class="document-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="document-info">
                        <h3>JavaScript Fundamentals</h3>
                        <p>PDF • 2.4 MB • 2 days ago</p>
                    </div>
                    <div class="document-actions">
                        <button class="btn-icon"><i class="fas fa-download"></i></button>
                        <button class="btn-icon"><i class="fas fa-share"></i></button>
                        <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                    </div>
                </div>
                
                <div class="document-card">
                    <div class="document-icon">
                        <i class="fas fa-file-word"></i>
                    </div>
                    <div class="document-info">
                        <h3>React Best Practices</h3>
                        <p>DOCX • 1.8 MB • 1 week ago</p>
                    </div>
                    <div class="document-actions">
                        <button class="btn-icon"><i class="fas fa-download"></i></button>
                        <button class="btn-icon"><i class="fas fa-share"></i></button>
                        <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                    </div>
                </div>
                
                <div class="document-card">
                    <div class="document-icon">
                        <i class="fas fa-file-powerpoint"></i>
                    </div>
                    <div class="document-info">
                        <h3>CSS Grid Layout</h3>
                        <p>PPTX • 3.2 MB • 2 weeks ago</p>
                    </div>
                    <div class="document-actions">
                        <button class="btn-icon"><i class="fas fa-download"></i></button>
                        <button class="btn-icon"><i class="fas fa-share"></i></button>
                        <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // AI Mentor view
    function showAIMentor() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>AI Mentor</h1>
                <p>Get personalized help and guidance</p>
            </div>
            <div class="header-right">
                <div class="status-indicator online">Online</div>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="ai-mentor-container">
                <div class="chat-interface">
                    <div class="chat-messages" id="chatMessages">
                        <div class="message ai-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <p>Hello! I'm your AI mentor. I can help you with:</p>
                                <ul>
                                    <li>Explaining complex concepts</li>
                                    <li>Providing study tips</li>
                                    <li>Answering questions</li>
                                    <li>Creating study plans</li>
                                </ul>
                                <p>What would you like to learn about today?</p>
                            </div>
                        </div>
                    </div>
                    <div class="chat-input">
                        <input type="text" id="chatInput" placeholder="Ask me anything...">
                        <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
                
                <div class="mentor-suggestions">
                    <h3>Quick Questions</h3>
                    <div class="suggestion-buttons">
                        <button class="suggestion-btn" onclick="askQuestion('Explain JavaScript closures')">Explain JavaScript closures</button>
                        <button class="suggestion-btn" onclick="askQuestion('How do I optimize React performance?')">How do I optimize React performance?</button>
                        <button class="suggestion-btn" onclick="askQuestion('What is CSS Grid?')">What is CSS Grid?</button>
                        <button class="suggestion-btn" onclick="askQuestion('Create a study plan for web development')">Create a study plan for web development</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Quizzes view
    function showQuizzes() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>Quizzes</h1>
                <p>Test your knowledge and track progress</p>
            </div>
            <div class="header-right">
                <button class="btn-primary">
                    <i class="fas fa-plus"></i>
                    Create Quiz
                </button>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="quizzes-grid">
                <div class="quiz-card">
                    <div class="quiz-header">
                        <h3>JavaScript Fundamentals</h3>
                        <span class="quiz-difficulty easy">Easy</span>
                    </div>
                    <p>Test your basic JavaScript knowledge</p>
                    <div class="quiz-stats">
                        <span><i class="fas fa-question"></i> 15 Questions</span>
                        <span><i class="fas fa-clock"></i> 20 Minutes</span>
                        <span><i class="fas fa-users"></i> 1,234 Attempts</span>
                    </div>
                    <div class="quiz-actions">
                        <button class="btn-primary">Start Quiz</button>
                        <button class="btn-secondary">Preview</button>
                    </div>
                </div>
                
                <div class="quiz-card">
                    <div class="quiz-header">
                        <h3>React Hooks</h3>
                        <span class="quiz-difficulty medium">Medium</span>
                    </div>
                    <p>Advanced React concepts and hooks</p>
                    <div class="quiz-stats">
                        <span><i class="fas fa-question"></i> 20 Questions</span>
                        <span><i class="fas fa-clock"></i> 30 Minutes</span>
                        <span><i class="fas fa-users"></i> 856 Attempts</span>
                    </div>
                    <div class="quiz-actions">
                        <button class="btn-primary">Start Quiz</button>
                        <button class="btn-secondary">Preview</button>
                    </div>
                </div>
                
                <div class="quiz-card">
                    <div class="quiz-header">
                        <h3>CSS Grid Mastery</h3>
                        <span class="quiz-difficulty hard">Hard</span>
                    </div>
                    <p>Complex CSS Grid layouts and techniques</p>
                    <div class="quiz-stats">
                        <span><i class="fas fa-question"></i> 25 Questions</span>
                        <span><i class="fas fa-clock"></i> 45 Minutes</span>
                        <span><i class="fas fa-users"></i> 432 Attempts</span>
                    </div>
                    <div class="quiz-actions">
                        <button class="btn-primary">Start Quiz</button>
                        <button class="btn-secondary">Preview</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Focus view
    function showFocus() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>Focus Mode</h1>
                <p>Stay focused and productive</p>
            </div>
            <div class="header-right">
                <div class="focus-timer">
                    <span id="timer">25:00</span>
                </div>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="focus-container">
                <div class="pomodoro-timer">
                    <div class="timer-circle">
                        <div class="timer-progress" id="timerProgress"></div>
                        <div class="timer-content">
                            <span id="timerDisplay">25:00</span>
                            <p id="timerLabel">Focus Time</p>
                        </div>
                    </div>
                    <div class="timer-controls">
                        <button class="timer-btn" id="startBtn">Start</button>
                        <button class="timer-btn" id="pauseBtn">Pause</button>
                        <button class="timer-btn" id="resetBtn">Reset</button>
                    </div>
                </div>
                
                <div class="focus-settings">
                    <h3>Focus Settings</h3>
                    <div class="setting-group">
                        <label>Focus Duration (minutes)</label>
                        <input type="number" id="focusDuration" value="25" min="5" max="60">
                    </div>
                    <div class="setting-group">
                        <label>Break Duration (minutes)</label>
                        <input type="number" id="breakDuration" value="5" min="1" max="30">
                    </div>
                    <div class="setting-group">
                        <label>Long Break Duration (minutes)</label>
                        <input type="number" id="longBreakDuration" value="15" min="5" max="60">
                    </div>
                </div>
            </div>
        `;
        
        // Initialize Pomodoro timer
        initializePomodoroTimer();
    }
    
    // Labs view
    function showLabs() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>Labs</h1>
                <p>Hands-on coding practice and projects</p>
            </div>
            <div class="header-right">
                <button class="btn-primary">
                    <i class="fas fa-plus"></i>
                    New Lab
                </button>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="labs-grid">
                <div class="lab-card">
                    <div class="lab-header">
                        <h3>JavaScript Calculator</h3>
                        <span class="lab-status completed">Completed</span>
                    </div>
                    <p>Build a fully functional calculator using vanilla JavaScript</p>
                    <div class="lab-tech">
                        <span class="tech-tag">JavaScript</span>
                        <span class="tech-tag">HTML</span>
                        <span class="tech-tag">CSS</span>
                    </div>
                    <div class="lab-actions">
                        <button class="btn-primary">View Code</button>
                        <button class="btn-secondary">Edit</button>
                    </div>
                </div>
                
                <div class="lab-card">
                    <div class="lab-header">
                        <h3>React Todo App</h3>
                        <span class="lab-status in-progress">In Progress</span>
                    </div>
                    <p>Create a todo application with React hooks and state management</p>
                    <div class="lab-tech">
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">Hooks</span>
                        <span class="tech-tag">State</span>
                    </div>
                    <div class="lab-actions">
                        <button class="btn-primary">Continue</button>
                        <button class="btn-secondary">Reset</button>
                    </div>
                </div>
                
                <div class="lab-card">
                    <div class="lab-header">
                        <h3>CSS Grid Layout</h3>
                        <span class="lab-status not-started">Not Started</span>
                    </div>
                    <p>Design responsive layouts using CSS Grid</p>
                    <div class="lab-tech">
                        <span class="tech-tag">CSS</span>
                        <span class="tech-tag">Grid</span>
                        <span class="tech-tag">Responsive</span>
                    </div>
                    <div class="lab-actions">
                        <button class="btn-primary">Start Lab</button>
                        <button class="btn-secondary">Preview</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Social view
    function showSocial() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>Social Learning</h1>
                <p>Connect with other learners and share knowledge</p>
            </div>
            <div class="header-right">
                <button class="btn-primary">
                    <i class="fas fa-plus"></i>
                    New Post
                </button>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="social-feed">
                <div class="post-card">
                    <div class="post-header">
                        <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="User" class="post-avatar">
                        <div class="post-user">
                            <h4>Sarah Johnson</h4>
                            <p>2 hours ago</p>
                        </div>
                    </div>
                    <div class="post-content">
                        <p>Just completed the React Hooks course! The useState and useEffect hooks are game-changers. Anyone else working on React projects?</p>
                        <div class="post-image">
                            <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop" alt="React Code">
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="post-action"><i class="fas fa-heart"></i> 24</button>
                        <button class="post-action"><i class="fas fa-comment"></i> 8</button>
                        <button class="post-action"><i class="fas fa-share"></i> Share</button>
                    </div>
                </div>
                
                <div class="post-card">
                    <div class="post-header">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="User" class="post-avatar">
                        <div class="post-user">
                            <h4>Mike Chen</h4>
                            <p>5 hours ago</p>
                        </div>
                    </div>
                    <div class="post-content">
                        <p>CSS Grid vs Flexbox - when to use which? Here's my cheat sheet:</p>
                        <div class="post-code">
                            <pre><code>/* CSS Grid for 2D layouts */
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Flexbox for 1D layouts */
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}</code></pre>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="post-action"><i class="fas fa-heart"></i> 42</button>
                        <button class="post-action"><i class="fas fa-comment"></i> 15</button>
                        <button class="post-action"><i class="fas fa-share"></i> Share</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Notes view
    function showNotes() {
        const header = document.querySelector('.header');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        header.innerHTML = `
            <div class="header-left">
                <h1>Notes</h1>
                <p>Capture your thoughts and learning insights</p>
            </div>
            <div class="header-right">
                <button class="btn-primary" onclick="createNewNote()">
                    <i class="fas fa-plus"></i>
                    New Note
                </button>
            </div>
        `;
        
        dashboardContent.innerHTML = `
            <div class="notes-container">
                <div class="notes-sidebar">
                    <div class="notes-search">
                        <input type="text" placeholder="Search notes...">
                    </div>
                    <div class="notes-list">
                        <div class="note-item active">
                            <h4>JavaScript Closures</h4>
                            <p>Understanding how closures work in JavaScript...</p>
                            <span class="note-date">Today</span>
                        </div>
                        <div class="note-item">
                            <h4>React State Management</h4>
                            <p>Best practices for managing state in React...</p>
                            <span class="note-date">Yesterday</span>
                        </div>
                        <div class="note-item">
                            <h4>CSS Grid Layout</h4>
                            <p>Complete guide to CSS Grid properties...</p>
                            <span class="note-date">2 days ago</span>
                        </div>
                    </div>
                </div>
                
                <div class="notes-editor">
                    <div class="editor-toolbar">
                        <button class="toolbar-btn"><i class="fas fa-bold"></i></button>
                        <button class="toolbar-btn"><i class="fas fa-italic"></i></button>
                        <button class="toolbar-btn"><i class="fas fa-underline"></i></button>
                        <button class="toolbar-btn"><i class="fas fa-list-ul"></i></button>
                        <button class="toolbar-btn"><i class="fas fa-list-ol"></i></button>
                    </div>
                    <div class="editor-content">
                        <input type="text" placeholder="Note title..." class="note-title">
                        <textarea placeholder="Start writing your note..." class="note-body"></textarea>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Attach event listeners
    function attachEventListeners() {
        // Search functionality
        const searchInputs = document.querySelectorAll('.search-box input');
        searchInputs.forEach(input => {
            input.addEventListener('input', function() {
                // Implement search functionality
                console.log('Searching for:', this.value);
            });
        });
        
        // Notification click
        const notifications = document.querySelectorAll('.notifications');
        notifications.forEach(notification => {
            notification.addEventListener('click', function() {
                alert('You have 3 new notifications!');
            });
        });
        
        // Action buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.querySelector('span').textContent;
                alert(`Action: ${action}`);
            });
        });
    }
    
    // Initialize the dashboard
    showDashboard();
});

// Global functions for specific features
function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    
    if (input.value.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <p>${input.value}</p>
            </div>
        `;
        
        messages.appendChild(messageDiv);
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const aiResponse = document.createElement('div');
            aiResponse.className = 'message ai-message';
            aiResponse.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>That's a great question! Let me help you understand that concept better.</p>
                </div>
            `;
            messages.appendChild(aiResponse);
            messages.scrollTop = messages.scrollHeight;
        }, 1000);
        
        messages.scrollTop = messages.scrollHeight;
    }
}

function askQuestion(question) {
    const input = document.getElementById('chatInput');
    input.value = question;
    sendMessage();
}

function createNewNote() {
    alert('Creating a new note...');
}

// Pomodoro Timer functionality
let pomodoroTimer;
let isRunning = false;
let currentTime = 25 * 60; // 25 minutes in seconds
let isBreak = false;

function initializePomodoroTimer() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerLabel = document.getElementById('timerLabel');
    const timerProgress = document.getElementById('timerProgress');
    
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
        pauseBtn.addEventListener('click', pauseTimer);
        resetBtn.addEventListener('click', resetTimer);
        
        updateTimerDisplay();
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        pomodoroTimer = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    isRunning = false;
    clearInterval(pomodoroTimer);
}

function resetTimer() {
    isRunning = false;
    clearInterval(pomodoroTimer);
    currentTime = 25 * 60;
    isBreak = false;
    updateTimerDisplay();
}

function updateTimer() {
    currentTime--;
    updateTimerDisplay();
    
    if (currentTime <= 0) {
        if (isBreak) {
            // Break finished, start focus time
            currentTime = 25 * 60;
            isBreak = false;
            document.getElementById('timerLabel').textContent = 'Focus Time';
        } else {
            // Focus time finished, start break
            currentTime = 5 * 60;
            isBreak = true;
            document.getElementById('timerLabel').textContent = 'Break Time';
        }
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = display;
    }
    
    const timer = document.getElementById('timer');
    if (timer) {
        timer.textContent = display;
    }
    
    // Update progress circle
    const totalTime = isBreak ? 5 * 60 : 25 * 60;
    const progress = ((totalTime - currentTime) / totalTime) * 100;
    const timerProgress = document.getElementById('timerProgress');
    if (timerProgress) {
        timerProgress.style.strokeDashoffset = 440 - (440 * progress) / 100;
    }
}
