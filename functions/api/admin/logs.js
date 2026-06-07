function parseJsonField(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapLogRow(row) {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorUsername: row.actor_username,
    actorRole: row.actor_role,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    targetLabel: row.target_label,
    metadata: parseJsonField(row.metadata, {}),
    createdAt: row.created_at,
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
        actor_id,
        actor_username,
        actor_role,
        action,
        target_type,
        target_id,
        target_label,
        metadata,
        created_at
      FROM admin_logs
      ORDER BY created_at DESC
      LIMIT 100
      `,
    ).all();

    return Response.json({
      ok: true,
      logs: results.map(mapLogRow),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil audit log.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}