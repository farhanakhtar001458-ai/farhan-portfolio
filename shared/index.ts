// Shared types for Todo App - Single Source of Truth
// Generated from CONTRACT.md

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type TodoInput = Pick<Todo, "title">;
export type TodoUpdate = Partial<Pick<Todo, "title" | "completed">>;

export interface ApiError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";
  field?: string;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Type guards
export function isApiError(obj: unknown): obj is ApiError {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "code" in obj &&
    ["VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR"].includes((obj as ApiError).code)
  );
}

export function isTodo(obj: unknown): obj is Todo {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "title" in obj &&
    "completed" in obj &&
    "createdAt" in obj &&
    "updatedAt" in obj
  );
}