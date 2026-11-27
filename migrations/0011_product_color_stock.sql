CREATE TABLE IF NOT EXISTS product_color_stock (
  product_id TEXT NOT NULL,
  location_code TEXT NOT NULL,
  color TEXT NOT NULL COLLATE NOCASE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (product_id, location_code, color)
);
CREATE TABLE IF NOT EXISTS stock_edit_guard (
  valid INTEGER NOT NULL CHECK (valid = 1)
);
CREATE TRIGGER IF NOT EXISTS product_stock_preserve_allocations
BEFORE UPDATE OF quantity ON product_stock
WHEN NEW.quantity < (SELECT COALESCE(SUM(quantity), 0) FROM product_color_stock WHERE product_id = NEW.product_id AND location_code = NEW.location_code)
BEGIN
  SELECT RAISE(ABORT, 'Total stock cannot be less than assigned colour stock');
END;
