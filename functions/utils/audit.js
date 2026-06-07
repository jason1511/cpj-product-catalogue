export async function writeAdminLog(env, adminUser, log) {
  if (!env.DB) return;

  const id = crypto.randomUUID();

  await env.DB.prepare(
    `
    INSERT INTO admin_logs (
      id,
      actor_id,
      actor_username,
      actor_role,
      action,
      target_type,
      target_id,
      target_label,
      metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      adminUser?.id || null,
      adminUser?.username || null,
      adminUser?.role || null,
      log.action,
      log.targetType,
      log.targetId || null,
      log.targetLabel || null,
      JSON.stringify(log.metadata || {}),
    )
    .run();
}