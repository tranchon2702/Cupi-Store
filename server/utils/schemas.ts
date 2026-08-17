import { z } from "zod";

const imageSchema = z
  .string()
  .min(1)
  .max(6_000_000)
  .refine(
    (value) =>
      value.startsWith("data:image/webp;base64,") ||
      value.startsWith("/") ||
      value.startsWith("https://") ||
      value.startsWith("http://"),
    "Đường dẫn ảnh không hợp lệ.",
  );

const priceSchema = z.number().int().min(1).max(100).nullable().optional();

export const bikeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
  name: z.string().trim().min(2).max(160),
  brand: z.string().trim().min(1).max(60),
  type: z.enum(["Tay ga", "Côn tay", "Xe số", "Mô tô"]),
  year: z
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  price: z.number().nonnegative().default(0),
  priceMillion: priceSchema,
  priceLabel: z.string().max(40).optional(),
  odo: z.number().int().nonnegative().max(2_000_000),
  engine: z.number().int().positive().max(3000),
  condition: z.enum(["Mới", "Đã qua sử dụng"]),
  cover: imageSchema,
  gallery: z.array(imageSchema).min(1).max(8),
  tags: z.array(z.string().trim().min(1).max(50)).max(5),
  description: z.string().trim().max(5000),
  specs: z.array(z.object({ label: z.string().max(80), value: z.string().max(200) })).max(12),
});

export const ledServiceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
  name: z.string().trim().min(2).max(160),
  category: z.enum(["Bi cầu LED", "Đèn trợ sáng", "Mạch LED", "Combo ánh sáng"]),
  priceMillion: priceSchema,
  priceLabel: z.string().max(40).optional(),
  cover: imageSchema,
  gallery: z.array(imageSchema).min(1).max(8),
  description: z.string().trim().max(5000),
  tags: z.array(z.string().trim().min(1).max(50)).max(5),
  warranty: z.string().trim().max(200),
});

export const resetBikesSchema = z.object({ items: z.array(bikeSchema).max(200) });
export const resetLedSchema = z.object({ items: z.array(ledServiceSchema).max(200) });
