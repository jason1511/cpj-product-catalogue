import { useEffect, useState } from "react";
import Container from "../components/Container";

const actionLabels = {
  "product.create": "Produk dibuat",
  "product.update": "Produk diperbarui",
  "product.activate": "Produk diaktifkan",
  "product.deactivate": "Produk dinonaktifkan",
  "image.upload.main": "Gambar utama diupload",
  "image.upload.color": "Gambar warna diupload",
  "user.update": "User diperbarui",
  "user.create": "User dibuat",
  "user.activate": "User diaktifkan",
  "user.deactivate": "User dinonaktifkan",
  "user.password_reset": "Password user direset",
  "image.cleanup.unused": "Cleanup gambar tidak terpakai",
  "stock.update": "Stok diperbarui",
  "brand.create": "Merek ditambahkan",
  "brand.logo_update": "Logo merek diperbarui",
  "brand.status_update": "Status merek diubah",
  "stock.color_update": "Stok warna diperbarui",
  "invoice.create": "Invoice dibuat",
"invoice.status_update": "Status invoice diperbarui",
};

function formatDate(value) {
  if (!value) return "—";
  const normalized = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value)
    ? value.replace(" ", "T") + "Z"
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
  }).format(date) + " WIB";
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(", ") : "—";
  if (typeof value === "object") return Object.entries(value).map(([key, item]) => key + ": " + formatValue(item)).join(", ") || "—";
  return String(value);
}

function formatLogDetail(log) {
  const metadata = log.metadata || {};

  if (log.action === "brand.create") return ["Merek ditambahkan ke daftar."];
  if (log.action === "brand.logo_update") return ["Logo merek diperbarui."];
  if (log.action === "brand.status_update") return [metadata.isActive ? "Merek ditampilkan di website." : "Merek disembunyikan dari website."];
  if (log.action === "stock.color_update") return (metadata.changes || []).map((change) => (metadata.color || "Warna") + " · " + (change.location || "Lokasi") + ": " + formatValue(change.before) + " → " + formatValue(change.after));

  if (log.action === "image.cleanup.unused") {
    const deletedCount = metadata.deletedKeys?.length || 0;
    const skippedCount = metadata.skippedKeys?.length || 0;

    return [
      `${deletedCount} gambar tidak terpakai dihapus.`,
      skippedCount > 0
        ? `${skippedCount} gambar dilewati karena masih digunakan.`
        : "Tidak ada gambar yang dilewati.",
    ];
  }

  if (log.action === "product.update") {
    const changes = metadata.changes || [];

    if (changes.length === 0) {
      return ["Tidak ada perubahan data yang terdeteksi."];
    }

    return changes.map((change) => {
      if (String(change.field || "").toLowerCase().includes("image")) {
        return (change.label || "Gambar") + " diperbarui.";
      }
      return (change.label || "Data") + ": " + formatValue(change.before) + " → " + formatValue(change.after);
    });
  }

  if (log.action === "product.activate") {
    return ["Status produk diubah menjadi: Aktif"];
  }

  if (log.action === "product.deactivate") {
    return ["Status produk diubah menjadi: Nonaktif"];
  }

  if (log.action === "product.create") {
    return [
      `Produk dibuat: ${metadata.brand || "-"} ${metadata.model || ""}`.trim(),
    ];
  }

  if (log.action === "image.upload.main") {
    return [`Gambar utama diupload: ${metadata.originalName || "-"}`];
  }

  if (log.action === "image.upload.color") {
    return [
      `Gambar warna ${metadata.colorName || "-"} diupload: ${
        metadata.originalName || "-"
      }`,
    ];
  }

  if (log.action === "user.create") {
    const details = [`User dibuat dengan role: ${metadata.role || "-"}`];

    if (metadata.role === "staff") {
      details.push(
        `Lokasi staff: ${
          metadata.locationName || metadata.locationCode || "-"
        }`,
      );
    }

    if (metadata.role === "admin") {
      details.push("Admin dapat mengakses semua lokasi.");
    }

    return details;
  }

  if (log.action === "user.update") {
    const changes = metadata.changes || [];

    if (changes.length === 0) {
      return ["Tidak ada perubahan user yang terdeteksi."];
    }

    return changes.map(
      (change) =>
        `${change.label} diubah dari "${formatValue(
          change.before,
        )}" menjadi "${formatValue(change.after)}"`,
    );
  }

  if (log.action === "user.activate") {
    const details = ["User diaktifkan."];

    if (metadata.locationName || metadata.locationCode) {
      details.push(`Lokasi: ${metadata.locationName || metadata.locationCode}`);
    }

    return details;
  }

  if (log.action === "user.deactivate") {
    const details = ["User dinonaktifkan."];

    if (metadata.locationName || metadata.locationCode) {
      details.push(`Lokasi: ${metadata.locationName || metadata.locationCode}`);
    }

    return details;
  }

  if (log.action === "user.password_reset") {
    const details = ["Password user direset."];

    if (metadata.role) {
      details.push(`Role: ${metadata.role}`);
    }

    if (metadata.locationName || metadata.locationCode) {
      details.push(`Lokasi: ${metadata.locationName || metadata.locationCode}`);
    }

    return details;
  }
  if (log.action === "stock.update") {
  const changes = metadata.changes || [];

  if (changes.length === 0) {
    return ["Tidak ada perubahan stok yang terdeteksi."];
  }

  return changes.map(
    (change) =>
      `${change.label} diubah dari "${formatValue(
        change.before,
      )}" menjadi "${formatValue(change.after)}"`,
  );
}
if (log.action === "invoice.create") {
  return [
    `Invoice ${metadata.invoiceNumber || "-"} dibuat.`,
    `Lokasi: ${metadata.locationName || metadata.locationCode || "-"}`,
    `Customer: ${metadata.customerName || "-"}`,
    `Status: ${metadata.status || "-"}`,
    `Jumlah item: ${metadata.itemCount || 0}`,
    `Total: Rp ${Number(metadata.total || 0).toLocaleString("id-ID")}`,
  ];
}

if (log.action === "invoice.status_update") {
  return [
    `Status invoice diubah dari "${
      metadata.previousStatusLabel || metadata.previousStatus || "-"
    }" menjadi "${metadata.statusLabel || metadata.status || "-"}".`,
    `Lokasi: ${metadata.locationName || metadata.locationCode || "-"}`,
    `Customer: ${metadata.customerName || "-"}`,
  ];
}
  return [];
}

