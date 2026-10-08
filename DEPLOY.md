# Putting the system online (MongoDB Atlas, Render, Vercel)

Do the steps in this order. Each one ends with a check. Do not move on until the check passes.

You will use three free accounts: **GitHub** (holds the code), **MongoDB Atlas** (database), **Render** (backend), and **Vercel** (frontend).

> **Read first: Vercel's free plan.** Vercel's free (Hobby) plan is limited to non-commercial personal use, and commercial use is defined broadly (for example, any deployment used for someone's financial gain, including a paid person writing the code). A school that charges fees may fall on the commercial side. Check with Vercel Support, or choose a host whose free plan allows your use. The frontend is a plain static site, so it works the same on any static host: build with `npm run build` and publish the `dist` folder. Only Step 4 changes.

---

## Step 0. Put the code on GitHub
1. Install Git (git-scm.com) and create a free GitHub account.
2. On GitHub, create a **private** repository called `bright-hills-results` (leave it empty).
3. In the project folder (the one containing `backend` and `frontend`):
```
git init
git add .
git commit -m "Bright Hills results system"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/bright-hills-results.git
git push -u origin main
```
**Check:** on GitHub you see the `backend` and `frontend` folders. You must **not** see any file named `.env` (only `.env.example`). The included `.gitignore` keeps `.env` out. If a `.env` ever got uploaded, change every password in it.

---

## Step 1. Database (MongoDB Atlas)
You may already have this from your local test. You can reuse that cluster, but a fresh one for the live school is cleaner.
1. In Atlas, create a **free (M0)** cluster.
2. **Database Access**, add a user with a long password using **letters and numbers only**. Note both.
3. **Network Access**, **Add IP Address**, **Allow access from anywhere** (0.0.0.0/0). Render's free plan has no fixed address, so this is required. Your protection is the strong password plus the app's own login.
4. **Connect, Drivers**, copy the string and put the database name before the `?`:
`mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/brighthills?retryWrites=true&w=majority`

**Check:** you have the full string with your real password and `/brighthills` in it.

---

## Step 2. Backend (Render)
**Option A: Blueprint (fastest).** In Render choose **New, Blueprint**, connect the repository, and it reads `render.yaml`. Fill in the values it asks for (below). If it complains about `rootDir`, use Option B.

**Option B: by hand.** **New, Web Service**, connect the repository, then:

| Setting | Value |
|---|---|
| Name | `bright-hills-api` (this becomes your address) |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |
| Health Check Path (under Advanced) | `/api/health` |

**Environment variables** (both options):

| Name | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `MONGODB_URI` | the string from Step 1 |
| `JWT_SECRET` | 32+ random characters (Blueprint creates it for you; otherwise generate one at home with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ADMIN_EMAIL` | your email (the first admin) |
| `ADMIN_PASSWORD` | a strong password you have not used elsewhere |
| `FRONTEND_URL` | leave a placeholder like `https://placeholder.vercel.app` for now; you set the real one in Step 5 |

Press **Deploy** and wait for "Live". Your address looks like `https://bright-hills-api.onrender.com`.

**Check:** open `https://YOUR-API-ADDRESS/api/health` in a browser. It shows `{"ok":true}`. The first visit may take up to a minute (the free server was asleep). In **Logs** you should see `First admin created`.

---

## Step 3. Test the backend settings
In Render's **Logs**, look for `API listening`. If you see `Startup failed` or `Database connection failed`, see the troubleshooting table below before continuing.

---

## Step 4. Frontend (Vercel)
1. On vercel.com sign in with GitHub, **Add New, Project**, choose the repository.
2. Set:

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite (usually detected) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment variable `VITE_API_URL` | your Render address, with **no slash at the end**, e.g. `https://bright-hills-api.onrender.com` |

3. **Deploy.** Your address looks like `https://bright-hills-results.vercel.app`.

**Check:** the sign-in page appears with the school logo. (Signing in will not work yet; that is Step 5.)

> `VITE_API_URL` is built into the site. If you ever change it, **redeploy** on Vercel for the change to take effect.

---

## Step 5. Connect them
1. In Render, open the service, **Environment**, and set `FRONTEND_URL` to your exact Vercel address: `https://bright-hills-results.vercel.app` (no slash at the end). If you add a custom domain later, add it too, separated by a comma.
2. Save. Render restarts the service.

**Check:** open your Vercel address, sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The Staff screen appears. (If the first request is slow, wait: you will see a "Waking up the server" banner.)

---

## Step 6. Set up the school (as in the local test)
1. **Account**: change the admin password to a new one that is not in any file.
2. **Staff**: add teachers and management with temporary passwords. Tell each person to change theirs under **Account**.
3. **Classes**: **Create default classes**, then set form teachers and subject teachers. On the **Term** tab, press **Set promotion order automatically**.
4. **Pupils**: add each class list.
5. **Approve, Term settings**: term, session, dates, times school open.
6. **Term, Backup**: download your first backup.

**Phones:** on Android (Chrome) or iPhone (Safari) open the Vercel address and choose **Add to Home Screen** to install it like an app.

---

## Step 7. Pilot first
Run one real class with two or three teachers for a week before opening it to everyone. Print a real sheet and compare it with your paper copy.

---

## Free-plan limits you should plan around
- **The backend sleeps after about 15 minutes without visitors.** The next person waits up to a minute while it wakes. The app shows a banner so people know to wait. Ask the admin to open the site a few minutes before teachers start entering scores.
- **Optional keep-awake:** a free monitor service (for example UptimeRobot) can visit `https://YOUR-API-ADDRESS/api/health` every 5 minutes during school hours. This keeps it awake but uses more of Render's free hours. Check Render's current free allowance before relying on it.
- **Backups are your job.** The free database does not give you dependable automatic backups. On the **Term** tab, press **Download backup** every week and before closing a term, and keep copies off the school computer (for example email to yourself or a flash drive). There is no restore button yet: a backup file lets a developer rebuild the data.
- **Closing a term deletes the live scores** (after archiving them). Download a backup immediately before.

## Security checklist
- Strong, unique `ADMIN_PASSWORD`, changed after first sign-in.
- Atlas password has never been shared in chat or email.
- `.env` files are not on GitHub.
- Deactivate staff accounts when people leave (Staff screen).
- Only give the admin role to people who need to unlock sheets and close terms.

## Updating the app later
Change the code, then `git add . && git commit -m "message" && git push`. Render and Vercel redeploy by themselves. Test locally first (`npm test` in both folders).

## Troubleshooting
| What you see | Likely cause and fix |
|---|---|
| Page says "Cannot reach the server" | `VITE_API_URL` is wrong or missing (fix it, then redeploy Vercel), or the server is still waking up (wait a minute and retry) |
| Browser console says "blocked by CORS policy" | `FRONTEND_URL` on Render does not exactly match your Vercel address (check `https://`, spelling, and no slash at the end) |
| Render log: `Database connection failed` with authentication | Wrong Atlas password in `MONGODB_URI`; use letters and numbers only |
| Render log: `Database connection failed` with timeout or IP | Atlas Network Access is missing 0.0.0.0/0, or has not finished applying |
| Render log: `Set MONGODB_URI and a JWT_SECRET...` | A variable is missing or `JWT_SECRET` is under 32 characters |
| Render build fails: cannot find `package.json` | Root Directory is not set to `backend` |
| Vercel build fails: cannot find `package.json` | Root Directory is not set to `frontend` |
| Wrong admin email or password | The admin is only created on a database with no users. Reset the password from Atlas (delete the user document) or ask me for a recovery step |
| New version does not show on phones | Close and reopen the app; the installed copy updates on the next visit |
