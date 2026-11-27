import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  async function loadBrands() {
    const response = await fetch("/api/brands");
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Gagal memuat merek.");
    setBrands(data.brands);
  }

  useEffect(() => {
    loadBrands().catch((error) => setMessage(error.message));
  }, []);

  async function uploadLogo(brandName, file) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024 || !file.size) {
      throw new Error("Pilih logo JPG, PNG, atau WebP dengan ukuran maksimal 3 MB.");
    }
    const form = new FormData();
    form.append("name", brandName);
    form.append("logo", file);
    const response = await fetch("/api/admin/brands/logo", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Gagal mengunggah logo.");
    return data.logo;
  }

  async function addBrand(event) {
    event.preventDefault();
    if (logo && (!["image/jpeg", "image/png", "image/webp"].includes(logo.type) || logo.size > 3 * 1024 * 1024 || !logo.size)) {
      setMessage("Pilih logo JPG, PNG, atau WebP dengan ukuran maksimal 3 MB.");
      return;
    }
    setSaving(true);
    setMessage("");
    let createdName = "";
    try {
      const response = await fetch("/api/admin/brands", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Gagal menambahkan merek.");
      createdName = data.name;
      setBrands((current) => [...current, { name: createdName, logo: "" }].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      if (logo) {
        const imageUrl = await uploadLogo(createdName, logo);
        setBrands((current) => current.map((brand) => brand.name === createdName ? { ...brand, logo: imageUrl } : brand));
      }
      setLogo(null);
      if (fileRef.current) fileRef.current.value = "";
      setMessage("Merek berhasil ditambahkan.");
    } catch (error) {
      setMessage(createdName ? `Merek ${createdName} tersimpan. ${error.message} Tambahkan logo melalui daftar merek.` : error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateLogo(brand, file, input) {
    if (!file) return;
    setSaving(true);
    setMessage("");
    try {
      const imageUrl = await uploadLogo(brand.name, file);
      setBrands((current) => current.map((item) => item.name === brand.name ? { ...item, logo: imageUrl } : item));
      setMessage(`Logo ${brand.name} berhasil disimpan.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      input.value = "";
      setSaving(false);
    }
  }

  return (
    <main className="py-8">
      <Container>
        <Link to="/admin" className="text-sm font-semibold text-slate-500 hover:text-red-600">← Kembali ke Dashboard</Link>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Kelola Merek</h1>
        <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={addBrand} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Nama merek
              <input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Nama merek" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Logo merek
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setLogo(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
            </label>
            <p className="text-xs text-slate-500">JPG, PNG, atau WebP, maksimal 3 MB.</p>
            <button disabled={saving} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Menyimpan..." : "Tambah Merek"}</button>
          </form>
          {message && <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{message}</p>}
          <h2 className="mt-7 text-lg font-bold">Daftar Merek</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {brands.map((brand) => (
              <li key={brand.name} className="flex flex-wrap items-center gap-3 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                  {brand.logo ? <img src={brand.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-xs font-bold text-slate-500">{brand.name.slice(0, 2).toUpperCase()}</span>}
                </div>
                <span className="min-w-0 flex-1 text-sm font-semibold">{brand.name}</span>
                <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:border-red-300 hover:text-red-600">
                  {brand.logo ? "Ganti Logo" : "Tambah Logo"}
                  <input aria-label={`Logo ${brand.name}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(event) => updateLogo(brand, event.target.files?.[0], event.target)} className="sr-only" />
                </label>
              </li>
            ))}
          </ul>
          {brands.length === 0 && <p className="mt-3 text-sm text-slate-500">Belum ada merek.</p>}
        </section>
      </Container>
    </main>
  );
}
