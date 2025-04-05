import { Navigate } from "react-router";

export default function ProtectedRoute({ isValid, children }) {
  if (isValid === null) {
    return <div>Loading...</div>;
  }
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
