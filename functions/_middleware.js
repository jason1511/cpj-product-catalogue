const protectedApiPrefixes = [
  "/api/admin/products",
  "/api/admin/uploads",
  "/api/admin/me",
  "/api/admin/logout",
  "/api/admin/users",
  "/api/admin/logs",
];
const protectedPagePrefixes = ["/admin"];
const adminOnlyPagePrefixes = [
  "/admin/users",
  "/admin/settings",
  "/admin/logs",
];
const adminOnlyApiPrefixes = [
  "/api/admin/users",
  "/api/admin/settings",
  "/api/admin/logs",
];
function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

function isProtectedPath(pathname) {
  if (pathname === "/admin/login") return false;
  if (pathname === "/api/admin/login") return false;

  return (
    protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    protectedPagePrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}
function isAdminOnlyPath(pathname) {
  return (
    adminOnlyApiPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    adminOnlyPagePrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}
function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createSignature(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return bufferToHex(signature);
}

async function verifySession(session, secret) {
  if (!session || !secret) return null;

  const [encodedPayload, signature] = session.split(".");

  if (!encodedPayload || !signature) return null;

  const expectedSignature = await createSignature(encodedPayload, secret);

  if (signature !== expectedSignature) return null;

  try {
    const user = JSON.parse(atob(encodedPayload));

    if (!user.exp || user.exp <= Date.now()) return null;
    if (!["admin", "staff"].includes(user.role)) return null;

    return user;
  } catch {
    return null;
  }
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (!isProtectedPath(url.pathname)) {
    return next();
  }

  const session = getCookie(request, "cpj_admin_session");
  const user = await verifySession(session, context.env.ADMIN_SESSION_SECRET);

 if (user) {
  context.data.adminUser = user;

  if (isAdminOnlyPath(url.pathname) && user.role !== "admin") {
    if (url.pathname.startsWith("/api/")) {
      return Response.json(
        {
          ok: false,
          message: "Akses admin diperlukan.",
        },
        { status: 403 },
      );
    }

    return Response.redirect(`${url.origin}/admin/products`, 302);
  }

  return next();
}

  if (url.pathname.startsWith("/api/")) {
    return Response.json(
      {
        ok: false,
        message: "Admin login diperlukan.",
      },
      { status: 401 },
    );
  }

  return Response.redirect(`${url.origin}/admin/login`, 302);
}