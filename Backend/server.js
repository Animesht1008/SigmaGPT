import "./loadEnv.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const IS_PRODUCTION = NODE_ENV === "production";

// Request size limit
app.use(express.json({ limit: "1mb" }));

// =========================
// CORS CONFIGURATION
// =========================
// DEV: Allow any origin for local testing
// PROD: Strict allowlist from environment variable
// 
// START DEV CODE (comment out for production)
// if (!IS_PRODUCTION) {
//   app.use(
//     cors({
//       origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN.split(",").map((s) => s.trim()),
//       credentials: true,
//     })
//   );
//   console.log(`[DEV] CORS enabled for: ${CORS_ORIGIN}`);
// }
// END DEV CODE

// START PROD CODE (uncomment for production)
if (IS_PRODUCTION) {
  const allowedOrigins = (CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowedOrigins.length === 0) {
    console.warn("[PROD] Warning: CORS_ORIGIN not configured, allowing no origins");
  }
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
  console.log(`[PROD] CORS enabled for: ${allowedOrigins.join(", ")}`);
} else {
  app.use(
    cors({
      origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  console.log(`[DEV] CORS enabled for: ${CORS_ORIGIN}`);
}
// END PROD CODE

// Security middleware
app.use((req, res, next) => {
  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Enable XSS protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // PROD: Add stricter headers
  // if (IS_PRODUCTION) {
  //   res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  //   res.setHeader("Content-Security-Policy", "default-src 'self'");
  //   res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // }
  next();
});

app.get("/api/health", (req, res) => {
  return res.json({ ok: true, ts: Date.now(), env: NODE_ENV });
});

app.use("/api", chatRoutes);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const statusCode = err.statusCode || 500;
  const message = IS_PRODUCTION ? "Internal server error" : err.message;
  return res.status(statusCode).json({ error: message });
});

const connectDB = async() => {
    try {
        if(!process.env.MONGODB_URI) {
          throw new Error("Missing MONGODB_URI (see Backend/.env.example)");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[${NODE_ENV.toUpperCase()}] Connected to MongoDB`);
    } catch(err) {
        console.error(`[ERROR] Failed to connect to MongoDB: ${err.message}`);
        process.exit(1);
    }
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[${NODE_ENV.toUpperCase()}] Server running on port ${PORT}`);
    console.log(`[CONFIG] MOCK_OPENAI=${process.env.MOCK_OPENAI}`);
    console.log(`[CONFIG] CORS_ORIGIN=${CORS_ORIGIN}`);
  });
});


