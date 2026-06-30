const header = document.querySelector('.header');
const footer = document.querySelector('.footer-content');

// Check authentiction
const current_user = JSON.parse(localStorage.getItem('currentUser'));

// ==========================
//      Header Content
// ==========================
header.innerHTML = (
    `   
        <nav>
            <div class="nav-start">
                <h3 onclick="alert('hello')">Logo</h3>
                <h3 class="burger-menu">☰</h3>
            </div>
            <ul class="nav-end">
                <li><a href="./home.html">Home</a></li>
                <li><a href="./jobs.html">Browse Jobs</a></li>

                <li class="dropdown">
                    <a href="./category.html" class="dropbtn">
                        Job Categories ▾
                    </a>

                    <div class="dropdown-content">
                        <a href="category_detail.html?category_id=1">Technology</a>
                        <a href="category_detail.html?category_id=2">Design & Creative</a>
                        <a href="category_detail.html?category_id=3">Marketing</a>
                        <a href="category_detail.html?category_id=4">Human Resources</a>
                        <a href="category_detail.html?category_id=5">Analytics</a>
                        <hr>
                        <a href="category.html?category_id=6">More ...</a>
                    </div>
                </li>

                <li><a href="./company.html">Companies</a></li>

                <li class="dropdown">
                    <a href="javascript:void(0)" class="dropbtn">Services ▾</a>
                    <div class="dropdown-content">
                        <a href="about.html">About Us</a>
                        <a href="./privacy.html">Privacy & Policy</a>
                    </div>
                </li>

                <li class="dropdown theme-toggle">
                    <a href="#" class="dropbtn">Setting ▾</a>
                    <div class="dropdown-content">
                        <a href="./profile.html">Profile</a>
                        <a onclick="toggleTheme()">Mode 🌓</a>
                        ${current_user ? `<a href="../auth/login.html" id="logoutLink">Logout</a>` : `<a href="../auth/login.html">Login</a>`}
                    </div>
                </li>
            </ul>
        </nav>
    `
);

// ==========================
//      Footer Content
// ==========================
footer.innerHTML = (
    `
        <div class="row">
            <div class="col-1 text-center">
                <img src="../../../Assets/images/qr_code_app.png" alt="qr">
                <p >Scan Now </p>
            </div>
            <div class="col-2 text-center">
                <h3>Loyalty & Membership</h3>
                <ul style="list-style: none;">
                    <li><p>Discount</p></li>
                    <li><p>Subscription</p></li>
                </ul>
            </div>
            <div class="col-3 text-center">
                <h3>Social Media</h3>
                <div class="text-center">
                    <a href="#" class="py-1">
                        <i class="bi bi-facebook px-2">Facebook</i>
                    </a>
                    <a href="#" class="py-1">
                        <i class="bi bi-linkedin px-2">LinkIn</i>
                    </a>
                    
                    <a href="#" class="py-1">
                        <i class="bi bi-tiktok px-2">TikTok</i>
                    </a>
                </div>
                
            </div>
            <div class="col-3">
                <h3>Subscription Letter</h3>
                <div class="py-2 text-center">
                    <form action="#" method="post">
                        <input type="email" name="email" class="form-control" id="email" placeholder="finn@gmail.com" required><br>
                        <button type="submit" class="form-control">Subscription</button>
                    </form>
                </div>
            </div>
            <div class="personal-detail col-2 ">
                <h3>More About Us</h3>
                <h4>Email: </h3>
                <p>Llightboth@gmail.com</p><br>
                <h4>Contact-Us: </h3>
                <p> 012-345-678</p>
            </div>
        </div>
    `
);


// ==========================
//      Burger Menu Content
// ==========================
const burger_menu = document.querySelector('.burger-menu');
const nav_end = document.querySelector('.nav-end');


burger_menu.addEventListener('click', () => {
    nav_end.classList.toggle('active');
});