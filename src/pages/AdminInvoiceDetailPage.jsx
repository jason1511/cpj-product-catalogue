import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/Container";
import { siteConfig } from "../data/siteConfig";

const statusLabels = {
  draft: "Draft",
  issued: "Diterbitkan",
  paid: "Lunas",
  cancelled: "Dibatalkan",
};

function formatPrice(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status) {
  if (status === "paid") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "issued") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "cancelled") {
    return "bg-slate-100 text-slate-500";
  }

  return "bg-amber-50 text-amber-700";
}

function AdminInvoiceDetailPage() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);

  const [nextStatus, setNextStatus] = useState("draft");

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  async function loadInvoice() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/admin/invoices/${id}`);
      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengambil detail invoice.");
      }

      setInvoice(data.invoice);
      setItems(data.items || []);
      setNextStatus(data.invoice?.status || "draft");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function handleUpdateStatus(event) {
    event.preventDefault();

    if (!invoice) return;

    try {
      setIsUpdatingStatus(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal memperbarui status invoice.");
      }

      setInvoice(data.invoice);
      setItems(data.items || []);
      setNextStatus(data.invoice?.status || nextStatus);
      setSuccessMessage(data.message || "Status invoice berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <main className="py-10 print:bg-white print:py-0">
      <Container>
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-10 print:hidden">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
                Detail Invoice
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                {invoice?.invoiceNumber || "Invoice"}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Lihat detail invoice, item pembelian, total pembayaran, dan ubah
                status invoice.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/admin/invoices"
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15"
              >
                Kembali
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Print
              </button>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 print:hidden">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 print:hidden">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm print:hidden">
            Memuat detail invoice...
          </div>
        ) : invoice ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] print:mt-0 print:block">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
              <div className="grid gap-6 border-b border-slate-200 pb-5 md:grid-cols-[1.2fr_0.8fr] print:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-red-600">
                    CV Chandra Putra Jaya
                  </p>

                  <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 print:text-3xl">
                    Invoice
                  </h2>

                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Showroom Sepeda & Motor Listrik
                  </p>

                  <div className="mt-4 max-w-xl space-y-1 text-xs leading-5 text-slate-600">
                    <p>{siteConfig.address}</p>
                    <p>WhatsApp: {siteConfig.whatsappNumber}</p>
                    <p>{siteConfig.operationalHours}</p>
                  </div>
                </div>

                <div className="text-left md:text-right print:text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Nomor Invoice
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-950 print:text-xl">
                    {invoice.invoiceNumber}
                  </p>

                  <div className="mt-3 flex justify-start md:justify-end print:justify-end">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        invoice.status,
                      )}`}
                    >
                      {invoice.statusLabel ||
                        statusLabels[invoice.status] ||
                        invoice.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-xs leading-5 text-slate-600">
                    <p>
                      <span className="font-bold text-slate-950">Tanggal:</span>{" "}
                      {formatDate(invoice.invoiceDate)}
                    </p>
                    <p>
                      <span className="font-bold text-slate-950">Lokasi:</span>{" "}
                      {invoice.locationName} ({invoice.locationCode})
                    </p>
                    <p>
                      <span className="font-bold text-slate-950">Staff:</span>{" "}
                      {invoice.createdByUsername || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2 print:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Customer
                  </p>

                  <p className="mt-2 text-base font-black text-slate-950">
                    {invoice.customerName}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {invoice.customerPhone || "-"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {invoice.customerAddress || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Detail Invoice
                  </p>

                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Tanggal</span>
                      <span className="font-bold text-slate-950">
                        {formatDate(invoice.invoiceDate)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Lokasi</span>
                      <span className="font-bold text-slate-950">
                        {invoice.locationName} ({invoice.locationCode})
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Dibuat oleh</span>
                      <span className="font-bold text-slate-950">
                        {invoice.createdByUsername || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Dibuat pada</span>
                      <span className="font-bold text-slate-950">
                        {formatDateTime(invoice.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 print:rounded-none">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-950 text-white print:bg-white print:text-slate-950">
                    <tr>
                      <th className="px-4 py-3 font-bold">Item</th>
                      <th className="px-4 py-3 font-bold">Warna</th>
                      <th className="px-4 py-3 text-right font-bold">Qty</th>
                      <th className="px-4 py-3 text-right font-bold">Harga</th>
                      <th className="px-4 py-3 text-right font-bold">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-950">
                            {item.productLabel}
                          </p>

                          {item.productId && (
                            <p className="mt-1 text-xs text-slate-500">
                              {item.productId}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {item.color || "-"}
                        </td>

                        <td className="px-4 py-3 text-right font-bold text-slate-950">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-700">
                          {formatPrice(item.unitPrice)}
                        </td>

                        <td className="px-4 py-3 text-right font-black text-slate-950">
                          {formatPrice(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px] print:grid-cols-[1fr_300px]">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Catatan
                  </p>

                  <div className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 print:bg-white print:p-0">
                    {invoice.notes ? (
                      invoice.notes
                    ) : (
                      <>
                        Terima kasih telah berbelanja di CV Chandra Putra Jaya.
                        Simpan invoice ini sebagai bukti transaksi.
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-bold text-slate-950">
                      {formatPrice(invoice.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Diskon</span>
                    <span className="font-bold text-slate-950">
                      {formatPrice(invoice.discount)}
                    </span>
                  </div>

                  <div className="border-t border-slate-300 pt-3">
                    <div className="flex justify-between gap-4 text-lg">
                      <span className="font-black text-slate-950">Total</span>
                      <span className="font-black text-red-600">
                        {formatPrice(invoice.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6 print:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5 print:rounded-none print:p-4">
                  <p className="text-sm font-bold text-slate-700">
                    Tanda Tangan Staff
                  </p>

                  <div className="mt-16 border-t border-slate-400 pt-3 print:mt-12">
                    <p className="text-sm font-bold text-slate-950">
                      {invoice.createdByUsername || "Staff"}
                    </p>
                    <p className="text-xs text-slate-500">
                      CV Chandra Putra Jaya
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 print:rounded-none print:p-4">
                  <p className="text-sm font-bold text-slate-700">
                    Tanda Tangan Customer
                  </p>

                  <div className="mt-16 border-t border-slate-400 pt-3 print:mt-12">
                    <p className="text-sm font-bold text-slate-950">
                      {invoice.customerName || "Customer"}
                    </p>
                    <p className="text-xs text-slate-500">Penerima / Pembeli</p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6 print:hidden">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">
                  Ringkasan
                </h2>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-bold text-slate-950">
                      {formatPrice(invoice.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Diskon</span>
                    <span className="font-bold text-slate-950">
                      {formatPrice(invoice.discount)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between gap-4">
                      <span className="font-black text-slate-950">Total</span>
                      <span className="font-black text-red-600">
                        {formatPrice(invoice.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">
                  Ubah Status
                </h2>

                <form onSubmit={handleUpdateStatus} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Status Invoice
                    </label>

                    <select
                      value={nextStatus}
                      onChange={(event) => setNextStatus(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    >
                      <option value="draft">Draft</option>
                      <option value="issued">Diterbitkan</option>
                      <option value="paid">Lunas</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingStatus ? "Menyimpan..." : "Simpan Status"}
                  </button>
                </form>
              </section>
            </aside>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Invoice tidak ditemukan
            </h2>

            <Link
              to="/admin/invoices"
              className="mt-4 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
            >
              Kembali ke Daftar Invoice
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}

export default AdminInvoiceDetailPage;