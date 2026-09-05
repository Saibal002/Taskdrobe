$(document).ready(function () {
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
                    $container.empty(); 
                    
                    $container.css({
                        "max-height": "260px",
                        "overflow-y": "auto",
                        "padding-right": "4px"
                    });

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
                    const modalElement = document.getElementById("addTeamModal");
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) modalInstance.hide();

                    $form.trigger("reset");
                    $submitButton.prop("disabled", false).html(originalText);

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
       5. DYNAMIC ASSIGNMENT DROPDOWNS
    ===================================================== */
    $('#addProjectModal').on('show.bs.modal', function () {
        const $select = $(this).find('.manager-subordinate-select');
        if (!$select.length || $select.children().length > 0) return; 
        
        $select.html('<option disabled>Loading...</option>');

        $.ajax({
            url: '/teams/manager/subordinates',
            type: 'GET',
            success: function (res) {
                if (res.success) {
                    $select.empty();
                    res.data.forEach(emp => {
                        $select.append(`<option value="${emp.user_id}">${emp.full_name}</option>`);
                    });
                } else {
                    $select.html('<option disabled>Failed to load</option>');
                }
            },
            error: function () {
                $select.html('<option disabled>Error loading</option>');
            }
        });
    });

    $('#addTaskModal').on('show.bs.modal', function () {
        const $select = $(this).find('.project-member-select');
        if (!$select.length || $select.children().length > 1) return; 
        
        const projectId = $select.attr('data-project-id');

        $.ajax({
            url: `/projects/${projectId}/members/data`,
            type: 'GET',
            success: function (res) {
                if (res.success && res.members) {
                    res.members.forEach(member => {
                        $select.append(`<option value="${member.user_id}">${member.full_name}</option>`);
                    });
                }
            }
        });
    });

    /* =====================================================
       6. TEAM INSIGHT: LOAD TAB DATA
    ===================================================== */
    function loadTeamMembersList() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        const $tbody = $("#teamMembersTableBody");
        
        $.ajax({
            url: `/teams/${CURRENT_TEAM_ID}/members`,
            type: "GET",
            success: function(res) {
                if (res.success && res.data && res.data.length > 0) {
                    $tbody.empty();
                    $("#stat-total-members").text(res.data.length); 
                    
                    res.data.forEach(member => {
                        const avatar = member.profile_image 
                            ? `<img src="${member.profile_image}" class="rounded-circle me-2" width="32" height="32">` 
                            : `<div class="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center me-2 fw-bold" style="width: 32px; height: 32px; font-size: 0.8rem;">${member.full_name.substring(0,2).toUpperCase()}</div>`;
                        
                        const date = new Date(member.joined_at).toLocaleDateString();
                        
                        $tbody.append(`
                            <tr>
                                <td>${avatar} <span class="fw-bold">${member.full_name}</span></td>
                                <td class="text-muted">${member.email}</td>
                                <td>${date}</td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-danger rounded-pill remove-member-btn" data-id="${member.user_id}">Remove</button>
                                </td>
                            </tr>
                        `);
                    });
                } else {
                    $tbody.html('<tr><td colspan="4" class="text-center text-muted py-4">No members in this team yet.</td></tr>');
                    $("#stat-total-members").text("0");
                }
            }
        });
    }

  function loadTeamProjects() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        const $grid = $("#teamProjectsGrid");
        
        $.ajax({
            url: `/teams/${CURRENT_TEAM_ID}/projects`,
            type: "GET",
            success: function(res) {
                if (res.success && res.data && res.data.length > 0) {
                    $grid.empty();
                    $("#stat-active-projects").text(res.data.length); 
                    
                    res.data.forEach(project => {
                        const statusColor = project.status === 'Completed' ? 'success' : 
                                          project.status === 'In Progress' ? 'primary' : 'warning';
                        
                        const date = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline';
                        
                        $grid.append(`
                            <div class="col-md-6 col-lg-4">
                                <div class="card h-100 border-0 shadow-sm rounded-4">
                                    <div class="card-body p-4">
                                        <div class="d-flex justify-content-between mb-3">
                                            <span class="badge bg-${statusColor} bg-opacity-10 text-${statusColor} rounded-pill px-3 py-2">${project.status}</span>
                                            <span class="text-muted small"><i class="bi bi-calendar-event me-1"></i>${date}</span>
                                        </div>
                                        <h5 class="fw-bold mb-3 text-truncate">${project.project_name}</h5>
                                        <div class="mb-3">
                                            <div class="d-flex justify-content-between small mb-1">
                                                <span class="text-muted">Progress</span>
                                                <span class="fw-bold">${project.progress}%</span>
                                            </div>
                                            <div class="progress" style="height: 6px;">
                                                <div class="progress-bar bg-${statusColor}" role="progressbar" style="width: ${project.progress}%"></div>
                                            </div>
                                        </div>
                                        <a href="/projects/${project.project_id}" class="btn btn-sm btn-outline-primary w-100 rounded-pill fw-bold">View Project</a>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $grid.html('<div class="col-12 text-center text-muted py-5"><i class="bi bi-folder-x fs-1 d-block mb-3"></i>No projects involve this team yet.</div>');
                    $("#stat-active-projects").text("0"); 
                }
            },
            error: function() {
                $grid.html('<div class="col-12 text-center text-danger py-4">Failed to load projects.</div>');
            }
        });
    }

    function loadTeamTasks() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        const $list = $("#teamTasksList");
        
        $.ajax({
            url: `/teams/${CURRENT_TEAM_ID}/tasks`,
            type: "GET",
            success: function(res) {
                if (res.success && res.data && res.data.length > 0) {
                    $list.empty();
                    
                    // Filter pending tasks for the stat counter
                    const pendingCount = res.data.filter(t => t.status !== 'Completed').length;
                    $("#stat-pending-tasks").text(pendingCount);
                    
                    res.data.forEach(task => {
                        const statusColor = task.status === 'Completed' ? 'success' : 'primary';
                        const priorityColor = task.priority === 'High' || task.priority === 'Critical' ? 'danger' : 'secondary';
                        const date = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due Date';
                        
                        $list.append(`
                            <div class="list-group-item border-0 border-bottom py-3 px-0">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="fw-bold mb-1">${task.title}</h6>
                                        <div class="small text-muted mb-2">
                                            <i class="bi bi-person-fill me-1"></i>${task.assigned_user} 
                                            <span class="mx-2">•</span> 
                                            <i class="bi bi-folder me-1"></i><a href="/projects/${task.project_id}" class="text-decoration-none">${task.project_name}</a>
                                        </div>
                                        <span class="badge bg-${priorityColor} bg-opacity-10 text-${priorityColor} rounded-pill me-2">${task.priority} Priority</span>
                                        <span class="badge bg-${statusColor} bg-opacity-10 text-${statusColor} rounded-pill">${task.status}</span>
                                    </div>
                                    <div class="text-end text-muted small fw-bold bg-light px-3 py-2 rounded-3">
                                        <i class="bi bi-calendar3 me-1"></i> ${date}
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $list.html('<div class="text-center text-muted py-5"><i class="bi bi-check2-circle fs-1 d-block mb-3"></i>No tasks assigned to this team.</div>');
                    $("#stat-pending-tasks").text("0");
                }
            },
            error: function() {
                $list.html('<div class="text-center text-danger py-4">Failed to load tasks.</div>');
            }
        });
    }

    $('#members-tab').on('shown.bs.tab', loadTeamMembersList);
    $('#projects-tab').on('shown.bs.tab', loadTeamProjects);
    $('#tasks-tab').on('shown.bs.tab', loadTeamTasks);

    if (typeof CURRENT_TEAM_ID !== "undefined" && CURRENT_TEAM_ID) {
        loadTeamMembersList(); 
    }

    /* =====================================================
       7. TEAM INSIGHT: FETCH AVAILABLE EMPLOYEES
    ===================================================== */
    $('#addTeamMemberModal').on('show.bs.modal', function () {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        
        const $select = $("#newMemberUserId");
        $select.html('<option value="" disabled selected>Loading...</option>');

        $.ajax({
            url: `/teams/${CURRENT_TEAM_ID}/available-employees`,
            type: "GET",
            success: function(res) {
                if (res.success) {
                    $select.empty();
                    if (res.data.length === 0) {
                        $select.append('<option value="" disabled selected>No available employees to add</option>');
                    } else {
                        $select.append('<option value="" disabled selected>Choose an employee...</option>');
                        res.data.forEach(emp => {
                            $select.append(`<option value="${emp.user_id}">${emp.full_name} (${emp.email})</option>`);
                        });
                    }
                }
            },
            error: function() {
                $select.html('<option value="" disabled selected>Error loading employees</option>');
            }
        });
    });

    /* =====================================================
       8. TEAM INSIGHT: ADD / REMOVE MEMBERS
    ===================================================== */
    $(document).on("submit", "#addTeamMemberForm", function(e) {
        e.preventDefault();
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

        const userId = $("#newMemberUserId").val();
        if (!userId) return;

        const $btn = $(this).find('button[type="submit"]');
        const originalText = $btn.html();

        $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span>');

        $.ajax({
            url: `/teams/${CURRENT_TEAM_ID}/members`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ userId: userId }),
            success: function(res) {
                if (res.success) {
                    const modalEl = document.getElementById('addTeamMemberModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    
                    $("#addTeamMemberForm")[0].reset();
                    loadTeamMembersList();
                }
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.message || "Failed to add member.");
            },
            complete: function() {
                $btn.prop("disabled", false).html(originalText);
            }
        });
    });

    $(document).on("click", ".remove-member-btn", function() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        
        const userId = $(this).attr("data-id");
        
        if (window.confirm("Are you sure you want to remove this employee from the team?")) {
            const $btn = $(this);
            $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span>');

            $.ajax({
                url: `/teams/${CURRENT_TEAM_ID}/members/${userId}`,
                type: "DELETE",
                success: function(res) {
                    if (res.success) {
                        loadTeamMembersList();
                    }
                },
                error: function(xhr) {
                    alert(xhr.responseJSON?.message || "Failed to remove member.");
                    $btn.prop("disabled", false).html('Remove');
                }
            });
        }
    });

    /* =====================================================
       INITIALIZE
    ===================================================== */
    loadManagerTeams();
    loadFullTeamGrid();
    loadTeamInsight();
});