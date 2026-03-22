# SigmaGPT
A MERN-based ChatGPT-style app (Frontend + Backend) using MongoDB and OpenAI (optional).

## Run locally

### 1) Install

```bash
npm run install:all
```

### 2) Backend env
Create `Backend/.env` (you already have an example at `Backend/.env.example`).

- **MongoDB**: set `MONGODB_URI=...`
- **AI**:
  - If you have a key: set `OPENAI_API_KEY=...` and `MOCK_OPENAI=false`
  - If you don’t have a key yet: set `MOCK_OPENAI=true`
- **CORS**: for local dev, set `CORS_ORIGIN=http://localhost:5173`

### 3) Frontend env
Create `Frontend/.env` (example: `Frontend/.env.example`).

- Set **`VITE_API_BASE_URL=http://localhost:8080`**

### 4) Start both

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8080` (health: `GET /api/health`)

## Deploy (Atlas + Render)

See **[DEPLOY.md](./DEPLOY.md)** for MongoDB Atlas, GitHub, and Render (uses `render.yaml`).
