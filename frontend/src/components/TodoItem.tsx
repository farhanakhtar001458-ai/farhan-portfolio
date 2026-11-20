// TodoItem Component
// Surgical: Only renders a single todo item

import { Todo } from "@todo/shared";
import { useTodos } from "../hooks";

interface Props {
  todo: Todo;
}

export default function TodoItem({ todo }: Props) {
  const { updateTodo, deleteTodo, loading } = useTodos();
  const isDeleting = loading;

  const handleToggle = async () => {
    try {
      await updateTodo(todo.id, { completed: !todo.completed });
    } catch {
      // Error handled by parent toast
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo(todo.id);
    } catch {
      // Error handled by parent toast
    }
  };

  return (
    <li className={`item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        className="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={loading}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      />
      <span className="title">{todo.title}</span>
      <button
        className="delete-btn"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete todo"
      >
        {isDeleting ? <span className="loading" /> : "Delete"}
      </button>
    </li>
  );
}