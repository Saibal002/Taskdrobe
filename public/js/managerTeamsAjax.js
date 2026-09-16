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
            "padding-right": "4px",
          });

          result.data.forEach((team, index) => {
            const initials = team.team_name.substring(0, 2).toUpperCase();

            const html = `
                        <div class="manager-team-item">

                            <div class="manager-team-main">

                                <div class="manager-team-avatar">
                                    ${initials}
                                </div>

                                <div class="manager-team-info">

                                    <strong>
                                        ${team.team_name}
                                    </strong>

                                    <span>
                                        ${team.description || "No description provided."}
                                    </span>

                                </div>

                            </div>

                            <div class="manager-team-actions">

                                <a
                                    href="/manager/teams/${team.team_id}"
                                    class="manager-team-manage">
                                    Manage
                                </a>

                            </div>

                        </div>
                    `;

            $container.append(html);
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

      error: function (xhr) {
        console.error("Error loading teams:", xhr);

        $container.html(`
                <div class="manager-team-error">
                    Failed to load teams.
                </div>
            `);
      },
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

          result.data.forEach((team) => {
            const teamInitials = team.team_name.substring(0, 2).toUpperCase();

            // Parse the members array attached by your updated service
            const members = team.members || [];
            const memberCount = team.member_count || members.length || 0;
            const displayCount = Math.min(members.length, 3);
            let memberAvatarsHtml = "";

            for (let i = 0; i < displayCount; i++) {
              const member = members[i];
              const memberName = member.full_name || "Member";

              if (member.profile_image) {
                // Render actual profile image
                memberAvatarsHtml += `<img src="${member.profile_image}" alt="${memberName}" class="manager-team-member-avatar" title="${memberName}">`;
              } else {
                // Render initials if no profile image exists
                const nameParts = memberName.trim().split(" ");
                let initials = "";
                if (nameParts.length >= 2) {
                  initials = (
                    nameParts[0][0] + nameParts[nameParts.length - 1][0]
                  ).toUpperCase();
                } else {
                  initials = memberName.substring(0, 2).toUpperCase();
                }

                memberAvatarsHtml += `
                                <div class="manager-team-member-avatar manager-team-member-initial" title="${memberName}">
                                    ${initials}
                                </div>`;
              }
            }

            // Show a "+X" overflow bubble if there are more than 3 members
            if (memberCount > 3) {
              memberAvatarsHtml += `<div class="manager-team-member-overflow" title="${memberCount - 3} more">+${memberCount - 3}</div>`;
            }

            const cardHtml = `
    <article class="manager-team-card">

        <div class="manager-team-card-header">
            <div class="manager-team-card-avatar">
                ${teamInitials}
            </div>

            <div class="dropdown">
                <button
                    class="manager-team-card-menu"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>

                
<ul class="dropdown-menu dropdown-menu-end manager-team-card-dropdown">
    <li>
        <!-- Note the added class and data attributes -->
        <a class="dropdown-item edit-team-btn" href="#" data-team-id="${team.team_id}" data-team-name="${team.team_name}" data-team-desc="${team.description || ""}">
            <i class="bi bi-pencil"></i> Edit
        </a>
    </li>
    <li><hr class="dropdown-divider"></li>
    <li>
        <!-- Note the added class and data attribute -->
        <a class="dropdown-item text-danger delete-team-btn" href="#" data-team-id="${team.team_id}">
            <i class="bi bi-trash3"></i> Delete
        </a>
    </li>
</ul>
            </div>
        </div>

        <div class="manager-team-card-body">
            <div class="manager-team-card-title">
                ${team.team_name}
            </div>

            <div class="manager-team-card-description">
                ${team.description || "No description provided."}
            </div>
            
            <div class="manager-team-member-avatars-container">
                ${memberAvatarsHtml}
            </div>

            <div class="manager-team-card-footer">
                <span class="manager-team-members">
                    <i class="bi bi-people-fill"></i> ${memberCount} Members
                </span>

                <a href="/manager/teams/${team.team_id}" class="manager-team-view">
                    View <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        </div>
    </article>
`;
            $grid.append(cardHtml);
          });
        } else {
          $grid.html(`
                    <div class="col-12 text-center py-5" style="grid-column: 1 / -1;">
                        <div class="manager-empty-state" style="border: 1px dashed var(--md-border); border-radius: var(--md-radius-lg);">
                            <div class="manager-empty-icon">
                                <i class="bi bi-people text-muted"></i>
                            </div>
                            <h3 class="fw-bold text-dark">No teams found</h3>
                            <p class="text-muted">You haven't created any teams yet.</p>
                            <button type="button" class="manager-primary-button mt-2" data-bs-toggle="modal" data-bs-target="#addTeamModal">
                                Create Your First Team
                            </button>
                        </div>
                    </div>
                `);
        }
      },
      error: function (xhr) {
        console.error("Error loading full teams:", xhr);
        $grid.html(
          '<div class="col-12 text-center text-danger py-4 fw-bold" style="grid-column: 1 / -1;">Error loading teams. Please refresh the page.</div>',
        );
      },
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
          $("#teamDescription").text(
            team.description || "No description provided.",
          );
          $("#teamAvatar").text(team.team_name.substring(0, 2).toUpperCase());
        } else {
          $("#teamName").text("Team not found");
          $("#teamDescription").text(
            result.message || "Unable to load team details.",
          );
        }
      },
      error: function (xhr) {
        console.error("Failed to fetch team details:", xhr);
        $("#teamName").text("Error");
        $("#teamDescription").text(
          "A network error occurred while loading this team.",
        );
      },
    });
  }

 /* =====================================================
       4. CREATE / EDIT TEAM FORM SUBMIT HANDLER
    ===================================================== */
  $(document).on("submit", "#createTeamForm", function (event) {
    event.preventDefault();

    const $form = $(this);
    const $submitButton = $("#teamSubmitBtn");
    const originalText = $submitButton.html();

    $submitButton
      .prop("disabled", true)
      .html('<span class="spinner-border spinner-border-sm"></span>');

    const teamId = $("#teamId").val(); // Check if we are editing
    const isEdit = teamId !== ""; 

    const teamData = {
      teamName: $("#teamName").val().trim(),
      description: $("#teamDescription").val().trim(),
    };

    // Dynamically set URL and Method based on Create vs Edit
    const ajaxUrl = isEdit ? `/teams/${teamId}` : "/teams";
    const ajaxType = isEdit ? "PUT" : "POST";

    $.ajax({
      url: ajaxUrl,
      type: ajaxType,
      contentType: "application/json",
      data: JSON.stringify(teamData),
      headers: { "X-Requested-With": "XMLHttpRequest" },
      success: function (response) {
        if (response.success) {
          const modalElement = document.getElementById("addTeamModal");
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) modalInstance.hide();

          // Refresh UI
          if ($("#managerTeamListContainer").length) loadManagerTeams();
          if ($("#fullTeamGrid").length) loadFullTeamGrid();
        }
      },
      error: function (xhr) {
        $submitButton.prop("disabled", false).html(originalText);
        alert(xhr.responseJSON?.message || `Failed to ${isEdit ? 'update' : 'create'} team.`);
      },
    });
  });

  // RESET MODAL UI WHEN CLOSED
  // This ensures that when you click "New Team" after editing, it resets to a Create form
  $('#addTeamModal').on('hidden.bs.modal', function () {
      $("#createTeamForm").trigger("reset");
      $("#teamId").val("");
      $("#teamModalTitle").html('<i class="bi bi-people-fill me-2"></i> Create New Team');
      $("#teamSubmitBtn").prop("disabled", false).text("Create Team");
  });

  /* =====================================================
       5. DYNAMIC ASSIGNMENT DROPDOWNS
    ===================================================== */
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
            $select.append(
              `<option value="${emp.user_id}">${emp.full_name}</option>`,
            );
          });
        } else {
          $select.html("<option disabled>Failed to load</option>");
        }
      },
      error: function () {
        $select.html("<option disabled>Error loading</option>");
      },
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
            $select.append(
              `<option value="${member.user_id}">${member.full_name}</option>`,
            );
          });
        }
      },
    });
  });

  /* =====================================================
       6. TEAM INSIGHT: LOAD TAB DATA
    ===================================================== */
  /* =====================================================
       6. TEAM INSIGHT: LOAD TAB DATA (THEME UPDATED)
    ===================================================== */
  function loadTeamMembersList() {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
    const $tbody = $("#teamMembersTableBody");

    $.ajax({
      url: `/teams/${CURRENT_TEAM_ID}/members`,
      type: "GET",
      success: function (res) {
        if (res.success && res.data && res.data.length > 0) {
          $tbody.empty();
          $("#stat-total-members").text(res.data.length);

          res.data.forEach((member) => {
            // Reusing the avatar styles from the team cards
            const avatar = member.profile_image
              ? `<img src="${member.profile_image}" class="manager-team-member-avatar" style="margin: 0; width: 34px; height: 34px;">`
              : `<div class="manager-team-member-initial" style="margin: 0; width: 34px; height: 34px; border-radius: 50%;">${member.full_name.substring(0, 2).toUpperCase()}</div>`;

            const date = new Date(member.joined_at).toLocaleDateString();

            $tbody.append(`
                <tr class="manager-insight-table-row">
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            ${avatar}
                            <span style="color: var(--md-text); font-weight: 600; font-size: 13px;">${member.full_name}</span>
                        </div>
                    </td>
                    <td class="manager-insight-meta align-middle">${member.email}</td>
                    <td class="manager-insight-meta align-middle">${date}</td>
                    <td class="text-end align-middle">
                        <button class="manager-insight-remove-btn remove-member-btn" data-id="${member.user_id}">Remove</button>
                    </td>
                </tr>
            `);
          });
        } else {
          $tbody.html('<tr><td colspan="4" class="text-center manager-insight-meta py-4">No members in this team yet.</td></tr>');
          $("#stat-total-members").text("0");
        }
      },
    });
  }

  function loadTeamProjects() {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
    const $grid = $("#teamProjectsGrid");

    $.ajax({
      url: `/teams/${CURRENT_TEAM_ID}/projects`,
      type: "GET",
      success: function (res) {
        if (res.success && res.data && res.data.length > 0) {
          $grid.empty();
          $("#stat-active-projects").text(res.data.length);

          res.data.forEach((project) => {
            // Map database status to our existing dashboard CSS classes
            let statusClass = "not-started";
            if (project.status === 'Completed') statusClass = "completed";
            else if (project.status === 'In Progress') statusClass = "in-progress";
            else if (project.status === 'On Hold') statusClass = "on-hold";

            const date = project.deadline ? new Date(project.deadline).toLocaleDateString() : "No Deadline";

            $grid.append(`
                <div class="col-md-6 col-lg-4">
                    <div class="manager-insight-card h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="manager-project-status ${statusClass}"><span></span>${project.status}</span>
                            <span class="manager-insight-meta"><i class="bi bi-calendar-event me-1"></i>${date}</span>
                        </div>
                        <h5 class="manager-insight-title text-truncate">${project.project_name}</h5>
                        
                        <div class="mb-4 mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="manager-insight-meta">Progress</span>
                                <span style="color: var(--md-text); font-weight: 700; font-size: 11px;">${project.progress}%</span>
                            </div>
                            <!-- Reusing the dashboard progress track -->
                            <div class="manager-progress-track" style="background: var(--md-surface-soft); border: 1px solid var(--md-border);">
                                <div class="manager-progress-fill" style="width: ${project.progress}%;"></div>
                            </div>
                        </div>
                        
                        <a href="/projects/${project.project_id}" class="manager-insight-btn w-100">View Project</a>
                    </div>
                </div>
            `);
          });
        } else {
          $grid.html('<div class="col-12 text-center manager-insight-meta py-5"><i class="bi bi-folder-x fs-1 d-block mb-3"></i>No projects involve this team yet.</div>');
          $("#stat-active-projects").text("0");
        }
      },
      error: function () {
        $grid.html('<div class="col-12 text-center text-danger py-4">Failed to load projects.</div>');
      },
    });
  }

  function loadTeamTasks() {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;
    const $list = $("#teamTasksList");

    $.ajax({
      url: `/teams/${CURRENT_TEAM_ID}/tasks`,
      type: "GET",
      success: function (res) {
        if (res.success && res.data && res.data.length > 0) {
          $list.empty();
          
          let pendingCount = 0;
          let completedCount = 0;
          let overdueCount = 0;
          const today = new Date();

          res.data.forEach((task) => {
            // Chart calculations
            if (task.status === 'Completed') {
                completedCount++;
            } else if (task.due_date && new Date(task.due_date) < today) {
                overdueCount++;
                pendingCount++;
            } else {
                pendingCount++;
            }

            // Map styling
            let statusClass = task.status === 'Completed' ? 'completed' : 'in-progress';
            let priorityClass = task.priority === 'High' || task.priority === 'Critical' ? 'attention' : 'healthy';
            const date = task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Due Date";

            $list.append(`
                <div class="manager-insight-task-item">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <h6 class="manager-insight-task-title mb-1">${task.title}</h6>
                            <div class="manager-insight-meta mb-2">
                                <i class="bi bi-person-fill me-1"></i>${task.assigned_user} 
                                <span class="mx-2">•</span> 
                                <i class="bi bi-folder me-1"></i><a href="/projects/${task.project_id}" style="color: var(--md-primary); text-decoration: none; font-weight: 600;">${task.project_name}</a>
                            </div>
                            <span class="manager-project-health-state ${priorityClass} me-2">${task.priority} Priority</span>
                            <span class="manager-project-status ${statusClass}"><span></span>${task.status}</span>
                        </div>
                        <div class="manager-insight-date-badge">
                            <i class="bi bi-calendar3 me-1"></i> ${date}
                        </div>
                    </div>
                </div>
            `);
          });

          $("#stat-pending-tasks").text(pendingCount);

          // DRAW THE CHART
          const ctx = document.getElementById('teamPerformanceChart');
          if (ctx) {
              if(window.teamChart) window.teamChart.destroy(); // Prevent overlapping charts on reload
              window.teamChart = new Chart(ctx, {
                  type: 'doughnut',
                  data: {
                      labels: ['Completed', 'In Progress', 'Overdue'],
                      datasets: [{
                          data: [completedCount, (pendingCount - overdueCount), overdueCount],
                          backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                          borderWidth: 0,
                          hoverOffset: 4
                      }]
                  },
                  options: {
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '75%',
                      plugins: {
                          legend: { position: 'bottom' }
                      }
                  }
              });
          }

        } else {
          $list.html('<div class="text-center manager-insight-meta py-5"><i class="bi bi-check2-circle fs-1 d-block mb-3"></i>No tasks assigned to this team.</div>');
          $("#stat-pending-tasks").text("0");
        }
      },
      error: function () {
        $list.html('<div class="text-center text-danger py-4">Failed to load tasks.</div>');
      },
    });
  }

  $("#members-tab").on("shown.bs.tab", loadTeamMembersList);
  $("#projects-tab").on("shown.bs.tab", loadTeamProjects);
  $("#tasks-tab").on("shown.bs.tab", loadTeamTasks);

  if (typeof CURRENT_TEAM_ID !== "undefined" && CURRENT_TEAM_ID) {
    loadTeamMembersList();
  }

  /* =====================================================
       7. TEAM INSIGHT: FETCH AVAILABLE EMPLOYEES
    ===================================================== */
  $("#addTeamMemberModal").on("show.bs.modal", function () {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

    const $select = $("#newMemberUserId");
    $select.html('<option value="" disabled selected>Loading...</option>');

    $.ajax({
      url: `/teams/${CURRENT_TEAM_ID}/available-employees`,
      type: "GET",
      success: function (res) {
        if (res.success) {
          $select.empty();
          if (res.data.length === 0) {
            $select.append(
              '<option value="" disabled selected>No available employees to add</option>',
            );
          } else {
            $select.append(
              '<option value="" disabled selected>Choose an employee...</option>',
            );
            res.data.forEach((emp) => {
              $select.append(
                `<option value="${emp.user_id}">${emp.full_name} (${emp.email})</option>`,
              );
            });
          }
        }
      },
      error: function () {
        $select.html(
          '<option value="" disabled selected>Error loading employees</option>',
        );
      },
    });
  });

  /* =====================================================
       8. TEAM INSIGHT: ADD / REMOVE MEMBERS
    ===================================================== */
  $(document).on("submit", "#addTeamMemberForm", function (e) {
    e.preventDefault();
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

    const userId = $("#newMemberUserId").val();
    if (!userId) return;

    const $btn = $(this).find('button[type="submit"]');
    const originalText = $btn.html();

    $btn
      .prop("disabled", true)
      .html('<span class="spinner-border spinner-border-sm"></span>');

    $.ajax({
      url: `/teams/${CURRENT_TEAM_ID}/members`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ userId: userId }),
      success: function (res) {
        if (res.success) {
          const modalEl = document.getElementById("addTeamMemberModal");
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();

          $("#addTeamMemberForm")[0].reset();
          loadTeamMembersList();
        }
      },
      error: function (xhr) {
        alert(xhr.responseJSON?.message || "Failed to add member.");
      },
      complete: function () {
        $btn.prop("disabled", false).html(originalText);
      },
    });
  });

  $(document).on("click", ".remove-member-btn", function () {
    if (typeof CURRENT_TEAM_ID === "undefined" || !CURRENT_TEAM_ID) return;

    const userId = $(this).attr("data-id");

    if (
      window.confirm(
        "Are you sure you want to remove this employee from the team?",
      )
    ) {
      const $btn = $(this);
      $btn
        .prop("disabled", true)
        .html('<span class="spinner-border spinner-border-sm"></span>');

      $.ajax({
        url: `/teams/${CURRENT_TEAM_ID}/members/${userId}`,
        type: "DELETE",
        success: function (res) {
          if (res.success) {
            loadTeamMembersList();
          }
        },
        error: function (xhr) {
          alert(xhr.responseJSON?.message || "Failed to remove member.");
          $btn.prop("disabled", false).html("Remove");
        },
      });
    }
  });

 
  /* =====================================================
       9. TEAM CARD: EDIT AND DELETE ACTIONS
    ===================================================== */
    
  // DELETE TEAM ACTION
  $(document).on("click", ".delete-team-btn", function (e) {
      e.preventDefault();
      
      const teamId = $(this).data("team-id");
      
      if (!teamId) return;

      if (confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
          $.ajax({
              url: `/teams/${teamId}`, 
              type: "DELETE",
              headers: { "X-Requested-With": "XMLHttpRequest" },
              success: function (result) {
                  if (result.success) {
                      if ($("#fullTeamGrid").length) loadFullTeamGrid();
                      if ($("#managerTeamListContainer").length) loadManagerTeams(); 
                  } else {
                      alert(result.message || "Failed to delete team.");
                  }
              },
              error: function (xhr) {
                  console.error("Error deleting team:", xhr);
                  alert(xhr.responseJSON?.message || "An error occurred while deleting the team.");
              }
          });
      }
  });

  // EDIT TEAM ACTION (Opens the modal in Edit Mode)
  $(document).on("click", ".edit-team-btn", function (e) {
      e.preventDefault();
      const teamId = $(this).data("team-id");
      const teamName = $(this).data("team-name");
      const teamDesc = $(this).data("team-desc");

      // 1. Populate the hidden ID and inputs
      $("#teamId").val(teamId);
      $("#teamName").val(teamName);
      $("#teamDescription").val(teamDesc);
      
      // 2. Change the UI text to reflect Edit Mode
      $("#teamModalTitle").html('<i class="bi bi-pencil-square me-2"></i> Edit Team');
      $("#teamSubmitBtn").text("Save Changes");

      // 3. Open the Modal
      $("#addTeamModal").modal("show");
  });
    
    // Option B: If you use a modal for editing (uncomment and replace Option A)
    /*
    $(document).on("click", ".edit-team-btn", function (e) {
        e.preventDefault();
        const teamId = $(this).data("team-id");
        const teamName = $(this).data("team-name");
        const teamDesc = $(this).data("team-desc");

        // Populate your edit modal inputs (adjust IDs to match your HTML)
        $("#editTeamId").val(teamId);
        $("#editTeamName").val(teamName);
        $("#editTeamDescription").val(teamDesc);
        
        // Show the modal
        $("#editTeamModal").modal("show");
    });
    */

  /* =====================================================
       INITIALIZE
    ===================================================== */
  loadManagerTeams();
  loadFullTeamGrid();
  loadTeamInsight();
});
