// API Routes for Todo App
// Surgical: Only defines HTTP handlers, delegates to storage

import { Request, Response, Router } from "express";
import { storage } from "./storage.js";
import { Todo, ApiError } from "@todo/shared";

const router = Router();

// Error helper
function sendError(res: Response, status: number, error: ApiError) {
  res.status(status).json({ error });
}

// GET /api/todos
router.get("/todos", (_req: Request, res: Response) => {
  try {
    const todos = storage.getAll();
    res.json({ data: todos });
  } catch {
    sendError(res, 500, { code: "INTERNAL_ERROR" });
  }
});

// POST /api/todos
router.post("/todos", (req: Request, res: Response) => {
  try {
    const result = storage.create(req.body);
    if ("error" in result) {
      return sendError(res, 400, result.error);
    }
    res.status(201).json({ data: result });
  } catch {
    sendError(res, 500, { code: "INTERNAL_ERROR" });
  }
});

// PATCH /api/todos/:id
router.patch("/todos/:id", (req: Request, res: Response) => {
  try {
    const result = storage.update(req.params.id, req.body);
    if ("error" in result) {
      const status = result.error.code === "NOT_FOUND" ? 404 : 400;
      return sendError(res, status, result.error);
    }
    res.json({ data: result });
  } catch {
    sendError(res, 500, { code: "INTERNAL_ERROR" });
  }
});

// DELETE /api/todos/:id
router.delete("/todos/:id", (req: Request, res: Response) => {
  try {
    const result = storage.delete(req.params.id);
    if ("error" in result) {
      return sendError(res, 404, result.error);
    }
    res.json({ data: result });
  } catch {
    sendError(res, 500, { code: "INTERNAL_ERROR" });
  }
});

export default router;