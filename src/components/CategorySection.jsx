import { categories } from "../data/categories";
import SectionHeader from "./SectionHeader";

const categoryIcons = {
  "motor-listrik": "ML",
  "sepeda-listrik": "SL",
  keranjang: "KR",
  pedal: "PD",
  "roda-tiga": "R3",
};

function CategorySection() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-slate-900/5 blur-3xl" />

      <div className="relative">
        <SectionHeader
          eyebrow="Pilih Berdasarkan Kategori"
          title="Temukan produk sesuai kebutuhan"
          description="Gunakan pintasan kategori untuk melihat pilihan produk berdasarkan jenis kendaraan dan fitur utama."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/catalogue?${category.filterType}=${category.id}`}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:bg-white hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-500/10 blur-2xl transition group-hover:bg-red-500/20" />

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg">
                {categoryIcons[category.id] || category.name.charAt(0)}
              </div>

              <h3 className="relative mt-5 text-base font-black text-slate-950">
                {category.name}
              </h3>

              <p className="relative mt-2 text-sm leading-6 text-slate-600">
                {category.description}
              </p>

              <p className="relative mt-5 text-sm font-bold text-red-600 transition group-hover:text-red-700">
                Lihat produk →
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;