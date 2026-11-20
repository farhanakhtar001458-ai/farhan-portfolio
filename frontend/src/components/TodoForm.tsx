// TodoForm Component
// Surgical: Only handles new todo input

import { useState, FormEvent } from "react";
import { useTodos } from "../hooks";

export default function TodoForm() {
  const [title, setTitle] = useState("");
  const { createTodo, loading } = useTodos();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    try {
      await createTodo(title.trim());
      setTitle("");
    } catch (err: unknown) {
      // Error handled by parent toast
      throw err;
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        maxLength={200}
        disabled={loading}
        aria-label="New todo"
      />
      <button className="btn" type="submit" disabled={!title.trim() || loading}>
        {loading ? <span className="loading" /> : "Add"}
      </button>
    </form>
  );
}