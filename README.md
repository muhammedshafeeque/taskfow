<p align="center">
  <img src="https://img.shields.io/badge/TaskFlow-Project%20Management-6366f1?style=for-the-badge&logo=trello&logoColor=white" alt="TaskFlow" />
</p>

<h1 align="center">TaskFlow</h1>
<p align="center">
  <strong>A modern, Jira-like project management platform</strong>
</p>
<p align="center">
  Plan, track, and ship software with ease. Built for teams.
</p>

---

## ✨ Overview

**TaskFlow** is a full-featured project management application explicitly focused on the needs of **small teams**. It is designed to be lightweight, incredibly fast to set up, and can be **installed and ready to use in under 10 minutes**. 

Create issues, manage sprints, visualize work on boards, track time, and collaborate—all in one place. TaskFlow provides large-scale enterprise features without the steep learning curve, supporting dark mode, real-time notifications, and robust role-based permissions to keep your team moving forward.

---

## 🚀 Features & Functions

### Core Issue Tracking & Planning
| Feature | Description |
|---------|-------------|
| **Issues & Subtasks** | Tasks, bugs, stories, and epics with custom fields, labels, and checklists. |
| **Kanban Boards** | Drag-and-drop interactive boards for sprint and backlog management. |
| **Sprints & Backlog** | Prioritize the backlog, plan sprints, and track velocity. |
| **Gantt & Roadmaps** | Visual timeline with Gantt charts and milestone-based roadmaps. |
| **Advanced Filtering** | Save custom filters, use quick filters, and switch between List, Table, and Kanban views. |
| **Estimates Tracking** | Track remaining estimates, burn rates, and calculate expected delivery dates. |

### Collaboration & Tracking
| Feature | Description |
|---------|-------------|
| **Comments & Mentions** | Discuss issues using TipTap rich text (Markdown, tables, images) and user mentions. |
| **Watchers** | Watch issues and receive notifications. |
| **Issue Links/Traceability** | Link related issues (blocks, duplicates) and trace requirements. |
| **Attachments** | Upload and manage files directly on issues. |
| **Work Logs & Timesheet** | Log time spent on issues and review timesheets across the team. |

### QA & Test Management
| Feature | Description |
|---------|-------------|
| **Test Cases & Plans** | Create and manage test cases; organize them into structured test plans. |
| **Test Cycles** | Execute test cycles and record pass/fail/skip/blocked results. |
| **Requirements Traceability** | Trace requirements directly to test cases and execution status. |
| **Defect Metrics** | Dashboard for bug density, status, and priority analytics. |

### Analytics & Advanced Reporting
| Feature | Description |
|---------|-------------|
| **Interactive Dashboards** | Personal, Project, and Executive dashboards with issue stats and activity. |
| **Custom Reports** | Build custom visual reports for issues by status, type, priority, and assignee. |
| **Performance Reports** | Team performance reporting with Excel export capabilities. |
| **Cost & Usage Reports** | Calculate work log totals mapped to users and projects. |
| **Sprint Reports** | Detailed reviews of sprint progress and completion metrics. |
| **Workload View** | Breakdown of open issues, story points, and counts per assignee. |

### Project Settings & Management
| Feature | Description |
|---------|-------------|
| **Versions & Releases** | Version management with environment mappings and automated release notes. |
| **Milestones** | Track critical project milestones and due dates. |
| **Custom Fields** | Extend issues with custom text, number, date, select, and user fields. |
| **Project Templates** | Standardize configurations across projects. |
| **Roles & Permissions** | Fine-grained global and project-scoped designations. |

### Enterprise & Security
| Feature | Description |
|---------|-------------|
| **Audit Logs** | Comprehensive tracking of resource modifications (who did what and when). |
| **Authentication** | JWT-based auth, Microsoft SSO integration, and password recovery. |
| **Customer Portal** | Dedicated portal for external customers to submit and track issues. |
| **Notifications** | Real-time Socket.io updates, in-app Inbox, and Web Push notifications. |

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express, TypeScript, Mongoose (MongoDB) |
| **Frontend** | React 19, Vite 7, TypeScript, React Router 7 |
| **Styling** | Tailwind CSS 4 |
| **Auth** | JWT (access + refresh), bcryptjs, Microsoft SSO |
| **Real-time** | Socket.IO, Web Push |
| **Rich Text** | TipTap |
| **Charts & BI** | Recharts, exceljs, jspdf |
| **Other Utilities** | @dnd-kit (drag-and-drop), frappe-gantt |

