const jobDetailContainer = document.getElementById("job_detail_container");


// Store data locally
let all_category = [];
let all_company = [];


// ==========================================
//          1. FETCH JOB_Detail DATA
// ==========================================
const Get_Job_Detail = async() => {
    try {
        const [jobRes, categoryRes, companyRes] = await Promise.all([
            fetch('../../../Database/jobs.json'),
            fetch('../../../Database/categories.json'),
            fetch('../../../Database/companies.json'),
        ]);
        // Fetch Data from Json
        const jobData = await jobRes.json();
        const categoryData = await categoryRes.json();
        const companyData = await companyRes.json();

        if (!jobData.jobs || !categoryData.categories || !companyData.companies) return;

        const baseJobs = jobData.jobs || [];
        const customJobs = JSON.parse(localStorage.getItem('jobs')) || [];
        const deletedIds = JSON.parse(localStorage.getItem('deleted_job_ids')) || [];

        // Stored to local data
        const all_job = [...customJobs, ...baseJobs].filter(job => !deletedIds.includes(Number(job.id)) && !deletedIds.includes(String(job.id)));
        all_category = categoryData.categories;
        all_company = companyData.companies;

        // Get JOB ID from query_parameter
        const jobParam = new URLSearchParams(window.location.search);
        const job_id = jobParam.get("id");

        // Find job id from all jobs data
        const find_job = all_job.find(j => String(j.id) == String(job_id));

        // Call Render for UI
        RenderJobDetail(find_job); 
    } catch (error) {  
        console.error(`The error is: ${error}`);
    }
}

// ==========================================
//          2. Render JOB_Detail
// ==========================================
async function RenderJobDetail(job) {
    jobDetailContainer.innerHTML = '';

    if (!job) {
        jobDetailContainer.innerHTML += (`
                <div class="w-full text-center py-4" style="grid-column: 1 / -1;">
                    <p class="text-muted">No matching job found.</p>
                </div>
            `);
        return;
    }

    // Relationship
    const category_detail = await all_category.find(c => c.id === job.category_id) || {};
    const company_detail = await all_company.find(c => c.id === job.company_id) || {};

    const job_benefit = await job?.benefit || [];
    const job_requirement = await job?.requirement.split(',') || [];

    // Render Job_Detail via ID
    jobDetailContainer.innerHTML += (`
        <div class="col-4" >
                <img src="https://placehold.co/100x100/png?text=Logo" alt="company-image" class="text-center w-full">
        </div>
        <div class="col-1"></div>
        <div class="col-6">
            <div class="pb-1">
                <h2>${job?.title || 'Unknown Job'}</h2>
                <h5 class="text-muted"> ${company_detail?.name || 'Unknown Company'} </h5>
                <div class="mt-1 d-flex gap-2">
                    <span class="badge badge--${job.type}"> ${job?.badgeText || 'N/A'} </span>
                    <span class="badge "> ${job?.salary || 'Negotiable'} </span>
                    <span class="badge "> <i class="bi bi-clock px-2"></i> ${job?.work_date || 'Negotiable'} </span>
                </div>
                <p class="text-muted mt-1"><i class="bi bi-geo-alt-fill px-2"></i> ${company_detail?.location || 'Unknown Location'} </p>
                <p class="text-muted"> <i class="bi bi-calendar px-2"></i> Posted: ${job?.createdAt || 'Unknown Date'} </p>
            </div>
            <div class="py-4">
                <h3 class="pb-1">Job Benefits</h3>
                <ul>
                    ${job_benefit
                        .map(b => `<li class="text-muted">${b}</li>`)
                        .join('')
                    }
                </ul>
                    
            </div>
            <div class="py-4">
                <h3 class="pb-1">Requirement</h3>
                <ul>
                    ${job_requirement
                        .map(req => `<li class="text-muted">${req.trim()}</li>`)
                        .join('')
                    }
                </ul>
            </div>
            <div class="py-4">
                <h3 class="pb-1">Description</h3>
                <p class="text-muted">${job?.desc || 'Unknown description'}</p>
            </div>
            <div>
                <a href="apply_cv.html?id=${job.id}" class="btn btn-primary p-4 ">Apply Now</a>
            </div>
        </div>
    `);
    
}


// ==========================================
//          INITIALIZE 
// ==========================================
Get_Job_Detail();