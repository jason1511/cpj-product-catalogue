export async function onRequestGet() {
  return Response.json({
    ok: true,
    message: "CPJ API is running",
    timestamp: new Date().toISOString(),
  });
}