import { writeAdminLog } from "../../../utils/audit";

const locationLabels = {
  SBY: "Surabaya",
  LBK: "Lombok",
  PBL: "Probolinggo",
  LMJ: "Lumajang",
};

function getLocationName(locationCode) {
  if (!locationCode) return "";

  return locationLabels[locationCode] || locationCode;
}

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
      SELECT
        id,
        username,
        role,
        location_code,
        is_active
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

    await writeAdminLog(env, data.adminUser, {
      action: body.isActive ? "user.activate" : "user.deactivate",
      targetType: "admin_user",
      targetId: id,
      targetLabel: existingUser.username,
      metadata: {
        role: existingUser.role,
        locationCode: existingUser.location_code || "",
        locationName: getLocationName(existingUser.location_code),
        previousIsActive: Boolean(existingUser.is_active),
        isActive: body.isActive,
      },
    });

    return Response.json({
      ok: true,
      message: body.isActive
        ? "User berhasil diaktifkan."
        : "User berhasil dinonaktifkan.",
      user: {
        id: existingUser.id,
        username: existingUser.username,
        role: existingUser.role,
        locationCode: existingUser.location_code || "",
        locationName: getLocationName(existingUser.location_code),
        isActive: body.isActive,
      },
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
function normalizeLocationCode(value) {
  return String(value || "").trim().toUpperCase();
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

export async function onRequestPut(context) {
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

    const existingUser = await env.DB.prepare(
      `
      SELECT
        id,
        username,
        role,
        location_code,
        is_active
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

    const nextRole = String(body.role || existingUser.role)
      .trim()
      .toLowerCase();

    const requestedLocationCode = normalizeLocationCode(body.locationCode);
    const nextLocationCode =
      nextRole === "admin" ? null : requestedLocationCode;

    if (!["admin", "staff"].includes(nextRole)) {
      return Response.json(
        {
          ok: false,
          message: "Role harus admin atau staff.",
        },
        { status: 400 },
      );
    }

    if (nextRole === "staff" && !nextLocationCode) {
      return Response.json(
        {
          ok: false,
          message: "Lokasi wajib dipilih untuk user staff.",
        },
        { status: 400 },
      );
    }

    if (nextRole === "staff" && !locationLabels[nextLocationCode]) {
      return Response.json(
        {
          ok: false,
          message: "Lokasi staff tidak valid.",
        },
        { status: 400 },
      );
    }

    if (data.adminUser?.id === id && nextRole !== "admin") {
      return Response.json(
        {
          ok: false,
          message:
            "Anda tidak bisa mengubah role akun yang sedang digunakan menjadi staff.",
        },
        { status: 400 },
      );
    }

    await env.DB.prepare(
      `
      UPDATE admin_users
      SET
        role = ?,
        location_code = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
      .bind(nextRole, nextLocationCode, id)
      .run();

    const changes = [];

    addChange(changes, "role", "Role", existingUser.role, nextRole);

    addChange(
      changes,
      "locationCode",
      "Lokasi",
      existingUser.role === "admin"
        ? "Semua lokasi"
        : getLocationName(existingUser.location_code),
      nextRole === "admin" ? "Semua lokasi" : getLocationName(nextLocationCode),
    );

    await writeAdminLog(env, data.adminUser, {
      action: "user.update",
      targetType: "admin_user",
      targetId: id,
      targetLabel: existingUser.username,
      metadata: {
        changes,
        previousRole: existingUser.role,
        role: nextRole,
        previousLocationCode: existingUser.location_code || "",
        locationCode: nextLocationCode || "",
        previousLocationName: getLocationName(existingUser.location_code),
        locationName: getLocationName(nextLocationCode),
      },
    });

    return Response.json({
      ok: true,
      message: "User berhasil diperbarui.",
      user: {
        id: existingUser.id,
        username: existingUser.username,
        role: nextRole,
        locationCode: nextLocationCode || "",
        locationName: getLocationName(nextLocationCode),
        isActive: Boolean(existingUser.is_active),
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal memperbarui user.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}