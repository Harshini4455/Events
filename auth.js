// Authentication Logic for Admin Panel

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const loginContainer = document.getElementById('loginContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    if (token) {
        // In a real app, you would verify the token with the server
        if (loginContainer) loginContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'flex';
        
        // Set admin username
        const adminUsername = localStorage.getItem('adminUsername');
        if (adminUsername && document.getElementById('adminUsername')) {
            document.getElementById('adminUsername').textContent = adminUsername;
        }
    } else {
        if (loginContainer) loginContainer.style.display = 'flex';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
    }
}

// Admin Login
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorElement = document.getElementById('loginError');
            
            // Simple validation
            if (!username || !password) {
                errorElement.textContent = 'Please enter both username and password';
                return;
            }
            
            // In a real app, you would send this to your backend for verification
            // This is just a demo with hardcoded credentials
            if (username === 'admin' && password === 'admin123') {
                // Simulate successful login
                localStorage.setItem('adminToken', 'demo_token');
                localStorage.setItem('adminUsername', username);
                checkAuth();
                
                // Redirect to dashboard if on login page
                if (window.location.pathname.endsWith('admin.html')) {
                    window.location.href = 'admin.html#dashboard';
                }
            } else {
                errorElement.textContent = 'Invalid username or password';
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUsername');
            checkAuth();
            window.location.href = 'admin.html';
        });
    }
    
    // Tab switching in admin panel
    const tabItems = document.querySelectorAll('.sidebar-menu li');
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all tabs
            tabItems.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            item.classList.add('active');
            
            // Get the tab to show
            const tabName = item.getAttribute('data-tab');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            document.getElementById(`${tabName}Tab`).classList.add('active');
            
            // Update page title
            const pageTitle = document.getElementById('adminPageTitle');
            if (pageTitle) {
                pageTitle.textContent = item.textContent.trim();
            }
        });
    });
    
    // Check for hash in URL to set active tab
    if (window.location.hash) {
        const tabName = window.location.hash.substring(1);
        const tabItem = document.querySelector(`.sidebar-menu li[data-tab="${tabName}"]`);
        if (tabItem) {
            tabItem.click();
        }
    }
});

// Protect admin routes
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        checkAuth();
    }
});