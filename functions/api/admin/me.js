const locationLabels = {
  SBY: "Surabaya",
  LBK: "Lombok",
  PBL: "Probolinggo",
  LMJ: "Lumajang",
};

function getLocationName(locationCode) {
  if (!locationCode) return "";

  return locationLabels[locationCode] || locationCode;
}

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

  const locationCode = user.locationCode || user.location_code || "";

  return Response.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      locationCode,
      locationName: getLocationName(locationCode),
    },
    locations: Object.entries(locationLabels).map(([code, name]) => ({
      code,
      name,
    })),
  });
}