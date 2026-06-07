import { writeAdminLog } from "../../../utils/audit";

function parseJsonField(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatArray(value) {
  if (!Array.isArray(value)) return "";

  return value.join(", ");
}

function addChange(changes, field, label, before, after) {
  const normalizedBefore = before ?? "";
  const normalizedAfter = after ?? "";

  if (String(normalizedBefore) === String(normalizedAfter)) return;

  changes.push({
    field,
    label,
    before: normalizedBefore,
    after: normalizedAfter,
  });
}

function buildProductChanges(beforeRow, afterProduct) {
  const changes = [];

  const beforeFeatures = parseJsonField(beforeRow.features, []);
  const beforeColors = parseJsonField(beforeRow.colors, []);
  const beforeSpecs = parseJsonField(beforeRow.specs, {});
  const beforeColorImages = parseJsonField(beforeRow.color_images, {});

  const afterFeatures = parseJsonField(afterProduct.features, []);
  const afterColors = parseJsonField(afterProduct.colors, []);
  const afterSpecs = parseJsonField(afterProduct.specs, {});
  const afterColorImages = parseJsonField(afterProduct.color_images, {});

  addChange(changes, "brand", "Brand", beforeRow.brand, afterProduct.brand);
  addChange(changes, "model", "Model", beforeRow.model, afterProduct.model);
  addChange(changes, "type", "Penggerak", beforeRow.type, afterProduct.type);
  addChange(changes, "price", "Harga", beforeRow.price, afterProduct.price);

  addChange(
    changes,
    "image",
    "Gambar Utama",
    beforeRow.image_url,
    afterProduct.image_url,
  );

  addChange(
    changes,
    "description",
    "Deskripsi",
    beforeRow.description,
    afterProduct.description,
  );

  addChange(
    changes,
    "features",
    "Fitur",
    formatArray(beforeFeatures),
    formatArray(afterFeatures),
  );

  addChange(
    changes,
    "colors",
    "Warna",
    formatArray(beforeColors),
    formatArray(afterColors),
  );

  addChange(
    changes,
    "battery",
    "Baterai",
    beforeSpecs.battery,
    afterSpecs.battery,
  );

  addChange(changes, "motor", "Motor", beforeSpecs.motor, afterSpecs.motor);

  addChange(
    changes,
    "range",
    "Jarak Tempuh",
    beforeSpecs.range,
    afterSpecs.range,
  );

  addChange(
    changes,
    "speed",
    "Kecepatan",
    beforeSpecs.speed,
    afterSpecs.speed,
  );

  addChange(
    changes,
    "loadCapacity",
    "Kapasitas Beban",
    beforeSpecs.loadCapacity,
    afterSpecs.loadCapacity,
  );

  addChange(
    changes,
    "wheelSize",
    "Ukuran Roda",
    beforeSpecs.wheelSize,
    afterSpecs.wheelSize,
  );

  addChange(changes, "brake", "Rem", beforeSpecs.brake, afterSpecs.brake);

  addChange(
    changes,
    "isFeatured",
    "Produk Pilihan",
    Boolean(beforeRow.is_featured) ? "Ya" : "Tidak",
    Boolean(afterProduct.is_featured) ? "Ya" : "Tidak",
  );

  addChange(
    changes,
    "isActive",
    "Status Aktif",
    Boolean(beforeRow.is_active) ? "Aktif" : "Nonaktif",
    Boolean(afterProduct.is_active) ? "Aktif" : "Nonaktif",
  );

  const allColorImageKeys = [
    ...new Set([
      ...Object.keys(beforeColorImages),
      ...Object.keys(afterColorImages),
    ]),
  ];

  allColorImageKeys.forEach((color) => {
    addChange(
      changes,
      `colorImage.${color}`,
      `Gambar Warna ${color}`,
      beforeColorImages[color] || "",
      afterColorImages[color] || "",
    );
  });

  return changes;
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
    is_featured: body.isFeatured ? 1 : 0,
    is_active: body.isActive ? 1 : 0,
  };
}

function validateProductPayload(product) {
  if (!product.brand) return "Brand wajib diisi.";
  if (!product.model) return "Model wajib diisi.";
  if (!product.type) return "Penggerak produk wajib diisi.";

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
        color_images,
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
        is_active
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
        color_images = ?,
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
        product.color_images,
        product.is_featured,
        product.is_active,
        id,
      )
      .run();

    const changes = buildProductChanges(existingProduct, product);

    await writeAdminLog(env, context.data?.adminUser, {
      action: "product.update",
      targetType: "product",
      targetId: id,
      targetLabel: `${product.brand} ${product.model}`,
      metadata: {
        changes,
      },
    });

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

export async function onRequestPatch(context) {
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

    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return Response.json(
        {
          ok: false,
          message: "Status aktif harus berupa boolean.",
        },
        { status: 400 },
      );
    }

    const existingProduct = await env.DB.prepare(
      `
      SELECT id, brand, model
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

    await env.DB.prepare(
      `
      UPDATE products
      SET
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
      .bind(body.isActive ? 1 : 0, id)
      .run();

    await writeAdminLog(env, context.data?.adminUser, {
      action: body.isActive ? "product.activate" : "product.deactivate",
      targetType: "product",
      targetId: id,
      targetLabel: `${existingProduct.brand} ${existingProduct.model}`,
      metadata: {
        isActive: body.isActive,
      },
    });

    return Response.json({
      ok: true,
      message: body.isActive
        ? "Produk berhasil diaktifkan."
        : "Produk berhasil dinonaktifkan.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengubah status produk.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}