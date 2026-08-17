export type VehicleOptionKind = "brand" | "type" | "machine";

export type VehicleOption = {
  slug: string;
  kind: VehicleOptionKind;
  name: string;
};

export const DEFAULT_VEHICLE_OPTIONS: VehicleOption[] = [
  ...["Honda", "Yamaha", "Suzuki", "Piaggio", "Vespa", "SYM", "Kymco"].map((name, index) => ({
    slug: `brand-${index + 1}`,
    kind: "brand" as const,
    name,
  })),
  ...["Tay ga", "Côn tay", "Xe số", "Mô tô"].map((name, index) => ({
    slug: `type-${index + 1}`,
    kind: "type" as const,
    name,
  })),
  ...["Máy zin", "62zz", "65zz", "75zz"].map((name, index) => ({
    slug: `machine-${index + 1}`,
    kind: "machine" as const,
    name,
  })),
];

export const optionNames = (options: VehicleOption[], kind: VehicleOptionKind) =>
  options.filter((option) => option.kind === kind).map((option) => option.name);
