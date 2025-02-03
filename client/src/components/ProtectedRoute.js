import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isValid, children }) {
  if (isValid === null) {
    return <div>Loading...</div>; // or a spinner
  }
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
