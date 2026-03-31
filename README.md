# SigmaGPT

A production-ready MERN-based ChatGPT-style application with real-time conversation management, MongoDB persistence, and OpenAI integration.

## Features

- ?? **Multi-threaded conversations** — Multiple independent chat sessions
- ?? **Full conversation context** — AI maintains memory across exchanges
- ?? **Persistent storage** — All messages saved to MongoDB
- ? **Real-time typing animation** — Word-by-word response streaming
- ?? **Markdown + syntax highlighting** — Rich content rendering
- ?? **Mock mode** — Test without OpenAI API key
- ?? **Responsive UI** — Built with React and Vite
- ?? **Production-ready** — Security headers, input validation, error handling

## Tech Stack

- **Frontend**: React 19 + Vite + React Markdown
- **Backend**: Express.js + Node.js
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI Chat API
- **Deployment**: Render + MongoDB Atlas

## Quick Start (Local Development)

### 1. Install Dependencies

`bash
npm run install:all
`

### 2. Configure Backend

Create Backend/.env:

`env
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/sigmagpt
OPENAI_API_KEY=your_key_here
MOCK_OPENAI=false
CORS_ORIGIN=http://localhost:5173
`

**Without OpenAI key?** Set MOCK_OPENAI=true to test with mock responses.

### 3. Configure Frontend

Create Frontend/.env:

`env
VITE_API_BASE_URL=http://localhost:8080
`

### 4. Start Development

`bash
npm run dev
`

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

## Project Structure

`
SigmaGPT/
+-- Backend/           # Express API server
¦   +-- models/       # MongoDB schemas
¦   +-- routes/       # API endpoints
¦   +-- utils/        # Helper functions (OpenAI integration)
¦   +-- server.js
+-- Frontend/         # React + Vite app
¦   +-- src/
¦       +-- App.jsx
¦       +-- Chat.jsx
¦       +-- ChatWindow.jsx
¦       +-- Sidebar.jsx
+-- PRODUCTION_SETUP.md     # Deployment guide
+-- render.yaml             # Render Blueprint config
+-- README.md
`

## Deployment

### Production Checklist

- ? Input validation & security headers
- ? Full conversation context passed to OpenAI
- ? Error handling & retry logic
- ? Database indexes for performance
- ? Environment-based configuration
- ? Comprehensive logging & monitoring

### Deploy to Render

See **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** for step-by-step deployment guide.

Quick summary:
1. Set up MongoDB Atlas + OpenAI API
2. Push to GitHub
3. Go to Render ? New ? Blueprint
4. Configure environment variables
5. Deploy!

For quick reference: **[DEPLOY.md](./DEPLOY.md)**

## Documentation

- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** — Complete production deployment guide
- **[DEPLOY.md](./DEPLOY.md)** — Quick deployment reference

## Development Scripts

`bash
# Root level
npm run install:all        # Install dependencies
npm run dev                # Start backend + frontend
npm run dev:backend        # Backend only
npm run dev:frontend       # Frontend only

# Backend
npm --prefix Backend run dev    # With auto-reload
npm --prefix Backend start      # Production

# Frontend
npm --prefix Frontend run dev       # Development
npm --prefix Frontend run build     # Production build
`

## Security Features

- **CORS Configuration** — Restricted in production, flexible in dev
- **Input Validation** — Message length limits, type checking
- **Security Headers** — XSS protection, MIME-type sniffing prevention
- **Error Handling** — Sensitive details hidden in production
- **API Timeouts** — Prevents hanging requests

## Production Improvements

This version includes:

1. **AI Context** — Passes full conversation history to OpenAI
2. **Enhanced Validation** — Input length limits (4000 chars), type checking
3. **Security Headers** — Production-ready CORS, XSS protection
4. **Better Error Messages** — Dev: detailed; Prod: user-friendly
5. **Database Optimization** — Indexes for performance
6. **Deployment Docs** — Comprehensive guide included
7. **Monitoring Ready** — Health checks, structured logging

## License

MIT

---

**Ready to deploy?** Start with [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
