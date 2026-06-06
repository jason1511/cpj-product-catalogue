INSERT OR REPLACE INTO products (
  id,
  brand,
  model,
  type,
  features,
  price,
  image_url,
  description,
  specs,
  colors,
  source_page,
  is_featured,
  is_active
) VALUES (
  'test-product-1',
  'Pacific',
  'Test Product',
  'motor-listrik',
  '[]',
  1000000,
  NULL,
  'Produk test dari D1.',
  '{"battery":"48V","motor":"500W","range":"-","speed":"-","loadCapacity":"-","wheelSize":"-","brake":"-"}',
  '["Merah","Hitam"]',
  1,
  1,
  1
);