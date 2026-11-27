import { writeAdminLog } from "../../../utils/audit";

export async function onRequestPost({ env, request, data }) {
  if (data.adminUser.role !== "admin") {
    return Response.json({ ok: false, message: "Hanya admin dapat mengubah logo merek." }, { status: 403 });
  }
  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const file = form.get("logo");
    const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    if (!name || !file || typeof file === "string" || !extensions[file.type] || file.size === 0 || file.size > 3 * 1024 * 1024) {
      return Response.json({ ok: false, message: "Pilih logo JPG, PNG, atau WebP dengan ukuran maksimal 3 MB." }, { status: 400 });
    }
    const product = await env.DB.prepare("SELECT brand FROM products WHERE LOWER(TRIM(brand)) = LOWER(?) LIMIT 1").bind(name).first();
    let saved = null;
    try {
      saved = await env.DB.prepare("SELECT name FROM catalogue_brands WHERE name = ? COLLATE NOCASE").bind(name).first();
    } catch (error) {
      if (!String(error.message).includes("no such table")) throw error;
    }
    if (!product && !saved) return Response.json({ ok: false, message: "Merek tidak ditemukan." }, { status: 404 });
    if (!env.PRODUCT_IMAGES) return Response.json({ ok: false, message: "Penyimpanan gambar tidak tersedia." }, { status: 500 });

    await env.DB.prepare("CREATE TABLE IF NOT EXISTS catalogue_brand_logos (name TEXT PRIMARY KEY COLLATE NOCASE, image_url TEXT NOT NULL)").run();
    const key = `brand-logos/${crypto.randomUUID()}.${extensions[file.type]}`;
    await env.PRODUCT_IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
    const imageUrl = `/api/images/${key}`;
    try {
      await env.DB.prepare("INSERT INTO catalogue_brand_logos(name, image_url) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET image_url = excluded.image_url").bind(name, imageUrl).run();
    } catch (error) {
      await env.PRODUCT_IMAGES.delete(key);
      throw error;
    }
    try {
      await writeAdminLog(env, data.adminUser, { action: "brand.logo_update", targetType: "brand", targetId: name, targetLabel: name, metadata: {} });
    } catch (error) { console.error(error); }
    return Response.json({ ok: true, name, logo: imageUrl });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, message: "Gagal mengunggah logo merek." }, { status: 500 });
  }
}
