import { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const handleChange = (e) => setForm({ ...form, [e.name]: e.value });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { token } = await registerUser(form);
    localStorage.setItem("token", token);
    navigate("/");
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
