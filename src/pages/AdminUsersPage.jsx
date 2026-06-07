import { useEffect, useState } from "react";
import AdminTopBar from "../components/AdminTopBar";
import Container from "../components/Container";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "staff",
  });

  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function parseJsonResponse(response) {
    const responseText = await response.text();

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error(
        `API tidak mengembalikan JSON. Status: ${response.status}. Response: ${responseText.slice(
          0,
          120,
        )}`,
      );
    }
  }

  async function loadUsers() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/users");
      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengambil data user.");
      }

      setUsers(data.users);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    try {
      setIsCreating(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal menambahkan user.");
      }

      setFormData({
        username: "",
        password: "",
        role: "staff",
      });

      await loadUsers();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleUserStatus(user) {
    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Aktifkan user ${user.username}?`
        : `Nonaktifkan user ${user.username}?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: nextStatus,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengubah status user.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                isActive: nextStatus,
              }
            : currentUser,
        ),
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    if (!passwordResetUser) return;

    try {
      setIsResettingPassword(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/admin/users/${passwordResetUser.id}/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        },
      );

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengubah password user.");
      }

      alert(`Password untuk ${passwordResetUser.username} berhasil diperbarui.`);
      setPasswordResetUser(null);
      setNewPassword("");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <main className="py-10">
      <Container>
        <AdminTopBar />

        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-10">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_38%)]" />

          <div className="relative">
            <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
              Admin Only
            </p>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
              Kelola User Admin
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Tambahkan akun admin atau staff. Staff hanya digunakan untuk
              mengelola produk, sedangkan admin dapat mengakses pengaturan user.
            </p>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={handleCreateUser}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-black text-slate-950">
              Tambah User
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(event) =>
                    updateField("username", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  autoComplete="new-password"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Minimal 6 karakter.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Menyimpan..." : "Tambah User"}
              </button>
            </div>
          </form>

          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-2xl font-black text-slate-950">
                Daftar User
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Total {users.length} user terdaftar.
              </p>
            </div>

            {isLoading ? (
              <div className="p-6 text-sm font-semibold text-slate-600">
                Memuat data user...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      <th className="px-5 py-4 font-bold">Username</th>
                      <th className="px-5 py-4 font-bold">Role</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                      <th className="px-5 py-4 text-right font-bold">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-950">
                            {user.username}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {user.id}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              user.role === "admin"
                                ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                                : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                            }
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              user.isActive
                                ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                                : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
                            }
                          >
                            {user.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordResetUser(user);
                                setNewPassword("");
                              }}
                              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600"
                            >
                              Reset Password
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user)}
                              className={
                                user.isActive
                                  ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                                  : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                              }
                            >
                              {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>

        {passwordResetUser && (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Reset Password
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ubah password untuk user{" "}
                  <span className="font-bold text-slate-950">
                    {passwordResetUser.username}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPasswordResetUser(null);
                  setNewPassword("");
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-5 max-w-xl">
              <label className="text-sm font-semibold text-slate-700">
                Password Baru
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                autoComplete="new-password"
              />

              <p className="mt-2 text-xs text-slate-500">
                Minimal 6 karakter.
              </p>

              <button
                type="submit"
                disabled={isResettingPassword}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResettingPassword ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          </section>
        )}
      </Container>
    </main>
  );
}

export default AdminUsersPage;