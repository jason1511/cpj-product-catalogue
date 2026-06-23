const locationLabels = {
  SBY: "Surabaya",
  LBK: "Lombok",
  PBL: "Probolinggo",
  LMJ: "Lumajang",
};

async function hashPassword(password, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${secret}`);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getLocationName(locationCode) {
  if (!locationCode) return "";

  return locationLabels[locationCode] || locationCode;
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

async function createSessionValue(user, secret) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    locationCode: user.location_code || "",
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };

  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = await createSignature(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export async function onRequestPost(context) {
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

    if (!env.ADMIN_SESSION_SECRET) {
      return Response.json(
        {
          ok: false,
          message: "ADMIN_SESSION_SECRET belum diset.",
        },
        { status: 500 },
      );
    }

    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return Response.json(
        {
          ok: false,
          message: "Username dan password wajib diisi.",
        },
        { status: 400 },
      );
    }

    const user = await env.DB.prepare(
      `
      SELECT
        id,
        username,
        password_hash,
        role,
        location_code,
        is_active
      FROM admin_users
      WHERE username = ?
      LIMIT 1
      `,
    )
      .bind(username)
      .first();

    if (!user || !user.is_active) {
      return Response.json(
        {
          ok: false,
          message: "Username atau password salah.",
        },
        { status: 401 },
      );
    }

    if (user.role === "staff" && !user.location_code) {
      return Response.json(
        {
          ok: false,
          message:
            "Akun staff belum memiliki lokasi. Hubungi admin untuk mengatur lokasi user.",
        },
        { status: 403 },
      );
    }

    const passwordHash = await hashPassword(password, env.ADMIN_SESSION_SECRET);

    if (passwordHash !== user.password_hash) {
      return Response.json(
        {
          ok: false,
          message: "Username atau password salah.",
        },
        { status: 401 },
      );
    }

    const sessionValue = await createSessionValue(
      user,
      env.ADMIN_SESSION_SECRET,
    );

    const locationCode = user.location_code || "";

    return Response.json(
      {
        ok: true,
        message: "Login berhasil.",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          locationCode,
          locationName: getLocationName(locationCode),
        },
      },
      {
        headers: {
          "Set-Cookie": `cpj_admin_session=${sessionValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
        },
      },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Gagal login admin.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}