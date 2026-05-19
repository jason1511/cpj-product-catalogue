import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/Container";
import ProductGrid from "../components/ProductGrid";
import SectionHeader from "../components/SectionHeader";
import { products } from "../data/products";
import { categories } from "../data/categories";
import ProductDetailModal from "../components/ProductDetailModal";

function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialBrand = searchParams.get("brand") || "all";
  const initialType = searchParams.get("type") || "all";
  const initialFeature = searchParams.get("feature") || "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedFeature, setSelectedFeature] = useState(initialFeature);
  const [sortBy, setSortBy] = useState("default");

  const typeCategories = categories.filter(
    (category) => category.filterType === "type",
  );

  const featureCategories = categories.filter(
    (category) => category.filterType === "feature",
  );

  const brandOptions = [...new Set(products.map((product) => product.brand))];
  const activeProducts = products.filter((product) => product.isActive);

const prices = activeProducts
  .map((product) => product.price)
  .filter((price) => typeof price === "number");

const lowestPrice = Math.min(...prices);
const highestPrice = Math.max(...prices);
  const selectedBrandLabel =
  selectedBrand === "all"
    ? null
    : brandOptions.find(
        (brand) => brand.toLowerCase() === selectedBrand.toLowerCase(),
      );

const selectedTypeLabel =
  selectedType === "all"
    ? null
    : typeCategories.find((category) => category.id === selectedType)?.name;

const selectedFeatureLabel =
  selectedFeature === "all"
    ? null
    : featureCategories.find((category) => category.id === selectedFeature)
        ?.name;

const hasActiveFilters =
  searchTerm ||
  selectedBrand !== "all" ||
  selectedType !== "all" ||
  selectedFeature !== "all" ||
  sortBy !== "default";
  const filteredProducts = products
  .filter((product) => {
    const searchText =
      `${product.brand} ${product.model} ${product.description}`
        .toLowerCase()
        .trim();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());

    const matchesBrand =
      selectedBrand === "all" ||
      product.brand.toLowerCase() === selectedBrand.toLowerCase();

    const matchesType =
      selectedType === "all" || product.type === selectedType;

    const matchesFeature =
      selectedFeature === "all" || product.features.includes(selectedFeature);

    return matchesSearch && matchesBrand && matchesType && matchesFeature;
  })
  .sort((a, b) => {
    if (sortBy === "price-low") {
      return (a.price ?? 0) - (b.price ?? 0);
    }

    if (sortBy === "price-high") {
      return (b.price ?? 0) - (a.price ?? 0);
    }

    if (sortBy === "brand") {
      return a.brand.localeCompare(b.brand);
    }

    if (sortBy === "model") {
      return a.model.localeCompare(b.model);
    }

    return 0;
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  function updateUrlParam(key, value) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (value === "all") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }

      return nextParams;
    });
  }

function resetFilters() {
  setSearchTerm("");
  setSelectedBrand("all");
  setSelectedType("all");
  setSelectedFeature("all");
  setSortBy("default");
  setSearchParams({});
}
function clearBrandFilter() {
  setSelectedBrand("all");
  updateUrlParam("brand", "all");
}

function clearTypeFilter() {
  setSelectedType("all");
  updateUrlParam("type", "all");
}

function clearFeatureFilter() {
  setSelectedFeature("all");
  updateUrlParam("feature", "all");
}

function clearSearchFilter() {
  setSearchTerm("");
}

function clearSortFilter() {
  setSortBy("default");
}
function formatPrice(price) {
  return `Rp ${price.toLocaleString("id-ID")}`;
}
  return (
    <main className="py-10">
      <Container>
        <SectionHeader
          eyebrow="Katalog Produk"
          title="Pilihan Sepeda & Motor Listrik"
          description="Jelajahi produk berdasarkan merek, jenis kendaraan, fitur utama, dan kebutuhan penggunaan."
        />
<section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 shadow-xl lg:p-10">
  <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
  <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_35%)]" />

  <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-end">
    <div>
      <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
        Katalog Produk
      </p>

      <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
        Pilihan Sepeda & Motor Listrik
      </h1>

      <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
        Jelajahi produk berdasarkan merek, jenis kendaraan, fitur utama, dan
        kebutuhan penggunaan. Gunakan filter untuk menemukan model yang paling
        sesuai sebelum menghubungi tim kami.
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-sm font-semibold text-slate-300">Total Produk</p>
        <p className="mt-2 text-3xl font-black text-white">
          {activeProducts.length}
        </p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-sm font-semibold text-slate-300">Merek Tersedia</p>
        <p className="mt-2 text-3xl font-black text-white">
          {brandOptions.length}
        </p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-sm font-semibold text-slate-300">Harga Mulai</p>
        <p className="mt-2 text-2xl font-black text-red-300">
          {formatPrice(lowestPrice)}
        </p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-sm font-semibold text-slate-300">Harga Tertinggi</p>
        <p className="mt-2 text-2xl font-black text-red-300">
          {formatPrice(highestPrice)}
        </p>
      </article>
    </div>
  </div>
