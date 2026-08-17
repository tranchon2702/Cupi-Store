const MAX_EDGE = 1440;
const OUTPUT_QUALITY = 0.8;

export async function optimizeImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Không thể xử lý ảnh trên trình duyệt này.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/webp", OUTPUT_QUALITY);
}

export async function optimizeImages(files: File[]) {
  return Promise.all(
    files
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 8)
      .map(optimizeImage),
  );
}
