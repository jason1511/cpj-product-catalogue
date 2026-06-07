const MAX_FILE_SIZE = 3 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

function getFileExtension(file) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";

  return "bin";
}

function createSafeFileName(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replaceAll("&", "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createImageKey(file, productId, colorName) {
  const extension = getFileExtension(file);
  const safeProductId = createSafeFileName(productId);
  const safeColorName = createSafeFileName(colorName);

  if (!safeProductId) {
    throw new Error("ID produk wajib tersedia sebelum upload gambar.");
  }

  if (safeColorName) {
    return `product-images/${safeProductId}-${safeColorName}.${extension}`;
  }

  return `product-images/${safeProductId}.${extension}`;
}

export async function onRequestPost(context) {
  try {
    const { env, request } = context;

    if (!env.PRODUCT_IMAGES) {
      return Response.json(
        {
          ok: false,
          message: "R2 binding PRODUCT_IMAGES is not available.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");
    const productId = formData.get("productId");
    const colorName = formData.get("colorName");
    if (!productId) {
      return Response.json(
        {
          ok: false,
          message: "ID produk wajib tersedia sebelum upload gambar.",
        },
        { status: 400 },
      );
    }

    if (!file || typeof file === "string") {
      return Response.json(
        {
          ok: false,
          message: "File gambar wajib diunggah.",
        },
        { status: 400 },
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        {
          ok: false,
          message: "Format gambar harus JPG, PNG, atau WebP.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          ok: false,
          message: "Ukuran gambar maksimal 3MB.",
        },
        { status: 400 },
      );
    }

    const key = createImageKey(file, productId, colorName);

    await env.PRODUCT_IMAGES.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
  originalName: file.name,
  productId: String(productId),
  colorName: String(colorName || ""),
},
    });

    return Response.json({
      ok: true,
      message: "Gambar berhasil diunggah.",
      key,
      imageUrl: `/api/images/${key}`,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal mengunggah gambar.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}