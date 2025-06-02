import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      // User accepted the install prompt
    } else {
      // User dismissed the install prompt
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-indigo-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Install Task App
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Get quick access to your tasks with our app
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-md hover:bg-indigo-700"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
