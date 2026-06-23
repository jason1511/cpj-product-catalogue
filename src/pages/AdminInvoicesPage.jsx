import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";

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

function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [userScope, setUserScope] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
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

  async function loadInvoices() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/invoices");
      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengambil data invoice.");
      }

      setInvoices(data.invoices || []);
      setLocations(data.locations || []);
      setUserScope(data.userScope || null);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const isAdmin = userScope?.role === "admin";

  const filteredInvoices = invoices.filter((invoice) => {
    const searchText = `${invoice.invoiceNumber || ""} ${
      invoice.customerName || ""
    } ${invoice.customerPhone || ""} ${invoice.locationName || ""} ${
      invoice.locationCode || ""
    } ${invoice.status || ""}`
      .toLowerCase()
      .trim();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    const matchesLocation =
      locationFilter === "all" || invoice.locationCode === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const totalValue = filteredInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0,
  );

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
                Invoice
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                Daftar Invoice
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Kelola invoice sederhana berdasarkan lokasi. Admin dapat melihat
                semua lokasi, sedangkan staff hanya melihat invoice lokasi
                akunnya.
              </p>
            </div>

            <Link
              to="/admin/invoices/new"
              className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              Buat Invoice
            </Link>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
            <div>
              <label
                htmlFor="invoice-search"
                className="text-sm font-semibold text-slate-700"
              >
                Cari invoice
              </label>

              <input
                id="invoice-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari nomor invoice, customer, lokasi..."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              />
            </div>

            <div>
              <label
                htmlFor="invoice-status"
                className="text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="invoice-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua status</option>
                <option value="draft">Draft</option>
                <option value="issued">Diterbitkan</option>
                <option value="paid">Lunas</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            {isAdmin && (
              <div>
                <label
                  htmlFor="invoice-location"
                  className="text-sm font-semibold text-slate-700"
                >
                  Lokasi
                </label>

                <select
                  id="invoice-location"
                  value={locationFilter}
                  onChange={(event) => setLocationFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                >
                  <option value="all">Semua lokasi</option>

                  {locations.map((location) => (
                    <option key={location.code} value={location.code}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button
                type="button"
                onClick={loadInvoices}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 hover:shadow-lg"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="relative mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Invoice tampil
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {filteredInvoices.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total nilai
              </p>
              <p className="mt-1 text-2xl font-black text-red-600">
                {formatPrice(totalValue)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Scope
              </p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {isAdmin
                  ? "Semua lokasi"
                  : userScope?.locationName || userScope?.locationCode || "-"}
              </p>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
            Memuat invoice...
          </div>
        ) : (
          <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-5 py-4 font-bold">Invoice</th>
                    <th className="px-5 py-4 font-bold">Customer</th>
                    <th className="px-5 py-4 font-bold">Lokasi</th>
                    <th className="px-5 py-4 font-bold">Tanggal</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 text-right font-bold">Total</th>
                    <th className="px-5 py-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-950">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {invoice.itemCount} item
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">
                          {invoice.customerName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {invoice.customerPhone || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">
                          {invoice.locationName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {invoice.locationCode}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {formatDate(invoice.invoiceDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                            invoice.status,
                          )}`}
                        >
                          {statusLabels[invoice.status] || invoice.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right font-black text-red-600">
                        {formatPrice(invoice.total)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/invoices/${invoice.id}`}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="p-8 text-center">
                <h2 className="text-lg font-black text-slate-950">
                  Invoice tidak ditemukan
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Coba ubah pencarian atau buat invoice baru.
                </p>
              </div>
            )}
          </section>
        )}
      </Container>
    </main>
  );
}

export default AdminInvoicesPage;