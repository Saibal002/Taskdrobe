document.addEventListener("DOMContentLoaded", function () {
  console.log("Manager dashboard JS loaded");

  /* =====================================================
       SIDEBAR
    ===================================================== */

  const sidebar = document.getElementById("managerSidebar");

  const sidebarToggle = document.getElementById("managerSidebarToggle");

  const sidebarClose = document.getElementById("managerSidebarClose");

  const sidebarBackdrop = document.getElementById("managerSidebarBackdrop");

  function openSidebar() {
    if (!sidebar) return;

    sidebar.classList.add("is-open");

    sidebarBackdrop?.classList.add("is-visible");

    sidebarToggle?.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    if (!sidebar) return;

    sidebar.classList.remove("is-open");

    sidebarBackdrop?.classList.remove("is-visible");

    sidebarToggle?.setAttribute("aria-expanded", "false");
  }

  sidebarToggle?.addEventListener("click", openSidebar);

  sidebarClose?.addEventListener("click", closeSidebar);

  sidebarBackdrop?.addEventListener("click", closeSidebar);

  /* =====================================================
       PROJECT CARD NAVIGATION
    ===================================================== */

  $(document).on("click", ".manager-project-link", function (event) {
    if ($(event.target).closest(".manager-project-action").length) {
      return;
    }

    const url = $(this).attr("data-project-url");

    console.log("Opening project:", url);

    if (url) {
      window.location.href = url;
    }
  });

  /* =====================================================
       PROJECT KEYBOARD NAVIGATION
    ===================================================== */

  $(document).on("keydown", ".manager-project-link", function (event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    if ($(event.target).closest(".manager-project-action").length) {
      return;
    }

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

    console.log("Delete project:", projectId);

    if (!projectId) {
      alert("Project ID is missing.");

      return;
    }

    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    button
      .prop("disabled", true)
      .html('<span class="spinner-border spinner-border-sm"></span>');

    $.ajax({
      url: `/projects/${projectId}/delete`,

      type: "POST",

      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },

      success: function (response) {
        console.log("Delete response:", response);

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

                                        <div class="manager-empty-icon">

                                            <i class="bi bi-folder2-open"></i>

                                        </div>

                                        <h3>
                                            No projects yet
                                        </h3>

                                        <p>
                                            Create your first project
                                            to start managing your workspace.
                                        </p>

                                        <button
                                            type="button"
                                            class="manager-primary-button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#addProjectModal">

                                            <i class="bi bi-plus-lg"></i>

                                            Create Project

                                        </button>

                                    `;
          }
        });
      },

      error: function (xhr) {
        console.error("Delete project error:", xhr);

        button.prop("disabled", false).html('<i class="bi bi-trash3"></i>');

        alert(xhr.responseJSON?.message || "Unable to delete project.");
      },
    });
  });

  /* =====================================================
       THEME
    ===================================================== */

  const themeToggle = document.getElementById("themeToggle");

  const themeIcon = themeToggle?.querySelector("i");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon";
    }

    console.log("Theme:", theme);
  }

  const savedTheme = localStorage.getItem("appTheme") || "light";

  applyTheme(savedTheme);

  themeToggle?.addEventListener("click", function () {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";

    const next = current === "dark" ? "light" : "dark";

    localStorage.setItem("appTheme", next);

    applyTheme(next);
  });

  /* =====================================================
       GLOBAL SEARCH
    ===================================================== */

  const searchInput = document.getElementById("globalSearch");

  const clearSearch = document.getElementById("clearSearch");

  const searchResults = document.getElementById("searchResults");

  let searchTimer;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function closeSearch() {
    if (!searchResults) return;

    searchResults.innerHTML = "";

    searchResults.classList.add("d-none");
  }

  function renderSearchResults(data) {
    if (!searchResults) {
      return;
    }

    /*
     * Support the current API shape and
     * a couple of safe fallbacks.
     */

    const projects =
      data?.projects || data?.results?.projects || data?.data?.projects || [];

    const tasks =
      data?.tasks || data?.results?.tasks || data?.data?.tasks || [];

    let html = "";

    if (projects.length === 0 && tasks.length === 0) {
      html = `

                <div class="manager-search-empty">

                    <i class="bi bi-search"></i>

                    <span>
                        No projects or tasks found.
                    </span>

                </div>

            `;
    } else {
      /* PROJECTS */

      projects.forEach((project) => {
        const id = project.project_id ?? project.id;

        const name =
          project.project_name ?? project.title ?? "Untitled project";

        html += `

                        <a
                            href="/projects/${encodeURIComponent(id)}"
                            class="manager-search-result">

                            <span class="manager-search-result-icon">

                                <i class="bi bi-kanban"></i>

                            </span>

                            <span>

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>

                                <span>
                                    Project
                                </span>

                            </span>

                        </a>

                    `;
      });

      /* TASKS */

      tasks.forEach((task) => {
        const id = task.task_id ?? task.id;

        const name =
          task.task_title ?? task.title ?? task.name ?? "Untitled task";

        html += `

                        <a
                            href="/tasks/${encodeURIComponent(id)}/insight"
                            class="manager-search-result">

                            <span class="manager-search-result-icon">

                                <i class="bi bi-check2-square"></i>

                            </span>

                            <span>

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>

                                <span>
                                    Task
                                </span>

                            </span>

                        </a>

                    `;
      });
    }

    searchResults.innerHTML = html;

    searchResults.classList.remove("d-none");
  }

  async function search(query) {
    if (!query || query.length < 2) {
      closeSearch();

      return;
    }

    try {
      const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
      }

      const data = await response.json();

      console.log("Search response:", data);

      renderSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);

      if (searchResults) {
        searchResults.innerHTML = `

                    <div class="manager-search-empty">

                        <i class="bi bi-exclamation-circle"></i>

                        <span>
                            Search is currently unavailable.
                        </span>

                    </div>

                `;

        searchResults.classList.remove("d-none");
      }
    }
  }

  searchInput?.addEventListener("input", function () {
    const query = this.value.trim();

    if (clearSearch) {
      clearSearch.classList.toggle("d-none", query.length === 0);
    }

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => search(query), 250);
  });

  clearSearch?.addEventListener("click", function () {
    searchInput.value = "";

    closeSearch();

    this.classList.add("d-none");

    searchInput.focus();
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".app-navbar-search-wrapper, .manager-search-wrapper")) {
      closeSearch();
    }
  });

  /* =====================================================
       CTRL/CMD + K
    ===================================================== */

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();

      searchInput?.focus();
    }
  });

  /* =====================================================
       NOTIFICATIONS
    ===================================================== */

  const notificationButton = document.getElementById("notificationButton");

  const notificationDropdown = document.getElementById("notificationDropdown");

  const notificationList = document.getElementById("notificationList");

  const notificationBadge = document.getElementById("notificationBadge");

  const notificationHeaderCount = document.getElementById(
    "notificationHeaderCount",
  );

  const markAllButton = document.getElementById("markAllNotifications");

  const currentUserId = notificationButton?.dataset.userId;

  function updateNotificationBadge(count) {
    count = parseInt(count, 10) || 0;

    if (notificationBadge) {
      notificationBadge.textContent = count > 99 ? "99+" : count;

      notificationBadge.classList.toggle("d-none", count === 0);
    }

    if (notificationHeaderCount) {
      notificationHeaderCount.textContent = count;
    }
  }

 function getNotificationIcon(type) {

    switch (type) {

        case "task_created":
            return "bi bi-plus-circle";

        case "task_updated":
            return "bi bi-pencil-square";

        case "task_deleted":
            return "bi bi-trash3";

        case "task_assigned":
            return "bi bi-check2-square";

        case "task_status":
            return "bi bi-flag";

        case "task_comment":
            return "bi bi-chat-left-text";

        case "project_created":
            return "bi bi-folder-plus";

        case "project_updated":
            return "bi bi-folder";

        case "project_member":
            return "bi bi-person-plus";

        default:
            return "bi bi-bell";
    }

}

  function formatNotificationTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load notifications");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Notification request failed");
      }

      renderNotifications(result.notifications || []);
    } catch (error) {
      console.error("Notification error:", error);

      if (notificationList) {
        notificationList.innerHTML = `

                    <div class="manager-notification-empty">

                        <i class="bi bi-exclamation-circle"></i>

                        <span>
                            Unable to load notifications.
                        </span>

                    </div>

                `;
      }
    }
  }

  function renderNotifications(notifications) {
    if (!notificationList) {
      return;
    }

    notificationList.innerHTML = "";

    if (!notifications || notifications.length === 0) {
      notificationList.innerHTML = `

            <div class="manager-notification-empty">

                <i class="bi bi-bell-slash"></i>

                <span>
                    You're all caught up!
                </span>

            </div>

        `;

      updateNotificationBadge(0);

      markAllButton?.classList.add("d-none");

      const subtitle = document.getElementById("notificationSubtitle");

      if (subtitle) {
        subtitle.textContent = "You're all caught up";
      }

      return;
    }

    let unreadCount = 0;

    notifications.forEach(function (notification) {
      const isUnread = !notification.is_read;

      if (isUnread) {
        unreadCount++;
      }

      const item = document.createElement("div");

      item.className =
        "manager-notification-item" + (isUnread ? " unread" : " read");

      item.dataset.id = notification.notification_id;

      item.dataset.type = notification.type || "";

      item.dataset.referenceId = notification.reference_id || "";

      item.innerHTML = `

            <div class="manager-notification-item-icon
                ${isUnread ? "notification-unread-icon" : "notification-read-icon"}">

                <i class="${getNotificationIcon(notification.type)}"></i>

            </div>


            <div class="manager-notification-item-content">

                <div class="manager-notification-content-row">

                    <strong class="
                        ${
                          isUnread
                            ? "notification-unread-text"
                            : "notification-read-text"
                        }">

                        ${escapeHtml(
                          notification.content || "New notification",
                        )}

                    </strong>

                    ${
                      isUnread
                        ? `
                                <span
                                    class="notification-unread-dot">
                                </span>
                              `
                        : ""
                    }

                </div>


                <span>

                    ${escapeHtml(notification.sender_name || "System")}

                    ·

                    ${formatNotificationTime(notification.created_at)}

                </span>

            </div>

        `;

      notificationList.appendChild(item);
    });

    updateNotificationBadge(unreadCount);

    if (markAllButton) {
      markAllButton.classList.toggle("d-none", unreadCount === 0);
    }

    const subtitle = document.getElementById("notificationSubtitle");

    if (subtitle) {
      subtitle.textContent =
        unreadCount > 0
          ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
          : "You're all caught up";
    }
  }

  notificationButton?.addEventListener("click", function (event) {
    event.stopPropagation();

    const open = !notificationDropdown.classList.contains("d-none");

    if (open) {
      notificationDropdown.classList.add("d-none");

      notificationButton.setAttribute("aria-expanded", "false");
    } else {
      notificationDropdown.classList.remove("d-none");

      notificationButton.setAttribute("aria-expanded", "true");

      loadNotifications();
    }
  });

  notificationList?.addEventListener("click", async function (event) {
    const item = event.target.closest(".manager-notification-item");

    if (!item) {
      return;
    }

    const notificationId = item.dataset.id;

    const type = item.dataset.type;

    const referenceId = item.dataset.referenceId;

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        updateNotificationBadge(result.unreadCount);

        // Change item state
        item.classList.remove("unread");
        item.classList.add("read");

        // Change icon from red to muted
        const icon = item.querySelector(".manager-notification-item-icon");

        if (icon) {
          icon.classList.remove("notification-unread-icon");

          icon.classList.add("notification-read-icon");
        }

        // Change text from bold to normal
        const text = item.querySelector(
          ".manager-notification-item-content strong",
        );

        if (text) {
          text.classList.remove("notification-unread-text");

          text.classList.add("notification-read-text");
        }

        // Remove unread dot
        const dot = item.querySelector(".notification-unread-dot");

        dot?.remove();

        // Update "X unread notifications"
        const subtitle = document.getElementById("notificationSubtitle");

        if (subtitle) {
          const unreadCount = parseInt(result.unreadCount, 10) || 0;

          subtitle.textContent =
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up";
        }
      }
    } catch (error) {
      console.error("Notification read error:", error);
    }

    navigateFromNotification(type, referenceId);
  });

  markAllButton?.addEventListener("click", async function (event) {
    event.preventDefault();

    event.stopPropagation();

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const result = await response.json();

      if (result.success) {
        updateNotificationBadge(0);

        loadNotifications();
      }
    } catch (error) {
      console.error("Mark all notifications error:", error);
    }
  });

function navigateFromNotification(
    type,
    referenceId
) {

    if (!referenceId) {
        return;
    }


    switch (type) {

        case "task_created":
        case "task_updated":
        case "task_deleted":
        case "task_assigned":
        case "task_status":
        case "task_comment":

            window.location.href =
                `/tasks/${referenceId}/insight`;

            break;

        default:
            break;
    }

}

  /* =====================================================
       SOCKET.IO NOTIFICATIONS
    ===================================================== */

  if (typeof io !== "undefined" && currentUserId) {
    const notificationSocket = io("/notifications");

    notificationSocket.on("connect", function () {
      console.log(
        "🔔 Manager notification socket connected:",
        notificationSocket.id,
      );

      notificationSocket.emit("joinNotificationRoom", currentUserId);

      console.log("🔔 Joined notification room:", currentUserId);
    });

    notificationSocket.on("newSystemNotification", function (notification) {
      console.log("🔔 NEW MANAGER NOTIFICATION:", notification);

      loadNotifications();
    });

    notificationSocket.on("notificationCountUpdated", function (count) {
      console.log("🔔 Manager notification count:", count);

      updateNotificationBadge(count);
    });

    notificationSocket.on("connect_error", function (error) {
      console.error("❌ Notification socket connection error:", error);
    });
  } else {
    console.error("❌ Notification socket could not initialize.", {
      ioAvailable: typeof io !== "undefined",

      currentUserId: currentUserId,
    });
  }

  /*
   * Initial notifications.
   */
  loadNotifications();
});
