# Taskdrobe
```bash
TaskDrobe/
│
├── .gitignore
├── README.md
├── app.js
├── ecosystem.config.js
├── package.json
├── package-lock.json
│
├── config/
│   └── environment.js
│
├── controllers/
│   ├── authController.js
│   └── dashboardController.js
│
├── database/
│   ├── README.md
│   ├── dbSetup.js
│   └── modules/
│       └── auth/
│           ├── 01_roles.sql
│           ├── 02_users.sql
│           └── 03_seed_roles.sql
│
├── middleware/
│   ├── authMiddleware.js
│   └── errorHandler.js
│
├── models/
│   ├── roleModel.js
│   └── userModel.js
│
├── plugins/
│   ├── db.js
│   └── query.js
│
├── public/
│   └── style.css
│
├── routes/
│   ├── authRoute.js
│   ├── dashboardRoute.js
│   └── homeRoute.js
│
├── services/
│   └── authService.js
│
├── utils/
│   ├── AppError.js
│   └── jwt.js
│
├── validators/
│   ├── authValidator.js
│   └── validate.js
│
└── views/
    ├── dashboard.ejs
    ├── landing.ejs
    ├── login.ejs
    ├── signup.ejs
    │
    └── layout/
        ├── addProjectModal.ejs
        ├── calendarSidebar.ejs
        ├── editProjectModal.ejs
        ├── footer.ejs
        ├── header.ejs
        ├── navBar.ejs
        ├── sideBar.ejs
        ├── statistics.ejs
        └── task.ejs

```