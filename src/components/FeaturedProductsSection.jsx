import { useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import ProductGrid from "./ProductGrid";
import ProductDetailModal from "./ProductDetailModal";
import SectionHeader from "./SectionHeader";

function FeaturedProductsSection() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const featuredProducts = products
    .filter((product) => product.isFeatured)
    .slice(0, 3);

  return (
    <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-slate-900/5 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeader
            eyebrow="Produk Pilihan"
            title="Sorotan dari katalog showroom"
            description="Beberapa pilihan produk dari katalog CV Chandra Putra Jaya. Gunakan katalog lengkap untuk melihat model lain berdasarkan merek, jenis, dan fitur."
          />

          <Link
            to="/catalogue"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 hover:shadow-lg"
          >
            Lihat Semua Produk
          </Link>
        </div>

        <ProductGrid
  products={featuredProducts}
  onViewDetails={setSelectedProduct}
/>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}

export default FeaturedProductsSection;