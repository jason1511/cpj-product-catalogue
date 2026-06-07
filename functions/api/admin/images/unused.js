import { writeAdminLog } from "../../../utils/audit";

function parseJsonField(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function imageUrlToKey(imageUrl) {
  if (!imageUrl) return "";

  const marker = "/api/images/";

  if (!String(imageUrl).includes(marker)) {
    return "";
  }

  return String(imageUrl).split(marker)[1] || "";
}

function normalizeKey(key) {
  return String(key || "").trim();
}

async function getUsedImageKeys(env) {
  const usedKeys = new Set();

  const { results } = await env.DB.prepare(
    `
    SELECT image_url, color_images
    FROM products
    `,
  ).all();

  results.forEach((product) => {
    const mainKey = imageUrlToKey(product.image_url);

    if (mainKey) {
      usedKeys.add(normalizeKey(mainKey));
    }

    const colorImages = parseJsonField(product.color_images, {});

    Object.values(colorImages).forEach((imageUrl) => {
      const colorKey = imageUrlToKey(imageUrl);

      if (colorKey) {
        usedKeys.add(normalizeKey(colorKey));
      }
    });
  });

  return usedKeys;
}

async function listAllProductImages(env) {
  const objects = [];
  let cursor = undefined;

  do {
    const listed = await env.PRODUCT_IMAGES.list({
      prefix: "product-images/",
      cursor,
    });

    objects.push(...listed.objects);
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  return objects;
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

    if (!env.PRODUCT_IMAGES) {
      return Response.json(
        {
          ok: false,
          message: "R2 binding PRODUCT_IMAGES is not available.",
        },
        { status: 500 },
      );
    }

    const usedKeys = await getUsedImageKeys(env);
    const r2Images = await listAllProductImages(env);

    const unusedImages = r2Images
      .filter((object) => !usedKeys.has(normalizeKey(object.key)))
      .map((object) => ({
        key: object.key,
        size: object.size,
        uploadedAt: object.uploaded?.toISOString?.() || null,
        imageUrl: `/api/images/${object.key}`,
      }));

    return Response.json({
      ok: true,
      totalR2Images: r2Images.length,
      totalUsedImages: usedKeys.size,
      totalUnusedImages: unusedImages.length,
      unusedImages,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengambil gambar tidak terpakai.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function onRequestDelete(context) {
  try {
    const { env, request } = context;
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

    if (!env.PRODUCT_IMAGES) {
      return Response.json(
        {
          ok: false,
          message: "R2 binding PRODUCT_IMAGES is not available.",
        },
        { status: 500 },
      );
    }

    const keys = Array.isArray(body.keys)
      ? body.keys.map(normalizeKey).filter(Boolean)
      : [];

    if (keys.length === 0) {
      return Response.json(
        {
          ok: false,
          message: "Tidak ada gambar yang dipilih.",
        },
        { status: 400 },
      );
    }

    const usedKeys = await getUsedImageKeys(env);
    const safeToDeleteKeys = keys.filter((key) => !usedKeys.has(key));

    if (safeToDeleteKeys.length === 0) {
      return Response.json(
        {
          ok: false,
          message:
            "Tidak ada gambar yang aman untuk dihapus. Beberapa gambar masih digunakan produk.",
        },
        { status: 400 },
      );
    }

    await Promise.all(
      safeToDeleteKeys.map((key) => env.PRODUCT_IMAGES.delete(key)),
    );

    try {
      await writeAdminLog(env, context.data?.adminUser, {
        action: "image.cleanup.unused",
        targetType: "r2_image",
        targetId: null,
        targetLabel: `${safeToDeleteKeys.length} gambar tidak terpakai`,
        metadata: {
          deletedKeys: safeToDeleteKeys,
          skippedKeys: keys.filter((key) => usedKeys.has(key)),
        },
      });
    } catch (auditError) {
      console.error("Audit log failed for image cleanup:", auditError);
    }

    return Response.json({
      ok: true,
      message: `${safeToDeleteKeys.length} gambar tidak terpakai berhasil dihapus.`,
      deletedKeys: safeToDeleteKeys,
      skippedKeys: keys.filter((key) => usedKeys.has(key)),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal menghapus gambar tidak terpakai.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}