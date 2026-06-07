export async function onRequestPatch(context) {
  try {
    const { env, params, request, data } = context;
    const { id } = params;
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

    if (typeof body.isActive !== "boolean") {
      return Response.json(
        {
          ok: false,
          message: "Status aktif harus berupa boolean.",
        },
        { status: 400 },
      );
    }

    const existingUser = await env.DB.prepare(
      `
      SELECT id, username, role
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

    if (data.adminUser?.id === id && body.isActive === false) {
      return Response.json(
        {
          ok: false,
          message: "Anda tidak bisa menonaktifkan akun yang sedang digunakan.",
        },
        { status: 400 },
      );
    }

    await env.DB.prepare(
      `
      UPDATE admin_users
      SET
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
      .bind(body.isActive ? 1 : 0, id)
      .run();

    return Response.json({
      ok: true,
      message: body.isActive
        ? "User berhasil diaktifkan."
        : "User berhasil dinonaktifkan.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengubah status user.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}