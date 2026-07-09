const header = document.querySelector('.header');
const aside_nav = document.querySelector('.emp-aside-nav');
const footer = document.querySelector('.footer-content');

// ==========================
//  Check User and session
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (!user || user.is_role !== 1) {
            window.location.replace('../auth/login.html');
            return;
        }
    } catch (error) {
        console.error('Auth error:', error);
        window.location.replace('../auth/login.html');
        return;
    }

    // ==========================
    //      Header Content
    // ==========================
    if (header) {
        header.innerHTML = `
            <nav class="top-nav w-full" aria-label="Global Administration Navigation">
                <div class="nav-start flex-between w-full">
                    <div class="nav-brand">
                        <i class="bi bi-briefcase-fill px-2" style="color: var(--brand-primary);" aria-hidden="true"></i>
                        <span>Job Palace</span>
                    </div>
                    <button class="burger-menu" id="burgerToggle" aria-expanded="false" aria-controls="navMenu emp-aside-nav" aria-label="Toggle navigation menu" 
                        style="background: transparent; border: none; color: inherit; font-size: 1.75rem; cursor: pointer;">☰</button>   
                </div> 
                
                <div class="nav-end" id="navMenu">
                    <ul id="emp-side-navigation" class="list-unstyled" style="margin: 0; padding: 0; align-items: center;">
                        <li>
                            <a href="../employee/profile.html" aria-label="View user profile documentation" style="background-color: transparent; display: flex;">
                                <i class="bi bi-person-circle px-2" aria-hidden="true"></i> Profile
                            </a>
                        </li>
                        <li>
                            <button class="btn-theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme mode" style="background: transparent; border: none; color: inherit; cursor: pointer; display: flex; align-items: center; font-size: inherit;">
                                <i class="bi bi-moon-stars px-2" aria-hidden="true"></i> Mode
                            </button>
                        </li>
                        <li class="px-2">
                            <a href="../auth/login.html" id="logoutLink" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; border: 2px solid #dc2626; border-radius: 12px; color: #e3aa26; text-decoration: none; font-weight: 500; transition: all 0.2s ease;">
                                <i class="bi bi-box-arrow-right"></i>
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
    }

    // ==========================
    //      Aside Navigation Content
    // ==========================
    if (aside_nav) {
        aside_nav.innerHTML = `
            <nav class="side-nav">
                <div class="sidebar-header" id="nav-header-mgmt">Job-Announcement</div>
                <ul class="aside-menu-list list-unstyled">
                    <li>
                        <a href="./dashboard.html" class="active" aria-current="page">
                            <i class="bi bi-speedometer2 px-2" aria-hidden="true"></i> Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="./employee.html">
                            <i class="bi bi-people px-2" aria-hidden="true"></i> Employees
                        </a>
                    </li>
                    <li>
                        <a href="./customer.html">
                            <i class="bi bi-building px-2" aria-hidden="true"></i> Company
                        </a>
                    </li>
                    <li>
                        <a href="./cv.html">
                            <i class="bi bi-file-earmark-text px-2" aria-hidden="true"></i> CVs
                        </a>
                    </li>
                    <li>
                        <a href="./jobs.html">
                            <i class="bi bi-list-task px-2" aria-hidden="true"></i> View Listings
                        </a>
                    </li>
                    <hr>
                    <li class="mobile-only">
                        <a href="../employee/profile.html" aria-label="View user profile documentation" style="background-color: transparent;">
                            <i class="bi bi-person-circle px-2" aria-hidden="true"></i> Profile
                        </a>
                    </li>
                    <li class="mobile-only">
                        <a href="#" class="btn-theme-toggle" onclick="toggleTheme()">
                            <i class="bi bi-moon-stars px-2" aria-hidden="true"></i> Mode
                        </a>
                    </li>
                    <li>
                    <a href="../client/index.html">
                    <i class="bi bi-briefcase px-2" aria-hidden="true"></i> Job-Announce
                    </a>
                    </li>
                    <li class="mobile-only">
                        <hr>
                        <a href="../auth/login.html" id="logoutLink" style="color: #e3aa26;">
                            <i class="bi bi-box-arrow-right px-2"></i>Logout
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    }

    // ==========================
    //      Add Logout Content
    // ==========================

    const logoutLinks = document.querySelectorAll('[id="logoutLink"]');

    logoutLinks.forEach(link => {
        link.addEventListener('click', () => {
            try {
                localStorage.clear(); 
            } catch (error) {
                localStorage.removeItem('currentUser');
                console.error('error clearing storage: ', error);
            }
        });
    });

    // ==========================
    //      Burger Menu Content
    // ==========================
    const burgerToggle = document.getElementById('burgerToggle');
    const navMenu = document.getElementById('navMenu');

    if (burgerToggle && navMenu && aside_nav) {
        burgerToggle.addEventListener('click', () => {
            // Toggles top utility items wrapper
            const isNavActive = navMenu.classList.toggle('active');
            
            // Toggles the Sidebar display layout wrapper
            const isAsideActive = aside_nav.classList.toggle('aside-active');
            
            burgerToggle.setAttribute('aria-expanded', isNavActive || isAsideActive);
        });
    }

    // ==========================
    //      Footer Menu Content
    // ==========================
    if (footer) {
        footer.innerHTML = `
            <p style="margin: 0;">&copy; 2026 Employer Management Portal. All application structures validated securely.</p>
        `;
    }
});