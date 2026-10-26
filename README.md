# School Results System

A web app for compiling school results for **Nursery, Primary and Secondary**. Teachers enter scores, form teachers complete class reports, School Management reviews and approves, and approved results print as exact A4 result sheets (with the school border, logo and layout).

Works on phones and computers, and can be installed to the home screen like an app.

## Contents
- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Run it on your computer](#run-it-on-your-computer)
- [First-time setup in the app](#first-time-setup-in-the-app)
- [Configuration](#configuration)
- [Tests](#tests)
- [Deploying](#deploying)
- [Terms, archive and a new session](#terms-archive-and-a-new-session)
- [Backups and security](#backups-and-security)
- [Customising for your school](#customising-for-your-school)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## Features
**Score entry**
- Teachers see only the subjects assigned to them. CA1 (20), CA2 (20) and Exam (60) save automatically, with total and grade shown as you type.
- A class **Review** grid (pupils x subjects) shows completeness. Submit one subject, or **all your subjects at once**.

**Class reports**
- Form teachers record behaviour ratings, days attended, a remark and (Secondary) a Status such as Promoted or Repeated.
- A preview table flags what is missing, and a **DRAFT** preview shows the actual result sheets before submitting.

**Approval**
- Management sees every pupil's scores per subject, with flags (incomplete, exam of 0, far from the class average), then **Approves** or **Returns** with a reason.
- Approved sheets are locked. Only an admin can unlock one, with a reason. Every action is kept in a **History** log.
- Principal's remarks are written by management, with suggestions based on each pupil's average.

**Printing**
- Exact A4 result sheets (Nursery, Primary and Secondary layouts), printed one pupil at a time or a whole class.
- Download as a standalone file, or print to PDF. Optional position in class. A printable class broadsheet.
- Highest, lowest, totals, grades, averages and earlier-term averages are calculated by the server.

**Terms and sessions**
- **Close term** archives every class's results, carries averages forward and starts the next term. Old results can be reprinted from the **Archive**.
- **New session** promotes pupils to the next class, repeats or releases them.

**Accounts and safety**
- Individual logins for admin, management and teachers. Roles are enforced on the server.
- One-click **backup** download for admins.

## How it works
```
Teacher enters scores ──> submits subject ──┐
                                            ├──> Management reviews ──> Approve ──> Print
Form teacher completes class report ────────┘          │
                                                     Return (with reason) ──> teacher fixes and resubmits
```
A class is ready to print when every subject sheet and the class report are approved and every pupil has a principal's remark.

| Role | Can do |
|---|---|
| **Teacher** | Enter and submit scores for assigned subjects. As a form teacher: class report and draft preview. |
| **Management** | Everything above for review: approve or return, write principal's remarks, print, broadsheet, archive, history. |
| **Admin** | All of the above plus staff, classes, pupils, term settings, unlock, close term, new session, backup. |

## Tech stack
| Part | Technology |
|---|---|
| Backend | Node.js 20+, Express, MongoDB (Mongoose), JWT login, bcrypt |
| Frontend | Vite, plain JavaScript modules (no framework), installable web app |
| Hosting (suggested) | MongoDB Atlas (database), Render (backend), Vercel or any static host (frontend) |

## Project structure
```
.
├── backend/          Node.js + Express API          (see backend/ARCHITECTURE.md)
│   ├── server.js     Entry point
│   ├── src/          config, models, routes, services, middleware
│   └── tests/        Term-closing tests (no database needed)
├── frontend/         Vite web app                   (see frontend/ARCHITECTURE.md)
│   ├── src/          api, views, print (A4 sheets), lib, ui, styles
│   ├── public/       Logo, icons, manifest, offline support
│   └── tests/        Screen render tests
├── DEPLOY.md         Step-by-step: MongoDB Atlas, Render, Vercel
└── render.yaml       Render blueprint for the backend
```

## Run it on your computer
**Needs:** Node.js 20 or newer, and a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works).

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm start
```
Check `http://localhost:3000/api/health` returns `{"ok":true}`. The first start on an empty database creates the admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Generate a `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**2. Frontend** (a second terminal)
```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```
Open `http://localhost:5173` and sign in as the admin.

## First-time setup in the app
Sign in as the admin, then:
1. **Staff**: add teachers and management with temporary passwords.
2. **Classes**: *Create default classes*, then set each class's form teacher and each subject's teacher.
3. **Term** tab: *Set promotion order automatically*.
4. **Pupils**: add or paste each class list.
5. **Approve > Term settings**: term, session, dates, times school open.
6. Teachers enter **Scores**; form teachers complete **Report**; management **Approve**s, writes remarks, then **Print**s.

## Configuration
| Where | Name | Meaning |
|---|---|---|
| `backend/.env` | `MONGODB_URI` | MongoDB connection string (include a database name, e.g. `/brighthills`) |
| `backend/.env` | `JWT_SECRET` | 32 or more random characters |
| `backend/.env` | `FRONTEND_URL` | Address of the web app, e.g. `https://your-app.vercel.app` (several allowed, comma separated, no trailing slash) |
| `backend/.env` | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin, used once on an empty database |
| `backend/.env` | `PORT` | Optional, defaults to 3000 |
| `frontend/.env` | `VITE_API_URL` | Address of the backend, e.g. `https://your-api.onrender.com` (no trailing slash) |

`.env` files hold secrets and are git-ignored. Never commit them. If you change `VITE_API_URL`, rebuild or redeploy the frontend, because the value is built into the site.

## Tests
```bash
cd backend  && npm test     # term closing: blocked until ready, nothing lost, safe to retry
cd frontend && npm test     # every screen renders real elements, with fake server data
```
Run both after changing code. Lint-free and building: `npm run build` in `frontend`.

## Deploying
Follow **[DEPLOY.md](DEPLOY.md)** step by step (GitHub, MongoDB Atlas, Render, Vercel), each step with a check and a troubleshooting table.

Things to know about free hosting:
- The free Render backend sleeps when idle, so the first request after a quiet period can take up to a minute. The app shows a "waking up" banner.
- Vercel's free plan is limited to non-commercial personal use. A school that charges fees should check this, or use another static host.
- Free databases do not give dependable automatic backups. See below.

## Terms, archive and a new session
- **Close term** (Term tab, admin): archives each class's exact results, saves averages for later terms, clears live scores, reports and approvals, and moves to the next term. Closing is blocked until classes are ready, unless you choose to archive them as incomplete. It is safe to retry if it fails part-way.
- **Archive** (management): reprint any closed term's results exactly as they were.
- **New session** (after Third Term): promote, repeat or release each pupil, then enter the new session.

## Backups and security
- On the **Term** tab press **Download backup** every week and before closing a term. Keep copies off the school computer. There is no restore button yet; a backup lets a developer rebuild the data.
- Use a strong, unique `ADMIN_PASSWORD` and change it after first sign-in. Never share the database password.
- Deactivate staff accounts when people leave (Staff screen).
- Role checks run on the server, not just in the screens.

## Customising for your school
| To change | Edit |
|---|---|
| School name, address, phone, motto, sheet wording | `frontend/src/print/sheet.js` |
| Logo and app icons | `frontend/public/logo.jpg`, `icon-192.png`, `icon-512.png` |
| Border design | constants at the top of `frontend/src/print/border.js` |
| Sheet look (colours, sizes) | `frontend/src/print/sheet.css` |
| Grade scale | `backend/src/lib/constants.js` (used for the printed grades), plus `frontend/src/lib/grading.js` (live preview) and the scale table in `frontend/src/print/sheet.js` (printed legend). Change all three together. |
| Default subjects and class names | `backend/src/lib/constants.js` (or edit subjects per class in the app) |
| Suggested principal remarks | `frontend/src/lib/remarks.js` |

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| "Cannot reach the server" | Wrong `VITE_API_URL`, or the free backend is waking up (wait a minute) |
| CORS error in the browser console | `FRONTEND_URL` does not exactly match the web app's address |
| `Database connection failed` | Wrong database password, or the Atlas network access list is missing `0.0.0.0/0` |
| Sign-in fails for the admin | The admin is only created on an empty database. See [DEPLOY.md](DEPLOY.md) |
| A screen shows `[object HTMLDivElement]` | Old frontend files mixed with new ones. Replace the whole `frontend/src` folder and run `npm test` |

More detail is in [DEPLOY.md](DEPLOY.md) and each folder's `ARCHITECTURE.md`.

## Documentation
- [`DEPLOY.md`](DEPLOY.md): going online
- [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md): backend structure, rules and where to look when something is wrong
- [`backend/README.md`](backend/README.md): roles, workflow and the list of API endpoints
- [`frontend/ARCHITECTURE.md`](frontend/ARCHITECTURE.md): frontend structure and conventions

## License
MIT License
