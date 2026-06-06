export async function onRequestGet(context) {
  const user = context.data.adminUser;

  if (!user) {
    return Response.json(
      {
        ok: false,
        message: "Admin login diperlukan.",
      },
      { status: 401 },
    );
  }

  return Response.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
}