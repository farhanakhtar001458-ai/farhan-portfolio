// API Client for Todo App
// Surgical: Only handles HTTP communication

import { Todo, TodoInput, TodoUpdate, ApiResponse, ApiError } from "@todo/shared";

const API_BASE = "/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || { code: "INTERNAL_ERROR" } };
    }

    return { data: data.data };
  } catch {
    return { error: { code: "INTERNAL_ERROR" } };
  }
}

export const api = {
  getTodos: () => request<Todo[]>("todos"),

  createTodo: (input: TodoInput) =>
    request<Todo>("todos", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateTodo: (id: string, updates: TodoUpdate) =>
    request<Todo>(`todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteTodo: (id: string) =>
    request<{ success: true }>(`todos/${id}`, {
      method: "DELETE",
    }),
};

// Optimistic update helpers
export function applyOptimisticCreate(
  todos: Todo[],
  tempId: string,
  title: string
): Todo[] {
  const now = new Date().toISOString();
  const optimistic: Todo = {
    id: tempId,
    title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  return [optimistic, ...todos];
}

export function applyOptimisticUpdate(
  todos: Todo[],
  id: string,
  updates: TodoUpdate
): Todo[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, ...updates, updatedAt: new Date().toISOString() } : todo
  );
}

export function applyOptimisticDelete(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}