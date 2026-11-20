// Custom Hooks for Todo App
// Simplicity: Minimal state logic, reusable

import { useState, useEffect, useCallback } from "react";
import { Todo } from "@todo/shared";
import { api, applyOptimisticCreate, applyOptimisticUpdate, applyOptimisticDelete } from "./api";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const result = await api.getTodos();
    if (result.error) {
      setError(result.error.message || "Failed to load todos");
    } else if (result.data) {
      setTodos(result.data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = useCallback(async (title: string) => {
    const tempId = `temp-${Date.now()}`;
    // Optimistic update
    setTodos((prev) => applyOptimisticCreate(prev, tempId, title));

    const result = await api.createTodo({ title });
    if (result.error) {
      // Rollback
      setTodos((prev) => applyOptimisticDelete(prev, tempId));
      throw result.error;
    }
    // Replace temp with real
    setTodos((prev) =>
      prev.map((t) => (t.id === tempId ? result.data! : t))
    );
    return result.data;
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    const previousTodos = todos;
    // Optimistic update
    setTodos((prev) => applyOptimisticUpdate(prev, id, updates));

    const result = await api.updateTodo(id, updates);
    if (result.error) {
      // Rollback
      setTodos(previousTodos);
      throw result.error;
    }
    return result.data;
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const previousTodos = todos;
    // Optimistic update
    setTodos((prev) => applyOptimisticDelete(prev, id));

    const result = await api.deleteTodo(id);
    if (result.error) {
      // Rollback
      setTodos(previousTodos);
      throw result.error;
    }
  }, [todos]);

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    refetch: fetchTodos,
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: "error" }[]>([]);

  const show = useCallback((message: string, type?: "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, show };
}