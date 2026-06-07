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

function mapUserRow(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
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
        username,
        role,
        is_active,
        created_at,
        updated_at
      FROM admin_users
      ORDER BY role ASC, username ASC
      `,
    ).all();

    return Response.json({
      ok: true,
      users: results.map(mapUserRow),
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
    const role = String(body.role || "staff").trim();

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

    if (!["admin", "staff"].includes(role)) {
      return Response.json(
        {
          ok: false,
          message: "Role harus admin atau staff.",
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
        is_active
      ) VALUES (?, ?, ?, ?, 1)
      `,
    )
      .bind(id, username, passwordHash, role)
      .run();

    return Response.json({
      ok: true,
      message: "User admin berhasil ditambahkan.",
      user: {
        id,
        username,
        role,
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