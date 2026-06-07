import { useEffect, useState } from "react";
import Container from "../components/Container";

const actionLabels = {
  "product.create": "Produk dibuat",
  "product.update": "Produk diperbarui",
  "product.activate": "Produk diaktifkan",
  "product.deactivate": "Produk dinonaktifkan",
  "image.upload.main": "Gambar utama diupload",
  "image.upload.color": "Gambar warna diupload",
  "user.create": "User dibuat",
  "user.activate": "User diaktifkan",
  "user.deactivate": "User dinonaktifkan",
  "user.password_reset": "Password user direset",
};

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";

  return String(value);
}

function formatLogDetail(log) {
  const metadata = log.metadata || {};

  if (log.action === "product.update") {
    const changes = metadata.changes || [];

    if (changes.length === 0) {
      return ["Tidak ada perubahan data yang terdeteksi."];
    }

    return changes.map(
      (change) =>
        `${change.label} diubah dari "${formatValue(
          change.before,
        )}" menjadi "${formatValue(change.after)}"`,
    );
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
    return [`User dibuat dengan role: ${metadata.role || "-"}`];
  }

  if (log.action === "user.activate") {
    return ["User diaktifkan."];
  }

  if (log.action === "user.deactivate") {
    return ["User dinonaktifkan."];
  }

  if (log.action === "user.password_reset") {
    return ["Password user direset."];
  }

  return [JSON.stringify(metadata)];
}

function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function parseJsonResponse(response) {
    const responseText = await response.text();

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error(
        `API tidak mengembalikan JSON. Status: ${response.status}. Response: ${responseText.slice(
          0,
          120,
        )}`,
      );
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/admin/logs");
        const data = await parseJsonResponse(response);

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Gagal mengambil audit log.");
        }

        if (isMounted) {
          setLogs(data.logs);
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

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const actionOptions = [
    ...new Set(logs.map((log) => log.action).filter(Boolean)),
  ];

  const userOptions = [
    ...new Set(logs.map((log) => log.actorUsername).filter(Boolean)),
  ];

  const targetOptions = [
    ...new Set(logs.map((log) => log.targetType).filter(Boolean)),
  ];

  const filteredLogs = logs.filter((log) => {
    const searchText = `${log.actorUsername || ""} ${log.actorRole || ""} ${
      log.action || ""
    } ${log.targetType || ""} ${log.targetId || ""} ${
      log.targetLabel || ""
    }`
      .toLowerCase()
      .trim();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());

    const matchesUser =
      userFilter === "all" || log.actorUsername === userFilter;

    const matchesAction =
      actionFilter === "all" || log.action === actionFilter;

    const matchesTarget =
      targetFilter === "all" || log.targetType === targetFilter;

    return matchesSearch && matchesUser && matchesAction && matchesTarget;
  });

  return (
    <main className="py-10">
      <Container>
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-10">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_38%)]" />

          <div className="relative">
            <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-200 backdrop-blur">
              Audit Log
            </p>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
              Riwayat Aktivitas Admin
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Lihat aktivitas penting seperti perubahan produk, upload gambar,
              perubahan status, dan pengelolaan user admin.
            </p>
          </div>
        </section>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative grid gap-4 lg:grid-cols-[1fr_220px_240px_220px]">
            <div>
              <label
                htmlFor="log-search"
                className="text-sm font-semibold text-slate-700"
              >
                Cari log
              </label>

              <input
                id="log-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari user, aksi, target, atau produk..."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              />
            </div>

            <div>
              <label
                htmlFor="log-user"
                className="text-sm font-semibold text-slate-700"
              >
                User
              </label>

              <select
                id="log-user"
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua user</option>
                {userOptions.map((username) => (
                  <option key={username} value={username}>
                    {username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="log-action"
                className="text-sm font-semibold text-slate-700"
              >
                Aksi
              </label>

              <select
                id="log-action"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua aksi</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {actionLabels[action] || action}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="log-target"
                className="text-sm font-semibold text-slate-700"
              >
                Target
              </label>

              <select
                id="log-target"
                value={targetFilter}
                onChange={(event) => setTargetFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="all">Semua target</option>
                {targetOptions.map((target) => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              Menampilkan{" "}
              <span className="font-bold text-slate-950">
                {filteredLogs.length}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-slate-950">{logs.length}</span>{" "}
              log terakhir.
            </p>
          </div>
        </section>

        {isLoading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
            Memuat audit log...
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-5 py-4 font-bold">Waktu</th>
                    <th className="px-5 py-4 font-bold">User</th>
                    <th className="px-5 py-4 font-bold">Aksi</th>
                    <th className="px-5 py-4 font-bold">Target</th>
                    <th className="px-5 py-4 font-bold">Detail</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-slate-700">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-black text-slate-950">
                          {log.actorUsername || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {log.actorRole || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                          {actionLabels[log.action] || log.action}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">
                          {log.action}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">
                          {log.targetLabel || log.targetId || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {log.targetType} / {log.targetId || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-md space-y-2 text-sm font-semibold leading-6 text-slate-700">
                          {formatLogDetail(log).map((detail, index) => (
                            <p key={`${log.id}-${index}`}>{detail}</p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center">
                <h2 className="text-lg font-black text-slate-950">
                  Log tidak ditemukan
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Coba ubah pencarian atau filter.
                </p>
              </div>
            )}
          </section>
        )}
      </Container>
    </main>
  );
}

export default AdminLogsPage;