function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadLogs() {
      try {
        const response = await fetch("/api/admin/logs");
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "Gagal memuat aktivitas.");
        if (active) setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch (error) {
        if (active) setErrorMessage(error.message || "Gagal memuat aktivitas.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadLogs();
    return () => { active = false; };
  }, []);

  const actionOptions = [...new Set(logs.map((log) => log.action).filter(Boolean))];
  const userOptions = [...new Set(logs.map((log) => log.actorUsername).filter(Boolean))];
  const targetOptions = [...new Set(logs.map((log) => log.targetType).filter(Boolean))];
  const targetLabels = { product: "Produk", brand: "Merek", user: "Pengguna", invoice: "Invoice", image: "Gambar" };
  const filteredLogs = logs.filter((log) => {
    const searchText = [log.actorUsername, log.action, actionLabels[log.action], log.targetType, log.targetId, log.targetLabel, ...formatLogDetail(log)]
      .filter(Boolean).join(" ").toLowerCase();
    return searchText.includes(searchTerm.trim().toLowerCase())
      && (userFilter === "all" || log.actorUsername === userFilter)
      && (actionFilter === "all" || log.action === actionFilter)
      && (targetFilter === "all" || log.targetType === targetFilter);
  });

  return (
    <main className="py-8">
      <Container>
        <a href="/admin" className="text-sm font-semibold text-slate-500 hover:text-red-600">← Kembali ke Dashboard</a>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Riwayat Aktivitas</h1>
        <p className="mt-2 text-sm text-slate-600">Lihat perubahan produk, merek, gambar, dan akun.</p>
        <section aria-label="Filter aktivitas" className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700">Cari aktivitas
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Cari produk, merek, atau pengguna" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
            </label>
            <label className="text-sm font-semibold text-slate-700">Pengguna
              <select value={userFilter} onChange={(event) => setUserFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="all">Semua pengguna</option>
                {userOptions.map((user) => <option key={user} value={user}>{user}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Aktivitas
              <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="all">Semua aktivitas</option>
                {actionOptions.map((action) => <option key={action} value={action}>{actionLabels[action] || action}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Jenis
              <select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="all">Semua jenis</option>
                {targetOptions.map((target) => <option key={target} value={target}>{targetLabels[target] || target}</option>)}
              </select>
            </label>
          </div>
          {!isLoading && !errorMessage && <p className="mt-4 text-xs text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} aktivitas terakhir.</p>}
        </section>
        {isLoading && <p className="mt-6 text-sm text-slate-600">Memuat aktivitas...</p>}
        {errorMessage && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>}
        {!isLoading && !errorMessage && (
          <section aria-label="Daftar aktivitas" className="mt-5 space-y-3">
            {filteredLogs.map((log) => {
              const details = formatLogDetail(log);
              return (
                <article key={log.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-950">{actionLabels[log.action] || log.action || "Aktivitas"}</h2>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-700">{log.targetLabel || log.targetId || "—"}</p>
                    </div>
                    <time className="text-xs text-slate-500">{formatDate(log.createdAt)}</time>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Oleh {log.actorUsername || "Pengguna tidak diketahui"}{log.actorRole ? " · " + log.actorRole : ""}</p>
                  {details.length > 0 && <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">{details.map((detail, index) => <li key={index} className="break-words">{detail}</li>)}</ul>}
                </article>
              );
            })}
            {filteredLogs.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Tidak ada aktivitas yang sesuai.</p>}
          </section>
        )}
      </Container>
    </main>
  );
}

export default AdminLogsPage;
