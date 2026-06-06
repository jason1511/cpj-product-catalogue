import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminTopBar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/admin/me");
        const data = await response.json();

        if (response.ok && data.ok && isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    } finally {
      navigate("/admin/login");
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-red-600">
            Admin Session
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {user ? (
              <>
                Login sebagai{" "}
                <span className="font-black text-slate-950">
                  {user.username}
                </span>{" "}
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                  {user.role}
                </span>
              </>
            ) : (
              "Memuat data admin..."
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/admin/products"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600"
          >
            Produk
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin/users"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600"
            >
              User Admin
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTopBar;