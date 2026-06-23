import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function parseJsonResponse(response) {
    const responseText = await response.text();

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error(
        `API tidak mengembalikan JSON. Status: ${
          response.status
        }. Response: ${responseText.slice(0, 120)}`,
      );
    }
  }

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
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await parseJsonResponse(response);

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
            Admin / Staff Login
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Masuk ke Dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Masuk sebagai admin atau staff untuk mengelola katalog produk,
            gambar, stok, dan data internal sesuai hak akses akun.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="admin-username"
                className="text-sm font-semibold text-slate-700"
              >
                Username
              </label>

              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Masuk Dashboard"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold leading-6 text-slate-500">
              Staff hanya dapat mengelola katalog, gambar, dan stok sesuai
              lokasi akun. Admin dapat mengakses semua lokasi, user, audit log,
              dan fitur maintenance.
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}

export default AdminLoginPage;