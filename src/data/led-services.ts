import detail1 from "@/assets/detail-1.jpg";
import detail2 from "@/assets/detail-2.jpg";
import detail3 from "@/assets/detail-3.jpg";
import bike1 from "@/assets/bike-1.jpg";

export const LED_CATEGORIES = ["Bi cầu LED", "Đèn trợ sáng", "Mạch LED", "Combo ánh sáng"] as const;

export type LedService = {
  slug: string;
  name: string;
  category: (typeof LED_CATEGORIES)[number];
  priceMillion?: number | null;
  priceLabel?: string;
  cover: string;
  gallery: string[];
  description: string;
  tags: string[];
  warranty: string;
};

export const ledServices: LedService[] = [
  {
    slug: "bi-cau-led-mini-2-inch",
    name: "Bi cầu LED Mini 2.0",
    category: "Bi cầu LED",
    priceMillion: 2,
    cover: detail1,
    gallery: [detail1, detail2, detail3],
    description:
      "Nâng cấp ánh sáng cos/pha gọn gàng, gom sáng tốt, không gây chói xe đối diện. Thi công dây điện và chống nước kỹ trước khi bàn giao.",
    tags: ["Cos/Pha", "Ánh sáng gom", "Chống nước"],
    warranty: "Bảo hành 12 tháng",
  },
  {
    slug: "bi-cau-led-3-inch",
    name: "Bi cầu LED 3.0 hiệu năng cao",
    category: "Bi cầu LED",
    priceMillion: 3,
    cover: detail2,
    gallery: [detail2, detail1, detail3],
    description:
      "Cấu hình ánh sáng mạnh cho khách thường xuyên đi đêm và đường dài. Căn chỉnh mặt cắt theo tải xe thực tế.",
    tags: ["Ánh sáng mạnh", "Mặt cắt chuẩn", "Đi tour"],
    warranty: "Bảo hành 18 tháng",
  },
  {
    slug: "den-tro-sang-compact",
    name: "Đèn trợ sáng Compact",
    category: "Đèn trợ sáng",
    priceMillion: 1,
    cover: detail3,
    gallery: [detail3, detail2, detail1],
    description:
      "Bộ trợ sáng nhỏ gọn cho xe phố, đi mưa và đường thiếu sáng. Đi dây riêng, cầu chì riêng và công tắc chống nước.",
    tags: ["Nhỏ gọn", "Cầu chì riêng", "Công tắc chống nước"],
    warranty: "Bảo hành 12 tháng",
  },
  {
    slug: "den-tro-sang-touring",
    name: "Đèn trợ sáng Touring",
    category: "Đèn trợ sáng",
    priceMillion: 2,
    cover: bike1,
    gallery: [bike1, detail3, detail2],
    description:
      "Cấu hình trợ sáng dành cho touring, vùng chiếu rộng và xa. Có lựa chọn ánh sáng vàng phá sương và trắng bám đường.",
    tags: ["Touring", "Phá sương", "Chiếu xa"],
    warranty: "Bảo hành 18 tháng",
  },
  {
    slug: "mach-led-audi-xe-may",
    name: "Mạch LED Audi theo xe",
    category: "Mạch LED",
    priceMillion: null,
    cover: detail1,
    gallery: [detail1, detail3, detail2],
    description:
      "Thiết kế LED demi và xi-nhan theo form chóa đèn từng dòng xe. Phối hiệu ứng theo yêu cầu nhưng vẫn ưu tiên độ bền và dễ bảo trì.",
    tags: ["Theo form xe", "Demi", "Xi-nhan"],
    warranty: "Bảo hành theo cấu hình",
  },
  {
    slug: "combo-anh-sang-full-option",
    name: "Combo ánh sáng Full Option",
    category: "Combo ánh sáng",
    priceMillion: null,
    cover: detail2,
    gallery: [detail2, detail3, detail1],
    description:
      "Combo bi cầu, trợ sáng, mạch LED và hệ thống điện được tính toán theo công suất xe. Báo cấu hình sau khi kiểm tra xe thực tế.",
    tags: ["Thi công trọn gói", "Kiểm tra sạc", "Căn chỉnh hoàn thiện"],
    warranty: "Bảo hành theo hạng mục",
  },
];
