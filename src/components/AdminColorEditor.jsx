import { useEffect, useState } from "react";

export default function AdminColorEditor({ productId, onChanged }) {
  const [state, setState] = useState(null);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch(`/api/admin/products/${productId}/colors`);
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Gagal memuat warna dan stok.");
    setState(data);
    return data;
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [productId]);

  function open(color = "") {
    setEditing(color);
    setName(color);
    setFile(null);
    setMessage("");
    setQuantities(Object.fromEntries(state.locations.map((location) => [
      location.code, location.colors[color] || 0,
    ])));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const color = name.trim();
      if (!color || color.includes(",")) throw new Error("Isi nama warna tanpa koma.");
      if (!editing && state.colors.some((item) => item.toLowerCase() === color.toLowerCase())) {
        throw new Error("Warna sudah ada. Pilih Edit pada warna tersebut.");
      }
      let image = "";
      if (file) {
        const form = new FormData();
        form.append("image", file);
        form.append("productId", productId);
        form.append("colorName", color);
        const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "Gagal mengunggah gambar.");
        image = data.imageUrl;
      }
      const expected = Object.fromEntries(state.locations.map((location) => [
        location.code, Number(location.colors[editing] || 0),
      ]));
      const response = await fetch(`/api/admin/products/${productId}/colors`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: color, image, quantities, expected }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Gagal menyimpan warna.");
      setState(data);
      onChanged(data.colors, data.images);
      setEditing(null);
      setMessage("Warna dan stok berhasil disimpan.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Warna &amp; Stok</h2>
        <button type="button" onClick={() => open()} disabled={!state} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Tambah Warna</button>
      </div>
      {message && <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{message}</p>}
      {state && (
        <>
          <div className="mt-4 space-y-2">
            {state.colors.map((color) => (
              <div key={color} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                {state.images[color] && <img src={state.images[color]} alt="" className="h-12 w-12 rounded-lg object-contain" />}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{color}</p>
                  <p className="text-xs text-slate-500">{state.locations.map((location) => `${location.name}: ${location.colors[color] || 0}`).join(" · ")}</p>
                </div>
                <button type="button" onClick={() => open(color)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">Edit</button>
              </div>
            ))}
            {!state.colors.length && <p className="text-sm text-slate-500">Belum ada warna.</p>}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-bold">Stok belum ditentukan warnanya</p>
            <p className="mt-1">{state.locations.map((location) => `${location.name}: ${location.unassigned}`).join(" · ")}</p>
          </div>
        </>
      )}
      {editing !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" onKeyDown={(event) => { if (event.key === "Escape" && !saving) setEditing(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="color-editor-title" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h3 id="color-editor-title" className="text-xl font-bold">{editing ? "Edit Warna" : "Tambah Warna"}</h3>
            <label className="mt-4 block text-sm font-semibold">Nama warna
              <input value={name} readOnly={Boolean(editing)} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="mt-3 block text-sm font-semibold">Gambar warna
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
            </label>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG, atau WebP. Maksimal 3 MB.</p>
            <p className="mt-4 text-sm font-bold">Jumlah stok per lokasi</p>
            <p className="mt-1 text-xs text-slate-500">Penambahan stok memakai stok belum ditentukan terlebih dahulu.</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {state.locations.map((location) => (
                <label key={location.code} className="text-sm font-semibold">{location.name}
                  <input type="number" min="0" step="1" value={quantities[location.code]} onChange={(event) => setQuantities({ ...quantities, [location.code]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
              ))}
            </div>
            {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold">Batal</button>
              <button type="button" disabled={saving} onClick={save} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan Warna"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
