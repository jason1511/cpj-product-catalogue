function parseJsonField(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapProductRow(row) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    type: row.type,
    features: parseJsonField(row.features, []),
    price: row.price,
    image: row.image_url,
    description: row.description,
    specs: parseJsonField(row.specs, {}),
    colors: parseJsonField(row.colors, []),
    sourcePage: row.source_page,
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function normalizeTextArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProductPayload(body) {
  return {
    brand: String(body.brand || "").trim(),
    model: String(body.model || "").trim(),
    type: String(body.type || "").trim(),
    price:
      body.price === "" || body.price === null || body.price === undefined
        ? null
        : Number(body.price),
    image_url: body.image ? String(body.image).trim() : null,
    description: String(body.description || "").trim(),
    features: JSON.stringify(normalizeTextArray(body.features)),
    colors: JSON.stringify(normalizeTextArray(body.colors)),
    specs: JSON.stringify({
      battery: String(body.specs?.battery || "").trim(),
      motor: String(body.specs?.motor || "").trim(),
      range: String(body.specs?.range || "").trim(),
      speed: String(body.specs?.speed || "").trim(),
      loadCapacity: String(body.specs?.loadCapacity || "").trim(),
      wheelSize: String(body.specs?.wheelSize || "").trim(),
      brake: String(body.specs?.brake || "").trim(),
    }),
    is_featured: body.isFeatured ? 1 : 0,
    is_active: body.isActive ? 1 : 0,
  };
}

function validateProductPayload(product) {
  if (!product.brand) return "Brand wajib diisi.";
  if (!product.model) return "Model wajib diisi.";
  if (!product.type) return "Jenis produk wajib diisi.";

  if (product.price !== null && Number.isNaN(product.price)) {
    return "Harga harus berupa angka.";
  }

  return "";
}
export async function onRequestGet(context) {
  try {
    const { env, params } = context;
    const { id } = params;

    if (!env.DB) {
      return Response.json(
        {
          ok: false,
          message: "D1 binding DB is not available.",
        },
        { status: 500 },
      );
    }

    const product = await env.DB.prepare(
      `
      SELECT
        id,
        brand,
        model,
        type,
        features,
        price,
        image_url,
        description,
        specs,
        colors,
        source_page,
        is_featured,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
    )
      .bind(id)
      .first();

    if (!product) {
      return Response.json(
        {
          ok: false,
          message: "Produk tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      ok: true,
      product: mapProductRow(product),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil detail produk.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
export async function onRequestPut(context) {
  try {
    const { env, params, request } = context;
    const { id } = params;

    if (!env.DB) {
      return Response.json(
        {
          ok: false,
          message: "D1 binding DB is not available.",
        },
        { status: 500 },
      );
    }

    const existingProduct = await env.DB.prepare(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
    )
      .bind(id)
      .first();

    if (!existingProduct) {
      return Response.json(
        {
          ok: false,
          message: "Produk tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    const product = normalizeProductPayload(body);
    const validationMessage = validateProductPayload(product);

    if (validationMessage) {
      return Response.json(
        {
          ok: false,
          message: validationMessage,
        },
        { status: 400 },
      );
    }

    await env.DB.prepare(
      `
      UPDATE products
      SET
        brand = ?,
        model = ?,
        type = ?,
        features = ?,
        price = ?,
        image_url = ?,
        description = ?,
        specs = ?,
        colors = ?,
        is_featured = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
      .bind(
        product.brand,
        product.model,
        product.type,
        product.features,
        product.price,
        product.image_url,
        product.description,
        product.specs,
        product.colors,
        product.is_featured,
        product.is_active,
        id,
      )
      .run();

    return Response.json({
      ok: true,
      message: "Produk berhasil diperbarui.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal memperbarui produk.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}