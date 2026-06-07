async function hashPassword(password, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${secret}`);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
    const password = String(body.password || "");

    if (!password || password.length < 6) {
      return Response.json(
        {
          ok: false,
          message: "Password minimal 6 karakter.",
        },
        { status: 400 },
      );
    }

    const existingUser = await env.DB.prepare(
      `
      SELECT id, username
      FROM admin_users
      WHERE id = ?
      LIMIT 1
      `,
    )
      .bind(id)
      .first();

    if (!existingUser) {
      return Response.json(
        {
          ok: false,
          message: "User tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const passwordHash = await hashPassword(password, env.ADMIN_SESSION_SECRET);

    await env.DB.prepare(
      `
      UPDATE admin_users
      SET
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
      .bind(passwordHash, id)
      .run();

    return Response.json({
      ok: true,
      message: "Password user berhasil diperbarui.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal memperbarui password user.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}