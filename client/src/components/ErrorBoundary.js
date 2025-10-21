import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Show error UI when something breaks
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // If it's a build issue, try clearing cache and reloading
    if (error.message && error.message.includes("MIME type")) {
      console.log("Detected MIME type error, clearing cache...");
      this.clearCacheAndReload();
    }
  }

  clearCacheAndReload = async () => {
    try {
      // Clear browser cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Clear saved data
      localStorage.clear();

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error clearing cache:", error);
      // If clearing cache fails, just refresh
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              It looks like there was an issue loading the app. This might be
              due to a recent deployment.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.clearCacheAndReload}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Cache & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
