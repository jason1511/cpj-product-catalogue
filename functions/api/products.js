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
      hint: "Check wrangler.toml or run wrangler pages dev dist --d1 DB=<>.",
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
      WHERE is_active = 1
      ORDER BY brand ASC, model ASC
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