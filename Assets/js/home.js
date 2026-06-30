// Home Page Logic - dynamically fetches jobs from jobs.json and renders them
const initHomePage = async () => {
    try {
        const [jobsRes, companiesRes] = await Promise.all([
            fetch('../../../Database/jobs.json'),
            fetch('../../../Database/companies.json')
        ]);

        const jobsData = await jobsRes.json();
        const companiesData = await companiesRes.json();

        const jobs = jobsData.jobs || [];
        const companies = companiesData.companies || [];

        const targetGrid = document.getElementById('home-jobs-target');
        if (!targetGrid) return;

        targetGrid.innerHTML = '';

        // Display the first 3 featured job postings
        jobs.slice(0, 3).forEach(job => {
            const comp = companies.find(c => c.id === job.company_id) || { name: 'Unknown Company' };

            targetGrid.innerHTML += `
                <article class="card" onclick="location.href='job_detail.html?id=${job.id}'" style="cursor: pointer;">
                    <div class="card_body">
                        <div class="card_header">
                            <span class="badge badge--${job.type}">${job.badgeText}</span>
                        </div>
                        <h3 class="text-heading" style="font-size: 1.25rem; margin-top: 0.5rem;">${job.title}</h3>
                        <p class="text-muted mb-2" style="font-weight: 600; color: var(--brand-primary);">${comp.name}</p>
                        <p class="text-muted text-clamp-3">${job.desc}</p>
                    </div>
                    <div class="card_footer">
                        <span class="text-price">${job.salary}</span>
                        <a href="job_detail.html?id=${job.id}" class="btn-primary" style="text-decoration: none; display: inline-block;">Apply Now</a>
                    </div>
                </article>
            `;
        });
    } catch (error) {
        console.error("Home page failed to fetch dynamic job listings from JSON database:", error);
    }
};

document.addEventListener('DOMContentLoaded', initHomePage);
