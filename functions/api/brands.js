export async function onRequestGet({ env }) {
  try {
    const products = await env.DB.prepare(
      "SELECT DISTINCT TRIM(brand) AS name FROM products WHERE TRIM(COALESCE(brand, '')) <> ''",
    ).all();
    let saved = [];
    let logos = [];
    try {
      saved = (await env.DB.prepare("SELECT name FROM catalogue_brands").all()).results;
    } catch (error) {
      if (!String(error.message).includes("no such table")) throw error;
    }
    try {
      logos = (await env.DB.prepare("SELECT name, image_url FROM catalogue_brand_logos").all()).results;
    } catch (error) {
      if (!String(error.message).includes("no such table")) throw error;
    }
    const byName = new Map();
    for (const row of [...saved, ...products.results]) {
      const name = row.name.trim();
      if (!byName.has(name.toLowerCase())) byName.set(name.toLowerCase(), name);
    }
    const logoByName = new Map(logos.map((row) => [row.name.toLowerCase(), row.image_url]));
    const brands = [...byName.values()].sort((a, b) => a.localeCompare(b)).map((name) => ({
      name,
      logo: logoByName.get(name.toLowerCase()) || "",
    }));
    return Response.json({ ok: true, brands });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, message: "Gagal memuat merek." }, { status: 500 });
  }
}
