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

        const style = window.getComputedStyle(card);

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

            behavior: "smooth"

        });

    });

    rightBtn.addEventListener("click", () => {

        scrollContainer.scrollBy({

            left: getCardWidth(),

            behavior: "smooth"

        });

    });

    scrollContainer.addEventListener("scroll", updateButtons);

    window.addEventListener("resize", updateButtons);

    updateButtons();

}



document.addEventListener("DOMContentLoaded", () => {

    const chartCanvas =
        document.getElementById("taskChart");

    if (!chartCanvas) return;

    const completed =
        Number(chartCanvas.dataset.completed);

    const pending =
        Number(chartCanvas.dataset.pending);

    const overdue =
        Number(chartCanvas.dataset.overdue);

    new Chart(chartCanvas, {

        type: "doughnut",

        data: {

            labels: [

                "Completed",

                "Pending",

                "Overdue"

            ],

            datasets: [

                {

                    data: [

                        completed,

                        pending,

                        overdue

                    ],

                    backgroundColor: [

                        "#22c55e",

                        "#f59e0b",

                        "#ef4444"

                    ],

                    borderWidth: 0,

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,
            cutout: "70%",

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

});

//project chart data

const projectCanvas =
    document.getElementById("projectChart");

if (projectCanvas) {

    const projects =
        JSON.parse(projectCanvas.dataset.projects);

    new Chart(projectCanvas, {

        type: "bar",

        data: {

            labels: projects.map(p => p.status),

            datasets: [{

                label: "Projects",

                data: projects.map(p => p.total),

                borderRadius: 8,

            }]

        },

        options: {

            indexAxis: "y",

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}