---

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** 6+ (local or Atlas)
- **npm** or **pnpm**

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/muhammedshafeeque/taskflow.git
cd taskflow
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend (from project root)
cd ../Tasks && npm install
```

### 3. Configure environment

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your settings (see `server/.env.example` for all options):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pm-tool

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Optional: Set up SMTP or Azure Graph for emails
# IS_SMTP_ENABLED=true
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587

# Optional: Web Push Notifications
# VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...
```

### 4. Create super admin (first run)

```bash
cd server
npm run create-super-admin
```

Follow the prompts to create your first admin user.

### 5. Start the application

**Terminal 1 – Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 – Frontend:**

```bash
cd Tasks
npm run dev
```

### 6. Open in browser

Navigate to **http://localhost:5173** and log in with your super admin credentials.

---

## 🏗 Project Structure

```text
Tasks/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/         # Environment config
│   │   ├── middleware/     # Auth, permissions, validation
│   │   ├── modules/        # Feature modules (auth, projects, issues, sprints, qa, reports, etc.)
│   │   ├── routes/         # API route aggregation
│   │   └── utils/
│   └── package.json
│
└── Tasks/                  # Frontend (React)
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── contexts/       # Auth, Notifications
    │   ├── lib/            # API client, types
    │   └── pages/          # Route-level pages (Dashboards, Kanban, QA, Reports, Admin)
    └── package.json
```

---

## 🚢 Production Build

```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd Tasks
npm run build
```

Serve the `Tasks/dist` folder with a static server (e.g. Nginx, Vercel, Netlify). Set `VITE_API_URL` to your API URL when building.

---

## 🔐 Environment Variables

You can find all of the environment variables inside `server/.env.example`. Below is a breakdown:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pm-tool` |
| `JWT_SECRET` | JWT signing secret | **Required in production** |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `APP_URL` | Default base URL for the app (emails, fallback) | `http://localhost:5173` |
| `FRONTEND_URL` | SPA origin, required for accurate email links | `http://localhost:5173` |
| **Email: SMTP Options** |
| `IS_SMTP_ENABLED` | Set to true to use SMTP for emails | `false` |
| `SMTP_HOST` / `SMTP_PORT` | SMTP server host and port | — / `587` |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials | — |
| `MAIL_FROM` | Sender address for emails | `noreply@taskflow.local` |
| **Email: Azure Graph Options** |
| `IS_AZURE_GRAPH_ENABLED` | Set to true to use Microsoft Graph API for emails | `false` |
| `AZURE_GRAPH_TENANT_ID` | Your Graph tenant ID (Not 'common') | — |
| `AZURE_GRAPH_CLIENT_ID` | Your Graph Client ID | — |
| `AZURE_GRAPH_CLIENT_SECRET` | Your Graph Client Secret | — |
| `AZURE_GRAPH_FROM_EMAIL` | Mailbox used for Graph sends | `noreply@yourdomain.com` |
| **Microsoft SSO Options** |
| `AZURE_AD_CLIENT_ID` | Client ID for MS SSO | — |
| `AZURE_AD_CLIENT_SECRET`| Client Secret for MS SSO| — |
| `AZURE_AD_TENANT_ID` | Tenant ID for MS SSO | `common` |
| `AZURE_REDIRECT_URI` | Re-direct URI | `http://localhost:5173/login` |
| `MS_USER_INFO_ENDPOINT` | OIDC Endpoint | `https://graph.microsoft.com/oidc/userinfo` |
| **Notification Options** |
| `VAPID_PUBLIC_KEY` | Web push public key | — |
| `VAPID_PRIVATE_KEY` | Web push private key | — |
| **Enterprise Options** |
| `MAX_USERS` | Optional user limit (enterprise) | — |
| **Automation / CLI Scripts** |
| `SUPER_ADMIN_*` | Variables (`EMAIL`, `PASSWORD`, `NAME`) for auto CLI creation | — |
| `AZURE_DEVOPS_*` | Tooling for importing tasks from ADO work items | — |

---

## 📜 Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | server | Start dev server with hot reload |
| `npm run build` | server | Compile TypeScript |
| `npm start` | server | Run production server |
| `npm run create-super-admin` | server | Create first admin user |
| `npm run dev` | Tasks | Start Vite dev server |
| `npm run build` | Tasks | Build for production |
| `npm run preview` | Tasks | Preview production build |

---

## 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE) (GPL-3.0). See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

## Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the contributor list and how to add yourself.

---

<p align="center">
  <sub>Built with ❤️ for teams</sub>
</p>
