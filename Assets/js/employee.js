// Employee Directory logic - fetches users and renders search/filter tables
let allEmployees = [];
let filteredEmployees = [];
let currentPage = 1;
const entriesPerPage = 5;
let selectedUserId = null; // Track selected user for modal actions

// Initialize employee data
const initEmployees = async () => {
    try {
        // Fetch users from database JSON directly to ensure it works with JSON edits
        const response = await fetch('../../../Database/users.json');
        const jsonUsers = await response.json();
        
        let localUsers = JSON.parse(localStorage.getItem('users')) || [];
        
        // Merge jsonUsers with localUsers (registered ones)
        const mergedUsers = [...jsonUsers];
        localUsers.forEach(localUser => {
            if (!mergedUsers.some(u => u.email.toLowerCase() === localUser.email.toLowerCase())) {
                mergedUsers.push(localUser);
            }
        });
        
        // Synchronize merged register back to localStorage for login/auth
        localStorage.setItem('users', JSON.stringify(mergedUsers));

        // Read status overrides from LocalStorage
        const statusOverrides = JSON.parse(localStorage.getItem('user_statuses')) || {};
        
        // Map status overrides and default to active
        allEmployees = mergedUsers.map(user => ({
            ...user,
            status: statusOverrides[user.email] || user.status || 'active'
        }));

        filteredEmployees = [...allEmployees];
        renderEmployeeTable();
        setupEventListeners();
    } catch (error) {
        console.error("Failed to load employee roster profiles:", error);
        document.getElementById('employeeTableBody').innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    <i class="bi bi-exclamation-triangle" style="font-size: 1.5rem; color: var(--accent-warning);"></i>
                    <p class="mt-1">Failed to fetch database information. Check console error registers.</p>
                </td>
            </tr>
        `;
    }
};

// Render Table entries
const renderEmployeeTable = () => {
    const tableBody = document.getElementById('employeeTableBody');
    tableBody.innerHTML = '';

    if (filteredEmployees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">No matching candidate profile found.</td>
            </tr>
        `;
        document.getElementById('employeeTotalStats').textContent = `Showing 0 employees`;
        document.getElementById('employeePaginationStats').textContent = `Showing 0 to 0 of 0 entries`;
        document.getElementById('employeePaginationButtons').innerHTML = '';
        return;
    }

    // Pagination calculations
    const totalEntries = filteredEmployees.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const paginatedItems = filteredEmployees.slice(startIndex, endIndex);

    // Update Stats Label
    document.getElementById('employeeTotalStats').textContent = `Showing ${filteredEmployees.length} employee${filteredEmployees.length === 1 ? '' : 's'}`;
    document.getElementById('employeePaginationStats').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;

    paginatedItems.forEach(emp => {
        const initials = emp.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        tableBody.innerHTML += `
            <tr>
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar-placeholder">${initials}</div>
                        <div class="user-info-text">
                            <h4>${emp.fullname}</h4>
                            <p>${emp.email === 'admin@example.com' ? 'Administrator' : 'Standard Member'}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="text-main" style="font-size: 0.9rem; font-weight: 500;">
                        <i class="bi bi-envelope" style="margin-right: 6px; color: var(--text-muted);"></i>${emp.email}
                    </div>
                    <div class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">
                        <i class="bi bi-telephone" style="margin-right: 6px;"></i>${emp.phone}
                    </div>
                </td>
                <td>
                    <span class="status-pill status--${emp.status}">${emp.status}</span>
                </td>
                <td>
                    <button class="btn-action-view" onclick="viewEmployeeDetails('${emp.email}')">
                        <i class="bi bi-eye"></i> View Profile
                    </button>
                </td>
            </tr>
        `;
    });

    renderPaginationControls(totalPages);
};

// Render Pagination Buttons
const renderPaginationControls = (totalPages) => {
    const wrapper = document.getElementById('employeePaginationButtons');
    wrapper.innerHTML = '';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-page';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderEmployeeTable();
        }
    };
    wrapper.appendChild(prevBtn);

    // Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderEmployeeTable();
        };
        wrapper.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-page';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderEmployeeTable();
        }
    };
    wrapper.appendChild(nextBtn);
};

// Setup Search and Filters
const setupEventListeners = () => {
    const searchInput = document.getElementById('employeeSearchInput');
    const statusFilter = document.getElementById('employeeStatusFilter');

    const filterRoster = () => {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusFilter.value;

        filteredEmployees = allEmployees.filter(emp => {
            const matchesQuery = emp.fullname.toLowerCase().includes(query) || 
                                 emp.email.toLowerCase().includes(query) || 
                                 emp.phone.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || emp.status === status;
            return matchesQuery && matchesStatus;
        });

        currentPage = 1; // Reset to page 1 on active filter changes
        renderEmployeeTable();
    };

    searchInput.addEventListener('input', filterRoster);
    statusFilter.addEventListener('change', filterRoster);
};

