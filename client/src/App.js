import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useTasks } from "./hooks/useTasks";
import Register from "./components/Register";
import Login from "./components/Login";
import TaskView from "./components/TaskView";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { setupCacheHandling } from "./utils/cacheUtils";
import ErrorBoundary from "./components/ErrorBoundary";

// Main app component for authenticated users
function AuthenticatedApp({ user }) {
  const {
    tasks,
    sharedTasks,
    loading: tasksLoading,
    error: tasksError,
    updatingTasks,
    refreshSharedTasks,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
    handleSetDueDate,
    handleUnlinkSharedTask,
  } = useTasks();

  return (
    <>
      <TaskView
        tasks={tasks}
        sharedTasks={sharedTasks}
        user={user}
        loading={tasksLoading}
        error={tasksError}
        updatingTasks={updatingTasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onSetDueDate={handleSetDueDate}
        onUnlinkSharedTask={handleUnlinkSharedTask}
        onRefreshSharedTasks={refreshSharedTasks}
      />
    </>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Clear old cache when app loads
  useEffect(() => {
    const deploymentChanged = setupCacheHandling();

    // If we detect a deployment change while user is logged in,
    // the auth context will handle token validation
    if (deploymentChanged && isAuthenticated) {
      // Auth context handles retry logic automatically
    }
  }, [isAuthenticated]);

  // Show spinner while we check if user is logged in
  if (authLoading) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
          <p className="mt-1 text-sm text-gray-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <AuthenticatedApp user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Catch-all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
