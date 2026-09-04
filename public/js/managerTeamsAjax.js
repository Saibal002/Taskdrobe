$(document).ready(function () {
    /* =====================================================
       1. DASHBOARD: LOAD TEAM OVERVIEW PARTIAL
    ===================================================== */
   /* =====================================================
       1. DASHBOARD: LOAD TEAM OVERVIEW PARTIAL
    ===================================================== */
    function loadManagerTeams() {
        const $container = $("#managerTeamListContainer");
        if (!$container.length) return;

        $.ajax({
            url: "/teams/manager",
            type: "GET",
            dataType: "json",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            success: function (result) {
                if (result.success && result.data.length > 0) {
                    $container.empty(); // Clear loading state
                    
                    // Optional: Add a scrollable wrapper style to keep it compact beside Recent Activity
                    $container.css({
                        "max-height": "260px",
                        "overflow-y": "auto",
                        "padding-right": "4px"
                    });

                    // Slice to show only the 2 latest teams if you prefer strictly two:
                    // const latestTeams = result.data.slice(0, 2);

                    result.data.forEach((team, index) => {
                        const gradients = [
                            "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            "linear-gradient(135deg, #0ea5e9, #2563eb)",
                            "linear-gradient(135deg, #f59e0b, #ea580c)",
                            "linear-gradient(135deg, #10b981, #059669)"
                        ];
                        const bg = gradients[index % gradients.length];
                        const initials = team.team_name.substring(0, 2).toUpperCase();

                        const html = `
                            <div class="manager-team-item d-flex align-items-center justify-content-between p-3 mb-2 rounded-4 shadow-sm" style="background-color: #f8fafc; border-left: 4px solid transparent; transition: all 0.2s;" onmouseover="this.style.borderLeft='4px solid #4f46e5'; this.style.backgroundColor='#fff';" onmouseout="this.style.borderLeft='4px solid transparent'; this.style.backgroundColor='#f8fafc';">
                                <div class="manager-team-main d-flex align-items-center gap-3">
                                    <div class="manager-team-avatar fw-bold d-flex align-items-center justify-content-center rounded-circle shadow-sm" style="width: 42px; height: 42px; min-width: 42px; background: ${bg}; color: white;">
                                        ${initials}
                                    </div>
                                    <div>
                                        <strong class="text-dark d-block" style="font-size: 1rem; line-height: 1.2;">${team.team_name}</strong>
                                        <span class="text-muted small text-truncate d-inline-block" style="max-width: 180px;">${team.description || "No description provided."}</span>
                                    </div>
                                </div>
                                <div class="manager-team-actions">
                                    <a href="/manager/teams/${team.team_id}" class="btn btn-sm btn-light text-primary fw-bold rounded-pill px-3 shadow-sm">Manage</a>
                                </div>
                            </div>
                        `;
                        $container.append(html);
                    });
                } else {
                    $container.html(`
                        <div class="text-center py-4 rounded-4 shadow-sm" style="background-color: #f8fafc; border: 2px dashed #cbd5e1;">
                            <i class="bi bi-people text-muted fs-2 mb-1 d-block"></i>
                            <p class="text-muted fw-bold mb-0 small">No teams found</p>
                        </div>
                    `);
                }
            },
            error: function (xhr) {
                console.error("Error loading teams:", xhr);
                $container.html('<div class="alert alert-danger shadow-sm rounded-4 small p-2">Failed to load teams.</div>');
            }
        });
    }


    /* =====================================================
       2. TEAMS DIRECTORY: LOAD FULL PAGE GRID
    ===================================================== */
    function loadFullTeamGrid() {
        const $grid = $("#fullTeamGrid");
        if (!$grid.length) return;

        $.ajax({
            url: "/teams/manager",
            type: "GET",
            dataType: "json",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            success: function (result) {
                if (result.success && result.data.length > 0) {
                    $grid.empty();
                    
                    result.data.forEach((team, index) => {
                        const gradients = [
                            "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            "linear-gradient(135deg, #0ea5e9, #2563eb)",
                            "linear-gradient(135deg, #f59e0b, #ea580c)"
                        ];
                        const bg = gradients[index % gradients.length];
                        const initials = team.team_name.substring(0, 2).toUpperCase();
                        
                        const cardHtml = `
                            <div class="col-12 col-md-6 col-lg-4">
                                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden" style="transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                                    <div class="card-header border-0 py-4" style="background: ${bg};">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold bg-white" style="width: 56px; height: 56px; font-size: 1.2rem; color: #334155;">
                                                ${initials}
                                            </div>
                                            <div class="dropdown">
                                                <button class="btn btn-sm btn-light rounded-circle shadow-sm" type="button" data-bs-toggle="dropdown">
                                                    <i class="bi bi-three-dots-vertical text-dark"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                                                    <li><a class="dropdown-item fw-bold" href="/manager/teams/${team.team_id}"><i class="bi bi-pencil me-2 text-primary"></i> Edit</a></li>
                                                    <li><hr class="dropdown-divider"></li>
                                                    <li><a class="dropdown-item fw-bold text-danger" href="#"><i class="bi bi-trash3 me-2"></i> Delete</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body p-4 bg-white d-flex flex-column">
                                        <h5 class="fw-bold mb-1 text-dark">${team.team_name}</h5>
                                        <p class="text-muted small mb-4 flex-grow-1">${team.description || "No description provided."}</p>
                                        <div class="d-flex justify-content-between align-items-center mt-auto">
                                            <span class="badge rounded-pill px-3 py-2" style="background-color: #f1f5f9; color: #475569;">
                                                <i class="bi bi-people-fill me-1"></i> Members
                                            </span>
                                            <a href="/manager/teams/${team.team_id}" class="btn btn-outline-primary btn-sm fw-bold rounded-pill px-4">View</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        $grid.append(cardHtml);
                    });
                } else {
                    $grid.html(`
                        <div class="col-12 text-center py-5">
                            <div class="p-5 rounded-4 shadow-sm" style="background-color: #fff; border: 2px dashed #cbd5e1;">
                                <i class="bi bi-people text-muted fs-1 mb-3 d-block"></i>
                                <h4 class="fw-bold text-dark">No teams found</h4>
                                <p class="text-muted">You haven't created any teams yet.</p>
                                <button type="button" class="btn text-white px-4 py-2 fw-bold mt-2 shadow-sm" style="background: #4f46e5; border-radius: 8px;" data-bs-toggle="modal" data-bs-target="#addTeamModal">
                                    Create Your First Team
                                </button>
                            </div>
                        </div>
                    `);
                }
            },
            error: function (xhr) {
                console.error("Error loading full teams:", xhr);
                $grid.html('<div class="col-12 text-center text-danger py-4 fw-bold">Error loading teams. Please refresh the page.</div>');
            }
        });
    }


    /* =====================================================
       3. TEAM INSIGHT: LOAD SINGLE TEAM DETAILS
    ===================================================== */
    function loadTeamInsight() {
        // Look for the global variable set in team_insight.ejs
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

        $.ajax({
            url: `/teams/${CURRENT_TEAM_ID}`,
            type: "GET",
            dataType: "json",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            success: function (result) {
                if (result.success) {
                    const team = result.data;
                    $("#teamName, #breadcrumbName").text(team.team_name);
                    $("#teamDescription").text(team.description || "No description provided.");
                    $("#teamAvatar").text(team.team_name.substring(0, 2).toUpperCase());
                } else {
                    $("#teamName").text("Team not found");
                    $("#teamDescription").text(result.message || "Unable to load team details.");
                }
            },
            error: function (xhr) {
                console.error("Failed to fetch team details:", xhr);
                $("#teamName").text("Error");
                $("#teamDescription").text("A network error occurred while loading this team.");
            }
        });
    }


    /* =====================================================
       4. CREATE TEAM FORM SUBMIT HANDLER
    ===================================================== */
    $(document).on("submit", "#createTeamForm", function (event) {
        event.preventDefault();

        const $form = $(this);
        const $submitButton = $form.find("button[type='submit']");
        const originalText = $submitButton.html();

        $submitButton.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span>');

        const teamData = {
            teamName: $("#teamName").val().trim(),
            description: $("#teamDescription").val().trim()
        };

        $.ajax({
            url: "/teams",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(teamData),
            headers: { "X-Requested-With": "XMLHttpRequest" },
            success: function (response) {
                if (response.success) {
                    // Close Bootstrap modal
                    const modalElement = document.getElementById("addTeamModal");
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) modalInstance.hide();

                    $form.trigger("reset");
                    $submitButton.prop("disabled", false).html(originalText);

                    // Dynamically refresh whichever UI is currently on the screen
                    if ($("#managerTeamListContainer").length) {
                        loadManagerTeams(); 
                    }
                    if ($("#fullTeamGrid").length) {
                        loadFullTeamGrid();
                    }
                }
            },
            error: function (xhr) {
                $submitButton.prop("disabled", false).html(originalText);
                alert(xhr.responseJSON?.message || "Failed to create team.");
            }
        });
    });


    /* =====================================================
       INITIALIZE
    ===================================================== */
    // Fire the functions. They will safely exit if their target container isn't on the page.
    loadManagerTeams();
    loadFullTeamGrid();
    loadTeamInsight();
});