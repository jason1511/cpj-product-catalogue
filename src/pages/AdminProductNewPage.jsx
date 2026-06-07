import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import AdminImageUploader from "../components/AdminImageUploader";

const fallbackDriveOptions = ["motor-listrik", "sepeda-listrik", "roda-tiga"];
const fallbackFeatureOptions = ["pedal", "keranjang"];

const driveLabels = {
  "motor-listrik": "Motor Listrik",
  "sepeda-listrik": "Sepeda Listrik",
  "roda-tiga": "Roda Tiga",
};

const specFields = [
  {
    field: "battery",
    label: "Baterai",
    placeholder: "Contoh: Lithium 48V / 12Ah atau 48V / 12Ah SLA",
    helper: "Isi voltase, kapasitas Ah, dan tipe baterai jika tersedia.",
  },
  {
    field: "motor",
    label: "Motor",
    placeholder: "Contoh: 500 Watt, 600 Watt, atau 48V / 600 Watt",
    helper: "Isi daya motor dalam Watt. Tambahkan voltase jika tercantum.",
  },
  {
    field: "range",
    label: "Jarak Tempuh",
    placeholder: "Contoh: Sekitar 40 km atau Hingga 45 km",
    helper: "Gunakan km. Bisa pakai perkiraan jika data katalog tidak pasti.",
  },
  {
    field: "speed",
    label: "Kecepatan",
    placeholder: "Contoh: Hingga 40 km/jam atau 25–40 km/jam",
    helper: "Gunakan km/jam.",
  },
  {
    field: "loadCapacity",
    label: "Kapasitas Beban",
    placeholder: "Contoh: Maksimal 150 kg atau 120 kg",
    helper: "Gunakan kg.",
  },
  {
    field: "wheelSize",
    label: "Ukuran Roda",
    placeholder: "Contoh: 14 x 2.50, Ban tubeless 14 inci",
    helper: "Isi ukuran ban/roda jika ada. Jika tidak ada, boleh kosong.",
  },
  {
    field: "brake",
    label: "Rem",
    placeholder: "Contoh: Rem tromol, Cakram depan dan belakang",
    helper: "Isi jenis rem depan/belakang jika tercantum.",
  },
];

function getDriveLabel(value) {
  return driveLabels[value] || value;
}

