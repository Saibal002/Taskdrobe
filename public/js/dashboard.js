// ================================
// Global Utilities
// ================================

// Unified HTML escaper for both global search and socket notifications
window.escapeHtml = function(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ================================
// Project Carousel
// ================================

const scrollContainer = document.getElementById("projectsScroll");
const leftBtn = document.getElementById("scrollLeft");
const rightBtn = document.getElementById("scrollRight");

if (scrollContainer && leftBtn && rightBtn) {
    function getCardWidth() {
        const card = scrollContainer.querySelector(".project-card");
        if (!card) return 340;
        const gap = 16;
        return card.offsetWidth + gap;
    }

    function updateButtons() {
        leftBtn.disabled = scrollContainer.scrollLeft <= 5;
        rightBtn.disabled =
            scrollContainer.scrollLeft + scrollContainer.clientWidth >=
            scrollContainer.scrollWidth - 5;
    }

    leftBtn.addEventListener("click", () => {
        scrollContainer.scrollBy({
            left: -getCardWidth(),
            behavior: "smooth",
        });
    });

    rightBtn.addEventListener("click", () => {
        scrollContainer.scrollBy({
            left: getCardWidth(),
            behavior: "smooth",
        });
    });

    scrollContainer.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);
    updateButtons();
}

// ================================
// Main Initialization
// ================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Global Search
    initGlobalSearch();

    // 2. Task Checkbox Interactions (Moved from inline EJS)
    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("click", function () {
            const isChecked = this.classList.toggle("checked");
            this.setAttribute("aria-pressed", String(isChecked));
            this.innerHTML = isChecked
                ? '<i class="fas fa-check" aria-hidden="true"></i>'
                : "";
        });
    });

    // 3. Unified Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        const body = document.body;
        const root = document.documentElement;
        
        // Check for saved theme preference (syncing local storage keys)
        const savedTheme = localStorage.getItem('appTheme') || localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            root.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggleBtn.addEventListener('click', () => {
            const isDark = body.classList.toggle("dark-theme");
            root.setAttribute("data-theme", isDark ? "dark" : "light");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            localStorage.setItem("appTheme", isDark ? "dark" : "light");
            themeToggleBtn.innerHTML = isDark
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
        });
    }

    // 4. Task Doughnut Chart
    const chartCanvas = document.getElementById("taskChart");
    if (chartCanvas) {
        const completed = Number(chartCanvas.dataset.completed || 0);
        const pending = Number(chartCanvas.dataset.pending || 0);
        const overdue = Number(chartCanvas.dataset.overdue || 0);

        new Chart(chartCanvas, {
            type: "doughnut",
            data: {
                labels: ["Completed", "Pending", "Overdue"],
                datasets: [
                    {
                        data: [completed, pending, overdue],
                        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
                plugins: {
                    legend: {
                        position: "bottom",
                    },
                },
            },
        });
    }

    // 5. Project Bar Chart
    const projectCanvas = document.getElementById("projectChart");
    if (projectCanvas && projectCanvas.dataset.projects) {
        try {
            const projects = JSON.parse(projectCanvas.dataset.projects);
            new Chart(projectCanvas, {
                type: "bar",
                data: {
                    labels: projects.map((p) => p.status),
                    datasets: [
                        {
                            label: "Projects",
                            data: projects.map((p) => p.total),
                            borderRadius: 8,
                        },
                    ],
                },
                options: {
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                            },
                        },
                    },
                },
            });
        } catch (e) {
            console.error("Error parsing project chart data:", e);
        }
    }
});

// ================================
// Global Search Logic
// ================================

function initGlobalSearch() {
    const searchInput = document.getElementById("globalSearch");
    const searchResults = document.getElementById("searchResults");
    const clearSearch = document.getElementById("clearSearch");

    if (!searchInput || !searchResults) return;

    let searchTimeout;

    function closeSearch() {
        searchResults.innerHTML = "";
        searchResults.classList.add("d-none");
    }

    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.trim();
        clearTimeout(searchTimeout);

        if (searchTerm) {
            clearSearch?.classList.remove("d-none");
        } else {
            clearSearch?.classList.add("d-none");
        }

        if (!searchTerm) {
            closeSearch();
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                searchResults.innerHTML = `
                    <div class="search-no-results">
                        <i class="fas fa-spinner fa-spin"></i>
                        <div>Searching...</div>
                    </div>
                `;
                searchResults.classList.remove("d-none");

                const response = await fetch(
                    `/search?q=${encodeURIComponent(searchTerm)}`
                );

                if (!response.ok) {
                    throw new Error("Search request failed.");
                }

                const data = await response.json();
                renderSearchResults(data, searchResults);

            } catch (error) {
                console.error("Search Error:", error);
                searchResults.innerHTML = `
                    <div class="search-no-results">
                        <i class="fas fa-exclamation-circle"></i>
                        <div>Unable to search.</div>
                    </div>
                `;
            }
        }, 300);
    });

    clearSearch?.addEventListener("click", () => {
        searchInput.value = "";
        clearTimeout(searchTimeout);
        clearSearch.classList.add("d-none");
        closeSearch();
        searchInput.focus();
    });

    document.addEventListener("click", (event) => {
        const searchWrapper = searchInput.closest(".search-wrapper, .employee-search-wrapper, .manager-search-wrapper");
        if (searchWrapper && !searchWrapper.contains(event.target)) {
            closeSearch();
        }
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSearch();
            searchInput.blur();
        }
    });
}

function renderSearchResults(data, container) {
    const projects = data.projects || [];
    const tasks = data.tasks || [];

    if (projects.length === 0 && tasks.length === 0) {
        container.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <div>No results found.</div>
            </div>
        `;
        container.classList.remove("d-none");
        return;
    }

    let html = "";

    if (projects.length > 0) {
        html += `
            <div class="search-result-section">
                <div class="search-result-title">Projects</div>
        `;
        projects.forEach((project) => {
            html += `
                <a href="/projects/${project.project_id}" class="search-result-item">
                    <div class="search-result-icon"><i class="fas fa-folder"></i></div>
                    <div class="search-result-content">
                        <div class="search-result-name">${window.escapeHtml(project.project_name)}</div>
                        <div class="search-result-meta">${window.escapeHtml(project.status)} · ${project.progress ?? 0}%</div>
                    </div>
                </a>
            `;
        });
        html += `</div>`;
    }

    if (tasks.length > 0) {
        html += `
            <div class="search-result-section">
                <div class="search-result-title">Tasks</div>
        `;
        tasks.forEach((task) => {
            html += `
                <a href="/projects/${task.project_id}" class="search-result-item">
                    <div class="search-result-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="search-result-content">
                        <div class="search-result-name">${window.escapeHtml(task.title)}</div>
                        <div class="search-result-meta">${window.escapeHtml(task.project_name || "No Project")} · ${window.escapeHtml(task.priority || "No Priority")}</div>
                    </div>
                </a>
            `;
        });
        html += `</div>`;
    }

    container.innerHTML = html;
    container.classList.remove("d-none");
}