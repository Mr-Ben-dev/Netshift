import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import apiRouter from "./api/routes.js";
import { CONFIG } from "./config/constants.js";
import { corsMiddleware, createRateLimiter, helmetMiddlewares } from "./utils/security.js";

console.log("🚀 Initializing server...");

const app = express();

console.log("📦 Setting up middleware...");

try {
  app.set("trust proxy", true);
  console.log("  ✓ Trust proxy set");
  
  app.use(express.json({ limit: "1mb" }));
  console.log("  ✓ JSON parser added");
  
  app.use(helmetMiddlewares);
  console.log("  ✓ Helmet security added");
  
  app.use(corsMiddleware);
  console.log("  ✓ CORS middleware added");
  
  app.use(morgan(CONFIG.nodeEnv === "production" ? "combined" : "dev"));
  console.log("  ✓ Morgan logger added");
} catch (error) {
  console.error("❌ Middleware setup failed:", error);
  process.exit(1);
}

console.log("🛣️  Setting up routes...");

try {
  app.get("/health", (_, res) => res.json({
    success: true,
    data: { status: "ok", version: CONFIG.version }
  }));
  console.log("✅ Health route added");

  // Apply rate limiter conditionally - skip for icon and health-check endpoints
  app.use("/api", (req, res, next) => {
    // Skip rate limiting for icon endpoints (static resources)
    if (req.path.startsWith('/coins/icon/')) {
      return next();
    }
    // Apply rate limiter with more generous limits
    return createRateLimiter(300, 15 * 60 * 1000)(req, res, next);
  }, apiRouter);
  console.log("✅ API routes added with conditional rate limiting");

  app.use((req, res) => res.status(404).json({ success: false, error: "Not found" }));
  console.log("✅ 404 handler added");

  app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ 
      success: false, 
      error: CONFIG.nodeEnv === "production" ? "Server error" : err.message 
    });
  });
  console.log("✅ Error handler added");
} catch (error) {
  console.error("❌ Route setup failed:", error);
  process.exit(1);
}

async function start() {
  try {
    console.log("Starting NetShift backend...");
    console.log("Config loaded:", {
      port: CONFIG.port,
      mongoUri: CONFIG.mongoUri ? "SET" : "NOT SET",
      nodeEnv: CONFIG.nodeEnv,
      sideshiftSecret: CONFIG.sideshift.secret ? "SET" : "NOT SET"
    });
    
    if (CONFIG.mongoUri) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(CONFIG.mongoUri);
      console.log("✅ MongoDB connected");
    } else {
      console.warn("⚠️  No MONGODB_URI found, running without database");
    }
    
    app.listen(CONFIG.port, () => {
      console.log(`\n✅ NetShift backend started!`);
      console.log(`📍 http://localhost:${CONFIG.port}`);
      console.log(`🔗 Health: http://localhost:${CONFIG.port}/health`);
      console.log(`🚀 Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

start();

export default app;
