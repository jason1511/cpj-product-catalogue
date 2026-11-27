import { writeAdminLog } from "../../../../utils/audit";

async function readState(env, id, user) {
  const product = await env.DB.prepare(
    "SELECT id, brand, model, colors, color_images FROM products WHERE id = ?"
  ).bind(id).first();
  if (!product) return null;
  const { results: locations } = await env.DB.prepare(
    "SELECT code, name FROM locations WHERE is_active = 1 ORDER BY sort_order, name"
  ).all();
  const visible = user.role === "admin"
    ? locations
    : locations.filter((location) => location.code === String(user.locationCode || "").toUpperCase());
  const { results: totals } = await env.DB.prepare(
    "SELECT location_code, quantity FROM product_stock WHERE product_id = ?"
  ).bind(id).all();
  const { results: quantities } = await env.DB.prepare(
    "SELECT location_code, color, quantity FROM product_color_stock WHERE product_id = ?"
  ).bind(id).all();
  const stock = visible.map((location) => {
    const total = Number(totals.find((row) => row.location_code === location.code)?.quantity || 0);
    const colors = Object.fromEntries(quantities.filter((row) => row.location_code === location.code).map((row) => [row.color, row.quantity]));
    return { ...location, total, colors, unassigned: total - Object.values(colors).reduce((sum, quantity) => sum + quantity, 0) };
  });
  return { product, colors: JSON.parse(product.colors || "[]"), images: JSON.parse(product.color_images || "{}"), locations: stock };
}

export async function onRequestGet({ env, params, data }) {
  try {
    const state = await readState(env, params.id, data.adminUser);
    return state ? Response.json({ ok: true, ...state }) : Response.json({ ok: false, message: "Produk tidak ditemukan." }, { status: 404 });
  } catch (error) {
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }
}

export async function onRequestPut({ env, params, data, request }) {
  try {
    const user = data.adminUser;
    const state = await readState(env, params.id, user);
    if (!state) return Response.json({ ok: false, message: "Produk tidak ditemukan." }, { status: 404 });
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name || name.includes(",")) return Response.json({ ok: false, message: "Nama warna wajib diisi tanpa koma." }, { status: 400 });
    const existing = state.colors.find((color) => color.toLowerCase() === name.toLowerCase());
    const color = existing || name;
    if (!state.locations.length) return Response.json({ ok: false, message: "Lokasi akun tidak tersedia." }, { status: 403 });
    const expected = body.expected || {};
    const changes = [];
    const statements = [];
    for (const location of state.locations) {
      const quantity = Number(body.quantities?.[location.code]);
      const oldQuantity = Number(location.colors[color] || 0);
      if (!Number.isSafeInteger(quantity) || quantity < 0 || !Number.isSafeInteger(expected[location.code])) {
        return Response.json({ ok: false, message: "Isi jumlah stok dengan bilangan bulat 0 atau lebih." }, { status: 400 });
      }
      const allocated = Math.max(0, quantity - oldQuantity);
      const newTotal = location.total + Math.max(0, allocated - location.unassigned) - Math.max(0, oldQuantity - quantity);
      if (location.unassigned < 0 || newTotal < 0) return Response.json({ ok: false, message: "Data stok perlu diperiksa." }, { status: 409 });
      statements.push(env.DB.prepare(`INSERT INTO stock_edit_guard(valid) VALUES (CASE WHEN
        COALESCE((SELECT quantity FROM product_stock WHERE product_id = ? AND location_code = ?), 0) = ?
        AND COALESCE((SELECT quantity FROM product_color_stock WHERE product_id = ? AND location_code = ? AND color = ?), 0) = ?
        AND COALESCE((SELECT SUM(quantity) FROM product_color_stock WHERE product_id = ? AND location_code = ?), 0) = ?
        THEN 1 ELSE 0 END)`).bind(params.id, location.code, location.total, params.id, location.code, color, expected[location.code], params.id, location.code, location.total - location.unassigned));
      statements.push(env.DB.prepare(`INSERT INTO product_color_stock(product_id, location_code, color, quantity) VALUES (?, ?, ?, ?)
        ON CONFLICT(product_id, location_code, color) DO UPDATE SET quantity = excluded.quantity`).bind(params.id, location.code, color, quantity));
      statements.push(env.DB.prepare(`INSERT INTO product_stock(id, product_id, location_code, quantity, updated_by_user_id, updated_by_username)
        VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(product_id, location_code) DO UPDATE SET quantity = excluded.quantity,
        updated_by_user_id = excluded.updated_by_user_id, updated_by_username = excluded.updated_by_username, updated_at = CURRENT_TIMESTAMP`)
        .bind("stock-" + crypto.randomUUID(), params.id, location.code, newTotal, user.id, user.username));
      changes.push({ location: location.code, before: oldQuantity, after: quantity });
    }
    const colors = existing ? state.colors : [...state.colors, color];
    const images = { ...state.images };
    if (body.image) images[color] = String(body.image);
    statements.unshift(env.DB.prepare(`INSERT INTO stock_edit_guard(valid) VALUES
      (CASE WHEN EXISTS(SELECT 1 FROM products WHERE id = ? AND COALESCE(colors, '[]') = ? AND COALESCE(color_images, '{}') = ?) THEN 1 ELSE 0 END)`)
      .bind(params.id, state.product.colors || "[]", state.product.color_images || "{}"));
    statements.push(env.DB.prepare("UPDATE products SET colors = ?, color_images = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(JSON.stringify(colors), JSON.stringify(images), params.id));
    statements.push(env.DB.prepare("DELETE FROM stock_edit_guard"));
    await env.DB.batch(statements);
    try {
      await writeAdminLog(env, user, { action: "stock.color_update", targetType: "product", targetId: params.id,
        targetLabel: state.product.brand + " " + state.product.model, metadata: { color, changes } });
    } catch (error) { console.error(error); }
    return Response.json({ ok: true, ...(await readState(env, params.id, user)) });
  } catch (error) {
    return Response.json({ ok: false, message: "Gagal menyimpan. Muat ulang data dan coba lagi.", error: error.message }, { status: 409 });
  }
}
