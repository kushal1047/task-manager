import { useState } from "react";
import { loginUser } from "../api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const handleChange = (e) => setForm({ ...form, [e.name]: e.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { token, user } = await loginUser(form);
    localStorage.setItem("token", token);
    onLogin();
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
