import { writeAdminLog } from "../../../../utils/audit";

const fallbackLocations = [
  { code: "SBY", name: "Surabaya" },
  { code: "LBK", name: "Lombok" },
  { code: "PBL", name: "Probolinggo" },
  { code: "LMJ", name: "Lumajang" },
];

function normalizeLocationCode(value) {
  return String(value || "").trim().toUpperCase();
}

function createStockId(productId, locationCode) {
  return `stock-${productId}-${locationCode}`.toLowerCase();
}

function getLocationName(locations, locationCode) {
  return (
    locations.find((location) => location.code === locationCode)?.name ||
    locationCode
  );
}

async function getLocations(env) {
  try {
    const { results } = await env.DB.prepare(
      `
      SELECT code, name
      FROM locations
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
      `,
    ).all();

    if (results.length > 0) {
      return results.map((location) => ({
        code: location.code,
        name: location.name,
      }));
    }

    return fallbackLocations;
  } catch {
    return fallbackLocations;
  }
}

function canEditLocation(user, locationCode) {
  if (user?.role === "admin") return true;

  return normalizeLocationCode(user?.locationCode) === locationCode;
}

function mapStockRows(locations, rows) {
  const rowMap = new Map(
    rows.map((row) => [
      normalizeLocationCode(row.location_code),
      Number(row.quantity || 0),
    ]),
  );

  const stockByLocation = {};

  locations.forEach((location) => {
    stockByLocation[location.code] = rowMap.get(location.code) || 0;
  });

  return stockByLocation;
}

function buildStockChanges(locations, beforeStock, afterStock, user) {
  const changes = [];

  locations.forEach((location) => {
    if (!canEditLocation(user, location.code)) return;

    const before = Number(beforeStock[location.code] || 0);
    const after = Number(afterStock[location.code] || 0);

    if (before === after) return;

    changes.push({
      field: `stock.${location.code}`,
      label: `Stok ${location.name}`,
      before,
      after,
    });
  });

  return changes;
}

async function getProduct(env, id) {
  return env.DB.prepare(
    `
    SELECT id, brand, model
    FROM products
    WHERE id = ?
    LIMIT 1
    `,
  )
    .bind(id)
    .first();
}

async function getStockRows(env, productId) {
  const { results } = await env.DB.prepare(
    `
    SELECT location_code, quantity
    FROM product_stock
    WHERE product_id = ?
    `,
  )
    .bind(productId)
    .all();

  return results;
}

export async function onRequestGet(context) {
  try {
    const { env, params, data } = context;
    const { id } = params;
    const user = data.adminUser;

    if (!env.DB) {
      return Response.json(
        {
          ok: false,
          message: "D1 binding DB is not available.",
        },
        { status: 500 },
      );
    }

    const product = await getProduct(env, id);

    if (!product) {
      return Response.json(
        {
          ok: false,
          message: "Produk tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const allLocations = await getLocations(env);
    const visibleLocations =
      user.role === "admin"
        ? allLocations
        : allLocations.filter(
            (location) =>
              location.code === normalizeLocationCode(user.locationCode),
          );

    const stockRows = await getStockRows(env, id);
    const stockByLocation = mapStockRows(visibleLocations, stockRows);

    const totalStock = Object.values(stockByLocation).reduce(
      (total, quantity) => total + Number(quantity || 0),
      0,
    );

    return Response.json({
      ok: true,
      product: {
        id: product.id,
        brand: product.brand,
        model: product.model,
      },
      locations: visibleLocations,
      stockByLocation,
      totalStock,
      userScope: {
        role: user.role,
        locationCode: user.locationCode || "",
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil stok produk.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function onRequestPut(context) {
  try {
    const { env, params, request, data } = context;
    const { id } = params;
    const user = data.adminUser;
    const body = await request.json();

    if (!env.DB) {
      return Response.json(
        {
          ok: false,
          message: "D1 binding DB is not available.",
        },
        { status: 500 },
      );
    }

    const product = await getProduct(env, id);

    if (!product) {
      return Response.json(
        {
          ok: false,
          message: "Produk tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const allLocations = await getLocations(env);
    const editableLocations =
      user.role === "admin"
        ? allLocations
        : allLocations.filter(
            (location) =>
              location.code === normalizeLocationCode(user.locationCode),
          );

    if (editableLocations.length === 0) {
      return Response.json(
        {
          ok: false,
          message: "User staff belum memiliki lokasi yang valid.",
        },
        { status: 403 },
      );
    }

    const beforeRows = await getStockRows(env, id);
    const beforeStock = mapStockRows(allLocations, beforeRows);

    const requestedStockByLocation = body.stockByLocation || {};
    const nextStock = {
      ...beforeStock,
    };

    editableLocations.forEach((location) => {
      const rawValue =
        requestedStockByLocation[location.code] ??
        requestedStockByLocation[location.code.toLowerCase()] ??
        0;

      const quantity = Number(rawValue);

      if (!Number.isFinite(quantity) || quantity < 0) {
        throw new Error(`Stok ${location.name} harus angka 0 atau lebih.`);
      }

      nextStock[location.code] = Math.floor(quantity);
    });

    const changes = buildStockChanges(
      editableLocations,
      beforeStock,
      nextStock,
      user,
    );

    if (changes.length === 0) {
      return Response.json({
        ok: true,
        message: "Tidak ada perubahan stok.",
        stockByLocation: nextStock,
      });
    }

    for (const location of editableLocations) {
      const quantity = nextStock[location.code];
      const stockId = createStockId(id, location.code);

      await env.DB.prepare(
        `
        INSERT INTO product_stock (
          id,
          product_id,
          location_code,
          quantity,
          updated_by_user_id,
          updated_by_username,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(product_id, location_code)
        DO UPDATE SET
          quantity = excluded.quantity,
          updated_by_user_id = excluded.updated_by_user_id,
          updated_by_username = excluded.updated_by_username,
          updated_at = CURRENT_TIMESTAMP
        `,
      )
        .bind(stockId, id, location.code, quantity, user.id, user.username)
        .run();
    }

    await writeAdminLog(env, user, {
      action: "stock.update",
      targetType: "product",
      targetId: id,
      targetLabel: `${product.brand} ${product.model}`.trim(),
      metadata: {
        productId: id,
        changes,
        updatedByLocationCode: user.locationCode || "",
        updatedByRole: user.role,
      },
    });

    return Response.json({
      ok: true,
      message: "Stok produk berhasil diperbarui.",
      stockByLocation: nextStock,
      changes,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal memperbarui stok produk.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}