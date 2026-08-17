import bike1 from "@/assets/bike-1.jpg";
import bike2 from "@/assets/bike-2.jpg";
import bike3 from "@/assets/bike-3.jpg";
import bike4 from "@/assets/bike-4.jpg";
import detail1 from "@/assets/detail-1.jpg";
import detail2 from "@/assets/detail-2.jpg";
import detail3 from "@/assets/detail-3.jpg";
import { formatPublicPrice } from "@/lib/price-utils";

export const BIKE_BRANDS = [
  "Honda",
  "Yamaha",
  "Suzuki",
  "Piaggio",
  "Vespa",
  "SYM",
  "Kymco",
] as const;
export const BIKE_TYPES = ["Tay ga", "Côn tay", "Xe số", "Mô tô"] as const;

export type Bike = {
  slug: string;
  name: string;
  brand: string;
  type: (typeof BIKE_TYPES)[number];
  year: number;
  price: number;
  priceMillion?: number | null;
  priceLabel?: string;
  odo: number;
  engine: number;
  condition: "Mới" | "Đã qua sử dụng";
  cover: string;
  gallery: string[];
  tags: string[];
  description: string;
  specs: { label: string; value: string }[];
};

const galleryA = [detail1, detail2, detail3];
const galleryB = [detail2, detail3, detail1];
const specs = (
  engine: string,
  power: string,
  transmission: string,
  weight: string,
  brake: string,
  warranty: string,
) => [
  { label: "Động cơ", value: engine },
  { label: "Công suất", value: power },
  { label: "Hộp số", value: transmission },
  { label: "Khối lượng", value: weight },
  { label: "Phanh", value: brake },
  { label: "Bảo hành / ODO", value: warranty },
];

