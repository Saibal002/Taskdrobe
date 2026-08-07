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