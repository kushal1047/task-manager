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
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { useEffect } from "react";
import { setupCacheHandling } from "./utils/cacheUtils";
import { setupServiceWorkerHandling } from "./utils/swUtils";
import ErrorBoundary from "./components/ErrorBoundary";

// Component that only renders when authenticated
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
      <PWAInstallPrompt />
    </>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Handle cache invalidation and service worker setup on app load
  useEffect(() => {
    const deploymentChanged = setupCacheHandling();
    setupServiceWorkerHandling();

    // Debug deployment issues in development
    // Removed debugDeployment call to prevent 404 errors in development

    // If deployment changed and user is authenticated, we might need to handle auth state
    if (deploymentChanged && isAuthenticated) {
      // The auth context will handle retrying the token validation
    }
  }, [isAuthenticated]);

  // Show loading state while checking authentication
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
        {/* Fallback route for any unmatched paths */}
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
