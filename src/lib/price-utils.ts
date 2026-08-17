export type PriceSource = {
  priceMillion?: number | null;
  priceLabel?: string;
  price?: number;
};

export type PriceMode = "range" | "contact";
export type VehiclePriceBand = "head" | "small" | "medium" | "large";

export type VehiclePriceSource = PriceSource & {
  priceBand?: VehiclePriceBand;
};

export const PRICE_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "under-10", label: "Dưới 10 triệu", min: 1, max: 9 },
  { id: "1x", label: "1X", min: 10, max: 19 },
  { id: "2x", label: "2X", min: 20, max: 29 },
  { id: "3x", label: "3X", min: 30, max: 39 },
  { id: "4x", label: "4X", min: 40, max: 49 },
  { id: "5x", label: "5X", min: 50, max: 59 },
  { id: "6x", label: "6X", min: 60, max: 69 },
  { id: "7x", label: "7X", min: 70, max: 79 },
  { id: "8x", label: "8X", min: 80, max: 89 },
  { id: "9x", label: "9X", min: 90, max: 99 },
  { id: "1xx", label: "1XX", min: 100, max: 100 },
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

export const inferVehiclePriceBand = (million: number | null): VehiclePriceBand => {
  if (million === null || million < 10 || million >= 100) return "head";
  const position = million % 10;
  return position <= 3 ? "small" : position <= 6 ? "medium" : "large";
};

export const formatVehiclePrice = (item: VehiclePriceSource) => {
  const million = getPriceMillion(item);
  if (million === null) return "Liên hệ";
  if (million < 10) return `${million}trXXX`;
  if (million >= 100) return "1XX triệu";

  const head = `${Math.floor(million / 10)}X`;
  const suffix =
    item.priceBand === "small"
      ? " nhỏ"
      : item.priceBand === "medium"
        ? " trung"
        : item.priceBand === "large"
          ? " lớn"
          : " triệu";
  return `${head}${suffix}`;
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
