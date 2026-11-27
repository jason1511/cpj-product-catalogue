import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";

function AdminPage() {
  const [role, setRole] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/me")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data?.ok) setRole(data.user?.role || "");
      })
      .catch((error) => console.error(error));
    return () => { active = false; };
  }, []);

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-red-600">Panel Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Kelola Katalog</h1>
            <p className="mt-2 text-sm text-slate-600">Pilih tindakan untuk memperbarui katalog CPJ.</p>
          </div>
          <Link to="/catalogue" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600">Lihat Katalog Publik</Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Link to="/admin/products/new" className="group rounded-2xl bg-slate-950 p-6 text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">
            <h2 className="text-lg font-bold">Tambah Produk</h2>
            <p className="mt-2 text-sm text-slate-300">Masukkan produk, spesifikasi, warna, dan gambar.</p>
            <span className="mt-5 inline-block text-sm font-bold text-red-300 group-hover:text-white">Tambah produk →</span>
          </Link>

          <Link to="/admin/products" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">
            <h2 className="text-lg font-bold text-slate-950">Kelola Produk</h2>
            <p className="mt-2 text-sm text-slate-600">Cari, ubah, dan atur produk yang tampil di katalog.</p>
            <span className="mt-5 inline-block text-sm font-bold text-red-600 group-hover:text-red-700">Lihat daftar produk →</span>
          </Link>

          {role === "admin" && (
            <Link to="/admin/brands" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">
              <h2 className="text-lg font-bold text-slate-950">Kelola Merek</h2>
              <p className="mt-2 text-sm text-slate-600">Tambahkan merek untuk dipilih saat membuat produk.</p>
              <span className="mt-5 inline-block text-sm font-bold text-red-600 group-hover:text-red-700">Lihat daftar merek →</span>
            </Link>
          )}
        </div>
      </Container>
    </main>
  );
}

export default AdminPage;
