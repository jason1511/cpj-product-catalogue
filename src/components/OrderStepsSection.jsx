import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";

const showroomSteps = [
  {
    number: "01",
    title: "Jelajahi Katalog",
    description:
      "Lihat pilihan sepeda listrik dan motor listrik berdasarkan merek, jenis kendaraan, atau fitur utama.",
  },
  {
    number: "02",
    title: "Buka Detail Produk",
    description:
      "Cek informasi produk seperti harga katalog, baterai, motor, warna, dan spesifikasi utama.",
  },
  {
    number: "03",
    title: "Bandingkan Pilihan",
    description:
      "Gunakan filter dan pencarian untuk menemukan beberapa model yang paling sesuai dengan kebutuhan Anda.",
  },
  {
    number: "04",
    title: "Tanyakan ke Tim Kami",
    description:
      "Hubungi tim CV Chandra Putra Jaya melalui WhatsApp untuk menanyakan stok, warna tersedia, dan harga terbaru.",
  },
];

function OrderStepsSection() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/25 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_38%)]" />

      <div className="relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="Cara Melihat Produk"
            title="Lihat katalog, cek detail, lalu hubungi kami"
            description="Website ini berfungsi sebagai showroom digital untuk melihat pilihan produk. Untuk informasi stok, warna, dan harga terbaru, pelanggan dapat langsung menghubungi tim kami."
            className="[&_h1]:text-white [&_p:last-child]:text-slate-300"
          />

          <Link
            to="/catalogue"
            className="inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
          >
            Buka Katalog
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {showroomSteps.map((step) => (
            <article
              key={step.number}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-red-300/50 hover:bg-white/15"
            >
              <p className="text-sm font-black text-red-300">{step.number}</p>

              <h3 className="mt-4 text-lg font-black text-white">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrderStepsSection;