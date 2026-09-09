/* =========================================================
   TASKDROBE SHARED AUTHENTICATED NAVBAR
   - One JS controller for employee + manager navbar
   - Safe on pages where dashboard-specific JS is absent
========================================================= */

(function () {
    "use strict";

    window.escapeHtml = window.escapeHtml || function (value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    ready(function () {
        const navbar = document.querySelector("[data-navbar-role]");
        if (!navbar) return;

        const role = navbar.dataset.navbarRole || "employee";
        const currentUserId = navbar.querySelector("[data-user-id]")?.dataset.userId || "";

        // dashboard.js already owns theme/search on the employee dashboard.
        // Avoid double-binding those controls while still sharing notifications.
        const dashboardOwnsControls = document.body.classList.contains("employee-dashboard-page");
        if (!dashboardOwnsControls) {
            initTheme();
            initSearch();
        }
        initNotifications(role, currentUserId);
    });

    function initTheme() {
        const button = document.getElementById("themeToggle");
        if (!button) return;

        const root = document.documentElement;
        const body = document.body;
        const saved = localStorage.getItem("appTheme") || localStorage.getItem("theme") || "light";

        applyTheme(saved === "dark");

        if (button.dataset.navbarThemeBound === "true") return;
        button.dataset.navbarThemeBound = "true";

        button.addEventListener("click", function () {
            applyTheme(root.dataset.theme !== "dark");
        });

        function applyTheme(isDark) {
            root.dataset.theme = isDark ? "dark" : "light";
            body.classList.toggle("dark-theme", isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
            localStorage.setItem("appTheme", isDark ? "dark" : "light");

            const icon = button.querySelector("i");
            if (icon) {
                if (navbarIsManager(button)) {
                    icon.className = isDark ? "bi bi-sun" : "bi bi-moon";
                } else {
                    icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
                }
            }
        }
    }

    function navbarIsManager(button) {
        return button.closest('[data-navbar-role="manager"]') !== null;
    }

    function initSearch() {
        const input = document.getElementById("globalSearch");
        const results = document.getElementById("searchResults");
        const clear = document.getElementById("clearSearch");
        if (!input || !results) return;
        if (input.dataset.navbarSearchBound === "true") return;
        input.dataset.navbarSearchBound = "true";

        let timer = null;

        function close() {
            results.innerHTML = "";
            results.classList.add("d-none");
        }

        input.addEventListener("input", function () {
            const term = input.value.trim();
            clear?.classList.toggle("d-none", !term);
            clearTimeout(timer);

            if (!term) {
                close();
                return;
            }

            timer = setTimeout(async function () {
                results.innerHTML = '<div class="search-no-results"><i class="fas fa-spinner fa-spin"></i><div>Searching...</div></div>';
                results.classList.remove("d-none");

                try {
                    const response = await fetch(`/search?q=${encodeURIComponent(term)}`, {
                        headers: { "X-Requested-With": "XMLHttpRequest" }
                    });
                    if (!response.ok) throw new Error("Search request failed");
                    renderSearchResults(await response.json(), results);
                } catch (error) {
                    console.error("Search Error:", error);
                    results.innerHTML = '<div class="search-no-results"><i class="fas fa-exclamation-circle"></i><div>Unable to search.</div></div>';
                }
            }, 300);
        });

        clear?.addEventListener("click", function () {
            input.value = "";
            clear.classList.add("d-none");
            clearTimeout(timer);
            close();
            input.focus();
        });

        document.addEventListener("click", function (event) {
            const wrapper = input.closest(".search-wrapper, .employee-search-wrapper, .manager-search-wrapper, .app-navbar-search-wrapper");
            if (wrapper && !wrapper.contains(event.target)) close();
        });

        input.addEventListener("keydown", function (event) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                input.focus();
            }
            if (event.key === "Escape") {
                close();
                input.blur();
            }
        });
    }

    function renderSearchResults(data, container) {
        const projects = Array.isArray(data.projects) ? data.projects : [];
        const tasks = Array.isArray(data.tasks) ? data.tasks : [];

        if (!projects.length && !tasks.length) {
            container.innerHTML = '<div class="search-no-results"><i class="fas fa-search"></i><div>No results found.</div></div>';
            container.classList.remove("d-none");
            return;
        }

        let html = "";

        if (projects.length) {
            html += '<div class="search-result-section"><div class="search-result-title">Projects</div>';
            projects.forEach(function (project) {
                html += `
                    <a href="/projects/${encodeURIComponent(project.project_id)}" class="search-result-item">
                        <div class="search-result-icon"><i class="fas fa-folder"></i></div>
                        <div class="search-result-content">
                            <div class="search-result-name">${escapeHtml(project.project_name)}</div>
                            <div class="search-result-meta">${escapeHtml(project.status)} · ${project.progress ?? 0}%</div>
                        </div>
                    </a>`;
            });
            html += "</div>";
        }

        if (tasks.length) {
            html += '<div class="search-result-section"><div class="search-result-title">Tasks</div>';
            tasks.forEach(function (task) {
                html += `
                    <a href="/tasks/${encodeURIComponent(task.task_id)}/insight" class="search-result-item">
                        <div class="search-result-icon"><i class="fas fa-tasks"></i></div>
                        <div class="search-result-content">
                            <div class="search-result-name">${escapeHtml(task.title || task.task_title || "Untitled task")}</div>
                            <div class="search-result-meta">${escapeHtml(task.status || "Pending")}</div>
                        </div>
                    </a>`;
            });
            html += "</div>";
        }

        container.innerHTML = html;
        container.classList.remove("d-none");
    }

    function initNotifications(role, currentUserId) {
        const manager = role === "manager";
        const ids = manager
            ? {
                button: "notificationButton",
                dropdown: "notificationDropdown",
                list: "notificationList",
                badge: "notificationBadge",
                markAll: "markAllNotifications"
            }
            : {
                button: "systemBellIcon",
                dropdown: "systemNotificationDropdown",
                list: "systemNotificationList",
                badge: "systemBellBadge",
                count: "systemBellCount",
                markAll: "markAllNotificationsRead"
            };

        const button = document.getElementById(ids.button);
        const dropdown = document.getElementById(ids.dropdown);
        const list = document.getElementById(ids.list);
        const badge = document.getElementById(ids.badge);
        const markAll = document.getElementById(ids.markAll);

        if (!button || !dropdown || !list) return;
        if (button.dataset.navbarNotificationBound === "true") return;
        button.dataset.navbarNotificationBound = "true";

        function updateBadge(count) {
            count = Number.parseInt(count, 10) || 0;
            badge?.classList.toggle("d-none", count === 0);
            if (manager) {
                if (badge) badge.textContent = count > 99 ? "99+" : String(count);
            } else {
                const countNode = document.getElementById(ids.count);
                if (countNode) countNode.textContent = String(count);
            }
            const subtitle = document.getElementById("notificationSubtitle");
            if (subtitle) {
                subtitle.textContent = count > 0
                    ? `${count} unread notification${count === 1 ? "" : "s"}`
                    : "You're all caught up";
            }
            markAll?.classList.toggle("d-none", count === 0);
        }

        async function load() {
            try {
                const response = await fetch("/api/notifications", {
                    headers: { "X-Requested-With": "XMLHttpRequest" }
                });
                if (!response.ok) throw new Error("Unable to load notifications");
                const result = await response.json();
                if (!result.success) throw new Error(result.message || "Notification request failed");
                render(result.notifications || []);
            } catch (error) {
                console.error("Notification error:", error);
                list.innerHTML = manager
                    ? '<div class="manager-notification-empty"><i class="bi bi-exclamation-circle"></i><span>Unable to load notifications.</span></div>'
                    : '<div class="employee-notification-empty"><i class="fas fa-exclamation-circle"></i><div>Unable to load notifications.</div></div>';
            }
        }

        function render(notifications) {
            list.innerHTML = "";
            if (!notifications.length) {
                list.innerHTML = manager
                    ? '<div class="manager-notification-empty"><i class="bi bi-bell-slash"></i><span>You\'re all caught up!</span></div>'
                    : '<div class="employee-notification-empty"><i class="fas fa-bell-slash fa-2x opacity-50"></i><div class="fw-semibold">You\'re all caught up!</div><small>No system notifications.</small></div>';
                updateBadge(0);
                return;
            }

            let unread = 0;
            notifications.forEach(function (notification) {
                const isUnread = !notification.is_read;
                if (isUnread) unread++;

                const item = document.createElement("div");
                item.dataset.id = notification.notification_id;
                item.dataset.type = notification.type || "";
                item.dataset.referenceId = notification.reference_id || "";

                if (manager) {
                    item.className = "manager-notification-item" + (isUnread ? " unread" : " read");
                    item.innerHTML = `
                        <div class="manager-notification-item-icon ${isUnread ? "notification-unread-icon" : "notification-read-icon"}">
                            <i class="${getNotificationIcon(notification.type, true)}"></i>
                        </div>
                        <div class="manager-notification-item-content">
                            <div class="manager-notification-content-row">
                                <strong class="${isUnread ? "notification-unread-text" : "notification-read-text"}">${escapeHtml(notification.content || "New notification")}</strong>
                                ${isUnread ? '<span class="notification-unread-dot"></span>' : ""}
                            </div>
                            <span>${escapeHtml(notification.sender_name || "System")} · ${formatTime(notification.created_at)}</span>
                        </div>`;
                } else {
                    item.className = "notification-item" + (isUnread ? " bg-light" : "");
                    item.innerHTML = `
                        <div class="d-flex gap-3">
                            <div class="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center ${isUnread ? "bg-danger text-white" : "bg-light text-muted"}" style="width:38px;height:38px;">
                                <i class="${getNotificationIcon(notification.type, false)}"></i>
                            </div>
                            <div class="flex-grow-1 min-w-0">
                                <div class="d-flex justify-content-between gap-2">
                                    <div class="small ${isUnread ? "fw-bold text-dark" : "text-dark"}">${escapeHtml(notification.content || "New notification")}</div>
                                    ${isUnread ? '<span class="rounded-circle bg-danger flex-shrink-0" style="width:7px;height:7px;margin-top:5px;"></span>' : ""}
                                </div>
                                <div class="small text-muted mt-1">${escapeHtml(notification.sender_name || "System")} · ${formatTime(notification.created_at)}</div>
                            </div>
                        </div>`;
                }
                list.appendChild(item);
            });
            updateBadge(unread);
        }

        button.addEventListener("click", function (event) {
            event.stopPropagation();
            const opening = dropdown.classList.contains("d-none");
            dropdown.classList.toggle("d-none", !opening);
            button.setAttribute("aria-expanded", String(opening));
            if (opening) load();
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(`#${ids.button}, #${ids.dropdown}`)) {
                dropdown.classList.add("d-none");
                button.setAttribute("aria-expanded", "false");
            }
        });

        list.addEventListener("click", async function (event) {
            const item = event.target.closest(manager ? ".manager-notification-item" : ".notification-item");
            if (!item) return;
            const id = item.dataset.id;
            const type = item.dataset.type;
            const referenceId = item.dataset.referenceId;
            try {
                const response = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
                    method: "PATCH",
                    headers: { "X-Requested-With": "XMLHttpRequest" }
                });
                const result = await response.json();
                if (result.success) {
                    updateBadge(result.unreadCount);
                    item.classList.remove("unread", "bg-light");
                    item.classList.add("read");
                }
            } catch (error) {
                console.error("Notification read error:", error);
            }
            navigateFromNotification(type, referenceId);
        });

        markAll?.addEventListener("click", async function (event) {
            event.preventDefault();
            event.stopPropagation();
            try {
                const response = await fetch("/api/notifications/read-all", {
                    method: "PATCH",
                    headers: { "X-Requested-With": "XMLHttpRequest" }
                });
                const result = await response.json();
                if (result.success) {
                    updateBadge(0);
                    await load();
                }
            } catch (error) {
                console.error("Mark all notifications error:", error);
            }
        });

        if (typeof io !== "undefined" && currentUserId) {
            const socket = io("/notifications");
            socket.on("connect", function () {
                socket.emit("joinNotificationRoom", currentUserId);
            });
            socket.on("newSystemNotification", load);
            socket.on("notificationCountUpdated", updateBadge);
            socket.on("connect_error", function (error) {
                console.error("Notification socket connection error:", error);
            });
        }

        load();
    }

    function getNotificationIcon(type, manager) {
        if (manager) {
            switch (type) {
                case "task_assigned": return "bi bi-check2-square";
                case "task_status": return "bi bi-flag";
                case "task_comment": return "bi bi-chat-left-text";
                case "project_created": return "bi bi-folder-plus";
                case "project_updated": return "bi bi-folder";
                case "project_member": return "bi bi-person-plus";
                default: return "bi bi-bell";
            }
        }
        switch (type) {
            case "task_assigned": return "fas fa-tasks";
            case "task_status": return "fas fa-flag";
            case "task_comment": return "fas fa-comments";
            case "project_created": return "fas fa-folder-plus";
            case "project_updated": return "fas fa-folder";
            case "project_member": return "fas fa-user-plus";
            default: return "fas fa-bell";
        }
    }

    function formatTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function navigateFromNotification(type, referenceId) {
        if (!referenceId) return;
        switch (type) {
            case "task_created":
            case "task_updated":
            case "task_deleted":
            case "task_assigned":
            case "task_status":
            case "task_comment":
                window.location.href = `/tasks/${encodeURIComponent(referenceId)}/insight`;
                break;
            default:
                break;
        }
    }
})();
