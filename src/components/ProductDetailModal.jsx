import { AnimatePresence, motion } from "motion/react";
import { createProductMessage, createWhatsAppLink } from "../utils/whatsapp";

function ProductDetailModal({ product, onClose }) {
  const typeLabels = {
    "motor-listrik": "Motor Listrik",
    "sepeda-listrik": "Sepeda Listrik",
    "roda-tiga": "Roda Tiga",
  };

  const featureLabels = {
    keranjang: "Dengan Keranjang",
    pedal: "Dengan Pedal",
  };
  const specItems = [
  {
    label: "Baterai",
    value: product?.specs.battery,
  },
  {
    label: "Motor",
    value: product?.specs.motor,
  },
  {
    label: "Jarak Tempuh",
    value: product?.specs.range,
  },
  {
    label: "Kecepatan",
    value: product?.specs.speed,
  },
  {
    label: "Kapasitas Beban",
    value: product?.specs.loadCapacity,
  },
  {
    label: "Ukuran Roda",
    value: product?.specs.wheelSize,
  },
  {
    label: "Rem",
    value: product?.specs.brake,
  },
];

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-950 p-6 text-white">
              <div>
                <p className="text-sm font-semibold text-red-300">
                  {product.brand}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  {product.model}
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  {typeLabels[product.type] || product.type}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:border-red-300 hover:bg-white/15"
              >
                Tutup
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-white">
                {product.image ? (
                  <img
  src={product.image}
  alt={`${product.brand} ${product.model}`}
  className="h-full w-full rounded-2xl object-cover"
/>
                ) : (
                  <>
                    <div className="absolute -right-12 top-6 h-44 w-44 rounded-full bg-red-600/30 blur-3xl" />
                    <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-red-500/20 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.28),transparent_45%)]" />

                    <div className="relative px-6 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-300">
                        {product.brand}
                      </p>

                      <p className="mt-4 text-3xl font-black tracking-tight text-white">
                        {product.model}
                      </p>

                      <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-red-500" />

                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        CPJ Electric Catalogue
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Detail Produk
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {product.description}
                </p>

                {product.price ? (
                  <p className="mt-5 text-2xl font-bold text-red-600">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                ) : (
                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Harga akan disesuaikan dengan katalog terbaru.
                  </p>
                )}

                {product.features.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        {featureLabels[feature] || feature}
                      </span>
                    ))}
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-950">
                      Pilihan Warna
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <span
                          key={color}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
  {specItems.map((item) => (
    <div
      key={item.label}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-500/10 blur-xl" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          {item.label}
        </p>

        <p className="mt-2 font-semibold leading-6 text-slate-950">
          {item.value || "-"}
        </p>
      </div>
    </div>
  ))}
</div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
  <a
    href={createWhatsAppLink(createProductMessage(product))}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
  >
    Tanya Produk Ini
  </a>

  <button
    type="button"
    onClick={onClose}
    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 hover:shadow-lg"
  >
    Kembali ke Katalog
  </button>
</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductDetailModal;