import { useEffect, useState } from "react";
import Container from "../components/Container";

function formatBytes(bytes) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function AdminImageCleanupPage() {
  const [unusedImages, setUnusedImages] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [summary, setSummary] = useState({
    totalR2Images: 0,
    totalUsedImages: 0,
    totalUnusedImages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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

  async function loadUnusedImages() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/images/unused");
      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal mengambil gambar.");
      }

      setUnusedImages(data.unusedImages || []);
      setSelectedKeys([]);
      setSummary({
        totalR2Images: data.totalR2Images || 0,
        totalUsedImages: data.totalUsedImages || 0,
        totalUnusedImages: data.totalUnusedImages || 0,
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUnusedImages();
  }, []);

  function toggleSelected(key) {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function toggleSelectAll() {
    if (selectedKeys.length === unusedImages.length) {
      setSelectedKeys([]);
      return;
    }

    setSelectedKeys(unusedImages.map((image) => image.key));
  }

  async function handleDeleteSelected() {
    if (selectedKeys.length === 0) return;

    const confirmed = window.confirm(
      `Hapus ${selectedKeys.length} gambar tidak terpakai dari R2? Tindakan ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/images/unused", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keys: selectedKeys,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gagal menghapus gambar.");
      }

      alert(data.message || "Gambar berhasil dihapus.");
      await loadUnusedImages();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsDeleting(false);
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
                Admin Only
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                Cleanup Gambar R2
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Temukan gambar di R2 yang tidak lagi dipakai oleh produk di D1,
                lalu hapus secara aman.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUnusedImages}
              disabled={isLoading}
              className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Memuat..." : "Refresh Scan"}
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total gambar R2
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {summary.totalR2Images}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Dipakai produk
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {summary.totalUsedImages}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Tidak terpakai
            </p>
            <p className="mt-2 text-3xl font-black text-red-600">
              {summary.totalUnusedImages}
            </p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Gambar Tidak Terpakai
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Pilih gambar yang ingin dihapus dari R2.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={unusedImages.length === 0}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedKeys.length === unusedImages.length
                  ? "Batal Pilih Semua"
                  : "Pilih Semua"}
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedKeys.length === 0 || isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting
                  ? "Menghapus..."
                  : `Hapus Terpilih (${selectedKeys.length})`}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm font-semibold text-slate-600">
              Memindai gambar R2...
            </div>
          ) : unusedImages.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-black text-slate-950">
                Tidak ada gambar tidak terpakai
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Semua gambar R2 saat ini masih dipakai oleh katalog.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {unusedImages.map((image) => {
                const isSelected = selectedKeys.includes(image.key);

                return (
                  <label
                    key={image.key}
                    className={
                      isSelected
                        ? "overflow-hidden rounded-2xl border border-red-300 bg-red-50 shadow-sm"
                        : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    }
                  >
                    <div className="aspect-[4/3] bg-slate-100">
                      <img
                        src={image.imageUrl}
                        alt={image.key}
                        className="h-full w-full object-contain p-3"
                      />
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(image.key)}
                          className="mt-1"
                        />

                        <div>
                          <p className="break-all text-sm font-bold text-slate-950">
                            {image.key}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatBytes(image.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}

export default AdminImageCleanupPage;