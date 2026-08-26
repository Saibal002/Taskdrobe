# File Tree: TaskDrobe

```
├── 📁 config
│   └── 📄 environment.js
├── 📁 controllers
│   ├── 📄 authController.js
│   ├── 📄 dashboardController.js
│   ├── 📄 projectController.js
│   ├── 📄 projectMemberController.js
│   ├── 📄 searchController.js
│   └── 📄 taskController.js
├── 📁 database
│   ├── 📁 migration
│   ├── 📁 modules
│   │   ├── 📁 auth
│   │   │   ├── 📄 01_roles.sql
│   │   │   ├── 📄 02_users.sql
│   │   │   ├── 📄 03_seed_roles.sql
│   │   │   └── 📄 04_sessions.sql
│   │   ├── 📁 projects
│   │   │   ├── 📄 01_project_status.sql
│   │   │   ├── 📄 02_projects.sql
│   │   │   └── 📄 03_project_members.sql
│   │   └── 📁 tasks
│   │       ├── 📄 01_task_status.sql
│   │       ├── 📄 02_task_priority.sql
│   │       └── 📄 03_tasks.sql
│   ├── 📝 README.md
│   └── 📄 dbSetup.js
├── 📁 middleware
│   ├── 📄 authMiddleware.js
│   ├── 📄 errorHandler.js
│   └── 📄 roleMiddleware.js
├── 📁 models
│   ├── 📄 dashboardModel.js
│   ├── 📄 projectMemberModel.js
│   ├── 📄 projectModel.js
│   ├── 📄 roleModel.js
│   ├── 📄 taskModel.js
│   └── 📄 userModel.js
├── 📁 plugins
│   ├── 📄 db.js
│   └── 📄 query.js
├── 📁 public
│   ├── 📁 css
│   │   ├── 🎨 dashboard.css
│   │   └── 🎨 style.css
│   ├── 📁 images
│   │   └── 🖼️ logo.png
│   ├── 📁 js
│   │   ├── 📄 auth.js
│   │   ├── 📄 dashboard.js
│   │   ├── 📄 project.js
│   │   └── 📄 task.js
│   └── 📁 uploads
├── 📁 routes
│   ├── 📄 adminRoutes.js
│   ├── 📄 authRoute.js
│   ├── 📄 dashboardRoute.js
│   ├── 📄 homeRoute.js
│   ├── 📄 managerRoutes.js
│   ├── 📄 projectMemberRoutes.js
│   ├── 📄 projectRoute.js
│   ├── 📄 searchRoute.js
│   └── 📄 taskRoute.js
├── 📁 scripts
├── 📁 services
│   ├── 📄 authService.js
│   ├── 📄 dashboardService.js
│   ├── 📄 projectMemberService.js
│   ├── 📄 projectService.js
│   ├── 📄 searchService.js
│   └── 📄 taskService.js
├── 📁 utils
│   ├── 📄 AppError.js
│   └── 📄 jwt.js
├── 📁 validators
│   ├── 📄 authValidator.js
│   ├── 📄 projectValidator.js
│   ├── 📄 taskValidator.js
│   └── 📄 validate.js
├── 📁 views
│   ├── 📁 admin
│   │   └── 📄 dashboard.ejs
│   ├── 📁 layout
│   │   ├── 📄 addProjectModal.ejs
│   │   ├── 📄 addTaskModal.ejs
│   │   ├── 📄 assignTaskModal.ejs
│   │   ├── 📄 calendarSidebar.ejs
│   │   ├── 📄 charts.ejs
│   │   ├── 📄 editProjectModal.ejs
│   │   ├── 📄 editTaskModal.ejs
│   │   ├── 📄 footer.ejs
│   │   ├── 📄 header.ejs
│   │   ├── 📄 navBar.ejs
│   │   ├── 📄 projectCarousel.ejs
│   │   ├── 📄 recentActivity.ejs
│   │   ├── 📄 sideBar.ejs
│   │   ├── 📄 statistics.ejs
│   │   ├── 📄 task.ejs
│   │   └── 📄 welcome.ejs
│   ├── 📁 manager
│   │   ├── 📄 dashboard.ejs
│   │   └── 📄 projectMembers.ejs
│   ├── 📄 dashboard.ejs
│   ├── 📄 landing.ejs
│   ├── 📄 login.ejs
│   ├── 📄 project.ejs
│   └── 📄 signup.ejs
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 app.js
├── 📄 ecosystem.config.js
├── ⚙️ package-lock.json
└── ⚙️ package.json
```

---
