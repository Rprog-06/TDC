import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token") === "loggedIn") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = (event) => {
    event.preventDefault();

    if (email === "admin@tdc.com" && password === "123456") {
      localStorage.setItem("token", "loggedIn");
      navigate("/dashboard");
      return;
    }

    alert("Invalid Credentials");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl bg-white p-8 text-left shadow-lg"
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
          The Date Crew
        </p>
        <h1 className="mb-6 text-3xl font-bold text-slate-950">
          Matchmaker Login
        </h1>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <input
          className="mb-4 w-full rounded-lg border border-slate-300 p-3"
          placeholder="admin@tdc.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          type="password"
          className="mb-6 w-full rounded-lg border border-slate-300 p-3"
          placeholder="123456"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
