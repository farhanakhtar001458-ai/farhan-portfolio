// In-memory storage for Todo App
// Surgical: Only this file manages data persistence

import { Todo, TodoInput, TodoUpdate } from "@todo/shared";
import { v4 as uuidv4 } from "uuid";

const todos: Map<string, Todo> = new Map();

function nowISO(): string {
  return new Date().toISOString();
}

function validateTitle(title: unknown): title is string {
  return typeof title === "string" && title.trim().length > 0 && title.trim().length <= 200;
}

export const storage = {
  // GET /api/todos
  getAll(): Todo[] {
    return Array.from(todos.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // POST /api/todos
  create(input: TodoInput): Todo | { error: { code: "VALIDATION_ERROR"; field: "title" } } {
    if (!validateTitle(input.title)) {
      return { error: { code: "VALIDATION_ERROR" as const, field: "title" } };
    }
    const now = nowISO();
    const todo: Todo = {
      id: uuidv4(),
      title: input.title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    todos.set(todo.id, todo);
    return todo;
  },

  // PATCH /api/todos/:id
  update(id: string, updates: TodoUpdate): Todo | { error: { code: "VALIDATION_ERROR" | "NOT_FOUND"; field?: string } } {
    const todo = todos.get(id);
    if (!todo) {
      return { error: { code: "NOT_FOUND" as const } };
    }

    if (updates.title !== undefined && !validateTitle(updates.title)) {
      return { error: { code: "VALIDATION_ERROR" as const, field: "title" } };
    }

    const updated: Todo = {
      ...todo,
      ...updates,
      title: updates.title?.trim() ?? todo.title,
      updatedAt: nowISO(),
    };
    todos.set(id, updated);
    return updated;
  },

  // DELETE /api/todos/:id
  delete(id: string): { success: true } | { error: { code: "NOT_FOUND" } } {
    if (!todos.has(id)) {
      return { error: { code: "NOT_FOUND" as const } };
    }
    todos.delete(id);
    return { success: true };
  },

  // For testing
  clear(): void {
    todos.clear();
  },
};