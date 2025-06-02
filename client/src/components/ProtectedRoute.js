import { Navigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import LoadingBar from "./LoadingBar";

export default function ProtectedRoute({ isValid, children }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (isValid === null) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 150);
    } else {
      setProgress(100);
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isValid]);

  if (isValid === null) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 min-h-screen">
        <LoadingBar percent={progress} />
        <span className="mt-4 text-indigo-500 font-medium text-sm">
          Loading...
        </span>
      </div>
    );
  }
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
