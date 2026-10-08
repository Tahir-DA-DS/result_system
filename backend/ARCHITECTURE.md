# Backend structure

```
backend/
  server.js                 Entry point: connect to MongoDB, seed first admin, listen
  src/
    config.js               The only file that reads environment variables
    app.js                  Express app: security, routes, 404, error handler
    bootstrap.js            Creates the first admin on an empty database
    models/                 One file per MongoDB collection (User, Class, Student, Sheet, Report, ClassReport, Setting, Archive)
    lib/
      constants.js          Grade scale, default subjects, default classes, status names
      errors.js             E(status,msg), h(async handler), sid, oid, str
      permissions.js        isM, isFT, isSubT, need(...roles): every role rule is here
    middleware/
      auth.js               Token check, sets req.user
      errorHandler.js       Turns errors into JSON; logs unexpected ones with method, URL and user
    services/               Logic shared by several routes
      lookup.js             getClass, getSheet, getCR
      review.js             Approve / return / unlock rules and history log
      broadsheet.js         Pupils x subjects grid and who may see which column (canSee)
      history.js            Approval history (live logs + copies kept in the archive)
      previews.js           Draft result sheets (form teacher) and the class broadsheet (management)
      termClose.js          Close a term: archive every class, save averages, clear live data, advance (safe to retry)
      classStatus.js        "Is this class ready to print?" and what is missing
      grading.js            Totals, grades, highest/lowest, averages, positions
    routes/                 Thin: validate input, check permission, call a service, reply
      public.routes.js      Health, login
      account / users / classes / students / sheets / broadsheet / reports / term / archive / preview / history / promotion / results / backup .routes.js
      index.js              Mounts all signed-in routes (add new route files here)
```

## Where to look when something is wrong
| Problem | Look in |
|---|---|
| Wrong grade, total, average or position | `services/grading.js` and `lib/constants.js` (scale) |
| Someone can or cannot do something | `lib/permissions.js`, then the route file |
| Sheet will not approve, return or unlock | `services/review.js` |
| Class stuck on "not ready" | `services/classStatus.js` |
| Draft preview or broadsheet numbers | `services/previews.js` |
| History screen missing events | `services/history.js` |
| Term closing, archive, or averages not carried over | `services/termClose.js` (tests: `npm test`) |
| Promotion or new session problems | `routes/promotion.routes.js` |
| A teacher or form teacher cannot see a column | `services/broadsheet.js` (canSee) |
| Marks rejected or not saved | `routes/sheets.routes.js` (validation) |
| Login or "please sign in again" | `routes/public.routes.js`, `middleware/auth.js` |
| Server error with no detail | Render logs; `middleware/errorHandler.js` prints method, URL and user id |
| Startup failure | `config.js` (missing settings), `server.js` (database connection) |

## Conventions
- Routes do not hold business rules. If a rule is used twice, it goes in `services/` or `lib/`.
- Handlers are wrapped in `h(...)` and fail by `throw E(status, 'message')`.
- Role checks use `need(...)` on the route and `isM/isFT/isSubT` inside it. Do not check roles anywhere else.
- Each file starts with a one-line comment saying what it is for.

## Tests
`npm test` runs `tests/termClose.test.js` against an in-memory fake database (no MongoDB needed). It checks that closing is blocked while classes are not ready, that nothing is lost, and that a failed close can be retried safely.