// Open Detail View Modal
window.viewEmployeeDetails = (email) => {
    const emp = allEmployees.find(u => u.email === email);
    if (!emp) return;

    selectedUserId = email;

    const modalBody = document.getElementById('employeeModalBody');
    const initials = emp.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Toggle button label
    const btnToggle = document.getElementById('btnToggleUserStatus');
    if (emp.status === 'active') {
        btnToggle.textContent = 'Suspend Member';
        btnToggle.style.backgroundColor = '#ef4444';
        btnToggle.style.color = '#ffffff';
        btnToggle.style.border = 'none';
    } else {
        btnToggle.textContent = 'Activate Member';
        btnToggle.style.backgroundColor = 'var(--accent-success)';
        btnToggle.style.color = '#ffffff';
        btnToggle.style.border = 'none';
    }

    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <div class="user-avatar-placeholder" style="width: 70px; height: 70px; font-size: 1.75rem; margin: 0 auto 0.75rem auto;">${initials}</div>
            <h3 class="text-heading" style="margin-bottom: 4px; text-transform: none;">${emp.fullname}</h3>
            <span class="status-pill status--${emp.status}">${emp.status}</span>
        </div>
        
        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div>
                    <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Email Address</label>
                    <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${emp.email}</p>
                </div>
                <div>
                    <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Phone Number</label>
                    <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${emp.phone}</p>
                </div>
                <div>
                    <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Account Role</label>
                    <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${emp.email === 'admin@example.com' ? 'Administrator' : 'Job Seeker'}</p>
                </div>
                <div>
                    <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Account Level</label>
                    <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">Verified Member <i class="bi bi-patch-check-fill" style="color: var(--brand-primary); font-size: 0.9rem;"></i></p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('employeeModalOverlay').classList.add('show');
};

// Close Modal
window.closeEmployeeModal = () => {
    document.getElementById('employeeModalOverlay').classList.remove('show');
    selectedUserId = null;
};

// Toggle user active status in localStorage
window.toggleUserStatusSimulated = () => {
    if (!selectedUserId) return;

    allEmployees = allEmployees.map(emp => {
        if (emp.email === selectedUserId) {
            const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
            
            // Save status overrides to localStorage
            const statusOverrides = JSON.parse(localStorage.getItem('user_statuses')) || {};
            statusOverrides[emp.email] = nextStatus;
            localStorage.setItem('user_statuses', JSON.stringify(statusOverrides));
            
            return { ...emp, status: nextStatus };
        }
        return emp;
    });
    
    // Find filtered item state
    const index = filteredEmployees.findIndex(emp => emp.email === selectedUserId);
    if (index !== -1) {
        filteredEmployees[index].status = filteredEmployees[index].status === 'active' ? 'inactive' : 'active';
    }

    renderEmployeeTable();
    closeEmployeeModal();
};

// Add Candidate Modal Triggers
window.openAddEmployeeModal = () => {
    document.getElementById('addEmployeeModalOverlay').classList.add('show');
};

window.closeAddEmployeeModal = () => {
    document.getElementById('addEmployeeModalOverlay').classList.remove('show');
    document.getElementById('addEmployeeForm').reset();
};

// Add Candidate Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const addEmpForm = document.getElementById('addEmployeeForm');
    if (addEmpForm) {
        addEmpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('addEmpName').value.trim();
            const email = document.getElementById('addEmpEmail').value.trim();
            const phone = document.getElementById('addEmpPhone').value.trim();
            const status = document.getElementById('addEmpStatus').value;

            if (!name || !email || !phone) {
                alert('Please fill out all required fields.');
                return;
            }

            // Check duplicate email
            const emailExists = allEmployees.some(emp => emp.email.toLowerCase() === email.toLowerCase());
            if (emailExists) {
                alert('A candidate with this email address already exists.');
                return;
            }

            const newCandidate = {
                fullname: name,
                email: email,
                phone: phone,
                password: "12345678", // Default placeholder password for new registration
                status: status
            };

            // Read, append and save to localStorage
            const localUsers = JSON.parse(localStorage.getItem('users')) || [];
            localUsers.push(newCandidate);
            localStorage.setItem('users', JSON.stringify(localUsers));

            // Sync status overrides for consistency
            const statusOverrides = JSON.parse(localStorage.getItem('user_statuses')) || {};
            statusOverrides[email] = status;
            localStorage.setItem('user_statuses', JSON.stringify(statusOverrides));

            // Update local memory and refresh
            allEmployees.push(newCandidate);
            filteredEmployees.push(newCandidate);

            renderEmployeeTable();
            closeAddEmployeeModal();
            alert('Candidate profile added successfully.');
        });
    }
});

// Start logic when loaded
document.addEventListener('DOMContentLoaded', initEmployees);
