import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import AdminTopBar from "../components/AdminTopBar";

function formatPrice(price) {
  if (!price) return "-";

  return `Rp ${price.toLocaleString("id-ID")}`;
}

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Gagal mengambil data produk.");
        }

        if (isMounted) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  async function toggleProductStatus(product) {
    const nextStatus = !product.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Aktifkan produk ${product.brand} ${product.model}?`
        : `Nonaktifkan produk ${product.brand} ${product.model}? Produk tidak akan tampil di katalog publik.`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengubah status produk.");
      }

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === product.id
            ? {
                ...currentProduct,
                isActive: nextStatus,
              }
            : currentProduct,
        ),
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  const filteredProducts = products.filter((product) => {
    const searchText = `${product.brand} ${product.model} ${product.type}`
      .toLowerCase()
      .trim();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="py-10">
      <Container>
        <AdminTopBar />
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-10">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_38%)]" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
                Admin Produk
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                Kelola Produk Katalog
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Lihat daftar produk dari database D1. Produk bisa ditambah,
                diedit, diaktifkan, atau dinonaktifkan dari halaman admin.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/admin"
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
              >
                Dashboard
              </Link>

              <Link
                to="/catalogue"
                className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Lihat Katalog
              </Link>
            </div>
          </div>
        </section>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative grid gap-4 lg:grid-cols-[1fr_220px_auto]">
            <div>
              <label
                htmlFor="admin-search"
                className="text-sm font-semibold text-slate-700"
              >
                Cari produk
              </label>

              <input
                id="admin-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari merek, model, atau penggerak..."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-status"
                className="text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="admin-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            <div className="flex items-end">
              <Link
                to="/admin/products/new"
                className="w-full rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-red-600"
              >
                Tambah Produk
              </Link>
            </div>
          </div>

          <div className="relative mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              Menampilkan{" "}
              <span className="font-bold text-slate-950">
                {filteredProducts.length}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-slate-950">
                {products.length}
              </span>{" "}
              produk
            </p>
          </div>
        </section>

        {isLoading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
            Memuat data produk dari database...
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-5 py-4 font-bold">Produk</th>
                    <th className="px-5 py-4 font-bold">Penggerak</th>
                    <th className="px-5 py-4 font-bold">Harga</th>
                    <th className="px-5 py-4 font-bold">Featured</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-950">
                          {product.brand} {product.model}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: {product.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {product.type}
                      </td>

                      <td className="px-5 py-4 font-bold text-red-600">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.isFeatured
                              ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
                          }
                        >
                          {product.isFeatured ? "Ya" : "Tidak"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.isActive
                              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
                          }
                        >
                          {product.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => toggleProductStatus(product)}
                            className={
                              product.isActive
                                ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                                : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                            }
                          >
                            {product.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="p-8 text-center">
                <h2 className="text-lg font-black text-slate-950">
                  Produk tidak ditemukan
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Coba ubah pencarian atau filter status.
                </p>
              </div>
            )}
          </section>
        )}
      </Container>
    </main>
  );
}

export default AdminProductsPage;