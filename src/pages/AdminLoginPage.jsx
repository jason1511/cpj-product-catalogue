import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Login gagal.");
      }

      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="py-10">
      <Container>
        <section className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Admin Login
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Masuk ke Dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Masukkan password admin untuk mengelola katalog produk.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}
    <label className="text-sm font-semibold text-slate-700">
  Username
</label>

<input
  type="text"
  value={username}
  onChange={(event) => setUsername(event.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
  autoComplete="username"
/>
          <form onSubmit={handleSubmit} className="mt-6">
            <label className="text-sm font-semibold text-slate-700">
              Password Admin
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Masuk Admin"}
            </button>
          </form>
        </section>
      </Container>
    </main>
  );
}

export default AdminLoginPage;