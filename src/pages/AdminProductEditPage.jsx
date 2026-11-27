import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

function arrayToText(value) {
  if (!Array.isArray(value)) return "";

  return value.join(", ");
}

function textToArray(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminProductEditPage() {
  const { id } = useParams();

  const [existingProducts, setExistingProducts] = useState([]);
  const [savedBrands, setSavedBrands] = useState([]);
  const [formData, setFormData] = useState(null);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [newColor, setNewColor] = useState("");
  const [colorImageFiles, setColorImageFiles] = useState({});

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

        const productsResponse = await fetch("/api/admin/products");
        const productsData = await productsResponse.json();

        if (productsResponse.ok && productsData.ok && isMounted) {
          setExistingProducts(productsData.products);
        }

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
            colorImages: product.colorImages || {},
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

          setMainImageFile(null);
          setColorImageFiles({});
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

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/brands")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Gagal memuat merek.")))
      .then((data) => { if (mounted && data.ok) setSavedBrands(data.brands); })
      .catch((error) => console.error(error));
    return () => { mounted = false; };
  }, []);

  const brandOptions = [
    ...new Set([...savedBrands, ...existingProducts.map((product) => product.brand), formData?.brand].filter(Boolean)),
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
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
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

      setFormData((current) => ({
        ...current,
        image: imageUrl,
        colorImages,
      }));

      setMainImageFile(null);
      setColorImageFiles({});

      alert("Produk berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="py-6">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Link to="/admin" className="text-sm font-semibold text-slate-500 hover:text-red-600">← Kembali ke Dashboard</Link><h1 className="mt-2 text-2xl font-black">Edit Produk</h1>{formData && <p className="mt-1 text-sm text-slate-500">{formData.brand} {formData.model} · {formData.id}</p>}</div>
          {formData && <button type="submit" form="edit-product-form" disabled={isSaving} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</button>}
        </div>

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
            id="edit-product-form"
            onSubmit={handleSubmit}
            className="mt-5 grid items-start gap-4 lg:grid-cols-2"
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
                  <select aria-label="Brand" value={formData.brand} onChange={(event) => updateField("brand", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm">
                    <option value="">Pilih merek</option>
                    {brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
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

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    ID Produk
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    ID produk tidak diubah dari halaman edit agar URL dan data
                    tetap aman.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Penggerak
                  </label>
                  <input
                    type="text"
                    list="edit-drive-options"
                    value={formData.type}
                    onChange={(event) =>
                      updateField("type", event.target.value)
                    }
                    placeholder="Contoh: motor-listrik, sepeda-listrik, roda-tiga"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                  <datalist id="edit-drive-options">
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
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
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
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>
              </div>
            </section>

            <div className="space-y-4">
              <details className="rounded-2xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-bold">Gambar Produk</summary>
              <AdminImageUploader
                imageUrl={formData.image}
                selectedFile={mainImageFile}
                onFileSelected={setMainImageFile}
              />

              <div className="mt-3 rounded-xl border border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-950">
                  Gambar per Warna
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Gambar ini akan muncul saat pengunjung memilih warna tertentu
                  di detail produk.
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
              </div></details>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950">
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
              <details className="rounded-2xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-bold">Stok per Lokasi</summary><div className="mt-3"><p className="text-sm text-slate-500">Fitur stok belum digunakan.</p></div></details>
            </div>

            <details open className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <summary className="cursor-pointer text-lg font-bold">Fitur, Warna, dan Spesifikasi</summary>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Fitur
                  </label>
                  <input
                    type="text"
                    list="edit-feature-options"
                    value={formData.featuresText}
                    onChange={(event) =>
                      updateField("featuresText", event.target.value)
                    }
                    placeholder="Contoh: pedal, keranjang"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                  <datalist id="edit-feature-options">
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
                  <label htmlFor="new-color" className="text-sm font-semibold text-slate-700">Warna</label>
                  <div className="mt-2 flex gap-2">
                    <input id="new-color" value={newColor} onChange={(event) => setNewColor(event.target.value)} placeholder="Nama warna" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                    <button type="button" onClick={() => {
                      const color = newColor.trim();
                      if (!color || color.includes(",") || textToArray(formData.colorsText).some((item) => item.toLowerCase() === color.toLowerCase())) return;
                      updateField("colorsText", [...textToArray(formData.colorsText), color].join(", "));
                      setNewColor("");
                    }} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Tambah</button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {textToArray(formData.colorsText).map((color) => (
                      <span key={color} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-sm">{color}
                        <button type="button" aria-label={`Hapus warna ${color}`} onClick={() => {
                          updateField("colorsText", textToArray(formData.colorsText).filter((item) => item !== color).join(", "));
                          setColorImageFiles((current) => { const next = { ...current }; delete next[color]; return next; });
                        }} className="font-bold text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Atur gambar setiap warna di bagian Gambar Produk.</p>
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
                  to="/admin"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 hover:shadow-lg"
                >
                  Batal
                </Link>
              </div>
            </details>
          </form>
        )}
      </Container>
    </main>
  );
}

export default AdminProductEditPage;