import { brands } from "../data/brands";
import SectionHeader from "./SectionHeader";

function BrandSection() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-slate-950 p-8 shadow-xl">
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/25 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_38%)]" />

      <div className="relative">
        <SectionHeader
          eyebrow="Merek Tersedia"
          title="Berbagai merek dalam satu katalog"
          description="Jelajahi pilihan sepeda listrik dan motor listrik dari beberapa merek yang tersedia di katalog CV Chandra Putra Jaya."
          className="[&_h1]:text-white [&_p:last-child]:text-slate-300"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <article
              key={brand.id}
              className="group rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-red-300/50 hover:bg-white/15"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-sm font-black text-white shadow-lg shadow-red-600/25">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>

              <h3 className="mt-5 text-lg font-black text-white">
                {brand.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {brand.description}
              </p>

              <a
                href={`/catalogue?brand=${brand.id}`}
                className="mt-5 inline-flex text-sm font-bold text-red-300 transition group-hover:text-red-200"
              >
                Lihat produk →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandSection;