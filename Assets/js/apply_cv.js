const applyDetail = document.getElementById('apply_detail');
const cvContainer = document.getElementById('cvContainer');
const fileInput = document.getElementById('cvFile');
const cvImageWrapper = document.getElementById('cvImageWrapper');
const previewImg = document.getElementById('previewImg');
const txtCoverLetter = document.getElementById('txtCoverLetter');
const previewDocIcon = document.getElementById('previewDocIcon');
const nameDisplay = document.getElementById('fileNameDisplay');
const btnCancel = document.getElementById('btn_cancel');

// Store data locally
let all_category = [];
let all_company = [];
let currentJob = null;
let currentCompany = null;


// ==========================================
//          1. FETCH JOB_Detail DATA
// ==========================================
const Get_Apply_Detail = async() => {
    try {
        // Check authentiction
        const current_user = JSON.parse(localStorage.getItem('currentUser'));
        if (!current_user) {
            window.location.href = "/Component/page/auth/login.html";
            return;
        }

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
        RenderApplyDetail(find_job); 
    } catch (error) {  
        console.error(`The error is: ${error}`);
    }
}

async function RenderApplyDetail(job) {
    applyDetail.innerHTML = '';

    if (!job) {
        applyDetail.innerHTML += (`
                <div class="w-full text-center py-4" style="grid-column: 1 / -1;">
                    <p class="text-muted">No matching job requirement found.</p>
                </div>
            `);
        return;
    }

    // Relationship
    const category_detail = await all_category.find(c => c.id === job.category_id) || {};
    const company_detail = await all_company.find(c => c.id === job.company_id) || {};
    
    currentJob = job;
    currentCompany = company_detail;
    
    applyDetail.innerHTML += `
        <div class="card_header">
            <span class="badge badge--${job.badgeText}">${job.badgeText}</span>
        </div>
        <div class="card_body">
            <h2 class="text-heading">${job.title}</h2>
            <p class="text-muted mb-1">Platform Operations Team</p>
            <p class="text-price my-2">${job.salary}</p>
            
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 12px 0;">
            
            <p class="text-muted lh-lg text-clamp-3">${job.desc}</p>
        </div>
        <div class="card_footer">
            <a href="#" onclick="history.back()" class="text-muted-link">← Back to Listings</a>
        </div>
    `
} 

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const filename = file.name;
        
        nameDisplay.innerText = `Selected file: ${filename}`;
        nameDisplay.style.display = 'inline-flex';
        
        cvContainer.style.display = 'none';
        cvImageWrapper.style.display = 'block';

        if (file.type.startsWith('image/')) {
            previewImg.src = URL.createObjectURL(file);
            previewImg.style.display = 'inline-block';
            previewDocIcon.style.display = 'none';
        } else {
            previewImg.style.display = 'none';
            previewDocIcon.style.display = 'block';
        }
    } else {
        resetUploadFields();
    }
});

// Combined reset sequence helper to keep things organized
function resetUploadFields() {
    fileInput.value = ''; 
    nameDisplay.style.display = 'none';
    nameDisplay.innerText = '';
    
    cvContainer.style.display = 'block';
    cvImageWrapper.style.display = 'none';
    
    previewImg.src = "";
    previewImg.style.display = 'none';
    previewDocIcon.style.display = 'none';
}

btnCancel.addEventListener('click', () => {
    resetUploadFields();
    if (txtCoverLetter) txtCoverLetter.value = '';
});

// ==========================================
//          CV SUBMISSION PERSISTENCE
// ==========================================
const applyForm = document.querySelector('form');
if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select and upload your CV/Resume file.');
            return;
        }

        const file = fileInput.files[0];
        const coverLetter = txtCoverLetter ? txtCoverLetter.value.trim() : '';

        // Retrieve current logged in user details if available
        const currentUserStr = localStorage.getItem('currentUser');
        let candidateName = "Anonymous Candidate";
        let candidateEmail = "anonymous@example.com";
        let candidatePhone = "+855 00 000 000";

        if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            candidateName = currentUser.fullname || candidateName;
            candidateEmail = currentUser.email || candidateEmail;
            candidatePhone = currentUser.phone || candidatePhone;
        }

        const newApp = {
            id: 'app_' + Date.now(),
            fullname: candidateName,
            email: candidateEmail,
            phone: candidatePhone,
            jobTitle: currentJob ? currentJob.title : "Senior Full-Stack Engineer (C# / React)",
            companyName: currentCompany ? currentCompany.name : "Nexus Financial Fintech",
            coverLetter: coverLetter || "Please see my attached CV file.",
            fileName: file.name,
            status: "Pending",
            appliedDate: new Date().toISOString().split('T')[0]
        };

        // Append to CV applications register in LocalStorage
        const cvApps = JSON.parse(localStorage.getItem('cv_applications')) || [];
        cvApps.unshift(newApp);
        localStorage.setItem('cv_applications', JSON.stringify(cvApps));

        alert('Congratulations! Your CV application was successfully submitted.');
        window.location.href = '../client/home.html';
    });
}

// ==========================================
//          INITIALIZE 
// ==========================================
Get_Apply_Detail();