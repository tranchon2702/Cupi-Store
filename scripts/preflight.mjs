import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const required = [
  "MONGODB_URI",
  "MONGODB_DB",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD_HASH",
  "SESSION_SECRET",
  "UPLOAD_DIR",
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Thiếu biến môi trường: ${missing.join(", ")}`);

const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);
if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 12)) {
  throw new Error(`Cần Node.js 22.12 trở lên. Hiện tại: ${process.versions.node}`);
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự.");
}
if (process.env.SESSION_COOKIE_SECURE !== "true") {
  throw new Error("SESSION_COOKIE_SECURE phải là true khi deploy HTTPS.");
}

try {
  bcrypt.getRounds(process.env.ADMIN_PASSWORD_HASH);
} catch {
  throw new Error("ADMIN_PASSWORD_HASH không phải bcrypt hash hợp lệ.");
}

if (!path.isAbsolute(process.env.UPLOAD_DIR)) {
  throw new Error("UPLOAD_DIR phải là đường dẫn tuyệt đối.");
}
await mkdir(process.env.UPLOAD_DIR, { recursive: true });
await access(process.env.UPLOAD_DIR, constants.R_OK | constants.W_OK);

const mongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
try {
  await mongo.connect();
  await mongo.db(process.env.MONGODB_DB).command({ ping: 1 });
} finally {
  await mongo.close();
}

console.log("Preflight: Node, MongoDB, tài khoản admin và thư mục ảnh đều hợp lệ.");
