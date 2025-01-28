import { Route, Redirect } from "react-router-dom";

export default function ProtectedRoute({
  component: Component,
  user,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
}
