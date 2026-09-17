$(document).ready(function () {
    // 1. Read Role to determine API paths (with a smart fallback if the data attribute is missing)
    let userRole = $("body").data("user-role"); 
    if (!userRole) {
        userRole = window.location.pathname.startsWith('/admin') ? 'admin' : 'manager';
    }
    
    // Dynamic URL routing based on role
    const gridUrl = userRole === 'admin' ? '/admin/teams' : '/teams/manager';
    const infoUrl = (teamId) => userRole === 'admin' ? `/admin/teams/${teamId}` : `/teams/${teamId}`;
    const apiBase = (teamId) => userRole === 'admin' ? `/admin/api/teams/${teamId}` : `/teams/${teamId}`;

    /* =====================================================
       2. MANAGER DASHBOARD: TEAM OVERVIEW WIDGET
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
                    $container.css({ "max-height": "260px", "overflow-y": "auto", "padding-right": "4px" });

                    result.data.forEach((team) => {
                        const initials = team.team_name.substring(0, 2).toUpperCase();
                        $container.append(`
                            <div class="manager-team-item">
                                <div class="manager-team-main">
                                    <div class="manager-team-avatar">${initials}</div>
                                    <div class="manager-team-info">
                                        <strong>${team.team_name}</strong>
                                        <span>${team.description || "No description provided."}</span>
                                    </div>
                                </div>
                                <div class="manager-team-actions">
                                    <a href="/manager/teams/${team.team_id}" class="manager-team-manage">Manage</a>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $container.html(`
                        <div class="manager-team-empty">
                            <i class="bi bi-people"></i>
                            <strong>No teams found</strong>
                            <span>Create a team to get started.</span>
                        </div>
                    `);
                }
            },
            error: function () {
                $container.html('<div class="manager-team-error text-danger p-3">Failed to load teams.</div>');
            }
        });
    }

    /* =====================================================
       3. GLOBAL / MANAGER TEAMS: LOAD FULL GRID
    ===================================================== */
    function loadFullTeamGrid() {
        const $grid = $("#fullTeamGrid");
        if (!$grid.length) return;

        $.ajax({
            url: gridUrl,
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (result.success && result.data.length > 0) {
                    $grid.empty();

                    result.data.forEach((team) => {
                        const teamInitials = team.team_name.substring(0, 2).toUpperCase();
                        const memberCount = team.member_count || (team.members ? team.members.length : 0);
                        
                        let headerExtra = userRole === 'admin' 
                            ? `<div class="badge bg-primary bg-opacity-10 text-primary fw-bold">Managed by: ${team.manager_name || "Unknown"}</div>`
                            : `<div class="dropdown">
                                <button class="manager-team-card-menu" type="button" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end manager-team-card-dropdown">
                                    <li><a class="dropdown-item edit-team-btn" href="#" data-team-id="${team.team_id}" data-team-name="${team.team_name}" data-team-desc="${team.description || ""}"><i class="bi bi-pencil"></i> Edit</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger delete-team-btn" href="#" data-team-id="${team.team_id}"><i class="bi bi-trash3"></i> Delete</a></li>
                                </ul>
                               </div>`;

                        const cardHtml = `
                        <div class="col-md-6 col-lg-4">
                            <article class="manager-team-card h-100" style="border: 1px solid var(--md-border); border-radius: var(--md-radius-lg); padding: 1.5rem; background: var(--md-surface);">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="manager-team-card-avatar" style="width: 48px; height: 48px; border-radius: 12px; background: var(--md-primary-soft); color: var(--md-primary); display: flex; align-items: center; justify-content: center; font-weight: 700;">${teamInitials}</div>
                                    ${headerExtra}
                                </div>
                                <div class="manager-team-card-title fw-bold fs-5 mb-1">${team.team_name}</div>
                                <div class="manager-team-card-description text-muted small mb-4">${team.description || "No description provided."}</div>
                                
                                <div class="d-flex justify-content-between align-items-center mt-auto">
                                    <span class="text-muted small fw-bold">
                                        <i class="bi bi-people-fill me-1"></i> ${memberCount} Members
                                    </span>
                                    <a href="${userRole === 'admin' ? `/admin/teams-view/${team.team_id}` : `/manager/teams/${team.team_id}`}" class="btn btn-sm btn-light text-primary fw-bold hover-lift">
                                        Insights <i class="bi bi-arrow-right ms-1"></i>
                                    </a>
                                </div>
                            </article>
                        </div>`;
                        $grid.append(cardHtml);
                    });
                } else {
                    $grid.html(`<div class="col-12 text-center py-5"><p class="text-muted">No teams found.</p></div>`);
                }
            }
        });
    }

    /* =====================================================
       4. TEAM INSIGHT: LOAD DETAILS & TABS
    ===================================================== */
    function loadTeamInsight() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

        $.ajax({
            url: infoUrl(CURRENT_TEAM_ID),
            type: "GET",
            success: function (result) {
                if (result.success) {
                    const team = result.data;
                    $("#teamName, #breadcrumbName").text(team.team_name);
                    $("#teamDescription").text(team.description || "No description provided.");
                    $("#teamAvatar").text(team.team_name.substring(0, 2).toUpperCase());
                }
            }
        });
    }

    function loadTeamMembersList() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        const $tbody = $("#teamMembersTableBody");

        $.ajax({
            url: `${apiBase(CURRENT_TEAM_ID)}/members`,
            type: "GET",
            success: function (res) {
                if (res.success && res.data.length > 0) {
                    $tbody.empty();
                    $("#stat-total-members").text(res.data.length);
                    res.data.forEach((member) => {
                        const avatar = member.profile_image
                            ? `<img src="${member.profile_image}" class="rounded-circle" style="width: 34px; height: 34px; object-fit: cover;">`
                            : `<div class="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold text-primary" style="width: 34px; height: 34px;">${member.full_name.substring(0, 2).toUpperCase()}</div>`;
                        
                        let actionBtn = userRole === 'manager' 
                            ? `<td class="text-end align-middle"><button class="btn btn-sm btn-outline-danger remove-member-btn" data-id="${member.user_id}">Remove</button></td>` 
                            : '';

                        $tbody.append(`
                            <tr>
                                <td><div class="d-flex align-items-center gap-3">${avatar}<span class="fw-bold text-dark">${member.full_name}</span></div></td>
                                <td class="text-muted align-middle">${member.email}</td>
                                <td class="text-muted align-middle">${new Date(member.joined_at).toLocaleDateString()}</td>
                                ${actionBtn}
                            </tr>
                        `);
                    });
                } else {
                    const colSpan = userRole === 'manager' ? 4 : 3;
                    $tbody.html(`<tr><td colspan="${colSpan}" class="text-center text-muted py-4">No members in this team.</td></tr>`);
                    $("#stat-total-members").text("0");
                }
            }
        });
    }

    function loadTeamProjects() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        const $grid = $("#teamProjectsGrid");

        $.ajax({
            url: `${apiBase(CURRENT_TEAM_ID)}/projects`,
            type: "GET",
            success: function (res) {
                if (res.success && res.data.length > 0) {
                    $grid.empty();
                    $("#stat-active-projects").text(res.data.length);
                    res.data.forEach((project) => {
                        const date = project.deadline ? new Date(project.deadline).toLocaleDateString() : "No Deadline";
                        $grid.append(`
                            <div class="col-md-6 col-lg-4">
                                <div class="admin-glass-panel h-100 p-4">
                                    <div class="d-flex justify-content-between mb-3">
                                        <span class="badge bg-primary bg-opacity-10 text-primary">${project.status}</span>
                                        <small class="text-muted"><i class="bi bi-calendar-event me-1"></i>${date}</small>
                                    </div>
                                    <h6 class="fw-bold text-truncate">${project.project_name}</h6>
                                    <div class="mt-4">
                                        <div class="d-flex justify-content-between mb-1 small fw-bold"><span>Progress</span><span>${project.progress}%</span></div>
                                        <div class="progress" style="height: 6px;"><div class="progress-bar bg-primary" style="width: ${project.progress}%"></div></div>
                                    </div>
                                    <a href="/projects/${project.project_id}" class="btn btn-sm btn-light w-100 mt-3 text-primary fw-bold hover-lift">View Project</a>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $grid.html('<div class="col-12 text-center py-5 text-muted">No projects found.</div>');
                    $("#stat-active-projects").text("0");
                }
            }
        });
    }

    function loadTeamTasks() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
        const $list = $("#teamTasksList");

        $.ajax({
            url: `${apiBase(CURRENT_TEAM_ID)}/tasks`,
            type: "GET",
            success: function (res) {
                if (res.success && res.data.length > 0) {
                    $list.empty();
                    let pendingCount = 0;
                    
                    res.data.forEach((task) => {
                        if (task.status !== 'Completed') {
                            pendingCount++; 
                        }

                        $list.append(`
                            <div class="list-group-item bg-transparent border-light p-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="fw-bold mb-1">${task.title}</h6>
                                        <small class="text-muted"><i class="bi bi-person me-1"></i>${task.assigned_user} • ${task.project_name}</small>
                                    </div>
                                    <span class="badge ${task.status === 'Completed' ? 'bg-success text-success' : 'bg-warning text-warning'} bg-opacity-10">${task.status}</span>
                                </div>
                            </div>
                        `);
                    });

                    $("#stat-pending-tasks").text(pendingCount);
                } else {
                    $list.html('<div class="text-center py-5 text-muted">No tasks assigned to this team.</div>');
                    $("#stat-pending-tasks").text("0");
                }
            } 
        });
    }
    
    function loadTeamAnalytics() {
        if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

        $.ajax({
            url: `${apiBase(CURRENT_TEAM_ID)}/analytics`,
            type: "GET",
            success: function (res) {
                if (res.success && res.data) {
                    const data = res.data;

                    $("#stat-completion-rate").text(`${data.overall.completionRate}%`);
                    const brandColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

                    // Chart 1: Workload Distribution (Doughnut)
                    const distCtx = document.getElementById('memberDistributionChart');
                    if (distCtx) {
                        if (window.distChart) window.distChart.destroy();
                        window.distChart = new Chart(distCtx, {
                            type: 'doughnut',
                            data: {
                                labels: data.memberStats.map(m => m.full_name),
                                datasets: [{
                                    data: data.memberStats.map(m => m.total_tasks),
                                    backgroundColor: brandColors,
                                    borderWidth: 0,
                                    hoverOffset: 4
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }
                        });
                    }

                    // Chart 2: Project Effort (Bar)
                    const projCtx = document.getElementById('projectEffortChart');
                    if (projCtx) {
                        if (window.projChart) window.projChart.destroy();
                        window.projChart = new Chart(projCtx, {
                            type: 'bar',
                            data: {
                                labels: data.projectStats.map(p => p.project_name),
                                datasets: [{
                                    label: 'Total Tasks',
                                    data: data.projectStats.map(p => p.total_tasks),
                                    backgroundColor: '#4f46e5',
                                    borderRadius: 4
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
                        });
                    }

                    // Chart 3: Individual Contribution (Horizontal Bar)
                    const indCtx = document.getElementById('individualContributionChart');
                    if (indCtx) {
                        if (window.indChart) window.indChart.destroy();
                        window.indChart = new Chart(indCtx, {
                            type: 'bar',
                            data: {
                                labels: data.memberStats.map(m => m.full_name),
                                datasets: [
                                    {
                                        label: 'Completed Tasks',
                                        data: data.memberStats.map(m => m.completed_tasks),
                                        backgroundColor: '#10b981',
                                        borderRadius: 4
                                    },
                                    {
                                        label: 'Assigned Tasks',
                                        data: data.memberStats.map(m => m.total_tasks),
                                        backgroundColor: '#e2e8f0',
                                        borderRadius: 4
                                    }
                                ]
                            },
                            options: { 
                                indexAxis: 'y', 
                                responsive: true, 
                                maintainAspectRatio: false, 
                                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } 
                            }
                        });
                    }
                }
            }
        });
    }

    // Bind Tabs
    $("#members-tab").on("shown.bs.tab", loadTeamMembersList);
    $("#projects-tab").on("shown.bs.tab", loadTeamProjects);
    $("#tasks-tab").on("shown.bs.tab", loadTeamTasks);
    $("#overview-tab").on("shown.bs.tab", loadTeamAnalytics);
    
    /* =====================================================
       5. MANAGER-ONLY CRUD OPERATIONS & MODALS
    ===================================================== */
    if (userRole === 'manager') {
        
        // 5.1 Create/Edit Team
        $(document).on("submit", "#createTeamForm", function (e) {
            e.preventDefault();
            const teamId = $("#teamId").val(); 
            const isEdit = teamId !== ""; 
            const url = isEdit ? `/teams/${teamId}` : "/teams";
            
            $.ajax({
                url: url,
                type: isEdit ? "PUT" : "POST",
                contentType: "application/json",
                data: JSON.stringify({ teamName: $("#teamName").val().trim(), description: $("#teamDescription").val().trim() }),
                success: function (res) {
                    if (res.success) {
                        bootstrap.Modal.getInstance(document.getElementById("addTeamModal"))?.hide();
                        loadFullTeamGrid();
                        if ($("#managerTeamListContainer").length) loadManagerTeams();
                    }
                }
            });
        });

        // 5.2 Edit Modal population
        $(document).on("click", ".edit-team-btn", function (e) {
            e.preventDefault();
            $("#teamId").val($(this).data("team-id"));
            $("#teamName").val($(this).data("team-name"));
            $("#teamDescription").val($(this).data("team-desc"));
            $("#teamModalTitle").html('<i class="bi bi-pencil-square me-2"></i> Edit Team');
            $("#addTeamModal").modal("show");
        });

        // 5.3 Delete Team
        $(document).on("click", ".delete-team-btn", function (e) {
            e.preventDefault();
            if (confirm("Are you sure?")) {
                $.ajax({
                    url: `/teams/${$(this).data("team-id")}`, 
                    type: "DELETE",
                    success: function (res) { 
                        if (res.success) {
                            loadFullTeamGrid(); 
                            if ($("#managerTeamListContainer").length) loadManagerTeams();
                        }
                    }
                });
            }
        });

        // 5.4 Load available employees for Add Member Modal
        $("#addTeamMemberModal").on("show.bs.modal", function () {
            if (!CURRENT_TEAM_ID) return;
            const $select = $("#newMemberUserId");
            $select.html('<option value="" disabled selected>Loading...</option>');
            $.ajax({
                url: `/teams/${CURRENT_TEAM_ID}/available-employees`,
                type: "GET",
                success: function (res) {
                    if (res.success) {
                        $select.empty();
                        res.data.length === 0 
                            ? $select.append('<option value="" disabled selected>No available employees</option>')
                            : $select.append('<option value="" disabled selected>Choose an employee...</option>');
                        res.data.forEach(emp => $select.append(`<option value="${emp.user_id}">${emp.full_name} (${emp.email})</option>`));
                    }
                }
            });
        });

        // 5.5 Submit New Member
        $(document).on("submit", "#addTeamMemberForm", function (e) {
            e.preventDefault();
            $.ajax({
                url: `/teams/${CURRENT_TEAM_ID}/members`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ userId: $("#newMemberUserId").val() }),
                success: function (res) {
                    if (res.success) {
                        bootstrap.Modal.getInstance(document.getElementById("addTeamMemberModal"))?.hide();
                        loadTeamMembersList();
                    }
                }
            });
        });

        // 5.6 Remove Member
        $(document).on("click", ".remove-member-btn", function () {
            if (confirm("Remove this employee from the team?")) {
                $.ajax({
                    url: `/teams/${CURRENT_TEAM_ID}/members/${$(this).attr("data-id")}`,
                    type: "DELETE",
                    success: function (res) { if (res.success) loadTeamMembersList(); }
                });
            }
        });

        // 5.7 Dynamic Assignment Dropdowns (Project / Task Modals)
        $("#addProjectModal").on("show.bs.modal", function () {
            const $select = $(this).find(".manager-subordinate-select");
            if (!$select.length || $select.children().length > 0) return;
            $select.html("<option disabled>Loading...</option>");
            $.ajax({
                url: "/teams/manager/subordinates",
                type: "GET",
                success: function (res) {
                    if (res.success) {
                        $select.empty();
                        res.data.forEach((emp) => {
                            $select.append(`<option value="${emp.user_id}">${emp.full_name}</option>`);
                        });
                    }
                }
            });
        });

        $("#addTaskModal").on("show.bs.modal", function () {
            const $select = $(this).find(".project-member-select");
            if (!$select.length || $select.children().length > 1) return;
            const projectId = $select.attr("data-project-id");
            $.ajax({
                url: `/projects/${projectId}/members/data`,
                type: "GET",
                success: function (res) {
                    if (res.success && res.members) {
                        res.members.forEach((member) => {
                            $select.append(`<option value="${member.user_id}">${member.full_name}</option>`);
                        });
                    }
                }
            });
        });
    }

    /* =====================================================
       INITIALIZATION
    ===================================================== */
    if ($("#managerTeamListContainer").length) loadManagerTeams();
    if ($("#fullTeamGrid").length) loadFullTeamGrid();
    if (typeof CURRENT_TEAM_ID !== "undefined" && CURRENT_TEAM_ID) {
        loadTeamInsight();
        loadTeamMembersList();
        loadTeamTasks(); 
        loadTeamAnalytics();
    }
});