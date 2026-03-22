# Deploy SigmaGPT (MongoDB Atlas + Render)

This project uses **`render.yaml`** at the repo root so you can deploy both the API and the static frontend from one GitHub repo.

## 1. MongoDB Atlas

1. Create a cluster (free tier is fine).
2. **Database Access**: create a user (e.g. `delta-student`) with a password you save securely.
3. **Network Access**: add **`0.0.0.0/0`** (allow from anywhere) so Render’s servers can connect. You can tighten this later.
4. **Connect → Drivers**: copy your **SRV** connection string and:
   - Replace `<password>` with your user’s password (URL-encode special characters if needed).
   - Insert your database name before the query string, e.g. `...mongodb.net/sigmagpt?...` (this app uses the `sigmagpt` database name).

## 2. Push code to GitHub

1. Create an empty repository on GitHub (no need to add a README if this repo already has one).
2. From your machine (replace `YOUR_USER` / `YOUR_REPO`):

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Render (Blueprint)

1. In [Render Dashboard](https://dashboard.render.com): **New → Blueprint**.
2. Connect the GitHub repository and select the branch (usually `main`).
3. Render reads **`render.yaml`**. When prompted, set:
   - **`MONGODB_URI`** — full Atlas SRV string (with `/sigmagpt` and password).
   - **`OPENAI_API_KEY`** — your OpenAI API key (or use mock mode only for testing; set `MOCK_OPENAI=true` in the Dashboard if you must skip OpenAI).

The **frontend** build sets **`VITE_API_BASE_URL`** from the backend service’s public URL (`RENDER_EXTERNAL_URL`) so the UI calls the correct API.

## 4. After deploy (recommended)

1. **Backend health**: open `https://<your-backend>.onrender.com/api/health` — you should see `{ "ok": true, ... }`.
2. **CORS**: Until you set **`CORS_ORIGIN`**, the backend allows any origin (`*`). For production, in the **backend** service on Render add:

   `CORS_ORIGIN=https://<your-frontend>.onrender.com`

   (Use your static site’s URL from the Render Dashboard.) Redeploy the backend if needed.

3. If the **frontend** build ever fails to resolve the API URL, set **`VITE_API_BASE_URL`** manually on the static site to your backend’s `https://...onrender.com` URL (no trailing slash) and trigger a new deploy.

## Free tier notes

- Services may **spin down** after inactivity; the first request can take ~30–60 seconds.
- Keep **secrets only** in Render environment variables or local `.env` (never commit `.env`).
