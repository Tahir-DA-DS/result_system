# Contributing

Thanks for helping. This system is **used by a real school**, and `main` is deployed automatically to the live site. A bad change on `main` can take the system down, so please follow these rules.

## The rules
1. **Never push directly to `main`.** Work on a branch and open a pull request. The owner reviews and merges.
2. **Never commit secrets.** `.env` files, database strings, passwords and `JWT_SECRET` stay on your computer. Check with `git status` before every commit.
3. **Never use the school's database or admin account for development.** Use your own free MongoDB Atlas cluster and your own `.env`.
4. **Tests and build must pass** before you open a pull request.

## Setting up
Follow "Run it on your computer" in the [README](README.md). Use your own database and make your own `.env` files from the `.env.example` templates.

## Making a change
```bash
git checkout main
git pull
git checkout -b feature/short-description     # or fix/short-description
# ... make your change ...
cd backend  && npm test
cd ../frontend && npm test && npm run build
git add <the files you changed>               # avoid "git add ." unless you checked git status
git commit -m "Short description of what and why"
git push -u origin feature/short-description
```
Then open a pull request on GitHub into `main` and fill in the checklist.

## Where things live
Read `backend/ARCHITECTURE.md` and `frontend/ARCHITECTURE.md` first. Their "where to look when something is wrong" tables point to the right file.

Conventions that matter:
- **Backend:** routes stay thin; business rules go in `src/services/` or `src/lib/`. All role rules are in `src/lib/permissions.js`.
- **Frontend:** screens never call `fetch` (use `src/api/endpoints.js`), never build HTML from strings (use `h()`), and fill containers with `mount()`, never `replaceChildren(array)`.
- **Grade scale:** it is defined in three places. Change `backend/src/lib/constants.js`, `frontend/src/lib/grading.js` and the legend in `frontend/src/print/sheet.js` together.

## Changes that need extra care
These affect real data. Say so in the pull request and discuss before merging:
- Anything in `backend/src/models/` (changing how data is stored).
- Term closing, the archive, promotion (`services/termClose.js`, `routes/promotion.routes.js`).
- Grading, averages or positions (`services/grading.js`).
- Permissions and login.
- The printed sheet layout (`frontend/src/print/`). Compare a printout with a paper sheet.

Prefer additive changes (new fields with defaults) over renaming or removing fields, so existing records keep working.

## Before the owner merges
- Tests pass and the build is clean.
- The change was tried in the browser with test data, as each affected role (teacher, form teacher, management, admin).
- Releases happen outside school hours where possible, and the owner downloads a backup first for changes that touch data.

## Reporting a problem
Open a GitHub issue with what you did, what you expected, what happened, and any error text. **Never paste passwords, tokens or connection strings** into an issue.
