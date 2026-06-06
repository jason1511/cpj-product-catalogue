import { writeFileSync } from "node:fs";
import { products } from "../src/data/products.js";

function sqlString(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "NULL";
  }

  return Number(value);
}

function sqlJson(value, fallback) {
  return sqlString(JSON.stringify(value ?? fallback));
}

const rows = products
  .map((product) => {
    return `INSERT OR REPLACE INTO products (
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
  ${sqlString(product.id)},
  ${sqlString(product.brand)},
  ${sqlString(product.model)},
  ${sqlString(product.type)},
  ${sqlJson(product.features, [])},
  ${sqlNumber(product.price)},
  ${sqlString(product.image)},
  ${sqlString(product.description)},
  ${sqlJson(product.specs, {})},
  ${sqlJson(product.colors, [])},
  ${sqlNumber(product.sourcePage)},
  ${product.isFeatured ? 1 : 0},
  ${product.isActive ? 1 : 0}
);`;
  })
  .join("\n\n");

const output = `-- Seed products from src/data/products.js
-- Generated file. Do not edit manually unless needed.

${rows}
`;

writeFileSync("migrations/0003_seed_products.sql", output);

console.log(`Generated migrations/0003_seed_products.sql with ${products.length} products.`);