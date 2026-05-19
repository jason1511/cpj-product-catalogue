import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";

const companyPoints = [
  {
    title: "Showroom Digital",
    description:
      "Website ini dibuat sebagai katalog showroom untuk menampilkan pilihan sepeda listrik dan motor listrik secara lebih rapi dan mudah dijelajahi.",
  },
  {
    title: "Katalog Multi-Merek",
    description:
      "Produk disusun dari berbagai merek agar pelanggan dapat melihat beberapa pilihan dalam satu tempat.",
  },
  {
    title: "Informasi Produk Awal",
    description:
      "Pelanggan dapat melihat harga katalog, spesifikasi utama, warna, dan fitur sebelum menghubungi tim kami.",
  },
];

const serviceAreas = [
  "Informasi produk",
  "Cek stok",
  "Cek warna tersedia",
  "Harga terbaru",
  "Rekomendasi model",
  "Informasi katalog",
];

function AboutPage() {
  return (
    <main className="py-10">
      <Container>
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-10">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_38%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <SectionHeader
                eyebrow="Tentang Kami"
                title="CV Chandra Putra Jaya"
                description="CV Chandra Putra Jaya menghadirkan katalog showroom sepeda listrik dan motor listrik dari berbagai merek untuk membantu pelanggan melihat pilihan produk dengan lebih mudah."
                className="[&_h1]:text-white [&_p:last-child]:text-slate-300"
              />

              <p className="mt-6 max-w-3xl leading-8 text-slate-300">
                Website ini berfungsi sebagai pusat informasi produk. Pelanggan
                dapat menjelajahi katalog, melihat detail model, membandingkan
                fitur utama, lalu menghubungi tim kami untuk menanyakan stok,
                warna tersedia, dan harga terbaru.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-200">
                CPJ Showroom
              </p>

              <h2 className="mt-3 text-2xl font-black text-white">
                Katalog kendaraan listrik yang mudah dijelajahi
              </h2>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-3xl font-black text-white">30+</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Pilihan produk katalog
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-3xl font-black text-white">8+</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Merek tersedia
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-3xl font-black text-white">WA</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Tanya informasi produk
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {companyPoints.map((point) => (
            <article
              key={point.title}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />

              <div className="relative">
                <h2 className="text-lg font-black text-slate-950">
                  {point.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {point.description}
                </p>
              </div>
            </article>
          ))}
        </section>

        <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-slate-900/5 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Layanan Informasi
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Membantu pelanggan melihat pilihan produk dengan lebih jelas
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Katalog ini membantu pelanggan mendapatkan gambaran awal sebelum
                menghubungi tim CV Chandra Putra Jaya untuk informasi lebih
                lanjut.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {serviceAreas.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-white hover:text-red-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

export default AboutPage;