export type PriceSource = {
  priceMillion?: number | null;
  priceLabel?: string;
  price?: number;
};

export type PriceMode = "range" | "contact";

export const PRICE_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "under-10", label: "1–9trXXX", min: 1, max: 9 },
  { id: "10-29", label: "10–29trXXX", min: 10, max: 29 },
  { id: "30-49", label: "30–49trXXX", min: 30, max: 49 },
  { id: "50-69", label: "50–69trXXX", min: 50, max: 69 },
  { id: "70-100", label: "70–100trXXX", min: 70, max: 100 },
  { id: "contact", label: "Liên hệ" },
] as const;

export const normalizePriceMillion = (value: number) =>
  Number.isFinite(value) ? Math.min(100, Math.max(1, Math.trunc(value))) : null;

export const getPriceMillion = (item: PriceSource): number | null => {
  if (item.priceMillion === null) return null;
  if (typeof item.priceMillion === "number") return normalizePriceMillion(item.priceMillion);

  const label = item.priceLabel?.trim();
  if (label && /liên hệ/i.test(label)) return null;

  // Dữ liệu cũ từng lưu giá chính xác: chỉ lấy phần triệu để chuyển sang format mới.
  if (item.price && item.price >= 1_000_000) {
    return normalizePriceMillion(item.price / 1_000_000);
  }

  if (!label) return null;

  const explicitMillion = label.match(/(\d{1,3})\s*(?:tr|triệu)/i);
  if (explicitMillion) return normalizePriceMillion(Number(explicitMillion[1]));

  // Chuyển dữ liệu demo cũ kiểu 3X/1XX sang một mốc triệu hợp lệ.
  const legacyX = label.match(/(\d{1,2})(X{1,2})/i);
  if (legacyX) {
    const base = Number(legacyX[1]);
    const multiplier = legacyX[2]!.length === 2 ? 100 : 10;
    const offset = /lớn/i.test(label) ? 8 : /nhỏ/i.test(label) ? 2 : 0;
    return normalizePriceMillion(base * multiplier + offset);
  }

  return null;
};

export const formatPublicPrice = (item: PriceSource) => {
  const million = getPriceMillion(item);
  return million ? `${million}trXXX` : "Liên hệ";
};

export const matchesPriceFilter = (item: PriceSource, filterId: string) => {
  if (filterId === "all") return true;
  const million = getPriceMillion(item);
  if (filterId === "contact") return million === null;
  const filter = PRICE_FILTERS.find((option) => option.id === filterId);
  return Boolean(
    filter && "min" in filter && million !== null && million >= filter.min && million <= filter.max,
  );
};
