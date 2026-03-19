import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(express.json({ limit: "1mb" }));
// =========================
// LOCALHOST-ONLY (DEV) CODE
// =========================
// For local dev, it's fine to set CORS to your local frontend origin.
// When deploying to production, you should lock this down to your real domain(s).
//
// To switch to production:
// - Comment out the block from "START LOCALHOST-ONLY (DEV) CODE" to "END LOCALHOST-ONLY (DEV) CODE"
// - Replace it with a strict allowlist, e.g. `origin: ["https://yourdomain.com"]`
//
// START LOCALHOST-ONLY (DEV) CODE
app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN.split(",").map((s) => s.trim()),
  })
);
// END LOCALHOST-ONLY (DEV) CODE

app.get("/api/health", (req, res) => {
  return res.json({ ok: true, ts: Date.now() });
});

app.use("/api", chatRoutes);

const connectDB = async() => {
    try {
        if(!process.env.MONGODB_URI) {
          throw new Error("Missing MONGODB_URI (see backend/.env.example)");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");
    } catch(err) {
        console.log("Failed to connect with Db", err);
        process.exit(1);
    }
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
    console.log(`MOCK_OPENAI=${process.env.MOCK_OPENAI}`);
  });
});


// app.post("/test", async (req, res) => {
//     const options = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//             model: "gpt-4o-mini",
//             messages: [{
//                 role: "user",
//                 content: req.body.message
//             }]
//         })
//     };

//     try {
//         const response = await fetch("https://api.openai.com/v1/chat/completions", options);
//         const data = await response.json();
//         //console.log(data.choices[0].message.content); //reply
//         res.send(data.choices[0].message.content);
//     } catch(err) {
//         console.log(err);
//     }
// });

