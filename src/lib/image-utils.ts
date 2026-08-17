const MAX_EDGE = 1440;
const OUTPUT_QUALITY = 0.82;

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không thể đọc ảnh sau khi tối ưu."));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encodeForDevice(canvas: HTMLCanvasElement) {
  const webp = await canvasToBlob(canvas, "image/webp", OUTPUT_QUALITY);
  if (webp?.type === "image/webp") return blobToDataUrl(webp);

  // Một số WebView/iPhone xem được WebP nhưng không xuất WebP từ canvas.
  // JPEG là phương án dự phòng nhẹ và tương thích hơn, phía server sẽ kiểm tra lại định dạng.
  const jpeg = await canvasToBlob(canvas, "image/jpeg", OUTPUT_QUALITY);
  if (!jpeg) throw new Error("Trình duyệt này không thể xuất ảnh đã tối ưu.");
  return blobToDataUrl(jpeg);
}

async function loadWithImageElement(file: Blob) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return image;
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Điện thoại không đọc được định dạng ảnh này.");
  }
}

function isHeic(file: File) {
  return /image\/hei[cf]/i.test(file.type) || /\.(?:heic|heif)$/i.test(file.name);
}

async function convertHeicForBrowser(file: File) {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  const jpeg = Array.isArray(converted) ? converted[0] : converted;
  if (!jpeg) throw new Error("Không thể chuyển ảnh HEIC/HEIF từ iPhone.");
  return jpeg;
}

export async function optimizeImage(file: File): Promise<string> {
  let source: ImageBitmap | HTMLImageElement | undefined;
  let objectUrlToRevoke = "";

  try {
    const browserImage: Blob = isHeic(file) ? await convertHeicForBrowser(file) : file;
    if (typeof createImageBitmap === "function") {
      try {
        source = await createImageBitmap(browserImage, { imageOrientation: "from-image" });
      } catch {
        source = await loadWithImageElement(browserImage);
        objectUrlToRevoke = source.src;
      }
    } else {
      source = await loadWithImageElement(browserImage);
      objectUrlToRevoke = source.src;
    }

    const sourceWidth = source instanceof ImageBitmap ? source.width : source.naturalWidth;
    const sourceHeight = source instanceof ImageBitmap ? source.height : source.naturalHeight;
    const scale = Math.min(1, MAX_EDGE / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Không thể xử lý ảnh trên trình duyệt này.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, width, height);
    return await encodeForDevice(canvas);
  } finally {
    if (source instanceof ImageBitmap) source.close();
    if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
  }
}

function isSelectableImage(file: File) {
  return file.type.startsWith("image/") || /\.(?:avif|heic|heif|jpe?g|png|webp)$/i.test(file.name);
}

export async function optimizeImages(files: File[], limit = 15) {
  const selected = files.filter(isSelectableImage).slice(0, Math.max(0, limit));
  if (!selected.length) throw new Error("Không tìm thấy ảnh hợp lệ.");
  const optimized: string[] = [];
  // Xử lý tuần tự để tránh đầy bộ nhớ khi iPhone chọn nhiều ảnh HEIC dung lượng lớn.
  for (const file of selected) optimized.push(await optimizeImage(file));
  return optimized;
}
