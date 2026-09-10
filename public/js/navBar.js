/* =========================================================
   TASKDROBE — SHARED AUTHENTICATED NAVBAR CONTROLLER
   Single source of truth for Sidebar, Theme, Search, and Notifications.
========================================================= */
(function () {
    "use strict";

    const ready = (fn) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    };

    const escapeHtml = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    window.escapeHtml = window.escapeHtml || escapeHtml;

    ready(function () {
        const navbar = document.querySelector(".app-navbar[data-navbar-role]");
        if (!navbar) return;

        const userId = navbar.querySelector("#notificationButton")?.dataset.userId || "";

        initSidebar();
        initTheme();
        initSearch();
        initNotifications(userId);
    });

    function initSidebar() {
        const sidebar = document.getElementById("appSidebar");
        const toggle = document.getElementById("appSidebarToggle");
        const close = document.getElementById("appSidebarClose");
        const backdrop = document.getElementById("appSidebarBackdrop");
        if (!sidebar || sidebar.dataset.controllerBound === "true") return;

        sidebar.dataset.controllerBound = "true";

        const closeSidebar = () => {
            sidebar.classList.remove("is-open");
            backdrop?.classList.remove("is-visible");
            toggle?.setAttribute("aria-expanded", "false");
            document.body.classList.remove("sidebar-open");
        };

        const openSidebar = () => {
            sidebar.classList.add("is-open");
            backdrop?.classList.add("is-visible");
            toggle?.setAttribute("aria-expanded", "true");
            document.body.classList.add("sidebar-open");
        };

        toggle?.addEventListener("click", function () {
            sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar();
        });
        close?.addEventListener("click", closeSidebar);
        backdrop?.addEventListener("click", closeSidebar);

        sidebar.querySelectorAll("a:not(.app-sidebar-disabled)").forEach((link) => {
            link.addEventListener("click", function () {
                if (window.innerWidth <= 991) closeSidebar();
            });
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 991) closeSidebar();
        });
    }

    function initTheme() {
        const button = document.getElementById("themeToggle");
        if (!button || button.dataset.bound === "true") return;
        button.dataset.bound = "true";

        const root = document.documentElement;
        const apply = (theme) => {
            const dark = theme === "dark";
            root.dataset.theme = dark ? "dark" : "light";
            document.body.classList.toggle("dark-theme", dark);
            localStorage.setItem("theme", dark ? "dark" : "light");
            localStorage.setItem("appTheme", dark ? "dark" : "light");
            const icon = button.querySelector("i");
            if (icon) icon.className = dark ? "bi bi-sun" : "bi bi-moon";
        };

        apply(localStorage.getItem("appTheme") || localStorage.getItem("theme") || "light");

        button.addEventListener("click", function () {
            apply(root.dataset.theme === "dark" ? "light" : "dark");
        });
    }

    function initSearch() {
        const input = document.getElementById("globalSearch");
        const clear = document.getElementById("clearSearch");
        const results = document.getElementById("searchResults");
        if (!input || !results || input.dataset.bound === "true") return;
        input.dataset.bound = "true";

        let timer = null;

        const close = () => {
            results.innerHTML = "";
            results.classList.add("d-none");
        };

        const render = (data) => {
            const projects = Array.isArray(data?.projects) ? data.projects : (data?.results?.projects || []);
            const tasks = Array.isArray(data?.tasks) ? data.tasks : (data?.results?.tasks || []);

            if (!projects.length && !tasks.length) {
                results.innerHTML = '<div class="app-navbar-search-empty"><i class="bi bi-search"></i><span>No results found.</span></div>';
                results.classList.remove("d-none");
                return;
            }

            let html = "";
            if (projects.length) {
                html += '<div class="app-navbar-search-section"><div class="app-navbar-search-title">Projects</div>';
                projects.forEach((project) => {
                    const id = project.project_id ?? project.id;
                    const name = project.project_name ?? project.title ?? "Untitled project";
                    html += `<a href="/projects/${encodeURIComponent(id)}" class="app-navbar-search-result">
                        <span class="app-navbar-search-result-icon"><i class="bi bi-folder2-open"></i></span>
                        <span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(project.status || "Project")} · ${project.progress ?? 0}%</small></span>
                    </a>`;
                });
                html += "</div>";
            }

            if (tasks.length) {
                html += '<div class="app-navbar-search-section"><div class="app-navbar-search-title">Tasks</div>';
                tasks.forEach((task) => {
                    const id = task.task_id ?? task.id;
                    const title = task.task_title ?? task.title ?? task.name ?? "Untitled task";
                    html += `<a href="/tasks/${encodeURIComponent(id)}/insight" class="app-navbar-search-result">
                        <span class="app-navbar-search-result-icon"><i class="bi bi-check2-square"></i></span>
                        <span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(task.status || "Task")}</small></span>
                    </a>`;
                });
                html += "</div>";
            }

            results.innerHTML = html;
            results.classList.remove("d-none");
        };

        input.addEventListener("input", function () {
            const query = input.value.trim();
            clear?.classList.toggle("d-none", !query);
            clearTimeout(timer);
            if (!query) return close();

            timer = setTimeout(async () => {
                results.innerHTML = '<div class="app-navbar-search-empty"><i class="bi bi-hourglass-split"></i><span>Searching...</span></div>';
                results.classList.remove("d-none");
                try {
                    const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
                        headers: { "X-Requested-With": "XMLHttpRequest" }
                    });
                    if (!response.ok) throw new Error("Search request failed");
                    render(await response.json());
                } catch (error) {
                    results.innerHTML = '<div class="app-navbar-search-empty"><i class="bi bi-exclamation-circle"></i><span>Unable to search.</span></div>';
                }
            }, 250);
        });

        clear?.addEventListener("click", function () {
            input.value = "";
            clear.classList.add("d-none");
            clearTimeout(timer);
            close();
            input.focus();
        });

        document.addEventListener("click", function (event) {
            const wrapper = input.closest(".app-navbar-search-wrapper");
            if (wrapper && !wrapper.contains(event.target)) close();
        });

        document.addEventListener("keydown", function (event) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                input.focus();
            }
            if (event.key === "Escape") close();
        });
    }

    function initNotifications(userId) {
        const button = document.getElementById("notificationButton");
        const dropdown = document.getElementById("notificationDropdown");
        const list = document.getElementById("notificationList");
        const badge = document.getElementById("notificationBadge");
        const subtitle = document.getElementById("notificationSubtitle");
        const markAll = document.getElementById("markAllNotifications");
        if (!button || !dropdown || !list) return;

        const updateBadge = (count) => {
            count = Number(count) || 0;
            badge.textContent = count > 99 ? "99+" : String(count);
            badge.classList.toggle("d-none", count === 0);
            subtitle.textContent = count
                ? `${count} unread notification${count === 1 ? "" : "s"}`
                : "You're all caught up";
            markAll?.classList.toggle("d-none", count === 0);
        };

        const iconFor = (type) => {
            switch (type) {
                case "task_assigned": return "bi bi-person-check";
                case "task_status": return "bi bi-flag";
                case "task_comment": return "bi bi-chat-dots";
                case "project_created": return "bi bi-folder-plus";
                case "project_updated": return "bi bi-folder2-open";
                case "project_member": return "bi bi-person-plus";
                default: return "bi bi-bell";
            }
        };

        const formatTime = (value) => {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "";
            return date.toLocaleString([], {
                month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
            });
        };

        const render = (notifications) => {
            if (!Array.isArray(notifications) || !notifications.length) {
                list.innerHTML = '<div class="app-navbar-empty"><i class="bi bi-bell-slash"></i><span>No notifications</span></div>';
                updateBadge(0);
                return;
            }

            let unread = 0;
            list.innerHTML = notifications.map((notification) => {
                const isUnread = !notification.is_read;
                if (isUnread) unread++;
                return `<div class="app-navbar-notification-item ${isUnread ? "unread" : "read"}"
                    data-id="${escapeHtml(notification.notification_id)}"
                    data-type="${escapeHtml(notification.type || "")}"
                    data-reference-id="${escapeHtml(notification.reference_id || "")}">
                    <span class="app-navbar-notification-icon ${isUnread ? "unread" : ""}"><i class="${iconFor(notification.type)}"></i></span>
                    <span class="app-navbar-notification-content">
                        <strong>${escapeHtml(notification.content || "New notification")}</strong>
                        <small>${escapeHtml(notification.sender_name || "System")} · ${formatTime(notification.created_at)}</small>
                    </span>
                    ${isUnread ? '<span class="app-navbar-notification-dot"></span>' : ""}
                </div>`;
            }).join("");

            updateBadge(unread);
        };

        const load = async () => {
            try {
                const response = await fetch("/api/notifications", {
                    headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" }
                });
                if (!response.ok) throw new Error("Unable to load notifications");
                const result = await response.json();
                render(result.notifications || []);
            } catch (error) {
                list.innerHTML = '<div class="app-navbar-empty"><i class="bi bi-exclamation-circle"></i><span>Unable to load notifications.</span></div>';
            }
        };

        button.addEventListener("click", function (event) {
            event.stopPropagation();
            const open = !dropdown.classList.contains("d-none");
            dropdown.classList.toggle("d-none", open);
            button.setAttribute("aria-expanded", String(!open));
            if (!open) load();
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest("#notificationButton, #notificationDropdown")) {
                dropdown.classList.add("d-none");
                button.setAttribute("aria-expanded", "false");
            }
        });

        // Click to read & redirect
        list.addEventListener("click", async function (event) {
            const item = event.target.closest(".app-navbar-notification-item");
            if (!item) return;

            const id = item.dataset.id;
            const refId = item.dataset.referenceId;
            const type = item.dataset.type;

            if (item.classList.contains("unread")) {
                try {
                    const response = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
                        method: "PATCH",
                        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" }
                    });
                    if (response.ok) {
                        const result = await response.json();
                        item.classList.remove("unread");
                        item.classList.add("read");
                        item.querySelector(".app-navbar-notification-icon")?.classList.remove("unread");
                        item.querySelector(".app-navbar-notification-dot")?.remove();
                        updateBadge(result.unreadCount ?? 0);
                    }
                } catch (error) {
                    console.error("Notification read error:", error);
                }
            }

            // Route user based on notification type
            if (refId) {
                if (type.startsWith("project_")) {
                    window.location.href = `/projects/${refId}`;
                } else {
                    window.location.href = `/tasks/${refId}/insight`;
                }
            }
        });

        markAll?.addEventListener("click", async function (event) {
            event.stopPropagation();
            try {
                const response = await fetch("/api/notifications/read-all", {
                    method: "PATCH",
                    headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" }
                });
                if (!response.ok) throw new Error("Unable to mark all notifications as read");
                await response.json();
                await load();
            } catch (error) {
                console.error("Mark all error:", error);
            }
        });

        if (userId && typeof io === "function") {
            const socket = io("/notifications");
            socket.on("connect", function () {
                socket.emit("joinNotificationRoom", userId);
            });
            socket.on("newSystemNotification", load);
            socket.on("notificationCountUpdated", updateBadge);
        }

        load();
    }
})();