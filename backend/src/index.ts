// Todo App Backend Entry Point
// Simplicity: Minimal setup, only what's needed

import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Middleware
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

// API Routes
app.use("/api", routes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR" } });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   CORS enabled for: ${FRONTEND_ORIGIN}`);
});

export default app;