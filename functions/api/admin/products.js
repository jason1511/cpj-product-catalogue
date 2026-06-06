function parseJsonField(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
function normalizeTextArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProductPayload(body) {
  return {
    id: String(body.id || "").trim(),
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
    color_images: JSON.stringify(body.colorImages || {}),
    specs: JSON.stringify({
      battery: String(body.specs?.battery || "").trim(),
      motor: String(body.specs?.motor || "").trim(),
      range: String(body.specs?.range || "").trim(),
      speed: String(body.specs?.speed || "").trim(),
      loadCapacity: String(body.specs?.loadCapacity || "").trim(),
      wheelSize: String(body.specs?.wheelSize || "").trim(),
      brake: String(body.specs?.brake || "").trim(),
    }),
    source_page:
      body.sourcePage === "" || body.sourcePage === null || body.sourcePage === undefined
        ? null
        : Number(body.sourcePage),
    is_featured: body.isFeatured ? 1 : 0,
    is_active: body.isActive ? 1 : 0,
  };
}

function validateProductPayload(product) {
  if (!product.id) return "ID produk wajib diisi.";
  if (!product.brand) return "Brand wajib diisi.";
  if (!product.model) return "Model wajib diisi.";
  if (!product.type) return "Jenis produk wajib diisi.";

  if (product.price !== null && Number.isNaN(product.price)) {
    return "Harga harus berupa angka.";
  }

  return "";
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
    colorImages: parseJsonField(row.color_images, {}),
    sourcePage: row.source_page,
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function onRequestGet(context) {
  try {
    const { env } = context;

    if (!env.DB) {
      return Response.json(
        {
          ok: false,
          message: "D1 binding DB is not available.",
        },
        { status: 500 },
      );
    }

    const { results } = await env.DB.prepare(
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
        color_images,
        source_page,
        is_featured,
        is_active,
        created_at,
        updated_at
      FROM products
      ORDER BY updated_at DESC, brand ASC, model ASC
      `,
    ).all();

    return Response.json({
      ok: true,
      products: results.map(mapProductRow),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil data produk admin.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
export async function onRequestPost(context) {
  try {
    const { env, request } = context;

    if (!env.DB) {
      return Response.json(
        {
          ok: false,
          message: "D1 binding DB is not available.",
        },
        { status: 500 },
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

    const existingProduct = await env.DB.prepare(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
    )
      .bind(product.id)
      .first();

    if (existingProduct) {
      return Response.json(
        {
          ok: false,
          message: "ID produk sudah digunakan.",
        },
        { status: 409 },
      );
    }

    await env.DB.prepare(
      `
      INSERT INTO products (
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
color_images,
source_page,
is_featured,
is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(
        product.id,
        product.brand,
        product.model,
        product.type,
        product.features,
        product.price,
        product.image_url,
        product.description,
        product.specs,
        product.colors,
        product.color_images,
        product.source_page,
        product.is_featured,
        product.is_active,
      )
      .run();

    return Response.json({
      ok: true,
      message: "Produk berhasil ditambahkan.",
      id: product.id,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal menambahkan produk.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}