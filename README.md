# File Tree: TaskDrobe



```
├── 📁 config
│   └── 📄 environment.js
├── 📁 controllers
│   ├── 📄 attachmentController.js
│   ├── 📄 authController.js
│   ├── 📄 chatController.js
│   ├── 📄 chatSocketController.js
│   ├── 📄 dashboardController.js
│   ├── 📄 notificationController.js
│   ├── 📄 notificationSocketController.js
│   ├── 📄 profileController.js
│   ├── 📄 projectController.js
│   ├── 📄 projectMemberController.js
│   ├── 📄 searchController.js
│   ├── 📄 taskController.js
│   └── 📄 teamController.js
├── 📁 database
│   ├── 📁 migration
│   ├── 📁 modules
│   │   ├── 📁 auth
│   │   │   ├── 📄 01_roles.sql
│   │   │   ├── 📄 02_users.sql
│   │   │   ├── 📄 03_seed_roles.sql
│   │   │   ├── 📄 04_sessions.sql
│   │   │   ├── 📄 05_user_profiles.sql
│   │   │   ├── 📄 06_conversations.sql
│   │   │   ├── 📄 07_messages.sql
│   │   │   └── 📄 08_notifications.sql
│   │   ├── 📁 projects
│   │   │   ├── 📄 01_project_status.sql
│   │   │   ├── 📄 02_projects.sql
│   │   │   ├── 📄 03_project_members.sql
│   │   │   ├── 📄 04_attachments.sql
│   │   │   └── 📄 05_comments.sql
│   │   ├── 📁 tasks
│   │   │   ├── 📄 01_task_status.sql
│   │   │   ├── 📄 02_task_priority.sql
│   │   │   └── 📄 03_tasks.sql
│   │   └── 📁 teams
│   │       ├── 📄 01_teams.sql
│   │       └── 📄 02_team_members.sql
│   ├── 📝 README.md
│   └── 📄 dbSetup.js
├── 📁 middleware
│   ├── 📄 authMiddleware.js
│   ├── 📄 documentUploadMiddleware.js
│   ├── 📄 errorHandler.js
│   ├── 📄 roleMiddleware.js
│   └── 📄 uploadMiddleware.js
├── 📁 models
│   ├── 📄 attachmentModel.js
│   ├── 📄 chatModel.js
│   ├── 📄 commentModel.js
│   ├── 📄 dashboardModel.js
│   ├── 📄 notificationModel.js
│   ├── 📄 projectMemberModel.js
│   ├── 📄 projectModel.js
│   ├── 📄 roleModel.js
│   ├── 📄 taskModel.js
│   ├── 📄 teamModel.js
│   └── 📄 userModel.js
├── 📁 plugins
│   ├── 📄 db.js
│   └── 📄 query.js
├── 📁 providers
│   ├── 📄 routeConfig.js
│   └── 📄 routeServiceProvider.js
├── 📁 public
│   ├── 📁 css
│   │   ├── 🎨 dashboard.css
│   │   ├── 🎨 discussion-comments.css
│   │   ├── 🎨 emp_dashboard.css
│   │   ├── 🎨 manager_dashboard.css
│   │   ├── 🎨 project.css
│   │   └── 🎨 style.css
│   ├── 📁 images
│   │   └── 🖼️ logo.png
│   └── 📁 js
│       ├── 📄 auth.js
│       ├── 📄 dashboard.js
│       ├── 📄 discussion-comments.js
│       ├── 📄 managerDashboard.js
│       ├── 📄 managerTeamsAjax.js
│       ├── 📄 project.js
│       └── 📄 task.js
├── 📁 routes
│   ├── 📄 adminRoutes.js
│   ├── 📄 authRoute.js
│   ├── 📄 chatRoute.js
│   ├── 📄 dashboardRoute.js
│   ├── 📄 homeRoute.js
│   ├── 📄 managerRoutes.js
│   ├── 📄 notificationRoute.js
│   ├── 📄 profileRoute.js
│   ├── 📄 projectMemberRoutes.js
│   ├── 📄 projectRoute.js
│   ├── 📄 searchRoute.js
│   ├── 📄 taskRoute.js
│   └── 📄 teamRoute.js
├── 📁 scripts
├── 📁 services
│   ├── 📄 authService.js
│   ├── 📄 commentService.js
│   ├── 📄 dashboardService.js
│   ├── 📄 projectMemberService.js
│   ├── 📄 projectService.js
│   ├── 📄 searchService.js
│   ├── 📄 taskService.js
│   └── 📄 teamService.js
├── 📁 utils
│   ├── 📄 AppError.js
│   ├── 📄 jwt.js
│   └── 📄 responseFormatter.js
├── 📁 validators
│   ├── 📄 authValidator.js
│   ├── 📄 projectValidator.js
│   ├── 📄 taskValidator.js
│   ├── 📄 teamValidator.js
│   └── 📄 validate.js
├── 📁 views
│   ├── 📁 admin
│   │   └── 📄 dashboard.ejs
│   ├── 📁 layout
│   │   ├── 📄 addProjectModal.ejs
│   │   ├── 📄 addTaskModal.ejs
│   │   ├── 📄 addTeamModal.ejs
│   │   ├── 📄 assignTaskModal.ejs
│   │   ├── 📄 calendarSidebar.ejs
│   │   ├── 📄 charts.ejs
│   │   ├── 📄 discussionComment.ejs
│   │   ├── 📄 discussionComments.ejs
│   │   ├── 📄 editProjectModal.ejs
│   │   ├── 📄 editTaskModal.ejs
│   │   ├── 📄 footer.ejs
│   │   ├── 📄 globalChat.ejs
│   │   ├── 📄 header.ejs
│   │   ├── 📄 navBar.ejs
│   │   ├── 📄 projectCarousel.ejs
│   │   ├── 📄 recentActivity.ejs
│   │   ├── 📄 sideBar.ejs
│   │   ├── 📄 statistics.ejs
│   │   ├── 📄 task.ejs
│   │   └── 📄 welcome.ejs
│   ├── 📁 manager
│   │   ├── 📁 partials
│   │   │   ├── 📄 managerActivity.ejs
│   │   │   ├── 📄 managerAttention.ejs
│   │   │   ├── 📄 managerDeadlines.ejs
│   │   │   ├── 📄 managerNavBar.ejs
│   │   │   ├── 📄 managerProjects.ejs
│   │   │   ├── 📄 managerStats.ejs
│   │   │   ├── 📄 managerTaskOverview.ejs
│   │   │   ├── 📄 managerTeamOverview.ejs
│   │   │   ├── 📄 managerWelcome.ejs
│   │   │   └── 📄 projectTasks.ejs
│   │   ├── 📄 man_dashboard.ejs
│   │   ├── 📄 team_insight.ejs
│   │   └── 📄 teams.ejs
│   ├── 📄 emp_dashboard.ejs
│   ├── 📄 error.ejs
│   ├── 📄 landing.ejs
│   ├── 📄 login.ejs
│   ├── 📄 profile.ejs
│   ├── 📄 project.ejs
│   ├── 📄 signup.ejs
│   └── 📄 task-insight.ejs
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 app.js
├── 📄 ecosystem.config.js
├── ⚙️ package-lock.json
└── ⚙️ package.json
```

---
