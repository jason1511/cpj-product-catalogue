import { writeAdminLog } from "../../utils/audit";

const locationLabels = {
  SBY: "Surabaya",
  LBK: "Lombok",
  PBL: "Probolinggo",
  LMJ: "Lumajang",
};

const validStatuses = ["draft", "issued", "paid", "cancelled"];

function normalizeLocationCode(value) {
  return String(value || "").trim().toUpperCase();
}

function getLocationName(locationCode) {
  if (!locationCode) return "";

  return locationLabels[locationCode] || locationCode;
}

function createInvoiceId(invoiceNumber) {
  return String(invoiceNumber || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createInvoiceItemId(invoiceId, index) {
  return `${invoiceId}-item-${String(index + 1).padStart(3, "0")}`;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDate(value) {
  const date = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  return getTodayDate();
}

function normalizeMoney(value) {
  if (value === "" || value === null || value === undefined) return 0;

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return 0;

  return Math.max(0, numberValue);
}

function normalizeQuantity(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 1;
  }

  return Math.floor(numberValue);
}

function normalizeInvoiceItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const quantity = normalizeQuantity(item.quantity);
      const unitPrice = normalizeMoney(item.unitPrice);
      const lineTotal = quantity * unitPrice;

      return {
        productId: String(item.productId || "").trim() || null,
        productLabel: String(item.productLabel || "").trim(),
        color: String(item.color || "").trim(),
        quantity,
        unitPrice,
        lineTotal,
      };
    })
    .filter((item) => item.productLabel);
}

function calculateInvoiceTotals(items, discount) {
  const subtotal = items.reduce(
    (total, item) => total + Number(item.lineTotal || 0),
    0,
  );

  const safeDiscount = Math.min(normalizeMoney(discount), subtotal);
  const total = Math.max(0, subtotal - safeDiscount);

  return {
    subtotal,
    discount: safeDiscount,
    total,
  };
}

