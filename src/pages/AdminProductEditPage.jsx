import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/Container";

const typeOptions = [
  {
    value: "motor-listrik",
    label: "Motor Listrik",
  },
  {
    value: "sepeda-listrik",
    label: "Sepeda Listrik",
  },
  {
    value: "roda-tiga",
    label: "Roda Tiga",
  },
];

function arrayToText(value) {
  if (!Array.isArray(value)) return "";

  return value.join(", ");
}

function AdminProductEditPage() {
  const { id } = useParams();

  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(`/api/admin/products/${id}`);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Gagal mengambil detail produk.");
        }

        const product = data.product;

        if (isMounted) {
          setFormData({
            id: product.id,
            brand: product.brand || "",
            model: product.model || "",
            type: product.type || "motor-listrik",
            price: product.price || "",
            image: product.image || "",
            description: product.description || "",
            featuresText: arrayToText(product.features),
            colorsText: arrayToText(product.colors),
            battery: product.specs?.battery || "",
            motor: product.specs?.motor || "",
            range: product.specs?.range || "",
            speed: product.specs?.speed || "",
            loadCapacity: product.specs?.loadCapacity || "",
            wheelSize: product.specs?.wheelSize || "",
            brake: product.specs?.brake || "",
            isFeatured: Boolean(product.isFeatured),
            isActive: Boolean(product.isActive),
          });
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

async function handleSubmit(event) {
  event.preventDefault();

  try {
    setIsSaving(true);
    setErrorMessage("");

    const payload = {
      brand: formData.brand,
      model: formData.model,
      type: formData.type,
      price: formData.price,
      image: formData.image,
      description: formData.description,
      features: formData.featuresText,
      colors: formData.colorsText,
      specs: {
        battery: formData.battery,
        motor: formData.motor,
        range: formData.range,
        speed: formData.speed,
        loadCapacity: formData.loadCapacity,
        wheelSize: formData.wheelSize,
        brake: formData.brake,
      },
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
    };

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "Gagal menyimpan perubahan.");
    }

    alert("Produk berhasil diperbarui.");
  } catch (error) {
    console.error(error);
    setErrorMessage(error.message);
  } finally {
    setIsSaving(false);
  }
}

  return (
    <main className="py-10">
      <Container>
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-10">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_38%)]" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
                Edit Produk
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                Ubah Detail Produk
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Edit data produk yang tersimpan di database D1. Nanti perubahan
                ini akan langsung memengaruhi katalog publik.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/admin/products"
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
              >
                Kembali ke Produk
              </Link>

              <Link
                to="/catalogue"
                className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Lihat Katalog
              </Link>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
            Memuat detail produk...
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && formData && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]"
          >
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">
                Informasi Utama
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(event) =>
                      updateField("brand", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(event) =>
                      updateField("model", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Jenis
                  </label>
                  <select
                    value={formData.type}
                    onChange={(event) =>
                      updateField("type", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  >
                    {typeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Harga
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    URL Gambar
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(event) =>
                      updateField("image", event.target.value)
                    }
                    placeholder="Nanti otomatis dari R2 upload"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">
                Status Produk
              </h2>

              <div className="mt-6 space-y-4">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(event) =>
                      updateField("isFeatured", event.target.checked)
                    }
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Tampilkan sebagai produk pilihan
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(event) =>
                      updateField("isActive", event.target.checked)
                    }
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Tampilkan di katalog publik
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-2xl font-black text-slate-950">
                Fitur, Warna, dan Spesifikasi
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Fitur
                  </label>
                  <input
                    type="text"
                    value={formData.featuresText}
                    onChange={(event) =>
                      updateField("featuresText", event.target.value)
                    }
                    placeholder="Contoh: pedal, keranjang"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Warna
                  </label>
                  <input
                    type="text"
                    value={formData.colorsText}
                    onChange={(event) =>
                      updateField("colorsText", event.target.value)
                    }
                    placeholder="Contoh: Merah, Hitam, Putih"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>

                {[
                  ["battery", "Baterai"],
                  ["motor", "Motor"],
                  ["range", "Jarak Tempuh"],
                  ["speed", "Kecepatan"],
                  ["loadCapacity", "Kapasitas Beban"],
                  ["wheelSize", "Ukuran Roda"],
                  ["brake", "Rem"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="text-sm font-semibold text-slate-700">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={(event) =>
                        updateField(field, event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
  type="submit"
  disabled={isSaving}
  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
</button>

                <Link
                  to="/admin/products"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 hover:shadow-lg"
                >
                  Batal
                </Link>
              </div>
            </section>
          </form>
        )}
      </Container>
    </main>
  );
}

export default AdminProductEditPage;