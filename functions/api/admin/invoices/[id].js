import { writeAdminLog } from "../../../utils/audit";

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

function formatStatusLabel(status) {
  const labels = {
    draft: "Draft",
    issued: "Diterbitkan",
    paid: "Lunas",
    cancelled: "Dibatalkan",
  };

  return labels[status] || status;
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
    statusLabel: formatStatusLabel(row.status),
    notes: row.notes || "",
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    createdByUserId: row.created_by_user_id || "",
    createdByUsername: row.created_by_username || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInvoiceItemRow(row) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    productId: row.product_id || "",
    productLabel: row.product_label,
    color: row.color || "",
    quantity: Number(row.quantity || 0),
    unitPrice: Number(row.unit_price || 0),
    lineTotal: Number(row.line_total || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getInvoice(env, id) {
  return env.DB.prepare(
    `
    SELECT
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
    FROM invoices
    WHERE id = ?
    LIMIT 1
    `,
  )
    .bind(id)
    .first();
}

async function getInvoiceItems(env, invoiceId) {
  const { results } = await env.DB.prepare(
    `
    SELECT
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
    FROM invoice_items
    WHERE invoice_id = ?
    ORDER BY id ASC
    `,
  )
    .bind(invoiceId)
    .all();

  return results;
}

function canAccessInvoice(user, invoice) {
  if (user.role === "admin") return true;

  return normalizeLocationCode(user.locationCode) === invoice.location_code;
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

    const invoice = await getInvoice(env, id);

    if (!invoice) {
      return Response.json(
        {
          ok: false,
          message: "Invoice tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (!canAccessInvoice(user, invoice)) {
      return Response.json(
        {
          ok: false,
          message: "Anda tidak memiliki akses ke invoice lokasi ini.",
        },
        { status: 403 },
      );
    }

    const items = await getInvoiceItems(env, id);

    return Response.json({
      ok: true,
      invoice: mapInvoiceRow(invoice),
      items: items.map(mapInvoiceItemRow),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil detail invoice.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function onRequestPatch(context) {
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

    const invoice = await getInvoice(env, id);

    if (!invoice) {
      return Response.json(
        {
          ok: false,
          message: "Invoice tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (!canAccessInvoice(user, invoice)) {
      return Response.json(
        {
          ok: false,
          message: "Anda tidak memiliki akses ke invoice lokasi ini.",
        },
        { status: 403 },
      );
    }

    const nextStatus = String(body.status || "").trim().toLowerCase();

    if (!validStatuses.includes(nextStatus)) {
      return Response.json(
        {
          ok: false,
          message: "Status invoice tidak valid.",
        },
        { status: 400 },
      );
    }

    if (invoice.status === nextStatus) {
      return Response.json({
        ok: true,
        message: "Status invoice tidak berubah.",
        invoice: mapInvoiceRow(invoice),
      });
    }

    await env.DB.prepare(
      `
      UPDATE invoices
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
      .bind(nextStatus, id)
      .run();

    await writeAdminLog(env, user, {
      action: "invoice.status_update",
      targetType: "invoice",
      targetId: id,
      targetLabel: invoice.invoice_number,
      metadata: {
        invoiceNumber: invoice.invoice_number,
        locationCode: invoice.location_code,
        locationName: getLocationName(invoice.location_code),
        customerName: invoice.customer_name,
        previousStatus: invoice.status,
        previousStatusLabel: formatStatusLabel(invoice.status),
        status: nextStatus,
        statusLabel: formatStatusLabel(nextStatus),
      },
    });

    const updatedInvoice = await getInvoice(env, id);
    const items = await getInvoiceItems(env, id);

    return Response.json({
      ok: true,
      message: "Status invoice berhasil diperbarui.",
      invoice: mapInvoiceRow(updatedInvoice),
      items: items.map(mapInvoiceItemRow),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal memperbarui invoice.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}