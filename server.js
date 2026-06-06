require("dotenv").config();

const app = require("./app");
const connectDB = require("./Backend/config/db");

const PORT = process.env.PORT || 5000;

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║           VendorBridge API Server            ║
╠══════════════════════════════════════════════╣
║  Status   : Running                          ║
║  Port     : ${PORT}                              ║
║  Env      : ${(process.env.NODE_ENV || "development").padEnd(30)} ║
║  Base URL : http://localhost:${PORT}/api/v1     ║
╚══════════════════════════════════════════════╝
      `);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = (signal) => {
      console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const mongoose = require("mongoose");
        await mongoose.connection.close();
        console.log("✅ MongoDB connection closed.");
        console.log("👋 Server shut down.");
        process.exit(0);
      });

      // Force exit after 10s if not done
      setTimeout(() => {
        console.error("⚠️  Forced shutdown after timeout.");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

    // ─── Unhandled Rejections ─────────────────────────────────────────────────
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Promise Rejection:", reason);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
