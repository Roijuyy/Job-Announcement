// CV Application management logic - handles CV listing, searching, filtering and status modifications
let allApplications = [];
let filteredApplications = [];
let currentPage = 1;
const entriesPerPage = 5;
let selectedApplicationId = null; // Track selected application for modal actions

// Initialize Roster
const initCvManager = () => {
    // Default list of applicants (in case the local register is blank)
    const defaultApps = [
        {
            "id": "app_1",
            "fullname": "John Doe",
            "email": "johndoe@example.com",
            "phone": "+855 77 666 555",
            "jobTitle": "Senior Full-Stack Engineer (C# / React)",
            "companyName": "Nexus Financial Fintech",
            "coverLetter": "I have 6 years of experience building enterprise systems in .NET and React. I am excited to join Nexus Financial.",
            "fileName": "John_Doe_CV.pdf",
            "status": "Interviewing",
            "appliedDate": "2026-06-25"
        },
        {
            "id": "app_2",
            "fullname": "Jane Smith",
            "email": "janesmith@example.com",
            "phone": "+855 99 888 777",
            "jobTitle": "UI/UX Product Designer",
            "companyName": "PixelCraft Studio",
            "coverLetter": "I am passionate about creating clean, minimalistic, and highly intuitive interfaces. Please find my Figma portfolio attached.",
            "fileName": "Jane_Smith_Portfolio.pdf",
            "status": "Pending",
            "appliedDate": "2026-06-27"
        },
        {
            "id": "app_3",
            "fullname": "Alice Johnson",
            "email": "alicej@example.com",
            "phone": "+855 12 345 678",
            "jobTitle": "Digital Marketing Specialist",
            "companyName": "GrowthSpark Media",
            "coverLetter": "I specialize in scaling startup traffic using organic SEO and highly target ad campaigns. I managed $50k monthly ad spend.",
            "fileName": "Alice_Johnson_Resume.docx",
            "status": "Hired",
            "appliedDate": "2026-06-20"
        }
    ];

    let localApps = localStorage.getItem('cv_applications');
    if (!localApps) {
        allApplications = defaultApps;
        localStorage.setItem('cv_applications', JSON.stringify(defaultApps));
    } else {
        allApplications = JSON.parse(localApps);
    }

    filteredApplications = [...allApplications];
    renderCvTable();
    setupEventListeners();
};

