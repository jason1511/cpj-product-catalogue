CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_username TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_label TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_actor_id ON admin_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs (action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type ON admin_logs (target_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs (created_at);