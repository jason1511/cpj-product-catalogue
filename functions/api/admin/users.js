import { writeAdminLog } from "../../utils/audit";

const locationLabels = {
  SBY: "Surabaya",
  LBK: "Lombok",
  PBL: "Probolinggo",
  LMJ: "Lumajang",
};

async function hashPassword(password, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${secret}`);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createUserId(username) {
  return `user-${String(username || "")
    .toLowerCase()
    .trim()
    .replaceAll("&", "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function normalizeLocationCode(value) {
  return String(value || "").trim().toUpperCase();
}

function getLocationName(locationCode) {
  if (!locationCode) return "";

  return locationLabels[locationCode] || locationCode;
}

function mapUserRow(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    locationCode: row.location_code || "",
    locationName: getLocationName(row.location_code),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateRoleAndLocation(role, locationCode) {
  if (!["admin", "staff"].includes(role)) {
    return "Role harus admin atau staff.";
  }

  if (role === "staff" && !locationCode) {
    return "Lokasi wajib dipilih untuk user staff.";
  }

  if (role === "staff" && !locationLabels[locationCode]) {
    return "Lokasi staff tidak valid.";
  }

  return "";
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
        username,
        role,
        location_code,
        is_active,
        created_at,
        updated_at
      FROM admin_users
      ORDER BY role ASC, location_code ASC, username ASC
      `,
    ).all();

    return Response.json({
      ok: true,
      users: results.map(mapUserRow),
      locations: Object.entries(locationLabels).map(([code, name]) => ({
        code,
        name,
      })),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil data user admin.",
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

    if (!env.ADMIN_SESSION_SECRET) {
      return Response.json(
        {
          ok: false,
          message: "ADMIN_SESSION_SECRET belum diset.",
        },
        { status: 500 },
      );
    }

    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const role = String(body.role || "staff").trim().toLowerCase();
    const requestedLocationCode = normalizeLocationCode(body.locationCode);
    const locationCode = role === "admin" ? null : requestedLocationCode;

    if (!username) {
      return Response.json(
        {
          ok: false,
          message: "Username wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return Response.json(
        {
          ok: false,
          message: "Password minimal 6 karakter.",
        },
        { status: 400 },
      );
    }

    const validationMessage = validateRoleAndLocation(role, locationCode);

    if (validationMessage) {
      return Response.json(
        {
          ok: false,
          message: validationMessage,
        },
        { status: 400 },
      );
    }

    const existingUser = await env.DB.prepare(
      `
      SELECT id
      FROM admin_users
      WHERE username = ?
      LIMIT 1
      `,
    )
      .bind(username)
      .first();

    if (existingUser) {
      return Response.json(
        {
          ok: false,
          message: "Username sudah digunakan.",
        },
        { status: 409 },
      );
    }

    const id = createUserId(username);
    const passwordHash = await hashPassword(password, env.ADMIN_SESSION_SECRET);

    await env.DB.prepare(
      `
      INSERT INTO admin_users (
        id,
        username,
        password_hash,
        role,
        location_code,
        is_active
      ) VALUES (?, ?, ?, ?, ?, 1)
      `,
    )
      .bind(id, username, passwordHash, role, locationCode)
      .run();

    await writeAdminLog(env, context.data?.adminUser, {
      action: "user.create",
      targetType: "admin_user",
      targetId: id,
      targetLabel: username,
      metadata: {
        role,
        locationCode,
        locationName: getLocationName(locationCode),
      },
    });

    return Response.json({
      ok: true,
      message: "User admin berhasil ditambahkan.",
      user: {
        id,
        username,
        role,
        locationCode: locationCode || "",
        locationName: getLocationName(locationCode),
        isActive: true,
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal menambahkan user admin.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}