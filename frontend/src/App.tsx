// Main App Component
// Simplicity: Composes components, handles errors

import { useToast } from "./hooks";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import ToastContainer from "./components/Toast";

export default function App() {
  const { show: showToast } = useToast();

  // Global error handler for hooks
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    const message = args.join(" ");
    if (message.includes("Failed to")) {
      showToast(message, "error");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Todos</h1>
      </header>
      <TodoForm onError={(err) => showToast(err.message || "Operation failed", "error")} />
      <TodoList />
      <ToastContainer />
    </div>
  );
}