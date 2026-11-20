// TodoList Component
// Surgical: Only renders the list of todos

import { useTodos } from "../hooks";
import TodoItem from "./TodoItem";

export default function TodoList() {
  const { todos, loading, error } = useTodos();

  if (loading) {
    return (
      <div className="empty">
        <span className="loading" style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="empty">Failed to load todos</div>;
  }

  if (todos.length === 0) {
    return <div className="empty">No todos yet. Add one above!</div>;
  }

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <>
      <ul className="list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      <div className="stats">
        {activeCount} active · {completedCount} completed
      </div>
    </>
  );
}