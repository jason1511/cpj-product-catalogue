import { writeAdminLog } from "../../utils/audit";

function parseJsonField(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseTextList(value) {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
      body.sourcePage === "" ||
      body.sourcePage === null ||
      body.sourcePage === undefined
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
  const totalStock = Number(row.total_stock || 0);

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

    totalStock,
    isAvailable: totalStock > 0,
    availabilityLabel: totalStock > 0 ? "Tersedia" : "Habis",
    availableLocations: parseTextList(row.available_locations),
    availableLocationCodes: parseTextList(row.available_location_codes),
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
        p.id,
        p.brand,
        p.model,
        p.type,
        p.features,
        p.price,
        p.image_url,
        p.description,
        p.specs,
        p.colors,
        p.color_images,
        p.source_page,
        p.is_featured,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(stock.total_stock, 0) AS total_stock,
        COALESCE(stock.available_locations, '') AS available_locations,
        COALESCE(stock.available_location_codes, '') AS available_location_codes
      FROM products p
      LEFT JOIN (
        SELECT
          ps.product_id,
          SUM(ps.quantity) AS total_stock,
          GROUP_CONCAT(l.name, ', ') AS available_locations,
          GROUP_CONCAT(ps.location_code, ', ') AS available_location_codes
        FROM product_stock ps
        LEFT JOIN locations l
          ON l.code = ps.location_code
        WHERE ps.quantity > 0
        GROUP BY ps.product_id
      ) stock
        ON stock.product_id = p.id
      ORDER BY p.updated_at DESC, p.brand ASC, p.model ASC
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

    await writeAdminLog(env, context.data?.adminUser, {
      action: "product.create",
      targetType: "product",
      targetId: product.id,
      targetLabel: `${product.brand} ${product.model}`,
      metadata: {
        brand: product.brand,
        model: product.model,
        type: product.type,
        isActive: Boolean(product.is_active),
        isFeatured: Boolean(product.is_featured),
      },
    });

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