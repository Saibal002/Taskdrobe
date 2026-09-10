/* =========================================================
   TASKDROBE — MANAGER DASHBOARD CONTROLLER
   Theme, Sidebar, Search, and Notifications are handled by navBar.js
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    
    /* =====================================================
         PROJECT CARD NAVIGATION
    ===================================================== */
    $(document).on("click", ".manager-project-link", function (event) {
        if ($(event.target).closest(".manager-project-action").length) {
            return;
        }
        const url = $(this).attr("data-project-url");
        if (url) {
            window.location.href = url;
        }
    });

    $(document).on("keydown", ".manager-project-link", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        if ($(event.target).closest(".manager-project-action").length) return;
        
        event.preventDefault();
        const url = $(this).attr("data-project-url");
        if (url) {
            window.location.href = url;
        }
    });

    /* =====================================================
         DELETE PROJECT
    ===================================================== */
    $(document).on("click", ".project-delete-btn", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const button = $(this);
        const projectId = button.attr("data-project-id");

        if (!projectId) return;

        if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
        }

        button.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span>');

        $.ajax({
            url: `/projects/${projectId}/delete`,
            type: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            success: function (response) {
                if (!response || !response.success) {
                    button.prop("disabled", false).html('<i class="bi bi-trash3"></i>');
                    alert(response?.message || "Unable to delete project.");
                    return;
                }

                const card = button.closest(".manager-project-link");
                card.fadeOut(250, function () {
                    $(this).remove();
                    const grid = document.getElementById("managerProjectsGrid");
                    
                    if (grid && !grid.querySelector(".manager-project-link")) {
                        grid.className = "manager-empty-state";
                        grid.innerHTML = `
                            <div class="manager-empty-icon"><i class="bi bi-folder2-open"></i></div>
                            <h3>No projects yet</h3>
                            <p>Create your first project to start managing your workspace.</p>
                            <button type="button" class="manager-primary-button" data-bs-toggle="modal" data-bs-target="#addProjectModal">
                                <i class="bi bi-plus-lg"></i> Create Project
                            </button>
                        `;
                    }
                });
            },
            error: function (xhr) {
                button.prop("disabled", false).html('<i class="bi bi-trash3"></i>');
                alert(xhr.responseJSON?.message || "Unable to delete project.");
            },
        });
    });
});