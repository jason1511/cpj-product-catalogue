export async function onRequestPost() {
  return Response.json(
    {
      ok: true,
      message: "Logout berhasil.",
    },
    {
      headers: {
        "Set-Cookie":
          "cpj_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      },
    },
  );
}