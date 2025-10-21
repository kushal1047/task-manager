import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { registerUser, loginUser, validateToken } from "../api";
import storage from "../utils/storage";
import { validateRegistration, validateLogin } from "../utils/validation";
import { ERROR_MESSAGES } from "../config/constants";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authCheckRef = useRef(false);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Check if user is logged in when component mounts
  useEffect(() => {
    // Reset tracking variables when component mounts
    authCheckRef.current = false;
    mountedRef.current = true;
    retryCountRef.current = 0;

    const checkAuth = async () => {
      // Don't run multiple auth checks at the same time
      if (authCheckRef.current) {
        return;
      }

      authCheckRef.current = true;
      const token = storage.getToken();

      if (!token) {
        if (mountedRef.current) {
          setIsAuthenticated(false);
          setLoading(false);
        }
        authCheckRef.current = false;
        return;
      }

      try {
        const { valid } = await validateToken();

        if (mountedRef.current) {
          setIsAuthenticated(valid);

          if (valid) {
            const userId = storage.getUserId();
            const userName = storage.getUserName();
            // Make sure we have complete user data before setting state
            if (userId && userName) {
              setUser({ id: userId, name: userName });
            } else {
              // Missing user data - clear everything and force login
              storage.clearAuth();
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // Token is bad - clear everything
            storage.clearAuth();
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Token validation failed:", err);

        // Retry a few times if it's just a network/server hiccup
        if (
          retryCountRef.current < maxRetries &&
          (err.message === ERROR_MESSAGES.NETWORK_ERROR ||
            err.message === "Server error. Please try again later." ||
            err.message === ERROR_MESSAGES.TIMEOUT_ERROR)
        ) {
          retryCountRef.current++;

          // Wait a bit before trying again (longer each time)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCountRef.current)
          );

          if (mountedRef.current) {
            authCheckRef.current = false;
            checkAuth(); // Retry
            return;
          }
        }

        if (mountedRef.current) {
          setIsAuthenticated(false);
          setUser(null);
          // Clear auth data if it's a real auth error or we've tried too many times
          if (
            err.message === ERROR_MESSAGES.AUTH_ERROR ||
            retryCountRef.current >= maxRetries
          ) {
            storage.clearAuth();
          }
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        authCheckRef.current = false;
      }
    };

    checkAuth();

    // Clean up when component unmounts
    return () => {
      mountedRef.current = false;
      authCheckRef.current = false;
    };
  }, []);

  // Sign up a new user
  const register = useCallback(async (credentials) => {
    if (!mountedRef.current) return;

    setError(null);
    setLoading(true);

    try {
      // Check if the form data looks good
      const validation = validateRegistration(credentials);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await registerUser(credentials);

      // Save user info to localStorage
      storage.setUser(response.user);

      if (mountedRef.current) {
        setIsAuthenticated(true);
        // Set user data in the right format
        setUser({
          id: response.user.id,
          name: response.user.firstName || response.user.name,
        });
      }

      return response;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Sign in existing user
  const login = useCallback(async (credentials) => {
    if (!mountedRef.current) return;

    setError(null);
    setLoading(true);

    try {
      // Check if the form data looks good
      const validation = validateLogin(credentials);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await loginUser(credentials);

      // Save login info to localStorage
      storage.setToken(response.token);
      storage.setUser(response.user);

      // Update state only if component is still mounted
      if (mountedRef.current) {
        setIsAuthenticated(true);
        // Set user data in the right format
        setUser({
          id: response.user.id,
          name: response.user.firstName || response.user.name,
        });
      }

      return response;
    } catch (err) {
      console.error("useAuth: login error:", err);
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Sign out user
  const logout = useCallback(() => {
    // Clear localStorage first
    storage.clearAuth();

    // Clear browser cache to remove any cached auth data
    if ("caches" in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }

    // Reset tracking variables
    authCheckRef.current = false;

    // Update state only if component is still mounted
    if (mountedRef.current) {
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  // Clear any error messages
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
