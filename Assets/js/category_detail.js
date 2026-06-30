const categoryHeader = document.getElementById("category_header");
const categoryContainer = document.getElementById("category");
const filterSelect = document.getElementById("job-filter");

// Store category globally
let all_jobs = [];
let jobs = [];
let all_categories = [];
let all_companies = [];

// ==========================================
//          1. FETCH JOB DATA
// ==========================================
const Get_All_Category_Detail = async () => {

    try {
        const [jobRes, categoryRes, companyRes] = await Promise.all([
            fetch('../../../Database/jobs.json'),
            fetch('../../../Database/categories.json'),
            fetch('../../../Database/companies.json')
        ]);
        // Get JSON Data
        const jobData = await jobRes.json();
        const categoryData = await categoryRes.json();
        const companyData = await companyRes.json();

        if (!jobData.jobs || !categoryData.categories || !companyData.companies) {
            console.error("Invalid JSON structure");
            return;
        }
        
        // Add Data
        all_jobs = jobData.jobs;
        all_categories = categoryData.categories;
        all_companies = companyData.companies;

        // Get Category ID from query_parameter
        const categoryParam = new URLSearchParams(window.location.search);
        const category_id = categoryParam.get("category_id");

        // Find job id from all categories data
        const find_category = all_categories.find(
            j => String(j.id) === String(category_id)
        );

        if (!find_category || !find_category.jobs_id) return;
        // convert job IDs → full job objects
        jobs = find_category.jobs_id
            .map(id => all_jobs.find(job => job.id === id))
            .filter(Boolean);

        renderCategory(jobs);
    } catch (error) {
        console.error("Failed to fetch category:", error);
    }
};

// ==========================================
//          2. RENDER FUNCTION
// ==========================================
function renderCategory(jobJson) {
    categoryContainer.innerHTML = "";
    categoryHeader.innerHTML = "";
    
    if (jobJson.length === 0) {
        categoryContainer.innerHTML = `
            <div class="w-full text-center py-4" style="grid-column: 1 / -1;">
            <p class="text-muted">No positions found matching this criteria.</p>
            </div>
        `;
        return;
    }
    
    jobJson.forEach(j => {
        // Find matching company
        const category = all_categories.find(c => c.id === j.category_id) || {};
        const company = all_companies.find(c => c.id === j.company_id) || {};
        // Header Contaner
        categoryHeader.innerHTML = `
            <span class="badge badge--remote" style="margin-bottom: 1rem;">Browse Category</span>
            <h1 class="text-heading" style="font-size: 2.5rem;">${category.name}</h1>
            <p class="text-muted">${category.description}</p>
        `


        // Main Container
        categoryContainer.innerHTML += `
            <article class="card" onclick="location.href='job_detail.html?id=${j.id}'" style="cursor: pointer;">
                <div class="card_body">

                    <div class="card_header">
                        <img src="${j.imageURI}" alt="${j.title}" class="card-image">

                        <span class="badge badge--${j.type}">
                            ${j.badgeText}
                        </span>

                        <span class="category">
                            ${category ? category.name : "Unknown Category"}
                        </span>
                    </div>

                    <h3 class="text-heading" style="font-size: 1.25rem; margin-top: 0.5rem;">
                        ${j.title}
                    </h3>

                    <p class="text-muted" style=" font-weight: 600; font-size: 0.85rem; margin-bottom: 0.75rem; color: var(--brand-primary);">
                        ${company ? company.name : "Unknown Company"}
                    </p>

                    <p class="text-muted text-clamp-3">
                        ${j.desc}
                    </p>

                </div>

                <div class="card_footer">
                    <span class="text-price">
                        ${j.salary}
                    </span>

                    <a href="job_detail.html?id=${j.id}" class="btn-primary" style="text-decoration: none; display: inline-block;">
                        View
                    </a>
                </div>
            </article>
        `;
    });
}

// ==========================================
//          3. FILTER ACTION LISTENER
// ==========================================
filterSelect.addEventListener("change", (e) => {

    const selectedValue = e.target.value;

    const filteredResults = jobs.filter(job => {

        if (selectedValue === "general") {
            return true;
        }

        return job.type === selectedValue;
    });

    renderCategory(filteredResults);
});


// ==========================================
//          INITIALIZE 
// ==========================================
Get_All_Category_Detail();