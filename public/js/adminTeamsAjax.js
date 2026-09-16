$(document).ready(function () {

  /* =====================================================
       1. GLOBAL TEAMS: LOAD FULL GRID
    ===================================================== */
  function loadFullTeamGrid() {
    const $grid = $("#fullTeamGrid");
    if (!$grid.length) return;

    $.ajax({
      url: "/admin/teams",
      type: "GET",
      dataType: "json",
      success: function (result) {
        if (result.success && result.data.length > 0) {
          $grid.empty();

          result.data.forEach((team) => {
            const teamInitials = team.team_name.substring(0, 2).toUpperCase();
            const managerName = team.manager_name || "Unknown Manager";
            const memberCount = team.member_count || 0;

            const cardHtml = `
            <div class="col-md-6 col-lg-4">
                <article class="manager-team-card h-100">
                    <div class="manager-team-card-header">
                        <div class="manager-team-card-avatar">${teamInitials}</div>
                        <div class="badge bg-primary bg-opacity-10 text-primary fw-bold">Managed by: ${managerName}</div>
                    </div>
                    <div class="manager-team-card-body">
                        <div class="manager-team-card-title">${team.team_name}</div>
                        <div class="manager-team-card-description">${team.description || "No description provided."}</div>
                        
                        <div class="manager-team-card-footer mt-4">
                            <span class="manager-team-members">
                                <i class="bi bi-people-fill"></i> ${memberCount} Members
                            </span>
                            <a href="/admin/teams-view/${team.team_id}" class="manager-team-view">
                                Insights <i class="bi bi-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </article>
            </div>`;
            $grid.append(cardHtml);
          });
        } else {
          $grid.html(`<div class="col-12 text-center py-5"><p class="text-muted">No teams exist in the system yet.</p></div>`);
        }
      },
      error: function () {
        $grid.html('<div class="col-12 text-center text-danger py-4">Error loading teams.</div>');
      },
    });
  }

  /* =====================================================
       2. TEAM INSIGHT: LOAD DETAILS
    ===================================================== */
  function loadTeamInsight() {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

    $.ajax({
      url: `/admin/teams/${CURRENT_TEAM_ID}`,
      type: "GET",
      success: function (result) {
        if (result.success) {
          const team = result.data;
          $("#teamName, #breadcrumbName").text(team.team_name);
          $("#teamDescription").text(team.description || "No description provided.");
          $("#teamAvatar").text(team.team_name.substring(0, 2).toUpperCase());
          // Optional: If you fetch manager name here, set it. Otherwise fallback.
          $("#managerNameBadge").text("Manager Access: Verified");
        }
      }
    });
  }

  function loadTeamMembersList() {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
    const $tbody = $("#teamMembersTableBody");

    $.ajax({
      url: `/admin/api/teams/${CURRENT_TEAM_ID}/members`,
      type: "GET",
      success: function (res) {
        if (res.success && res.data.length > 0) {
          $tbody.empty();
          $("#stat-total-members").text(res.data.length);
          res.data.forEach((member) => {
            const avatar = member.profile_image
              ? `<img src="${member.profile_image}" class="rounded-circle" style="width: 34px; height: 34px; object-fit: cover;">`
              : `<div class="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold text-primary" style="width: 34px; height: 34px;">${member.full_name.substring(0, 2).toUpperCase()}</div>`;
            
            $tbody.append(`
                <tr>
                    <td><div class="d-flex align-items-center gap-3">${avatar}<span class="fw-bold text-dark">${member.full_name}</span></div></td>
                    <td class="text-muted">${member.email}</td>
                    <td class="text-muted">${new Date(member.joined_at).toLocaleDateString()}</td>
                </tr>
            `);
          });
        } else {
          $tbody.html('<tr><td colspan="3" class="text-center text-muted py-4">No members in this team.</td></tr>');
          $("#stat-total-members").text("0");
        }
      }
    });
  }

  function loadTeamProjects() {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
    const $grid = $("#teamProjectsGrid");

    $.ajax({
      url: `/admin/api/teams/${CURRENT_TEAM_ID}/projects`,
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
      url: `/admin/api/teams/${CURRENT_TEAM_ID}/tasks`,
      type: "GET",
      success: function (res) {
        if (res.success && res.data.length > 0) {
          $list.empty();
          let pendingCount = 0; let completedCount = 0; let overdueCount = 0;
          const today = new Date();

          res.data.forEach((task) => {
            if (task.status === 'Completed') completedCount++;
            else if (task.due_date && new Date(task.due_date) < today) { overdueCount++; pendingCount++; }
            else pendingCount++;

            $list.append(`
                <div class="list-group-item bg-transparent border-light p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="fw-bold mb-1">${task.title}</h6>
                            <small class="text-muted"><i class="bi bi-person me-1"></i>${task.assigned_user} • ${task.project_name}</small>
                        </div>
                        <span class="badge ${task.status === 'Completed' ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${task.status === 'Completed' ? 'text-success' : 'text-warning'}">${task.status}</span>
                    </div>
                </div>
            `);
          });

          $("#stat-pending-tasks").text(pendingCount);

          // Draw the Admin Chart
          const ctx = document.getElementById('teamPerformanceChart');
          if (ctx) {
              if(window.teamChart) window.teamChart.destroy();
              window.teamChart = new Chart(ctx, {
                  type: 'doughnut',
                  data: {
                      labels: ['Completed', 'In Progress', 'Overdue'],
                      datasets: [{
                          data: [completedCount, (pendingCount - overdueCount), overdueCount],
                          backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                          borderWidth: 0, hoverOffset: 4
                      }]
                  },
                  options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }
              });
          }
        } else {
          $list.html('<div class="text-center py-5 text-muted">No tasks assigned to this team.</div>');
          $("#stat-pending-tasks").text("0");
        }
      }
    });
  }

  // Bind Tabs
  $("#members-tab").on("shown.bs.tab", loadTeamMembersList);
  $("#projects-tab").on("shown.bs.tab", loadTeamProjects);
  $("#tasks-tab").on("shown.bs.tab", loadTeamTasks);

  // Initialize
  if ($("#fullTeamGrid").length) loadFullTeamGrid();
  if (typeof CURRENT_TEAM_ID !== "undefined" && CURRENT_TEAM_ID) {
    loadTeamInsight();
    loadTeamMembersList();
    // Pre-load tasks to trigger the chart immediately on Overview
    loadTeamTasks(); 
  }
});