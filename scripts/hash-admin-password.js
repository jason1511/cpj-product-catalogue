import crypto from "node:crypto";

const password = process.argv[2];
const secret = process.argv[3];

if (!password || !secret) {
  console.error(
    "Usage: node scripts/hash-admin-password.js <password> <ADMIN_SESSION_SECRET>",
  );
  process.exit(1);
}

const hash = crypto
  .createHash("sha256")
  .update(`${password}:${secret}`)
  .digest("hex");

console.log(hash);