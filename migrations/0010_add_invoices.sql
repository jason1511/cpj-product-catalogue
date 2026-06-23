CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  location_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  invoice_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT DEFAULT '',
  subtotal REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  created_by_user_id TEXT,
  created_by_username TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  product_id TEXT,
  product_label TEXT NOT NULL,
  color TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number
ON invoices (invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoices_location_code
ON invoices (location_code);

CREATE INDEX IF NOT EXISTS idx_invoices_status
ON invoices (status);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date
ON invoices (invoice_date);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id
ON invoice_items (invoice_id);