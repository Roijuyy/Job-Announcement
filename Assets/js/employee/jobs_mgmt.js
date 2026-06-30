// Recruiter workspace Posted Jobs directory controller
let allJobs = [];
let filteredJobs = [];
let allCompanies = [];
let allCategories = [];
let cvApplications = [];

let currentPage = 1;
const entriesPerPage = 5;
let selectedJobId = null;

// Initialize posted jobs roster
const initJobsMgmt = async () => {
    try {
        const [jobsRes, companiesRes, categoriesRes] = await Promise.all([
            fetch('../../../Database/jobs.json'),
            fetch('../../../Database/companies.json'),
            fetch('../../../Database/categories.json')
        ]);

        const jobsData = await jobsRes.json();
        const companiesData = await companiesRes.json();
        const categoriesData = await categoriesRes.json();

        const baseJobs = jobsData.jobs || [];
        allCompanies = companiesData.companies || [];
        allCategories = categoriesData.categories || [];
        cvApplications = JSON.parse(localStorage.getItem('cv_applications')) || [];

        // Load custom created jobs from localStorage
        const customJobs = JSON.parse(localStorage.getItem('jobs')) || [];
        // Load local deleted job IDs overrides
        const deletedIds = JSON.parse(localStorage.getItem('deleted_job_ids')) || [];

        // Merge: combine base jobs and custom jobs, filtering out deleted ones
        allJobs = [...customJobs, ...baseJobs].filter(job => !deletedIds.includes(Number(job.id)) && !deletedIds.includes(String(job.id)));

        filteredJobs = [...allJobs];
        renderJobsTable();
        setupEventListeners();
    } catch (err) {
        console.error("Failed to load posted job announcements:", err);
        document.getElementById('jobsTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-exclamation-triangle" style="font-size: 1.5rem; color: var(--accent-warning);"></i>
                    <p class="mt-1">Failed to query jobs databases.</p>
                </td>
            </tr>
        `;
    }
};

// Render Table
const renderJobsTable = () => {
    const tableBody = document.getElementById('jobsTableBody');
    tableBody.innerHTML = '';

    if (filteredJobs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">No posted job announcements match filter queries.</td>
            </tr>
        `;
        document.getElementById('jobsTotalStats').textContent = `Showing 0 listings`;
        document.getElementById('jobsPaginationStats').textContent = `Showing 0 to 0 of 0 entries`;
        document.getElementById('jobsPaginationButtons').innerHTML = '';
        return;
    }

    const totalEntries = filteredJobs.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const paginatedItems = filteredJobs.slice(startIndex, endIndex);

    document.getElementById('jobsTotalStats').textContent = `Showing ${filteredJobs.length} listing${filteredJobs.length === 1 ? '' : 's'}`;
    document.getElementById('jobsPaginationStats').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;

    paginatedItems.forEach(job => {
        const comp = allCompanies.find(c => c.id === job.company_id) || { name: 'Partner Company' };
        const cat = allCategories.find(c => c.id === job.category_id) || { name: 'Unknown Classification' };
        const appCount = cvApplications.filter(app => app.jobTitle === job.title).length;

        tableBody.innerHTML += `
            <tr>
                <td>
                    <div class="text-main" style="font-size: 0.95rem; font-weight: 600; cursor: pointer;" onclick="viewJobDetails('${job.id}')">${job.title}</div>
                    <div class="text-muted" style="font-size: 0.8rem; margin-top: 2px;">
                        <i class="bi bi-building"></i> ${comp.name}
                    </div>
                </td>
                <td>
                    <span class="text-main" style="font-size: 0.9rem;">${cat.name}</span>
                </td>
                <td>
                    <span class="text-price" style="font-size: 0.9rem;">${job.salary}</span>
                </td>
                <td>
                    <span class="badge badge--remote" style="font-size: 0.75rem; text-transform: none;">${appCount} Applications</span>
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-action-view" onclick="viewJobDetails('${job.id}')">
                            <i class="bi bi-eye"></i> Details
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    renderPaginationControls(totalPages);
};

// Render Pagination Buttons
const renderPaginationControls = (totalPages) => {
    const wrapper = document.getElementById('jobsPaginationButtons');
    wrapper.innerHTML = '';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-page';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderJobsTable();
        }
    };
    wrapper.appendChild(prevBtn);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderJobsTable();
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
            renderJobsTable();
        }
    };
    wrapper.appendChild(nextBtn);
};

// Event handlers
const setupEventListeners = () => {
    const searchInput = document.getElementById('jobsSearchInput');
    const typeFilter = document.getElementById('jobsTypeFilter');

    const filterRoster = () => {
        const query = searchInput.value.toLowerCase().trim();
        const type = typeFilter.value;

        filteredJobs = allJobs.filter(job => {
            const comp = allCompanies.find(c => c.id === job.company_id) || {};
            const cat = allCategories.find(c => c.id === job.category_id) || {};
            
            const matchesQuery = job.title.toLowerCase().includes(query) ||
                                 comp.name?.toLowerCase().includes(query) ||
                                 cat.name?.toLowerCase().includes(query) ||
                                 job.requirement?.toLowerCase().includes(query);
            
            const matchesType = type === 'all' || job.type === type;
            return matchesQuery && matchesType;
        });

        currentPage = 1;
        renderJobsTable();
    };

    searchInput.addEventListener('input', filterRoster);
    typeFilter.addEventListener('change', filterRoster);
};

// Modal Detail View
window.viewJobDetails = (id) => {
    const job = allJobs.find(j => String(j.id) === String(id));
    if (!job) return;

    selectedJobId = id;

    const modalBody = document.getElementById('jobsModalBody');
    const comp = allCompanies.find(c => c.id === job.company_id) || { name: 'Partner Company', location: 'Unknown Location' };
    const cat = allCategories.find(c => c.id === job.category_id) || { name: 'Unknown Category' };

    const benefitsList = Array.isArray(job.benefit) ? job.benefit : (job.benefit ? job.benefit.split(',') : []);
    const requirementsList = Array.isArray(job.requirement) ? job.requirement : (job.requirement ? job.requirement.split(',') : []);

    modalBody.innerHTML = `
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.25rem;">
            <div class="flex-between">
                <span class="badge badge--${job.type}">${job.badgeText || job.type}</span>
                <span class="text-price" style="font-size: 1.2rem;">${job.salary}</span>
            </div>
            <h3 class="text-heading" style="font-size: 1.35rem; margin-top: 6px; text-transform: none;">${job.title}</h3>
            <p class="text-muted" style="font-size: 0.9rem; font-weight: 600; color: var(--brand-primary);"><i class="bi bi-building"></i> ${comp.name} &bull; <i class="bi bi-geo-alt"></i> ${comp.location}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; background-color: var(--bg-main); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem;">
            <div>
                <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Classification</label>
                <p style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">${cat.name}</p>
            </div>
            <div>
                <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Work Shift / Hours</label>
                <p style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">${job.work_date}</p>
            </div>
        </div>

        <div style="margin-bottom: 1.25rem;">
            <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 4px;">Job Summary</label>
            <p class="text-main" style="font-size: 0.925rem; line-height: 1.6; color: var(--text-main);">${job.desc}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 6px;">Requirements</label>
                <ul style="padding-left: 1.2rem; font-size: 0.875rem; line-height: 1.5; color: var(--text-main);">
                    ${requirementsList.map(r => `<li>${r.trim()}</li>`).join('')}
                </ul>
            </div>
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 6px;">Benefits</label>
                <ul style="padding-left: 1.2rem; font-size: 0.875rem; line-height: 1.5; color: var(--text-main);">
                    ${benefitsList.map(b => `<li>${b.trim()}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    document.getElementById('jobsModalOverlay').classList.add('show');
};

// Close modal
window.closeJobsModal = () => {
    document.getElementById('jobsModalOverlay').classList.remove('show');
    selectedJobId = null;
};

// Remove Job simulated
window.deleteJobSimulated = () => {
    if (!selectedJobId) return;

    if (!confirm('Are you sure you want to permanently remove this recruitment posting announcement?')) return;

    // Load custom jobs
    let customJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const beforeLength = customJobs.length;
    
    // Attempt deleting from customJobs
    customJobs = customJobs.filter(j => String(j.id) !== String(selectedJobId));
    localStorage.setItem('jobs', JSON.stringify(customJobs));

    if (customJobs.length === beforeLength) {
        // If length did not change, it was a base jobs.json job, so add its ID to deleted_job_ids list
        const deletedIds = JSON.parse(localStorage.getItem('deleted_job_ids')) || [];
        // Add both numeric and string options just in case
        deletedIds.push(selectedJobId);
        if (!isNaN(selectedJobId)) deletedIds.push(Number(selectedJobId));
        
        localStorage.setItem('deleted_job_ids', JSON.stringify(deletedIds));
    }

    // Refresh dashboard / local lists
    allJobs = allJobs.filter(j => String(j.id) !== String(selectedJobId));
    filteredJobs = filteredJobs.filter(j => String(j.id) !== String(selectedJobId));

    renderJobsTable();
    closeJobsModal();
    alert('Job posting removed successfully.');
};

document.addEventListener('DOMContentLoaded', initJobsMgmt);
