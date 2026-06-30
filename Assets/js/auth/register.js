function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    alertContainer.innerHTML = `
        <div class="alert-box alert-${type}">
            <span>${message}</span>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');

    if (registerForm) {
        registerForm.addEventListener('submit', async(e) => {
            e.preventDefault();

            const fullname = fullnameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const phone = phoneInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const agreeTerms = termsCheckbox.checked;

            if (!fullname || !email || !phone || !password || !confirmPassword) {
                showAlert('Please fill in all fields.', 'error');
                return;
            }

            if (password.length < 8) {
                showAlert('Password must be at least 8 characters long.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match.', 'error');
                return;
            }

            
            

            if (!agreeTerms) {
                showAlert('You must agree to the Terms and Conditions.', 'error');
                return;
            }

            // Load and check JSON database
            let all_users = [];

            const user_res = await fetch("../../../Database/users.json");
            all_users = await user_res.json();

            const userExists = all_users.find(u => u.email === email.toLowerCase());

            if (userExists) {
                showAlert('An account with this email already exists.', 'error');
                return;
            }

            const newUser = {
                fullname,
                email,
                phone,
                password
            };

            // Add user to JSON database and save localstorage
            all_users.push(newUser);
            localStorage.setItem('users', JSON.stringify(all_users));

            showAlert('Account created successfully! Redirecting to login...', 'success');

            const submitBtn = registerForm.querySelector('.btn-primary');
            if (submitBtn) submitBtn.disabled = true;

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
});
