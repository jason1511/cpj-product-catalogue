import { Link } from "react-router-dom";
import Container from "../components/Container";

function NotFoundPage() {
  return (
    <main className="py-10">
      <Container>
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-center text-white shadow-xl lg:p-12">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_38%)]" />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-300">
              404
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Halaman tidak ditemukan
            </h1>

            <p className="mt-5 leading-8 text-slate-300">
              Halaman yang Anda buka tidak tersedia atau alamatnya sudah
              berubah. Silakan kembali ke beranda atau lihat katalog produk.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Kembali ke Beranda
              </Link>

              <Link
                to="/catalogue"
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
              >
                Lihat Katalog
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

export default NotFoundPage;