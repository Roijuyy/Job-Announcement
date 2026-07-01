async function initDefaultAccounts() {
    if (!localStorage.getItem('users')) {
        const all_users = await fetch('../../../Database/users.json');
        const user_res = await all_users.json();
        const user_data = localStorage.setItem('users', JSON.stringify(user_res));
    }
}

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
    initDefaultAccounts();

    // if (localStorage.getItem('currentUser')) {
    //     window.location.href = '../client/home.html';
    //     return;
    // }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            if (!email || !password) {
                showAlert('Please fill in all fields.', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email.toLowerCase() === email);

            if (!user) {
                showAlert('No account found with that email address.', 'error');
                return;
            }

            if (user.password !== password) {
                showAlert('Incorrect password. Please try again.', 'error');
                return;
            }
            
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            showAlert('Login successful! Redirecting...', 'success');

            const submitBtn = loginForm.querySelector('.btn-primary');
            if (submitBtn) submitBtn.disabled = true;

            if (user.is_role === 1) {
                setTimeout(() => {
                    window.location.href = '../employee/dashboard.html';
                }, 1000);
                return;
            }

            setTimeout(() => {
                window.location.href = '../client/index.html';
            }, 1000);
        });
    }
});