export const bikes: Bike[] = [
  {
    slug: "honda-sh160i-abs-2025",
    name: "Honda SH160i ABS",
    brand: "Honda",
    type: "Tay ga",
    year: 2025,
    price: 104900000,
    priceMillion: 100,
    odo: 8200,
    engine: 157,
    condition: "Đã qua sử dụng",
    cover: bike3,
    gallery: [bike3, ...galleryA],
    tags: ["ABS 2 kênh", "Smartkey", "HSTC"],
    description:
      "SH160i bản ABS một chủ, giấy tờ đầy đủ, máy móc nguyên bản. Động cơ eSP+ 4 van vận hành êm, đã kiểm tra điện, phanh, lốp và hỗ trợ sang tên.",
    specs: specs(
      "156,9cc eSP+ 4 van",
      "16,6 HP / 8.500 rpm",
      "CVT",
      "134 kg",
      "ABS 2 kênh",
      "Cam kết máy móc tại cửa hàng",
    ),
  },
  {
    slug: "honda-air-blade-160-abs",
    name: "Honda Air Blade 160 ABS",
    brand: "Honda",
    type: "Tay ga",
    year: 2025,
    price: 58900000,
    priceMillion: 58,
    odo: 6100,
    engine: 157,
    condition: "Đã qua sử dụng",
    cover: bike1,
    gallery: [bike1, ...galleryB],
    tags: ["ABS", "eSP+", "Cốp 23,2L"],
    description:
      "Air Blade 160 phong cách thể thao, phù hợp đi phố và đường dài. Xe có ABS bánh trước, cổng sạc USB và cốp rộng, được kiểm tra 32 hạng mục trước khi bàn giao.",
    specs: specs(
      "156,9cc eSP+",
      "15,2 HP / 8.000 rpm",
      "CVT",
      "114 kg",
      "ABS bánh trước",
      "Cam kết máy móc tại cửa hàng",
    ),
  },
  {
    slug: "honda-winner-x-v3-abs",
    name: "Honda Winner X V3 ABS",
    brand: "Honda",
    type: "Côn tay",
    year: 2024,
    price: 42900000,
    priceMillion: 42,
    odo: 3800,
    engine: 150,
    condition: "Đã qua sử dụng",
    cover: bike4,
    gallery: [bike4, ...galleryA],
    tags: ["Slipper clutch", "ABS", "Máy nguyên bản"],
    description:
      "Winner X V3 một chủ, máy móc nguyên bản, lịch sử bảo dưỡng rõ ràng. Đã thay nhớt, kiểm tra phanh, lốp và hệ thống điện trước khi lên sàn.",
    specs: specs(
      "149,1cc DOHC",
      "15,4 HP / 9.000 rpm",
      "6 cấp",
      "124 kg",
      "ABS bánh trước",
      "ODO 3.800 km",
    ),
  },
  {
    slug: "yamaha-exciter-155-vva-abs",
    name: "Yamaha Exciter 155 VVA ABS",
    brand: "Yamaha",
    type: "Côn tay",
    year: 2025,
    price: 54900000,
    priceMillion: 54,
    odo: 4700,
    engine: 155,
    condition: "Đã qua sử dụng",
    cover: bike4,
    gallery: [bike4, ...galleryB],
    tags: ["VVA", "ABS", "Quick shift"],
    description:
      "Exciter 155 VVA bản ABS một chủ, máy nguyên bản và sang số mượt. Đã kiểm tra ly hợp, phanh, điện và giấy tờ trước khi đăng bán.",
    specs: specs(
      "155cc VVA",
      "17,7 HP / 9.500 rpm",
      "6 cấp",
      "121 kg",
      "ABS bánh trước",
      "Cam kết máy móc tại cửa hàng",
    ),
  },
  {
    slug: "yamaha-nvx-155-vva",
    name: "Yamaha NVX 155 VVA",
    brand: "Yamaha",
    type: "Tay ga",
    year: 2024,
    price: 51200000,
    priceMillion: 51,
    odo: 2900,
    engine: 155,
    condition: "Đã qua sử dụng",
    cover: bike1,
    gallery: [bike1, ...galleryA],
    tags: ["VVA", "Y-Connect", "Traction control"],
    description:
      "NVX 155 dáng thể thao, động cơ VVA bốc và tiết kiệm. Xe đẹp, dàn áo nguyên, đã bảo dưỡng lớn và sẵn hồ sơ sang tên.",
    specs: specs(
      "155cc Blue Core VVA",
      "15,1 HP / 8.000 rpm",
      "CVT",
      "125 kg",
      "ABS bánh trước",
      "ODO 2.900 km",
    ),
  },
  {
    slug: "yamaha-grande-hybrid",
    name: "Yamaha Grande Hybrid",
    brand: "Yamaha",
    type: "Tay ga",
    year: 2025,
    price: 49900000,
    priceMillion: 49,
    odo: 9200,
    engine: 125,
    condition: "Đã qua sử dụng",
    cover: bike3,
    gallery: [bike3, ...galleryB],
    tags: ["Hybrid", "Siêu tiết kiệm", "Cốp 27L"],
    description:
      "Grande Hybrid thanh lịch, nhẹ và tiết kiệm nhiên liệu. Cốp rộng 27 lít, khóa thông minh và trợ lực điện khi tăng tốc.",
    specs: specs(
      "125cc Blue Core Hybrid",
      "8,3 HP / 6.500 rpm",
      "CVT",
      "101 kg",
      "ABS bánh trước",
      "Cam kết máy móc tại cửa hàng",
    ),
  },
  {
    slug: "suzuki-raider-r150",
    name: "Suzuki Raider R150",
    brand: "Suzuki",
    type: "Côn tay",
    year: 2024,
    price: 46900000,
    priceMillion: 46,
    odo: 6100,
    engine: 150,
    condition: "Đã qua sử dụng",
    cover: bike4,
    gallery: [bike4, ...galleryA],
    tags: ["DOHC", "6 cấp", "Nhẹ 109kg"],
    description:
      "Raider R150 máy DOHC mạnh, trọng lượng nhẹ và cảm giác lái linh hoạt. Xe nguyên bản, máy êm, giấy tờ chính chủ.",
    specs: specs(
      "147,3cc DOHC",
      "18,5 HP / 10.000 rpm",
      "6 cấp",
      "109 kg",
      "Đĩa trước/sau",
      "ODO 6.100 km",
    ),
  },
  {
    slug: "suzuki-burgman-street-125ex",
    name: "Suzuki Burgman Street 125EX",
    brand: "Suzuki",
    type: "Tay ga",
    year: 2025,
    price: 48900000,
    priceMillion: null,
    odo: 6800,
    engine: 125,
    condition: "Đã qua sử dụng",
    cover: bike2,
    gallery: [bike2, ...galleryB],
    tags: ["Maxi scooter", "SEP-α", "Cốp rộng"],
    description:
      "Burgman Street 125EX kiểu dáng maxi scooter thoải mái, sàn để chân rộng và động cơ SEP-α tối ưu nhiên liệu cho nhu cầu đô thị.",
    specs: specs(
      "124cc SEP-α",
      "8,6 HP / 6.500 rpm",
      "CVT",
      "112 kg",
      "CBS",
      "Cam kết máy móc tại cửa hàng",
    ),
  },
  {
    slug: "piaggio-liberty-125-abs",
    name: "Piaggio Liberty 125 ABS",
    brand: "Piaggio",
    type: "Tay ga",
    year: 2025,
    price: 57900000,
    priceMillion: 57,
    odo: 7400,
    engine: 125,
    condition: "Đã qua sử dụng",
    cover: bike3,
    gallery: [bike3, ...galleryA],
    tags: ["i-Get", "ABS", "Bánh lớn"],
    description:
      "Liberty 125 ABS dáng đẹp, bánh lớn ổn định và động cơ i-Get vận hành êm. Xe giấy tờ đầy đủ, hỗ trợ sang tên và trả góp.",
    specs: specs(
      "124,5cc i-Get",
      "10,7 HP / 7.600 rpm",
      "CVT",
      "124 kg",
      "ABS bánh trước",
      "Cam kết máy móc tại cửa hàng",
    ),
  },
  {
    slug: "vespa-sprint-s-150",
    name: "Vespa Sprint S 150",
    brand: "Vespa",
    type: "Tay ga",
    year: 2025,
    price: 98500000,
    priceMillion: 98,
    odo: 5200,
    engine: 150,
    condition: "Đã qua sử dụng",
    cover: bike3,
    gallery: [bike3, ...galleryB],
    tags: ["i-Get", "Full LED", "Màn TFT"],
    description:
      "Sprint S 150 cá tính với thân thép liền khối, đèn LED và động cơ i-Get. Có nhiều gói phụ kiện chính hãng và lựa chọn phối màu tại cửa hàng.",
    specs: specs(
      "155cc i-Get",
      "12,3 HP / 7.250 rpm",
      "CVT",
      "130 kg",
      "ABS bánh trước",
      "Cam kết máy móc tại cửa hàng",
    ),
  },
  {
    slug: "vespa-primavera-150",
    name: "Vespa Primavera 150",
    brand: "Vespa",
    type: "Tay ga",
    year: 2024,
    price: 82900000,
    priceMillion: 82,
    odo: 1800,
    engine: 150,
    condition: "Đã qua sử dụng",
    cover: bike3,
    gallery: [bike3, ...galleryA],
    tags: ["Một chủ", "Sơn zin", "Bảo dưỡng đủ"],
    description:
      "Primavera 150 một chủ, sơn zin đẹp, máy móc nguyên bản. Xe đã được chăm sóc toàn bộ và kiểm tra điện, phanh, lốp trước khi đăng bán.",
    specs: specs(
      "155cc i-Get",
      "12,9 HP / 7.750 rpm",
      "CVT",
      "130 kg",
      "ABS bánh trước",
      "ODO 1.800 km",
    ),
  },
  {
    slug: "sym-star-sr-170",
    name: "SYM Star SR 170 ABS",
    brand: "SYM",
    type: "Côn tay",
    year: 2024,
    price: 47500000,
    priceMillion: 47,
    odo: 4300,
    engine: 170,
    condition: "Đã qua sử dụng",
    cover: bike1,
    gallery: [bike1, ...galleryB],
    tags: ["ABS 2 kênh", "6 cấp", "Máy zin"],
    description:
      "Star SR 170 ABS hai kênh, kiểu dáng underbone thể thao. Xe máy zin, bảo dưỡng đúng lịch và sang tên nhanh.",
    specs: specs(
      "174,5cc EFI",
      "15 HP / 8.500 rpm",
      "6 cấp",
      "130 kg",
      "ABS 2 kênh",
      "ODO 4.300 km",
    ),
  },
];

export const getPublicPrice = (bike: Pick<Bike, "price" | "priceMillion" | "priceLabel">) =>
  formatPublicPrice(bike);
export const getBike = (slug: string) => bikes.find((bike) => bike.slug === slug);
