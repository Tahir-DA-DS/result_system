# Frontend structure

Plain JavaScript modules built with Vite. No framework, so there is little to learn before changing something.

```
frontend/
  index.html                Page shell
  public/                   Logo, app icons, manifest (installable app), sw.js (offline fallback)
  src/
    main.js                 Start-up: styles, slow-server banner, service worker, router
    config.js               Backend address (VITE_API_URL)
    routes.js               The list of screens and who may open each. Add new screens here
    router.js               Picks the screen from the address (#/staff), checks the role, shows login if signed out
    api/
      client.js             The only code that calls fetch(): token, slow-server signal, error handling
      endpoints.js          One object per backend area (Auth, Users, Classes, Students ...)
    state/session.js        Signed-in user and token
    ui/
      dom.js                h(), card(), field(), options(): build the page safely
      feedback.js           toast(), run(button, fn)
      layout.js             Header and menu
      statusTag.js, reviewButtons.js, scoreTable.js, reportTable.js   Shared by several screens
    views/                  One file per screen, each exports render(root)
      login, account, staff, classes, pupils     Setup (admin) and sign-in
      scores.js             Teachers enter CA1 / CA2 / Exam; autosave; submit
      report.js             Form teacher: behaviour, attendance, remark, status, plus a preview of all pupils before submitting
      review.js             Class broadsheet (pupils x subjects): submit one or all subjects, approve or return columns
      approve/              Management: index.js (page), termSettings.js, sheetReviews.js, principalRemarks.js
      term/                 Admin: index.js, closeTerm.js (archive and advance), promotion.js (new session), backup.js (download backup)
      draftPreview.js       Form teacher: result sheets marked DRAFT (no print)
      mastersheet.js        Management: class broadsheet, printable
      history.js            Management: approvals log
      archive.js            Reprint results from closed terms
      print.js              Management: preview, Print, Download file, Save term averages
    print/                  Everything about the A4 sheet (no screens): sheet.js (layout), mastersheet.js (class broadsheet), sheet.css, border.js, preview.js (fit to phone), download.js (standalone file), styles.js (adds sheet styles once)
    lib/                    Plain logic with no page code: grading.js (live preview), remarks.js (suggestions), access.js,
                            flags.js (what management should look at), reportCheck.js (what is missing on a class report)
    styles/main.css         All styling
```

## Rules
- Screens never call `fetch`; they use `api/endpoints.js`.
- Screens never build HTML from strings; they use `h()`, so typed text cannot inject markup.
- To fill a container use `mount(parent, ...kids)` from `ui/dom.js`, never `parent.replaceChildren(array)`: it accepts arrays and skips `false`, so `cond && card(...)` and `list.map(...)` are safe.
- Wrap button actions in `run(button, async () => {...})`: it disables the button and shows errors as a toast.
- A new screen = a file in `views/` plus one line in `routes.js`.

## Tests
`npm test` renders every screen against fake server data and fails if stray text like `[object HTMLDivElement]` or `false` appears. Run it after changing any screen.

## Where to look when something is wrong
| Problem | Look in |
|---|---|
| "Cannot reach the server" or "Waking up" banner | `api/client.js`, then `VITE_API_URL` in Vercel |
| Kicked back to sign-in | `api/client.js` (401 handling), `state/session.js` |
| A menu item is missing for a role | `routes.js` (roles) |
| A screen shows an error card | `router.js` shows the message; open the screen's file in `views/` |
| Screen shows `[object HTMLDivElement]` or `false` | A container was filled with an array; use `mount()` (see `tests/views.test.js`) |
| Wrong look on phone | `styles/main.css` |
| Scores not saving | `views/scores.js` (makeSaver) and the backend `routes/sheets.routes.js` |
| Sheet layout, wording or footer lines | `print/sheet.js` (structure) and `print/sheet.css` (look) |
| Border design | `print/border.js` (spacing, tilt and colour are constants at the top) |
| A number on the sheet is wrong | The server: `backend/src/services/grading.js`. The sheet only displays what it is given |
| Flagged pupils in Approve (incomplete, exam 0, far from average) | `lib/flags.js` |
| "Incomplete" on the class report preview | `lib/reportCheck.js` |
| Which columns a user sees on the broadsheet | backend `services/broadsheet.js` (canSee) |
| Close term, archive or promotion screens | `views/term/*.js`, `views/archive.js`; the logic is in the backend `services/termClose.js` |
| Suggested remark text | `lib/remarks.js` |
