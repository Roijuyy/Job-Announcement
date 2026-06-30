const companyContainer = document.getElementById("company_container");

// Stored Categoried locally
all_companies = [];

// ==========================================
//          1. FETCH COMPANY DATA
// ==========================================
const Get_Company_Detail = async() => {
    try {
        const response = await fetch('../../../Database/companies.json');
        const data = await response.json();
        const baseCompanies = data.companies || [];
        const customCompanies = JSON.parse(localStorage.getItem('companies')) || [];
        all_companies = [...customCompanies, ...baseCompanies];

        // FInd company with ID
        const company_param = new URLSearchParams(window.location.search);
        const company_id = company_param.get("company_id");

        if (!company_id) return;
        const find_company = await all_companies.find(c => String(c.id) === String(company_id));
        renderCompany(find_company);
    } catch (error) {
        console.error("Failed to fetch company:", error);
    }
}

// ==========================================
//          2. RENDER FUNCTION
// ==========================================
function renderCompany(company) {
    companyContainer.innerHTML = '';

    // Fallback
    if (!company) {
        companyContainer.innerHTML = `
            <div class="w-full text-center py-4" style="grid-column: 1 / -1;">
                <p class="text-muted">No Company found.</p>
            </div>
        `;
        return;
    }

    // Company Data 
    companyContainer.innerHTML += (
        `
            <div class="row my-4">
                <div class="col-12" style="background-color: var(--dark-200); padding: 40px; border-radius: 12px; border: 1px solid var(--dark-300);">
                    <div class="d-flex" style="align-items: center; gap: 1.5rem;">
                        <div style="flex-shrink: 0;">
                            <img src="${company.logo}" alt="${company.name}" style="border-radius: 12px; border: 2px solid var(--dark-300); display: block;">
                        </div>
                        <div style="flex-grow: 1;">
                            <span class="badge badge--remote mb-1" style="background-color: color-mix(in srgb, var(--brand-primary) 20%, transparent); color: var(--neutral-100);">Verified Profile</span>
                            <span class="badge badge--fulltime mb-1">${company.status}</span>
                            <h1 class="glow-text" style="font-size: 2.5rem; margin: 0 0 0.25rem 0;">${company.name}</h1>
                            <p class="text-muted" style="color: var(--dark-700); font-size: 1.05rem;">
                                <i class="bi bi-geo-alt px-1"></i> ${company.address} &nbsp;|&nbsp; <i class="bi bi-globe px-1"></i> <a href="${company.website}" target="_blank" class="text-muted-link" style="color: var(--brand-primary); text-decoration: underline;">Visit Official Website</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                
                <div class="col-8">
                    <div class="card" style="height: 100%;">
                        <div class="card_body">
                            <h2 class="text-heading" style="font-size: 1.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">About the Company</h2>
                            
                            <div class="flex-between mb-1">
                                <h3 class="text-muted"> ${company.ceo} (CEO) </h3>
                                <h3 class="text-muted">Founded: ${company.founded} </h3>
                            </div>
                            <p class="text-muted lh-lg" style="font-size: 1.05rem;">
                                ${company.description}
                            </p>
                            
                            <h3 class="text-heading" style="font-size: 1.1rem; margin-top: 2rem; margin-bottom: 0.75rem;">Core Culture & Mission</h3>
                            <p class="text-muted lh-lg">
                                We pride ourselves on balancing speed, robust cryptographic parameters, and cross-functional technology integrations to build out fluid frameworks meant to sustain shifting, real-time market actions reliably.
                            </p>

                            <h3 class="text-heading" style="font-size: 1.1rem; margin-top: 2rem; margin-bottom: 0.75rem;">Contact Details</h3>
                            <p class="text-muted" style="font-size: 1.05rem; line-height: 1.8;">
                                <i class="bi bi-envelope px-1"></i> Email: <a href="mailto:${company.email}" style="color: var(--brand-primary); text-decoration: none;">${company.email}</a> <br>
                                <i class="bi bi-telephone px-1"></i> Phone: <span style="font-weight: 600;">${company.phone}</span>
                            </p>
                        </div>
                        <div class="card_footer">
                            <span class="text-muted" style="font-size: 0.85rem;">Profile Reference ID: #${company.id}</span>
                            <button type="button" class="btn-primary">Follow Company</button>
                        </div>
                    </div>
                </div>

                <div class="col-4">
                    <div class="card" style="margin-bottom: 15px;">
                        <div class="card_body">
                            <h2 class="text-heading" style="font-size: 1.25rem; margin-bottom: 1.25rem;">Company Data</h2>
                            
                            <div class="my-2">
                                <label class="form-label" style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Industry Segment</label>
                                <p class="text-price" style="font-size: 1.15rem; color: var(--brand-primary);">${company.industry}</p>
                            </div>
                            
                            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 12px 0;">

                            <div class="my-2">
                                <label class="form-label" style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Team Operational Scale</label>
                                <p class="text-heading" style="font-size: 1.15rem;">${company.employees}</p>
                            </div>

                            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 12px 0;">

                            <div class="my-2">
                                <label class="form-label" style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Headquarters Office</label>
                                <p class="text-muted" style="font-weight: 600;">${company.location}</p>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card_body">
                            <h3 class="text-heading" style="font-size: 1rem; margin-bottom: 0.5rem;">Current Work Status</h3>
                            <div class="d-flex gap-2 mt-1">
                                <span class="badge badge--fulltime">Hiring Now</span>
                                <span class="badge badge--remote">Remote Friendly</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `
    );
}

// ==========================================
//          INITIALIZE 
// ==========================================
Get_Company_Detail();