function createSlug(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replaceAll("&", "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createProductId(brand, model, driveType) {
  return createSlug(`${brand} ${model} ${driveType}`);
}

function textToArray(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminProductNewPage() {
  const navigate = useNavigate();

  const [existingProducts, setExistingProducts] = useState([]);
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [colorImageFiles, setColorImageFiles] = useState({});

  const [formData, setFormData] = useState({
    id: "",
    brand: "",
    model: "",
    type: "motor-listrik",
    price: "",
    image: "",
    description: "",
    featuresText: "",
    colorsText: "",
    colorImages: {},
    battery: "",
    motor: "",
    range: "",
    speed: "",
    loadCapacity: "",
    wheelSize: "",
    brake: "",
    isFeatured: false,
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadExistingProducts() {
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (response.ok && data.ok && isMounted) {
          setExistingProducts(data.products);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadExistingProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const brandOptions = [
    ...new Set(existingProducts.map((product) => product.brand).filter(Boolean)),
  ];

  const driveOptions = [
    ...new Set([
      ...fallbackDriveOptions,
      ...existingProducts.map((product) => product.type).filter(Boolean),
    ]),
  ];

  const featureOptions = [
    ...new Set([
      ...fallbackFeatureOptions,
      ...existingProducts.flatMap((product) => product.features || []),
    ]),
  ];

  const colorOptions = [
    ...new Set(existingProducts.flatMap((product) => product.colors || [])),
  ];

  function updateField(field, value) {
    setFormData((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      const shouldRegenerateId =
        !isIdManuallyEdited &&
        (field === "brand" || field === "model" || field === "type");

      if (shouldRegenerateId) {
        next.id = createProductId(next.brand, next.model, next.type);
      }

      return next;
    });
  }

  function updateColorImageFile(color, file) {
    setColorImageFiles((current) => ({
      ...current,
      [color]: file,
    }));
  }

  async function uploadProductImage({ file, productId, colorName = "" }) {
    if (!file) return "";

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);
    uploadFormData.append("productId", productId);

    if (colorName) {
      uploadFormData.append("colorName", colorName);
    }

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: uploadFormData,
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error
          ? `${data.message || "Gagal mengunggah gambar."} Detail: ${data.error}`
          : data.message || "Gagal mengunggah gambar.",
      );
    }

    return data.imageUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");

      if (!formData.id) {
        throw new Error("ID produk wajib tersedia sebelum menyimpan gambar.");
      }

      let imageUrl = formData.image;
      const colorImages = {
        ...(formData.colorImages || {}),
      };

      if (mainImageFile) {
        imageUrl = await uploadProductImage({
          file: mainImageFile,
          productId: formData.id,
        });
      }

      for (const [color, file] of Object.entries(colorImageFiles)) {
        if (file) {
          const uploadedUrl = await uploadProductImage({
            file,
            productId: formData.id,
            colorName: color,
          });

          colorImages[color] = uploadedUrl;
        }
      }

      const payload = {
        id: formData.id,
        brand: formData.brand,
        model: formData.model,
        type: formData.type,
        price: formData.price,
        image: imageUrl,
        description: formData.description,
        features: formData.featuresText,
        colors: formData.colorsText,
        colorImages,
        specs: {
          battery: formData.battery,
          motor: formData.motor,
          range: formData.range,
          speed: formData.speed,
          loadCapacity: formData.loadCapacity,
          wheelSize: formData.wheelSize,
          brake: formData.brake,
        },
        sourcePage: null,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal menambahkan produk.");
      }

      setMainImageFile(null);
      setColorImageFiles({});

      alert("Produk berhasil ditambahkan.");

      const createdProductId = data.product?.id || data.id || formData.id;
      navigate(`/admin/products/${createdProductId}/edit`);
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
                Tambah Produk
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                Produk Baru
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Tambahkan produk baru ke database D1. Produk aktif akan tampil
                di katalog publik.
              </p>
            </div>

            <Link
              to="/admin/products"
              className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
            >
              Kembali ke Produk
            </Link>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

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
                  list="brand-options"
                  value={formData.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                />
                <datalist id="brand-options">
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Model
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(event) => updateField("model", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Penggerak
                </label>
                <input
                  type="text"
                  list="drive-options"
                  value={formData.type}
                  onChange={(event) => updateField("type", event.target.value)}
                  placeholder="Contoh: motor-listrik, sepeda-listrik, roda-tiga"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                />
                <datalist id="drive-options">
                  {driveOptions.map((type) => (
                    <option
                      key={type}
                      value={type}
                      label={getDriveLabel(type)}
                    />
                  ))}
                </datalist>
                <p className="mt-2 text-xs text-slate-500">
                  Gunakan nilai internal seperti{" "}
                  <span className="font-semibold">motor-listrik</span>,{" "}
                  <span className="font-semibold">sepeda-listrik</span>, atau
                  ketik penggerak baru jika belum tersedia.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Harga
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  ID Produk
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(event) => {
                    setIsIdManuallyEdited(true);
                    updateField("id", event.target.value);
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                />
                <p className="mt-2 text-xs text-slate-500">
                  ID otomatis dibuat dari brand, model, dan penggerak. Bisa
                  diubah manual jika diperlukan.
                </p>
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

          <div className="space-y-6">
            <AdminImageUploader
              imageUrl={formData.image}
              selectedFile={mainImageFile}
              onFileSelected={setMainImageFile}
            />

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">
                Gambar per Warna
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Isi daftar warna terlebih dahulu, lalu pilih gambar untuk
                masing-masing warna jika tersedia.
              </p>

              <div className="mt-5 space-y-4">
                {textToArray(formData.colorsText).length > 0 ? (
                  textToArray(formData.colorsText).map((color) => (
                    <AdminImageUploader
                      key={color}
                      imageUrl={formData.colorImages?.[color] || ""}
                      selectedFile={colorImageFiles[color] || null}
                      title={`Gambar ${color}`}
                      description={`Pilih gambar khusus untuk warna ${color}. Gambar akan diupload saat produk disimpan.`}
                      onFileSelected={(file) =>
                        updateColorImageFile(color, file)
                      }
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                    Isi daftar warna terlebih dahulu, misalnya: Pink, Hijau,
                    Biru.
                  </div>
                )}
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
                    Produk pilihan
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
          </div>

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
                  list="feature-options"
                  value={formData.featuresText}
                  onChange={(event) =>
                    updateField("featuresText", event.target.value)
                  }
                  placeholder="Contoh: pedal, keranjang"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                />
                <datalist id="feature-options">
                  {featureOptions.map((feature) => (
                    <option key={feature} value={feature} />
                  ))}
                </datalist>
                <p className="mt-2 text-xs text-slate-500">
                  Pisahkan lebih dari satu fitur dengan koma. Contoh:{" "}
                  <span className="font-semibold">pedal, keranjang</span>.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Warna
                </label>
                <input
                  type="text"
                  list="color-options"
                  value={formData.colorsText}
                  onChange={(event) =>
                    updateField("colorsText", event.target.value)
                  }
                  placeholder="Contoh: Merah, Hitam, Putih"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                />
                <datalist id="color-options">
                  {colorOptions.map((color) => (
                    <option key={color} value={color} />
                  ))}
                </datalist>
                <p className="mt-2 text-xs text-slate-500">
                  Pisahkan warna dengan koma. Contoh:{" "}
                  <span className="font-semibold">Merah, Hitam, Cream</span>.
                </p>
              </div>

              {specFields.map((item) => (
                <div key={item.field}>
                  <label className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </label>
                  <input
                    type="text"
                    value={formData[item.field]}
                    onChange={(event) =>
                      updateField(item.field, event.target.value)
                    }
                    placeholder={item.placeholder}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                  <p className="mt-2 text-xs text-slate-500">{item.helper}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Menyimpan..." : "Tambah Produk"}
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
      </Container>
    </main>
  );
}

export default AdminProductNewPage;