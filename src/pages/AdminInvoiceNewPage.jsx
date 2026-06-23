import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";

const fallbackLocations = [
  { code: "SBY", name: "Surabaya" },
  { code: "LBK", name: "Lombok" },
  { code: "PBL", name: "Probolinggo" },
  { code: "LMJ", name: "Lumajang" },
];

const emptyItem = {
  productId: "",
  productLabel: "",
  color: "",
  quantity: 1,
  unitPrice: 0,
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatPrice(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function calculateLineTotal(item) {
  return Number(item.quantity || 0) * Number(item.unitPrice || 0);
}

function AdminInvoiceNewPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState(fallbackLocations);
  const [userScope, setUserScope] = useState(null);

  const [formData, setFormData] = useState({
    locationCode: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    invoiceDate: getTodayDate(),
    status: "draft",
    discount: 0,
    notes: "",
  });

  const [items, setItems] = useState([{ ...emptyItem }]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function parseJsonResponse(response) {
    const responseText = await response.text();

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error(
        `API tidak mengembalikan JSON. Status: ${
          response.status
        }. Response: ${responseText.slice(0, 120)}`,
      );
    }
  }

  async function loadInitialData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [invoiceResponse, productResponse] = await Promise.all([
        fetch("/api/admin/invoices"),
        fetch("/api/admin/products"),
      ]);

      const invoiceData = await parseJsonResponse(invoiceResponse);
      const productData = await parseJsonResponse(productResponse);

      if (!invoiceResponse.ok || !invoiceData.ok) {
        throw new Error(invoiceData.message || "Gagal mengambil data invoice.");
      }

      if (!productResponse.ok || !productData.ok) {
        throw new Error(productData.message || "Gagal mengambil data produk.");
      }

      const nextLocations =
        Array.isArray(invoiceData.locations) && invoiceData.locations.length > 0
          ? invoiceData.locations
          : fallbackLocations;

      const nextUserScope = invoiceData.userScope || null;

      setLocations(nextLocations);
      setUserScope(nextUserScope);
      setProducts(productData.products || []);

      setFormData((current) => ({
        ...current,
        locationCode:
          nextUserScope?.role === "admin"
            ? nextLocations[0]?.code || "SBY"
            : nextUserScope?.locationCode || nextLocations[0]?.code || "SBY",
      }));
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const isAdmin = userScope?.role === "admin";

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + calculateLineTotal(item),
      0,
    );

    const discount = Math.min(
      Math.max(0, Number(formData.discount || 0)),
      subtotal,
    );

    const total = Math.max(0, subtotal - discount);

    return {
      subtotal,
      discount,
      total,
    };
  }, [items, formData.discount]);

  function updateFormField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateItem(index, field, value) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const nextItem = {
          ...item,
          [field]: value,
        };

        if (field === "productId") {
          const selectedProduct = products.find(
            (product) => product.id === value,
          );

          if (selectedProduct) {
            nextItem.productLabel = `${selectedProduct.brand} ${selectedProduct.model}`;
            nextItem.unitPrice = selectedProduct.price || 0;
            nextItem.color = selectedProduct.colors?.[0] || "";
          }
        }

        if (field === "quantity") {
          nextItem.quantity = Math.max(1, Number(value || 1));
        }

        if (field === "unitPrice") {
          nextItem.unitPrice = Math.max(0, Number(value || 0));
        }

        return nextItem;
      }),
    );
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, { ...emptyItem }]);
  }

  function removeItem(index) {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return [{ ...emptyItem }];
      }

      return currentItems.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload = {
        locationCode: formData.locationCode,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        invoiceDate: formData.invoiceDate,
        status: formData.status,
        discount: formData.discount,
        notes: formData.notes,
        items: items.map((item) => ({
          productId: item.productId,
          productLabel: item.productLabel,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal membuat invoice.");
      }

      navigate(`/admin/invoices/${data.invoice.id}`);
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

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
                Invoice Baru
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                Buat Invoice
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Buat invoice sederhana untuk customer. Nomor invoice akan dibuat
                otomatis berdasarkan lokasi dan tanggal.
              </p>
            </div>

            <Link
              to="/admin/invoices"
              className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
            >
              Kembali ke Daftar
            </Link>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
            Memuat data invoice...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">
                  Informasi Customer
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Nama Customer
                    </label>

                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(event) =>
                        updateFormField("customerName", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Nomor HP / WhatsApp
                    </label>

                    <input
                      type="text"
                      value={formData.customerPhone}
                      onChange={(event) =>
                        updateFormField("customerPhone", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Alamat Customer
                    </label>

                    <textarea
                      value={formData.customerAddress}
                      onChange={(event) =>
                        updateFormField("customerAddress", event.target.value)
                      }
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Item Invoice
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Pilih produk dari katalog atau isi item manual.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600"
                  >
                    Tambah Item
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Produk
                          </label>

                          <select
                            value={item.productId}
                            onChange={(event) =>
                              updateItem(index, "productId", event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                          >
                            <option value="">Manual / pilih produk</option>

                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.brand} {product.model}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Nama Item
                          </label>

                          <input
                            type="text"
                            value={item.productLabel}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "productLabel",
                                event.target.value,
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Warna
                          </label>

                          <input
                            type="text"
                            value={item.color}
                            onChange={(event) =>
                              updateItem(index, "color", event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Qty
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(index, "quantity", event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Harga Satuan
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(event) =>
                              updateItem(index, "unitPrice", event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Total Baris
                          </label>

                          <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-950">
                            {formatPrice(calculateLineTotal(item))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600"
                        >
                          Hapus Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">
                  Detail Invoice
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Tanggal Invoice
                    </label>

                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(event) =>
                        updateFormField("invoiceDate", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Lokasi
                    </label>

                    <select
                      value={formData.locationCode}
                      onChange={(event) =>
                        updateFormField("locationCode", event.target.value)
                      }
                      disabled={!isAdmin}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      {locations.map((location) => (
                        <option key={location.code} value={location.code}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      value={formData.status}
                      onChange={(event) =>
                        updateFormField("status", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    >
                      <option value="draft">Draft</option>
                      <option value="issued">Diterbitkan</option>
                      <option value="paid">Lunas</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Diskon
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={formData.discount}
                      onChange={(event) =>
                        updateFormField("discount", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Catatan
                    </label>

                    <textarea
                      value={formData.notes}
                      onChange={(event) =>
                        updateFormField("notes", event.target.value)
                      }
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">
                  Ringkasan
                </h2>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-bold text-slate-950">
                      {formatPrice(totals.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Diskon</span>
                    <span className="font-bold text-slate-950">
                      {formatPrice(totals.discount)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between gap-4">
                      <span className="font-black text-slate-950">Total</span>
                      <span className="font-black text-red-600">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Invoice"}
                </button>
              </section>
            </aside>
          </form>
        )}
      </Container>
    </main>
  );
}

export default AdminInvoiceNewPage;