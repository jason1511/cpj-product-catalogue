import { writeAdminLog } from "../../utils/audit";

export async function onRequestGet({ env }) {
  try {
    const products = await env.DB.prepare(
      "SELECT DISTINCT TRIM(brand) AS name FROM products WHERE TRIM(COALESCE(brand, '')) <> '' ORDER BY name COLLATE NOCASE",
    ).all();
    let saved = [];
    try {
      const result = await env.DB.prepare("SELECT name FROM catalogue_brands ORDER BY name COLLATE NOCASE").all();
      saved = result.results;
    } catch (error) {
      if (!String(error.message).includes("no such table")) throw error;
    }
    const brands = new Map();
    for (const row of [...saved, ...products.results]) {
      const name = row.name.trim();
      if (!brands.has(name.toLowerCase())) brands.set(name.toLowerCase(), name);
    }
    return Response.json({ ok: true, brands: [...brands.values()].sort((a, b) => a.localeCompare(b)) });
  } catch (error) {
    return Response.json({ ok: false, message: "Gagal memuat merek." }, { status: 500 });
  }
}

export async function onRequestPost({ env, request, data }) {
  if (data.adminUser.role !== "admin") {
    return Response.json({ ok: false, message: "Hanya admin dapat menambah merek." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().replace(/\s+/g, " ");
    if (!name || name.length > 100) return Response.json({ ok: false, message: "Isi nama merek, maksimal 100 karakter." }, { status: 400 });

    await env.DB.prepare("CREATE TABLE IF NOT EXISTS catalogue_brands (name TEXT PRIMARY KEY COLLATE NOCASE, created_at TEXT DEFAULT CURRENT_TIMESTAMP)").run();
    const existing = await env.DB.prepare("SELECT brand FROM products WHERE LOWER(TRIM(brand)) = LOWER(?) LIMIT 1").bind(name).first();
    if (existing) return Response.json({ ok: false, message: "Merek sudah tersedia." }, { status: 409 });
    const result = await env.DB.prepare("INSERT OR IGNORE INTO catalogue_brands (name) VALUES (?)").bind(name).run();
    if (!result.meta.changes) return Response.json({ ok: false, message: "Merek sudah tersedia." }, { status: 409 });
    try {
      await writeAdminLog(env, data.adminUser, { action: "brand.create", targetType: "brand", targetId: name, targetLabel: name, metadata: {} });
    } catch (error) { console.error(error); }
    return Response.json({ ok: true, name }, { status: 201 });
  } catch (error) {
    return Response.json({ ok: false, message: "Gagal menambahkan merek." }, { status: 500 });
  }
}
