import { useEffect, useState } from "react";

function AdminProductStockEditor({ productId }) {
  const [locations, setLocations] = useState([]);
  const [stockByLocation, setStockByLocation] = useState({});
  const [userScope, setUserScope] = useState(null);
  const [totalStock, setTotalStock] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStock, setIsSavingStock] = useState(false);
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

  function calculateTotal(stockData) {
    return Object.values(stockData).reduce(
      (total, quantity) => total + Number(quantity || 0),
      0,
    );
  }

  async function loadStock() {
    if (!productId) return;

    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/admin/products/${productId}/stock`);
      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengambil stok produk.");
      }

      const nextStock = data.stockByLocation || {};

      setLocations(data.locations || []);
      setStockByLocation(nextStock);
      setUserScope(data.userScope || null);
      setTotalStock(data.totalStock ?? calculateTotal(nextStock));
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStock();
  }, [productId]);

  function updateStock(locationCode, value) {
    const quantity = Math.max(0, Number(value || 0));

    setStockByLocation((current) => {
      const next = {
        ...current,
        [locationCode]: quantity,
      };

      setTotalStock(calculateTotal(next));

      return next;
    });
  }

  async function handleSaveStock() {
    try {
      setIsSavingStock(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/admin/products/${productId}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockByLocation,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal menyimpan stok produk.");
      }

      const nextStock = data.stockByLocation || stockByLocation;

      setStockByLocation(nextStock);
      setTotalStock(calculateTotal(nextStock));
      setSuccessMessage(data.message || "Stok produk berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsSavingStock(false);
    }
  }

  const isAdmin = userScope?.role === "admin";

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Stok per Lokasi
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isAdmin
              ? "Admin dapat mengubah stok untuk semua lokasi."
              : "Staff hanya dapat mengubah stok sesuai lokasi akun."}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Total stok terlihat
          </p>
          <p className="text-2xl font-black">{totalStock}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          Memuat stok produk...
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              {successMessage}
            </div>
          )}

          {locations.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
              Tidak ada lokasi yang tersedia untuk user ini.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {locations.map((location) => (
                <div
                  key={location.code}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">
                        {location.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {location.code}
                      </p>
                    </div>

                    <span
                      className={
                        Number(stockByLocation[location.code] || 0) > 0
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                          : "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                      }
                    >
                      {Number(stockByLocation[location.code] || 0) > 0
                        ? "Ada stok"
                        : "Kosong"}
                    </span>
                  </div>

                  <label className="mt-4 block text-sm font-semibold text-slate-700">
                    Jumlah Stok
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stockByLocation[location.code] ?? 0}
                    onChange={(event) =>
                      updateStock(location.code, event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveStock}
              disabled={isSavingStock || locations.length === 0}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingStock ? "Menyimpan Stok..." : "Simpan Stok"}
            </button>

            <button
              type="button"
              onClick={loadStock}
              disabled={isSavingStock}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh Stok
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminProductStockEditor;