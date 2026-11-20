# API Contract: Todo App

## Endpoints

### GET /api/todos
**Response:** `Todo[]`
**Errors:** 500 `{ code: "INTERNAL_ERROR" }`

### POST /api/todos
**Request:** `{ title: string }`
**Response:** `Todo` (created)
**Errors:** 400 `{ code: "VALIDATION_ERROR", field: "title" }`, 500 `{ code: "INTERNAL_ERROR" }`

### PATCH /api/todos/:id
**Request:** `{ title?: string; completed?: boolean }`
**Response:** `Todo` (updated)
**Errors:** 400 `{ code: "VALIDATION_ERROR" }`, 404 `{ code: "NOT_FOUND" }`, 500 `{ code: "INTERNAL_ERROR" }`

### DELETE /api/todos/:id
**Response:** `{ success: true }`
**Errors:** 404 `{ code: "NOT_FOUND" }`, 500 `{ code: "INTERNAL_ERROR" }`

---

## Shared Types

```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface ApiError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";
  field?: string;
  message?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
```

---

## Frontend Requirements

- Display todo list with checkbox, title, delete button
- Add new todo via input + button
- Toggle completion on checkbox change
- Delete todo on button click
- Optimistic UI updates (update immediately, rollback on error)
- Loading states
- Error toast notifications

---

## Backend Requirements

- In-memory storage (array) - no database needed for demo
- UUID v4 for IDs
- ISO timestamps
- CORS enabled for frontend origin
- Input validation (title required, non-empty, max 200 chars)
- Proper HTTP status codes