export async function onRequestGet(context) {
  try {
    const { env, params } = context;

    if (!env.PRODUCT_IMAGES) {
      return new Response("R2 binding PRODUCT_IMAGES is not available.", {
        status: 500,
      });
    }

    const path = Array.isArray(params.path)
      ? params.path.join("/")
      : params.path;

    if (!path) {
      return new Response("Image path is required.", { status: 400 });
    }

    const object = await env.PRODUCT_IMAGES.get(path);

    if (!object) {
      return new Response("Image not found.", { status: 404 });
    }

    const headers = new Headers();

    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=300");

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}