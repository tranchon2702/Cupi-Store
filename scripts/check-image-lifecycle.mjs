import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { cleanupImages, stageImages } from "../server/utils/images.ts";

const testDirectory = await mkdtemp(path.join(tmpdir(), "cupi-images-"));
process.env.UPLOAD_DIR = testDirectory;
process.env.PUBLIC_UPLOAD_BASE = "/uploads";

try {
  const fakeWebp = Buffer.from("RIFF0000WEBPtest");
  const dataUrl = `data:image/webp;base64,${fakeWebp.toString("base64")}`;
  const staged = await stageImages("bike", "kiem-tra-anh", [dataUrl]);
  if (staged.urls.length !== 1 || (await readdir(testDirectory)).length !== 1) {
    throw new Error("Không tạo được ảnh thử nghiệm.");
  }
  await cleanupImages(staged.urls);
  if ((await readdir(testDirectory)).length !== 0) {
    throw new Error("Ảnh thử nghiệm không được xóa sạch.");
  }
  console.log("Image lifecycle: OK");
} finally {
  await rm(testDirectory, { recursive: true, force: true });
}
