import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { validateRegistration } from "../utils/validation";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState([]);
  const { register, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error messages when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if form data is valid
    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      setErrors([err.message]);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 relative">
      {/* Logo in top left */}
      <div className="absolute top-4 left-4">
        <h1 className="italic text-2xl font-bold text-indigo-600">
          Get it Done.
        </h1>
      </div>

      {/* Register form centered */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 font-semibold">
              Join us to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name field */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.length > 0 ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your first name"
                disabled={loading}
              />
            </div>

            {/* Last Name field */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.length > 0 ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your last name"
                disabled={loading}
              />
            </div>

            {/* Username field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.length > 0 ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Choose a username"
                disabled={loading}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.length > 0 ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Choose a password"
                disabled={loading}
              />
            </div>

            {/* Error messages */}
            {(errors.length > 0 || authError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-sm text-red-600">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {authError && <li>{authError}</li>}
                </ul>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
