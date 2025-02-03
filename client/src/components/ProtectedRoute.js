import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isValid, children }) {
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