// Render Table
const renderCvTable = () => {
    const tableBody = document.getElementById('cvTableBody');
    tableBody.innerHTML = '';

    if (filteredApplications.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">No applications match selected search filters.</td>
            </tr>
        `;
        document.getElementById('cvTotalStats').textContent = `Showing 0 applications`;
        document.getElementById('cvPaginationStats').textContent = `Showing 0 to 0 of 0 entries`;
        document.getElementById('cvPaginationButtons').innerHTML = '';
        return;
    }

    const totalEntries = filteredApplications.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const paginatedItems = filteredApplications.slice(startIndex, endIndex);

    document.getElementById('cvTotalStats').textContent = `Showing ${filteredApplications.length} application${filteredApplications.length === 1 ? '' : 's'}`;
    document.getElementById('cvPaginationStats').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;

    paginatedItems.forEach(app => {
        const initials = app.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const displayStatus = app.status.toLowerCase();

        tableBody.innerHTML += `
            <tr>
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar-placeholder" style="background-color: color-mix(in srgb, var(--brand-primary) 10%, transparent); color: var(--brand-primary);">${initials}</div>
                        <div class="user-info-text">
                            <h4>${app.fullname}</h4>
                            <p>${app.email}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="text-main" style="font-size: 0.9rem; font-weight: 600;">${app.jobTitle}</div>
                    <div class="text-muted" style="font-size: 0.8rem; margin-top: 2px; font-weight: 500; color: var(--brand-primary);">${app.companyName}</div>
                </td>
                <td>
                    <div class="text-main" style="font-size: 0.9rem;">${app.appliedDate}</div>
                </td>
                <td>
                    <a href="javascript:void(0)" class="text-muted-link" style="font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px; text-decoration: none;" onclick="alert('Simulation: Downloading resume archive file \\'${app.fileName}\\'')">
                        <i class="bi bi-file-earmark-pdf-fill" style="color: #ef4444; font-size: 1.15rem;"></i> ${app.fileName}
                    </a>
                </td>
                <td>
                    <span class="status-pill status--${displayStatus}">${displayStatus}</span>
                </td>
                <td>
                    <button class="btn-action-view" onclick="viewCvDetails('${app.id}')">
                        <i class="bi bi-file-text"></i> Review CV
                    </button>
                </td>
            </tr>
        `;
    });

    renderPaginationControls(totalPages);
};

// Render Pagination Buttons
const renderPaginationControls = (totalPages) => {
    const wrapper = document.getElementById('cvPaginationButtons');
    wrapper.innerHTML = '';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-page';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderCvTable();
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
            renderCvTable();
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
            renderCvTable();
        }
    };
    wrapper.appendChild(nextBtn);
};

// Event handlers search/filter
const setupEventListeners = () => {
    const searchInput = document.getElementById('cvSearchInput');
    const statusFilter = document.getElementById('cvStatusFilter');

    const filterAppList = () => {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusFilter.value;

        filteredApplications = allApplications.filter(app => {
            const matchesQuery = app.fullname.toLowerCase().includes(query) || 
                                 app.jobTitle.toLowerCase().includes(query) || 
                                 app.companyName.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || app.status.toLowerCase() === status;
            return matchesQuery && matchesStatus;
        });

        currentPage = 1;
        renderCvTable();
    };

    searchInput.addEventListener('input', filterAppList);
    statusFilter.addEventListener('change', filterAppList);
};

// View CV application details modal
window.viewCvDetails = (id) => {
    const app = allApplications.find(a => a.id === id);
    if (!app) return;

    selectedApplicationId = id;

    const modalBody = document.getElementById('cvModalBody');
    const initials = app.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Set select element status
    document.getElementById('modalAppStatus').value = app.status;

    modalBody.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div class="user-avatar-placeholder" style="width: 50px; height: 50px; font-weight: bold; background-color: color-mix(in srgb, var(--brand-primary) 10%, transparent); color: var(--brand-primary);">${initials}</div>
            <div>
                <h3 class="text-heading" style="margin-bottom: 4px; font-size: 1.2rem; text-transform: none;">${app.fullname}</h3>
                <p class="text-muted" style="font-size: 0.85rem;"><i class="bi bi-envelope"></i> ${app.email} &bull; <i class="bi bi-telephone"></i> ${app.phone}</p>
            </div>
        </div>

        <div style="background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                <div>
                    <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Applied Position</label>
                    <p style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">${app.jobTitle}</p>
                </div>
                <div>
                    <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Corporate Partner</label>
                    <p style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">${app.companyName}</p>
                </div>
                <div>
                    <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Date Submitted</label>
                    <p style="font-size: 0.9rem; font-weight: 600; color: var(--text-main);">${app.appliedDate}</p>
                </div>
                <div>
                    <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">CV Attachment</label>
                    <p style="font-size: 0.9rem; font-weight: 600;">
                        <a href="javascript:void(0)" style="color: var(--brand-primary); text-decoration: none;" onclick="alert('Simulation: Downloading resume archive file \\'${app.fileName}\\'')">
                            <i class="bi bi-file-earmark-arrow-down-fill" style="color: #ef4444;"></i> ${app.fileName} <i class="bi bi-download"></i>
                        </a>
                    </p>
                </div>
            </div>
        </div>

        <div>
            <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; display: block; font-weight: 600;">Cover Letter / Personal Note</label>
            <div style="background-color: var(--bg-main); border-left: 3px solid var(--brand-primary); padding: 1rem; border-radius: 0 8px 8px 0; max-height: 180px; overflow-y: auto; font-size: 0.9rem; line-height: 1.6; color: var(--text-main); white-space: pre-line;">
                ${app.coverLetter}
            </div>
        </div>
    `;

    document.getElementById('cvModalOverlay').classList.add('show');
};

// Close modal
window.closeCvModal = () => {
    document.getElementById('cvModalOverlay').classList.remove('show');
    selectedApplicationId = null;
};

// Update Application Status in localstorage
window.updateApplicationStatusSimulated = () => {
    if (!selectedApplicationId) return;

    const selectStatus = document.getElementById('modalAppStatus').value;

    allApplications = allApplications.map(app => {
        if (app.id === selectedApplicationId) {
            return { ...app, status: selectStatus };
        }
        return app;
    });

    localStorage.setItem('cv_applications', JSON.stringify(allApplications));

    const index = filteredApplications.findIndex(a => a.id === selectedApplicationId);
    if (index !== -1) {
        filteredApplications[index].status = selectStatus;
    }

    renderCvTable();
    closeCvModal();
};

document.addEventListener('DOMContentLoaded', initCvManager);
