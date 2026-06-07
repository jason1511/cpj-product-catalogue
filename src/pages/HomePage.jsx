import { Link } from "react-router-dom";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import BrandSection from "../components/BrandSection";
import CategorySection from "../components/CategorySection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import Reveal from "../components/Reveal";
import OrderStepsSection from "../components/OrderStepsSection";
import SEO from "../components/SEO";

function HomePage() {
  return (
    <main className="py-10">
      <SEO
        title="Beranda"
        canonicalPath="/"
        description="Katalog sepeda listrik dan motor listrik CV Chandra Putra Jaya. Kantor pusat di Surabaya, melayani area Lumajang dan Lombok dengan berbagai pilihan merek seperti Exotic, Pacific, Uwinfly, Selis, Saige, Nuv, dan Larizz."
      />

      <Container>
        <Reveal>
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-xl">
            <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-red-600/30 blur-3xl" />
            <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.22),transparent_35%),linear-gradient(135deg,rgba(15,23,42,1),rgba(2,6,23,1))]" />

            <div className="relative grid gap-10 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10 xl:p-12">
              <div className="flex flex-col justify-center">
                <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
                  CV Chandra Putra Jaya
                </div>

                <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Katalog Sepeda & Motor Listrik
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
                  Jelajahi pilihan kendaraan listrik dari berbagai merek dalam
                  satu katalog showroom. CV Chandra Putra Jaya berkantor pusat
                  di Surabaya dan melayani area Lumajang serta Lombok untuk
                  kebutuhan sepeda listrik dan motor listrik.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/catalogue"
                    className="rounded-xl bg-red-600 px-5 py-3 text-center font-semibold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
                  >
                    Lihat Katalog
                  </Link>

                  <Link
                    to="/contact"
                    className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
                  >
                    Hubungi Kami
                  </Link>
                </div>

                <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-black text-white">30+</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Pilihan produk
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-black text-white">8+</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Merek tersedia
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-black text-white">WA</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Tanya stok cepat
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-8 rounded-full bg-red-500/20 blur-3xl" />

                <div className="relative w-full rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <div className="rounded-[1.5rem] bg-gradient-to-br from-white to-slate-200 p-6 shadow-2xl">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                          CPJ Showroom
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-950">
                          Multi-Brand Electric Catalogue
                        </h2>
                      </div>

                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                        <img
                          src="/logo_cpj.png"
                          alt="Logo CV Chandra Putra Jaya"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="mt-8 rounded-[1.5rem] bg-slate-950 p-6">
                      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.35),rgba(15,23,42,1)_55%)]">
                        <div className="text-center">
                          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-300">
                            Electric Mobility
                          </p>
                          <p className="mt-3 text-4xl font-black text-white">
                            2026
                          </p>
                          <p className="mt-2 text-sm text-slate-400">
                            Sepeda & Motor Listrik
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <p className="text-sm font-bold text-slate-950">
                          Produk Katalog
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Disusun berdasarkan merek, jenis, dan fitur utama.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-red-50 p-4">
                        <p className="text-sm font-bold text-red-700">
                          Showroom Digital
                        </p>
                        <p className="mt-1 text-sm text-red-900/70">
                          Fokus pada tampilan produk dan informasi awal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <BrandSection />
        </Reveal>

        <Reveal delay={0.1}>
          <CategorySection />
        </Reveal>

        <Reveal delay={0.15}>
          <FeaturedProductsSection />
        </Reveal>

        <Reveal delay={0.2}>
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <SectionHeader
              eyebrow="Showroom multi-merek"
              title="Pilihan kendaraan listrik untuk kebutuhan harian"
              description="Temukan sepeda listrik dan motor listrik dari berbagai merek terpercaya. Bandingkan model, lihat spesifikasi utama, lalu hubungi tim CPJ untuk informasi stok, warna, dan harga terbaru."
            />
          </section>
        </Reveal>

        <OrderStepsSection />
      </Container>
    </main>
  );
}

export default HomePage;