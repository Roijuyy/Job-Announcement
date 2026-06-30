// Customer Directory logic - fetches companies and renders search/filter tables
let allCompanies = [];
let filteredCompanies = [];
let currentPage = 1;
const entriesPerPage = 5;
let selectedCompanyId = null; // Track selected company for modal actions

// Initialize customer (companies) data
const initCustomers = async () => {
    try {
        // Fetch companies from database JSON directly to ensure it works with JSON edits
        const response = await fetch('../../../Database/companies.json');
        const data = await response.json();
        const companiesList = data.companies || data;
        
        // Read status overrides from LocalStorage
        const statusOverrides = JSON.parse(localStorage.getItem('company_statuses')) || {};
        
        // Map status overrides and default to active
        allCompanies = companiesList.map(comp => ({
            ...comp,
            status: statusOverrides[comp.id] || comp.status || 'active'
        }));

        // Populate Industry filter categories
        populateIndustryFilter();

        filteredCompanies = [...allCompanies];
        renderCustomerTable();
        setupEventListeners();
    } catch (error) {
        console.error("Failed to load corporate customer directory:", error);
        document.getElementById('customerTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-exclamation-triangle" style="font-size: 1.5rem; color: var(--accent-warning);"></i>
                    <p class="mt-1">Failed to fetch partner companies databases.</p>
                </td>
            </tr>
        `;
    }
};

// Populate Industry Dropdown
const populateIndustryFilter = () => {
    const filterSelect = document.getElementById('customerIndustryFilter');
    const industries = [...new Set(allCompanies.map(c => c.industry))].filter(Boolean);
    
    industries.forEach(ind => {
        const option = document.createElement('option');
        option.value = ind.toLowerCase();
        option.textContent = ind;
        filterSelect.appendChild(option);
    });
};

// Render Table entries
const renderCustomerTable = () => {
    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = '';

    if (filteredCompanies.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">No corporate customers match filter parameters.</td>
            </tr>
        `;
        document.getElementById('customerTotalStats').textContent = `Showing 0 companies`;
        document.getElementById('customerPaginationStats').textContent = `Showing 0 to 0 of 0 entries`;
        document.getElementById('customerPaginationButtons').innerHTML = '';
        return;
    }

    const totalEntries = filteredCompanies.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const paginatedItems = filteredCompanies.slice(startIndex, endIndex);

    // Update Stats labels
    document.getElementById('customerTotalStats').textContent = `Showing ${filteredCompanies.length} companie${filteredCompanies.length === 1 ? '' : 's'}`;
    document.getElementById('customerPaginationStats').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;

    paginatedItems.forEach(comp => {
        // Logo letter placeholder
        const letter = comp.name[0].toUpperCase();
        const displayStatus = comp.status === 'active' ? 'active' : 'inactive';

        tableBody.innerHTML += `
            <tr>
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar-placeholder" style="border-radius: 8px; font-weight: bold; background-color: color-mix(in srgb, var(--accent-info) 15%, transparent); color: var(--accent-info);">${letter}</div>
                        <div class="user-info-text">
                            <h4>${comp.name}</h4>
                            <p><i class="bi bi-geo-alt" style="margin-right: 4px;"></i>${comp.location}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="text-main" style="font-size: 0.9rem; font-weight: 600;">${comp.ceo}</div>
                    <div class="text-muted" style="font-size: 0.85rem; margin-top: 3px;">
                        <span class="badge badge--remote" style="text-transform: none; font-size: 0.7rem; padding: 2px 8px;">${comp.industry}</span>
                    </div>
                </td>
                <td>
                    <div class="text-main" style="font-size: 0.9rem; font-weight: 500;">${comp.employees} employees</div>
                    <div class="text-muted" style="font-size: 0.8rem; margin-top: 2px;">Est. ${comp.founded}</div>
                </td>
                <td>
                    <span class="status-pill status--${displayStatus}">${displayStatus}</span>
                </td>
                <td>
                    <button class="btn-action-view" onclick="viewCustomerDetails(${comp.id})">
                        <i class="bi bi-eye"></i> Details
                    </button>
                </td>
            </tr>
        `;
    });

    renderPaginationControls(totalPages);
};

// Render Pagination Controls
const renderPaginationControls = (totalPages) => {
    const wrapper = document.getElementById('customerPaginationButtons');
    wrapper.innerHTML = '';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-page';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderCustomerTable();
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
            renderCustomerTable();
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
            renderCustomerTable();
        }
    };
    wrapper.appendChild(nextBtn);
};

// Setup search & filters
const setupEventListeners = () => {
    const searchInput = document.getElementById('customerSearchInput');
    const industryFilter = document.getElementById('customerIndustryFilter');

    const filterRoster = () => {
        const query = searchInput.value.toLowerCase().trim();
        const industry = industryFilter.value;

        filteredCompanies = allCompanies.filter(comp => {
            const matchesQuery = comp.name.toLowerCase().includes(query) || 
                                 comp.ceo.toLowerCase().includes(query) || 
                                 comp.location.toLowerCase().includes(query) ||
                                 comp.industry.toLowerCase().includes(query);
            const matchesIndustry = industry === 'all' || comp.industry.toLowerCase() === industry;
            return matchesQuery && matchesIndustry;
        });

        currentPage = 1;
        renderCustomerTable();
    };

    searchInput.addEventListener('input', filterRoster);
    industryFilter.addEventListener('change', filterRoster);
};

