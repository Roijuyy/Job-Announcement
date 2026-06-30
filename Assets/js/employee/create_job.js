// Recruiter Workspace Job Posting Creator controller
document.addEventListener('DOMContentLoaded', async () => {
    const companySelect = document.getElementById('jobCompanySelect');
    const categorySelect = document.getElementById('jobCategorySelect');
    const form = document.getElementById('jobCreatorForm');

    let partnerCompanies = [];
    let classifications = [];

    // 1. Populate Dropdowns
    try {
        const [companiesRes, categoriesRes] = await Promise.all([
            fetch('../../../Database/companies.json'),
            fetch('../../../Database/categories.json')
        ]);

        const compData = await companiesRes.json();
        const catData = await categoriesRes.json();

        partnerCompanies = compData.companies || [];
        classifications = catData.categories || [];

        // Populate Companies
        partnerCompanies.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.id;
            option.textContent = comp.name;
            companySelect.appendChild(option);
        });

        // Populate Categories
        classifications.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });

    } catch (err) {
        console.error("Failed to populate dropdown resources:", err);
    }

    // 2. Submit Handler
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('jobTitleInput').value.trim();
            const companyId = Number(companySelect.value);
            const categoryId = Number(categorySelect.value);
            const type = document.getElementById('jobTypeSelect').value;
            const salary = document.getElementById('jobSalaryInput').value.trim();
            const workHours = document.getElementById('jobWorkHoursInput').value.trim();
            const benefitsText = document.getElementById('jobBenefitsInput').value.trim();
            const requirementsText = document.getElementById('jobRequirementsInput').value.trim();
            const desc = document.getElementById('jobDescriptionInput').value.trim();

            if (!title || !companyId || !categoryId || !salary || !workHours || !requirementsText || !desc) {
                alert('Please fill out all required fields.');
                return;
            }

            // Map selected type to badge labels
            const typeLabels = {
                fulltime: "Full-Time",
                parttime: "Part-Time",
                remote: "Remote",
                freelance: "Freelance",
                contract: "Contract"
            };

            const benefits = benefitsText ? benefitsText.split(',').map(b => b.trim()).filter(Boolean) : [];
            const requirement = requirementsText.trim(); // store as comma separated or string

            const newJob = {
                id: 'job_' + Date.now(),
                title: title,
                category_id: categoryId,
                type: type,
                badgeText: typeLabels[type] || "Full-Time",
                benefit: benefits,
                work_date: workHours,
                desc: desc,
                requirement: requirement,
                salary: salary,
                company_id: companyId,
                createdAt: new Date().toISOString().split('T')[0]
            };

            // Retrieve local listings database, push, and save
            const customJobs = JSON.parse(localStorage.getItem('jobs')) || [];
            customJobs.unshift(newJob);
            localStorage.setItem('jobs', JSON.stringify(customJobs));

            alert('Your job posting announcement was successfully published!');
            window.location.href = './jobs.html';
        });
    }
});
