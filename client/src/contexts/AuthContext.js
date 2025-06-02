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

  // Check if user is authenticated on mount
  useEffect(() => {
    // Reset refs on mount
    authCheckRef.current = false;
    mountedRef.current = true;
    retryCountRef.current = 0;

    const checkAuth = async () => {
      // Prevent multiple simultaneous auth checks
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
            // Ensure we have both id and name before setting user
            if (userId && userName) {
              setUser({ id: userId, name: userName });
            } else {
              // If user data is incomplete, clear auth and force re-login
              storage.clearAuth();
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // If token is invalid, clear auth data
            storage.clearAuth();
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Token validation failed:", err);

        // Retry logic for network/server issues during deployment
        if (
          retryCountRef.current < maxRetries &&
          (err.message === ERROR_MESSAGES.NETWORK_ERROR ||
            err.message === "Server error. Please try again later." ||
            err.message === ERROR_MESSAGES.TIMEOUT_ERROR)
        ) {
          retryCountRef.current++;

          // Wait before retry (exponential backoff)
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
          // Only clear auth if it's an authentication error or max retries exceeded
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

    // Cleanup function
    return () => {
      mountedRef.current = false;
      authCheckRef.current = false;
    };
  }, []);

  // Register new user
  const register = useCallback(async (credentials) => {
    if (!mountedRef.current) return;

    setError(null);
    setLoading(true);

    try {
      // Validate input
      const validation = validateRegistration(credentials);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await registerUser(credentials);

      // Store user data
      storage.setUser(response.user);

      if (mountedRef.current) {
        setIsAuthenticated(true);
        // Ensure we set the user data immediately with the correct structure
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

  // Login user
  const login = useCallback(async (credentials) => {
    if (!mountedRef.current) return;

    setError(null);
    setLoading(true);

    try {
      // Validate input
      const validation = validateLogin(credentials);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await loginUser(credentials);

      // Store auth data
      storage.setToken(response.token);
      storage.setUser(response.user);

      // Update authentication state only if component is still mounted
      if (mountedRef.current) {
        setIsAuthenticated(true);
        // Ensure we set the user data immediately with the correct structure
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

  // Logout user
  const logout = useCallback(() => {
    // Clear storage first
    storage.clearAuth();

    // Clear browser cache to prevent any cached authentication data
    if ("caches" in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }

    // Notify service worker to clear cache
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CLEAR_CACHE",
      });
    }

    // Reset refs
    authCheckRef.current = false;

    // Update state only if component is still mounted
    if (mountedRef.current) {
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  // Clear error
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