// Open Detail View Modal
window.viewCustomerDetails = (id) => {
    const comp = allCompanies.find(c => c.id === id);
    if (!comp) return;

    selectedCompanyId = id;

    const modalBody = document.getElementById('customerModalBody');
    const letter = comp.name[0].toUpperCase();
    const displayStatus = comp.status === 'active' ? 'active' : 'inactive';

    // Toggle button configuration
    const btnToggle = document.getElementById('btnToggleCompanyStatus');
    if (comp.status === 'active') {
        btnToggle.textContent = 'Suspend Client';
        btnToggle.style.backgroundColor = '#ef4444';
        btnToggle.style.color = '#ffffff';
        btnToggle.style.border = 'none';
    } else {
        btnToggle.textContent = 'Approve Client';
        btnToggle.style.backgroundColor = 'var(--accent-success)';
        btnToggle.style.color = '#ffffff';
        btnToggle.style.border = 'none';
    }

    modalBody.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div class="user-avatar-placeholder" style="width: 60px; height: 60px; border-radius: 12px; font-size: 1.5rem; font-weight: bold; background-color: color-mix(in srgb, var(--accent-info) 15%, transparent); color: var(--accent-info);">${letter}</div>
            <div>
                <h3 class="text-heading" style="margin-bottom: 4px; font-size: 1.4rem; text-transform: none;">${comp.name}</h3>
                <span class="status-pill status--${displayStatus}">${displayStatus}</span>
            </div>
        </div>
        
        <p class="text-muted" style="margin-bottom: 1.5rem; line-height: 1.6; font-style: italic;">"${comp.description}"</p>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Chief Executive Officer</label>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${comp.ceo}</p>
            </div>
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Industry Classification</label>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${comp.industry}</p>
            </div>
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Corporate Email</label>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${comp.email}</p>
            </div>
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Contact Phone</label>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${comp.phone}</p>
            </div>
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Official Website</label>
                <p style="font-size: 0.95rem; font-weight: 600;"><a href="${comp.website}" target="_blank" style="color: var(--brand-primary); text-decoration: none;">${comp.website.replace('https://', '')} <i class="bi bi-box-arrow-up-right"></i></a></p>
            </div>
            <div>
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Scale (Employees)</label>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${comp.employees} headcounts</p>
            </div>
            <div style="grid-column: span 2;">
                <label class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Headquarters Address</label>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);"><i class="bi bi-geo-alt-fill" style="color: red; margin-right: 4px;"></i>${comp.address}</p>
            </div>
        </div>
    `;

    document.getElementById('customerModalOverlay').classList.add('show');
};

// Close Modal
window.closeCustomerModal = () => {
    document.getElementById('customerModalOverlay').classList.remove('show');
    selectedCompanyId = null;
};

// Toggle Company Status in localStorage
window.toggleCompanyStatusSimulated = () => {
    if (!selectedCompanyId) return;

    allCompanies = allCompanies.map(c => {
        if (c.id === selectedCompanyId) {
            const nextStatus = c.status === 'active' ? 'inactive' : 'active';
            
            // Save status overrides to localStorage
            const statusOverrides = JSON.parse(localStorage.getItem('company_statuses')) || {};
            statusOverrides[c.id] = nextStatus;
            localStorage.setItem('company_statuses', JSON.stringify(statusOverrides));
            
            return { ...c, status: nextStatus };
        }
        return c;
    });

    const index = filteredCompanies.findIndex(c => c.id === selectedCompanyId);
    if (index !== -1) {
        filteredCompanies[index].status = filteredCompanies[index].status === 'active' ? 'inactive' : 'active';
    }

    renderCustomerTable();
    closeCustomerModal();
};

// Add Customer Modal Triggers
window.openAddCustomerModal = () => {
    document.getElementById('addCustomerModalOverlay').classList.add('show');
};

window.closeAddCustomerModal = () => {
    document.getElementById('addCustomerModalOverlay').classList.remove('show');
    document.getElementById('addCustomerForm').reset();
};

// Add Customer Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const addCustForm = document.getElementById('addCustomerForm');
    if (addCustForm) {
        addCustForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('addCustName').value.trim();
            const ceo = document.getElementById('addCustCEO').value.trim();
            const industry = document.getElementById('addCustIndustry').value.trim();
            const location = document.getElementById('addCustLocation').value.trim();
            const employees = document.getElementById('addCustEmployees').value;
            const email = document.getElementById('addCustEmail').value.trim();
            const phone = document.getElementById('addCustPhone').value.trim();
            const website = document.getElementById('addCustWebsite').value.trim();
            const founded = Number(document.getElementById('addCustFounded').value);
            const address = document.getElementById('addCustAddress').value.trim();
            const desc = document.getElementById('addCustDesc').value.trim();

            if (!name || !ceo || !industry || !location || !email || !phone || !website || !founded || !address || !desc) {
                alert('Please fill out all required fields.');
                return;
            }

            const newCompany = {
                id: Date.now(), // Generate a unique numeric ID for the company
                name: name,
                logo: "https://placehold.co/100x100/png?text=" + encodeURIComponent(name[0]),
                location: location,
                website: website,
                industry: industry,
                employees: employees,
                description: desc,
                email: email,
                phone: phone,
                founded: founded,
                ceo: ceo,
                status: "active",
                address: address
            };

            // Read, append and save to localStorage
            const localCompanies = JSON.parse(localStorage.getItem('companies')) || [];
            localCompanies.push(newCompany);
            localStorage.setItem('companies', JSON.stringify(localCompanies));

            // Update local memory and refresh
            allCompanies.push(newCompany);
            filteredCompanies.push(newCompany);

            // Re-populate industry filter dropdown to keep it synchronized
            const filterSelect = document.getElementById('customerIndustryFilter');
            filterSelect.innerHTML = '<option value="all">All Industries</option>';
            populateIndustryFilter();

            renderCustomerTable();
            closeAddCustomerModal();
            alert('Partner company profile added successfully.');
        });
    }
});

document.addEventListener('DOMContentLoaded', initCustomers);
