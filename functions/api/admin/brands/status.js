import { writeAdminLog } from "../../../utils/audit";

export async function onRequestPut({ env, request, data }) {
  if (data.adminUser.role !== "admin") {
    return Response.json({ ok: false, message: "Hanya admin dapat mengubah status merek." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name || name.length > 100 || typeof body.isActive !== "boolean") {
      return Response.json({ ok: false, message: "Nama atau status merek tidak valid." }, { status: 400 });
    }
    const product = await env.DB.prepare("SELECT brand FROM products WHERE LOWER(TRIM(brand)) = LOWER(?) LIMIT 1").bind(name).first();
    let saved = null;
    try {
      saved = await env.DB.prepare("SELECT name FROM catalogue_brands WHERE name = ? COLLATE NOCASE").bind(name).first();
    } catch (error) {
      if (!String(error.message).includes("no such table")) throw error;
    }
    if (!product && !saved) return Response.json({ ok: false, message: "Merek tidak ditemukan." }, { status: 404 });
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS catalogue_brand_visibility (name TEXT PRIMARY KEY COLLATE NOCASE, is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)))").run();
    await env.DB.prepare("INSERT INTO catalogue_brand_visibility (name, is_active) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET is_active = excluded.is_active").bind(name, body.isActive ? 1 : 0).run();
    try {
      await writeAdminLog(env, data.adminUser, { action: "brand.status_update", targetType: "brand", targetId: name, targetLabel: name, metadata: { isActive: body.isActive } });
    } catch (error) { console.error(error); }
    return Response.json({ ok: true, name, isActive: body.isActive });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, message: "Gagal mengubah status merek." }, { status: 500 });
  }
}