function mapInvoiceRow(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    locationCode: row.location_code,
    locationName: getLocationName(row.location_code),
    customerName: row.customer_name,
    customerPhone: row.customer_phone || "",
    customerAddress: row.customer_address || "",
    invoiceDate: row.invoice_date,
    status: row.status,
    notes: row.notes || "",
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    itemCount: Number(row.item_count || 0),
    createdByUserId: row.created_by_user_id || "",
    createdByUsername: row.created_by_username || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function resolveInvoiceLocation(user, requestedLocationCode) {
  if (user.role === "admin") {
    const locationCode = normalizeLocationCode(requestedLocationCode);

    if (!locationCode) {
      return {
        ok: false,
        message: "Lokasi invoice wajib dipilih.",
      };
    }

    if (!locationLabels[locationCode]) {
      return {
        ok: false,
        message: "Lokasi invoice tidak valid.",
      };
    }

    return {
      ok: true,
      locationCode,
    };
  }

  const staffLocationCode = normalizeLocationCode(user.locationCode);

  if (!staffLocationCode || !locationLabels[staffLocationCode]) {
    return {
      ok: false,
      message: "Akun staff belum memiliki lokasi yang valid.",
    };
  }

  return {
    ok: true,
    locationCode: staffLocationCode,
  };
}

async function generateInvoiceNumber(env, locationCode, invoiceDate) {
  const datePart = String(invoiceDate).replaceAll("-", "");
  const prefix = `INV-${locationCode}-${datePart}`;

  const latest = await env.DB.prepare(
    `
    SELECT invoice_number
    FROM invoices
    WHERE invoice_number LIKE ?
    ORDER BY invoice_number DESC
    LIMIT 1
    `,
  )
    .bind(`${prefix}-%`)
    .first();

  const latestNumber = latest?.invoice_number
    ? Number(String(latest.invoice_number).split("-").at(-1))
    : 0;

  const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

export async function onRequestGet(context) {
  try {
    const { env, data } = context;
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

    const baseQuery = `
      SELECT
        i.id,
        i.invoice_number,
        i.location_code,
        i.customer_name,
        i.customer_phone,
        i.customer_address,
        i.invoice_date,
        i.status,
        i.notes,
        i.subtotal,
        i.discount,
        i.total,
        i.created_by_user_id,
        i.created_by_username,
        i.created_at,
        i.updated_at,
        COUNT(ii.id) AS item_count
      FROM invoices i
      LEFT JOIN invoice_items ii
        ON ii.invoice_id = i.id
    `;

    const orderClause = `
      GROUP BY i.id
      ORDER BY i.invoice_date DESC, i.created_at DESC
      LIMIT 100
    `;

    const statement =
      user.role === "admin"
        ? env.DB.prepare(`${baseQuery} ${orderClause}`)
        : env.DB.prepare(
            `
            ${baseQuery}
            WHERE i.location_code = ?
            ${orderClause}
            `,
          ).bind(normalizeLocationCode(user.locationCode));

    const { results } = await statement.all();

    return Response.json({
      ok: true,
      invoices: results.map(mapInvoiceRow),
      locations: Object.entries(locationLabels).map(([code, name]) => ({
        code,
        name,
      })),
      userScope: {
        role: user.role,
        locationCode: user.locationCode || "",
        locationName: getLocationName(user.locationCode),
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil data invoice.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function onRequestPost(context) {
  try {
    const { env, request, data } = context;
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

    const body = await request.json();

    const locationResult = resolveInvoiceLocation(user, body.locationCode);

    if (!locationResult.ok) {
      return Response.json(
        {
          ok: false,
          message: locationResult.message,
        },
        { status: 400 },
      );
    }

    const locationCode = locationResult.locationCode;
    const invoiceDate = normalizeDate(body.invoiceDate);
    const customerName = String(body.customerName || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const customerAddress = String(body.customerAddress || "").trim();
    const notes = String(body.notes || "").trim();
    const status = String(body.status || "draft").trim().toLowerCase();

    if (!customerName) {
      return Response.json(
        {
          ok: false,
          message: "Nama customer wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!validStatuses.includes(status)) {
      return Response.json(
        {
          ok: false,
          message: "Status invoice tidak valid.",
        },
        { status: 400 },
      );
    }

    const items = normalizeInvoiceItems(body.items);

    if (items.length === 0) {
      return Response.json(
        {
          ok: false,
          message: "Minimal satu item invoice wajib diisi.",
        },
        { status: 400 },
      );
    }

    const totals = calculateInvoiceTotals(items, body.discount);
    const invoiceNumber = await generateInvoiceNumber(
      env,
      locationCode,
      invoiceDate,
    );
    const invoiceId = createInvoiceId(invoiceNumber);

    await env.DB.prepare(
      `
      INSERT INTO invoices (
        id,
        invoice_number,
        location_code,
        customer_name,
        customer_phone,
        customer_address,
        invoice_date,
        status,
        notes,
        subtotal,
        discount,
        total,
        created_by_user_id,
        created_by_username,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
    )
      .bind(
        invoiceId,
        invoiceNumber,
        locationCode,
        customerName,
        customerPhone,
        customerAddress,
        invoiceDate,
        status,
        notes,
        totals.subtotal,
        totals.discount,
        totals.total,
        user.id,
        user.username,
      )
      .run();

    for (const [index, item] of items.entries()) {
      await env.DB.prepare(
        `
        INSERT INTO invoice_items (
          id,
          invoice_id,
          product_id,
          product_label,
          color,
          quantity,
          unit_price,
          line_total,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
      )
        .bind(
          createInvoiceItemId(invoiceId, index),
          invoiceId,
          item.productId,
          item.productLabel,
          item.color,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
        )
        .run();
    }

    await writeAdminLog(env, user, {
      action: "invoice.create",
      targetType: "invoice",
      targetId: invoiceId,
      targetLabel: invoiceNumber,
      metadata: {
        invoiceNumber,
        locationCode,
        locationName: getLocationName(locationCode),
        customerName,
        status,
        itemCount: items.length,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
      },
    });

    return Response.json({
      ok: true,
      message: "Invoice berhasil dibuat.",
      invoice: {
        id: invoiceId,
        invoiceNumber,
        locationCode,
        locationName: getLocationName(locationCode),
        customerName,
        customerPhone,
        customerAddress,
        invoiceDate,
        status,
        notes,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        itemCount: items.length,
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal membuat invoice.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}