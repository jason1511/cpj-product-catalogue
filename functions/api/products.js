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
          hint: "Check wrangler.toml or run wrangler pages dev dist --d1 DB=<>.",
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
      WHERE p.is_active = 1
      ORDER BY p.brand ASC, p.model ASC
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
        message: "Gagal mengambil data produk.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}