</section>
        <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
  <div className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
  <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-slate-900/5 blur-3xl" />

  <div className="relative">
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
      Filter Katalog
    </p>
    <h2 className="mt-1 text-2xl font-black text-slate-950">
      Temukan model yang sesuai
    </h2>
  </div>

  <p className="max-w-xl text-sm leading-6 text-slate-600">
    Gunakan pencarian, merek, jenis, fitur, dan urutan harga untuk menjelajahi
    katalog showroom dengan lebih cepat.
  </p>
</div>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
            <div>
              <label
                htmlFor="search"
                className="text-sm font-semibold text-slate-700"
              >
                Cari produk
              </label>

              <input
                id="search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari merek, model, atau keterangan..."
               className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              />
            </div>

            <div>
              <label
                htmlFor="brand"
                className="text-sm font-semibold text-slate-700"
              >
                Merek
              </label>

              <select
                id="brand"
                value={selectedBrand}
                onChange={(event) => {
                  setSelectedBrand(event.target.value);
                  updateUrlParam("brand", event.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua merek</option>

                {brandOptions.map((brand) => (
                  <option key={brand} value={brand.toLowerCase()}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="type"
                className="text-sm font-semibold text-slate-700"
              >
                Jenis produk
              </label>

              <select
                id="type"
                value={selectedType}
                onChange={(event) => {
                  setSelectedType(event.target.value);
                  updateUrlParam("type", event.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua jenis</option>

                {typeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="feature"
                className="text-sm font-semibold text-slate-700"
              >
                Fitur
              </label>

              <select
                id="feature"
                value={selectedFeature}
                onChange={(event) => {
                  setSelectedFeature(event.target.value);
                  updateUrlParam("feature", event.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua fitur</option>

                {featureCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
  <label
    htmlFor="sort"
    className="text-sm font-semibold text-slate-700"
  >
    Urutkan
  </label>

  <select
    id="sort"
    value={sortBy}
    onChange={(event) => setSortBy(event.target.value)}
    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
  >
    <option value="default">Urutan katalog</option>
    <option value="price-low">Harga terendah</option>
    <option value="price-high">Harga tertinggi</option>
    <option value="brand">Merek A-Z</option>
    <option value="model">Model A-Z</option>
  </select>
</div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-xl border border-slate-300 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white hover:text-red-600 hover:shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <p className="text-sm text-slate-600">
      Menampilkan{" "}
      <span className="font-semibold text-slate-950">
        {filteredProducts.length}
      </span>{" "}
      produk
    </p>

    {hasActiveFilters && (
      <button
        type="button"
        onClick={resetFilters}
        className="text-left text-sm font-semibold text-red-600 hover:text-red-700 lg:text-right"
      >
        Hapus semua filter
      </button>
    )}
  </div>

  {hasActiveFilters && (
    <div className="mt-4 flex flex-wrap gap-2">
      {searchTerm && (
        <button
          type="button"
          onClick={clearSearchFilter}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
        >
          Pencarian: {searchTerm} ×
        </button>
      )}

      {selectedBrandLabel && (
        <button
          type="button"
          onClick={clearBrandFilter}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
        >
          Merek: {selectedBrandLabel} ×
        </button>
      )}

      {selectedTypeLabel && (
        <button
          type="button"
          onClick={clearTypeFilter}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
        >
          Jenis: {selectedTypeLabel} ×
        </button>
      )}

      {selectedFeatureLabel && (
        <button
          type="button"
          onClick={clearFeatureFilter}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
        >
          Fitur: {selectedFeatureLabel} ×
        </button>
      )}

      {sortBy !== "default" && (
        <button
          type="button"
          onClick={clearSortFilter}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
        >
          Urutan:{" "}
          {sortBy === "price-low"
            ? "Harga terendah"
            : sortBy === "price-high"
              ? "Harga tertinggi"
              : sortBy === "brand"
                ? "Merek A-Z"
                : "Model A-Z"}{" "}
          ×
        </button>
      )}
    </div>
  )}
</div>
</div>
        </section>

        {filteredProducts.length > 0 ? (
          <ProductGrid
  products={filteredProducts}
  onViewDetails={setSelectedProduct}
/>
        ) : (
          <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-center shadow-xl">
  <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/25 blur-3xl" />
  <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_38%)]" />

  <div className="relative mx-auto max-w-xl">
    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-300">
      Tidak Ada Hasil
    </p>

    <h2 className="mt-3 text-2xl font-black text-white">
      Produk tidak ditemukan
    </h2>

    <p className="mt-3 text-sm leading-6 text-slate-300">
      Coba ubah kata kunci, merek, jenis produk, fitur, atau urutan yang
      dipilih untuk melihat produk lain di katalog showroom.
    </p>

    <button
      type="button"
      onClick={resetFilters}
      className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
    >
      Tampilkan Semua Produk
    </button>
  </div>
</div>
        )}
      </Container>
      <ProductDetailModal
  product={selectedProduct}
  onClose={() => setSelectedProduct(null)}
/>
    </main>
  );
}

export default CataloguePage;