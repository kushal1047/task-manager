import { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const handleChange = (e) => setForm({ ...form, [e.name]: e.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { token } = await loginUser(form);
    localStorage.setItem("token", token);
    onLogin();
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={(e) => handleChange(e.target)}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => handleChange(e.target)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
