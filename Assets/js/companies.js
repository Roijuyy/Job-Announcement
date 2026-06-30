const companyContainer = document.getElementById("company_container");

// Stored Categoried locally
all_companies = [];

// ==========================================
//          1. FETCH CATEGORY DATA
// ==========================================
const Get_Companies = async() => {
    try {
        const response = await fetch('../../../Database/companies.json');
        const data = await response.json();
        const baseCompanies = data.companies || [];
        const customCompanies = JSON.parse(localStorage.getItem('companies')) || [];
        all_companies = [...customCompanies, ...baseCompanies];
        renderCompanies(all_companies);
    } catch (error) {
        console.error("Failed to fetch companies:", error);
    }
}

// ==========================================
//          2. RENDER FUNCTION
// ==========================================
function renderCompanies(companies) {
    companyContainer.innerHTML = '';

    // Fallback
    if (companies.length == 0) {
        companyContainer.innerHTML = `
            <div class="w-full text-center py-4" style="grid-column: 1 / -1;">
                <p class="text-muted">No Company found.</p>
            </div>
        `;
        return;
    }
    companies.forEach(com => {
        companyContainer.innerHTML += (
            `
                <div class="col-4">
                    <article class="card" onclick="location.href='company_detail.html?company_id=${com.id}'" style="cursor: pointer; padding: 0; overflow: hidden; height: 100%;">  
                        <div class="card_header" style="
                            position: relative; 
                            height: 130px; 
                            margin-bottom: 3rem; 
                            background-image: linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0.15)), url('${com.logo}'); 
                            background-size: cover; 
                            background-position: center; 
                            padding: 1rem 1.5rem;
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            border-bottom: 1px solid var(--border-color);">

                            <span class="text-muted" style="font-size: 0.85rem; color: #ffffff !important; font-weight: 600; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); padding: 4px 8px; border-radius: 6px;">
                                <i class="bi bi-people-fill" style="color: var(--accent-warning); margin-right: 4px;"></i>${com.employees}
                            </span> 
                            
                            <span class="badge" style="font-size: 0.7rem; background-color: #ffffff; color: var(--neutral-900); font-weight: 700; box-shadow: var(--shadow-sm);">
                                ${com.industry}
                            </span>

                            <div class="company-logo" style="
                                position: absolute;
                                bottom: -2.25rem;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 76px; 
                                height: 76px; 
                                background-color: var(--bg-card); 
                                border: 4px solid var(--bg-card); 
                                border-radius: 50%; 
                                overflow: hidden; 
                                box-shadow: var(--shadow-md);
                                display: flex; 
                                align-items: center; 
                                justify-content: center;
                                z-index: 3;">
                                
                                <img src="${com.logo}" alt="${com.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                            </div>
                        </div>

                        <div class="card_body" style="padding: 0 1.5rem 1.5rem 1.5rem;">
                            <h2 class="text-heading text-clamp-1 text-center" style="font-size: 1.25rem; margin-bottom: 0.5rem;">
                                ${com.name}
                            </h2>
                            <p class="text-muted text-clamp-3 text-center" style="font-size: 0.9rem; min-height: 4.8ch;">
                                ${com.description}
                            </p>
                        </div>

                        <div class="card_footer flex-between" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); margin-top: auto;">          
                            <span class="text-muted" style="font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="bi bi-geo-alt-fill" style="color: var(--brand-primary);"></i>${com.location}
                            </span>
                            <a href="${com.website}" target="_blank" onclick="event.stopPropagation();" class="text-muted-link" style="font-weight: 600; text-decoration: none;">
                                View Site →
                            </a>
                        </div>
                        
                    </article>
                </div>
            `
        )
    });
}

// ==========================================
//          INITIALIZE 
// ==========================================
Get_Companies();