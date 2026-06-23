CREATE TABLE IF NOT EXISTS locations (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO locations (code, name, description, sort_order)
VALUES
  ('SBY', 'Surabaya', 'Kantor pusat dan area gudang/showroom Surabaya', 1),
  ('LBK', 'Lombok', 'Area layanan Lombok', 2),
  ('PBL', 'Probolinggo', 'Area layanan Probolinggo', 3),
  ('LMJ', 'Lumajang', 'Area layanan Lumajang', 4);

ALTER TABLE admin_users ADD COLUMN location_code TEXT;

CREATE TABLE IF NOT EXISTS product_stock (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  location_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 1,
  updated_by_user_id TEXT,
  updated_by_username TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, location_code)
);

CREATE INDEX IF NOT EXISTS idx_product_stock_product_id
ON product_stock (product_id);

CREATE INDEX IF NOT EXISTS idx_product_stock_location_code
ON product_stock (location_code);