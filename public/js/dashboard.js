/* =========================================================
   TASKDROBE — EMPLOYEE DASHBOARD CONTROLLER
   Theme, Sidebar, Search, and Notifications are handled by navBar.js
========================================================= */

// Unified HTML escaper
window.escapeHtml = function(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ================================
// Main Initialization
// ================================
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Task Checkbox Interactions
    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("click", function () {
            const isChecked = this.classList.toggle("checked");
            this.setAttribute("aria-pressed", String(isChecked));
            this.innerHTML = isChecked
                ? '<i class="fas fa-check" aria-hidden="true"></i>'
                : "";
        });
    });

    // 2. Project Carousel Controls
    const scrollContainer = document.getElementById("projectsScroll");
    const leftBtn = document.getElementById("scrollLeft");
    const rightBtn = document.getElementById("scrollRight");

    if (scrollContainer && leftBtn && rightBtn) {
        function getCardWidth() {
            const card = scrollContainer.querySelector(".project-card");
            if (!card) return 340;
            return card.offsetWidth + 24; // Width + Gap
        }

        function updateButtons() {
            leftBtn.disabled = scrollContainer.scrollLeft <= 5;
            rightBtn.disabled =
                scrollContainer.scrollLeft + scrollContainer.clientWidth >=
                scrollContainer.scrollWidth - 5;
        }

        leftBtn.addEventListener("click", () => {
            scrollContainer.scrollBy({ left: -getCardWidth(), behavior: "smooth" });
        });

        rightBtn.addEventListener("click", () => {
            scrollContainer.scrollBy({ left: getCardWidth(), behavior: "smooth" });
        });

        scrollContainer.addEventListener("scroll", updateButtons);
        window.addEventListener("resize", updateButtons);
        updateButtons();
    }

    // 3. Task Doughnut Chart
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
                        backgroundColor: ["#00b894", "#e1b12c", "#d63031"],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
                plugins: {
                    legend: { position: "bottom" },
                },
            },
        });
    }

    // 4. Project Bar Chart
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
                            backgroundColor: "#6C5CE7",
                            borderRadius: 8,
                        },
                    ],
                },
                options: {
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { beginAtZero: true, ticks: { precision: 0 } },
                    },
                },
            });
        } catch (e) {
            console.error("Error parsing project chart data:", e);
        }
    }
});