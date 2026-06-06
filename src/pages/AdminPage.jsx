import { Link } from "react-router-dom";
import Container from "../components/Container";
import AdminTopBar from "../components/AdminTopBar";
function AdminPage() {
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
              Admin Dashboard
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
              Kelola Katalog Produk
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Halaman ini disiapkan untuk mengelola produk katalog, termasuk
              menambah produk baru, mengubah detail, mengatur status tampil,
              dan nantinya mengunggah gambar produk.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/admin/products"
                className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Kelola Produk
              </Link>

              <Link
                to="/catalogue"
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
              >
                Lihat Katalog Publik
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Produk
            </p>
            <h2 className="mt-3 text-xl font-black text-slate-950">
              Tambah dan edit produk
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Kelola merek, model, harga, spesifikasi, warna, dan status tampil.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Gambar
            </p>
            <h2 className="mt-3 text-xl font-black text-slate-950">
              Upload gambar produk
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Nantinya gambar akan disimpan di Cloudflare R2 dan URL-nya
              disimpan ke D1.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Publikasi
            </p>
            <h2 className="mt-3 text-xl font-black text-slate-950">
              Atur produk aktif
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Produk bisa disembunyikan dari katalog tanpa menghapus data dari
              database.
            </p>
          </article>
        </section>
      </Container>
    </main>
  );
}

export default AdminPage;