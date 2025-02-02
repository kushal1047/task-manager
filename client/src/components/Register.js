import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const handleChange = (e) => setForm({ ...form, [e.name]: e.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { token, user } = await registerUser(form);
    localStorage.setItem("token", token);
    onRegister();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
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
      <button type="submit">Sign Up</button>
    </form>
  );
}
