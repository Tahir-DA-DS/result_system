# Bright Hills Academy – Results API

Node.js + Express + MongoDB (Atlas). Deploy target: Render (free web service).
See `ARCHITECTURE.md` for the folder layout and where to look when debugging.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill it in (MongoDB Atlas URI, JWT secret, first admin email and password).
3. `npm start`. On first start with an empty database, the admin from `.env` is created.
4. Check `http://localhost:3000/api/health` returns `{"ok":true}`.

## Roles
- **admin**: setup (users, classes, subjects, pupils, term settings), everything management can do, and unlocking approved sheets.
- **management**: reviews, approves or returns sheets and class reports, writes principal remarks, prints.
- **teacher**: enters scores for subjects assigned to them; as form teacher, fills the class report.

Every rule is enforced on the server.

## Workflow and statuses
draft → submitted → approved (locked) / returned (editable again). Only an admin can unlock an approved sheet, with a reason. All reviews are logged.
A class is ready to print only when every subject sheet is approved, the class report is approved, and every pupil has a principal's remark.

## Endpoints (all under `/api`, JSON, `Authorization: Bearer <token>` except login and health)
| Method and path | Who | Purpose |
|---|---|---|
| GET `/health` | public | wake-up and status check |
| POST `/login` | public | `{email,password}` returns `{token,user}` |
| GET `/me`, POST `/me/password` | any | profile, change own password |
| GET/POST `/users`, PATCH `/users/:id` | management (list), admin | staff accounts |
| GET/POST `/classes`, PATCH/DELETE `/classes/:id`, POST `/classes/seed-defaults` | any (read), admin | classes and subjects (subjects keep permanent ids) |
| GET `/classes/:id/students`, POST `/students`, PATCH/DELETE `/students/:id` | any (read), admin | pupils (POST accepts a bulk list) |
| GET `/classes/:id/sheets` | teacher (own subjects), management | score sheets |
| PUT `/sheets/:class/:subject` | subject teacher | save `{rows:{studentId:{a,b,e}}}` |
| POST `/sheets/:class/:subject/submit` | subject teacher | submit |
| POST `/sheets/:class/:subject/review` | management, admin | `{action:"approve"｜"return"｜"unlock",note}` |
| GET `/classes/:id/broadsheet` | teacher, form teacher, management | pupils x subjects grid; scores hidden where the user may not see them |
| POST `/classes/:id/submit-subjects` | subject teacher | `{subjects:[ids]}` submit several subjects at once |
| GET `/term/close-check`, POST `/term/close` | admin | readiness of every class; close the term `{force}`: archive, save averages, clear live data, next term |
| GET `/archive`, GET `/archive/results?session&term&class` | management, admin | closed terms; frozen results for reprinting |
| POST `/classes/auto-next`, GET `/promotion/preview`, POST `/promotion/run` | admin | promotion order, per-pupil defaults, start the new session |
| GET `/classes/:id/preview` | form teacher, management | result sheets as they stand now (draft; only subjects the user may see) |
| GET `/classes/:id/mastersheet` | management, admin | pupils x subjects totals, average, position |
| GET `/history` | management, admin | who submitted, approved, returned or unlocked what |
| GET `/classes/:id/reports`, PUT `/reports/:student` | form teacher, management | behaviour, attendance, remark, status |
| POST `/classes/:id/report/submit`, `/report/review` | form teacher, management | class report workflow |
| PUT `/classes/:id/principal` | management, admin | `{items:[{student,prin,st}]}` |
| GET/PUT `/term` | any (read), admin | term, session, dates, times open, position switch |
| GET `/classes/:id/status`, `/classes/:id/results` | management, admin | readiness; full calculated print data when ready |
| GET `/classes/:id/averages` | management, admin | per-pupil averages so far (for suggested remarks) |
| POST `/classes/:id/save-averages` | management, admin | store this term's averages for later terms |
| GET `/export` | admin | full JSON backup |
