import { randomUUID } from "node:crypto";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_PREFIX = "data:image/webp;base64,";

function uploadDirectory() {
  return path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));
}

function publicBase() {
  const configured = process.env.PUBLIC_UPLOAD_BASE || "/uploads";
  return `/${configured.replace(/^\/+|\/+$/g, "")}`;
}

function managedFilename(url: string) {
  const prefix = `${publicBase()}/`;
  if (!url.startsWith(prefix)) return null;
  const filename = url.slice(prefix.length);
  return /^[a-z0-9-]+\.webp$/i.test(filename) ? filename : null;
}

async function removeUrl(url: string) {
  const filename = managedFilename(url);
  if (!filename) return;
  await unlink(path.join(uploadDirectory(), filename)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export type StoredImages = {
  urls: string[];
  created: string[];
  removedAfterCommit: string[];
};

export async function stageImages(
  kind: "bike" | "led",
  slug: string,
  incoming: string[],
  previous: string[] = [],
): Promise<StoredImages> {
  const directory = uploadDirectory();
  await mkdir(directory, { recursive: true });
  const maxBytes = Number(process.env.MAX_IMAGE_BYTES || 3 * 1024 * 1024);
  const created: string[] = [];

  try {
    const urls: string[] = [];
    for (const image of incoming) {
      if (!image.startsWith(DATA_PREFIX)) {
        urls.push(image);
        continue;
      }

      const buffer = Buffer.from(image.slice(DATA_PREFIX.length), "base64");
      const isWebp =
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP";
      if (!isWebp || buffer.length > maxBytes) {
        throw new Error("Ảnh WebP không hợp lệ hoặc vượt quá dung lượng cho phép.");
      }

      const filename = `${kind}-${slug}-${randomUUID()}.webp`;
      const finalPath = path.join(directory, filename);
      const tempPath = `${finalPath}.tmp`;
      await writeFile(tempPath, buffer, { flag: "wx" });
      await rename(tempPath, finalPath);
      created.push(`${publicBase()}/${filename}`);
      urls.push(`${publicBase()}/${filename}`);
    }

    return {
      urls,
      created,
      removedAfterCommit: previous.filter((url) => managedFilename(url) && !urls.includes(url)),
    };
  } catch (error) {
    await cleanupImages(created);
    throw error;
  }
}

export async function cleanupImages(urls: string[]) {
  await Promise.all(urls.map(removeUrl));
}
