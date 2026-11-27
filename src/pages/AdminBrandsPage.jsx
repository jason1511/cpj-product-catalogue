import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadBrands() {
    const response = await fetch("/api/admin/brands");
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Gagal memuat merek.");
    setBrands(data.brands);
  }

  useEffect(() => {
    loadBrands().catch((error) => setMessage(error.message));
  }, []);

  async function addBrand(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Gagal menambahkan merek.");
      setName("");
      setBrands((current) => [...current, data.name].sort((a, b) => a.localeCompare(b)));
      setMessage("Merek berhasil ditambahkan.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="py-8">
      <Container>
        <Link to="/admin/products" className="text-sm font-semibold text-slate-500 hover:text-red-600">← Kembali ke Produk</Link>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Kelola Merek</h1>
        <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={addBrand} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-semibold text-slate-700">Nama merek
              <input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Nama merek" />
            </label>
            <button disabled={saving} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Menyimpan..." : "Tambah Merek"}</button>
          </form>
          {message && <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{message}</p>}
          <h2 className="mt-7 text-lg font-bold">Daftar Merek</h2>
          <ul className="mt-3 divide-y divide-slate-100">{brands.map((brand) => <li key={brand} className="py-3 text-sm font-semibold">{brand}</li>)}</ul>
          {brands.length === 0 && <p className="mt-3 text-sm text-slate-500">Belum ada merek.</p>}
        </section>
      </Container>
    </main>
  );
}
