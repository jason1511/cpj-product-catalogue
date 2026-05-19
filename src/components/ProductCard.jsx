import { createProductMessage, createWhatsAppLink } from "../utils/whatsapp";

function ProductCard({ product, onViewDetails }) {
  const typeLabels = {
    "motor-listrik": "Motor Listrik",
    "sepeda-listrik": "Sepeda Listrik",
    "roda-tiga": "Roda Tiga",
  };

  const featureLabels = {
    keranjang: "Dengan Keranjang",
    pedal: "Dengan Pedal",
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-950">
  {product.image ? (
    <img
      src={product.image}
      alt={`${product.brand} ${product.model}`}
      className="h-full w-full object-cover"
    />
  ) : (
    <>
      <div className="absolute -right-10 top-4 h-36 w-36 rounded-full bg-red-600/30 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.25),transparent_45%)]" />

      <div className="relative px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-300">
          {product.brand}
        </p>

        <p className="mt-3 text-2xl font-black tracking-tight text-white">
          {product.model}
        </p>

        <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-red-500" />

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          CPJ Catalogue
        </p>
      </div>
    </>
  )}
</div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-red-600">
              {product.brand}
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">
              {product.model}
            </h3>
            {product.price ? (
  <p className="mt-2 text-xl font-black text-red-600">
    Rp {product.price.toLocaleString("id-ID")}
  </p>
) : (
  <p className="mt-2 text-sm font-bold text-slate-500">
    Harga menyesuaikan katalog
  </p>
)}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
    {typeLabels[product.type] || product.type}
  </span>

  {product.sourcePage && (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
      Hal. {product.sourcePage}
    </span>
  )}
</div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
    <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-red-500/10 blur-xl" />

    <div className="relative">
      <p className="font-bold uppercase tracking-wide text-slate-500">
        Baterai
      </p>
      <p className="mt-1 font-semibold text-slate-950">
        {product.specs.battery}
      </p>
    </div>
  </div>

  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
    <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-red-500/10 blur-xl" />

    <div className="relative">
      <p className="font-bold uppercase tracking-wide text-slate-500">
        Motor
      </p>
      <p className="mt-1 font-semibold text-slate-950">
        {product.specs.motor}
      </p>
    </div>
  </div>
</div>

        {product.features.length > 0 && (
  <div className="mt-4 flex flex-wrap gap-2">
    {product.features.map((feature) => (
      <span
        key={feature}
        className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
      >
        {featureLabels[feature] || feature}
      </span>
    ))}
  </div>
)}

        <div className="mt-5 flex gap-2">
  <button
    type="button"
    onClick={() => onViewDetails?.(product)}
    className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-red-600/20"
  >
    Lihat Detail
  </button>

  <a
    href={createWhatsAppLink(createProductMessage(product))}
    target="_blank"
    rel="noreferrer"
    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 hover:shadow-lg"
  >
    Tanya
  </a>
</div>
      </div>
    </article>
  );
}

export default ProductCard;