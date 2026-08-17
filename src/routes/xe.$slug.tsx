import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Gauge,
  MessageCircle,
  Phone,
  ShieldCheck,
  ZoomIn,
} from "lucide-react";
import { BikeCard } from "@/components/BikeCard";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getBike, getPublicPrice } from "@/data/bikes";
import { useBikeInventory } from "@/hooks/use-bike-inventory";
import { goToHomeSection } from "@/lib/navigation";

export const Route = createFileRoute("/xe/$slug")({
  loader: ({ params }) => ({ bike: getBike(params.slug), slug: params.slug }),
  head: ({ loaderData }) => {
    const bike = loaderData?.bike;
    if (!bike)
      return {
        meta: [
          { title: "Chi tiết xe — CU PI STORE" },
          {
            name: "description",
            content: "Thông tin và hình ảnh chi tiết xe tại CU PI STORE.",
          },
        ],
      };
    const title = `${bike.name} ${bike.year} — ${getPublicPrice(bike)} | CU PI STORE`;
    const description = `${bike.name} xe cũ tuyển chọn, ${bike.engine}cc. ${bike.description.slice(0, 120)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
    };
  },
  component: BikeDetail,
});

function BikeDetail() {
  const { bike: loadedBike, slug } = Route.useLoaderData();
  const { inventory } = useBikeInventory();
  const bike = inventory.find((item) => item.slug === slug) ?? loadedBike;
  const [active, setActive] = useState(0);

  if (!bike)
    return (
      <div className="grid-tech min-h-screen">
        <SiteHeader />
        <main className="mx-auto grid min-h-[65vh] max-w-4xl place-items-center px-4 text-center">
          <div>
            <Gauge className="mx-auto h-12 w-12 text-steel" />
            <h1 className="mt-5 text-5xl text-white">KHÔNG TÌM THẤY XE</h1>
            <p className="mt-2 text-muted-foreground">
              Mẫu xe này có thể đã bán hoặc được gỡ khỏi kho.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-black"
            >
              Về kho xe
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );

  const related = inventory
    .filter(
      (item) => item.slug !== bike.slug && (item.brand === bike.brand || item.type === bike.type),
    )
    .slice(0, 4);

  return (
    <div className="grid-tech min-h-screen">
      <SiteHeader />
      <main>
        <div className="border-b border-white/10 bg-surface/40">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-steel">
            <Link to="/" className="shrink-0 hover:text-primary">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                goToHomeSection("kho-xe");
              }}
              className="shrink-0 hover:text-primary"
            >
              Kho xe
            </a>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate text-white">{bike.name}</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-7 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] xl:gap-12">
            <section className="order-2 lg:order-1">
              <div className="relative overflow-hidden border border-white/10 bg-black">
                <img
                  src={bike.gallery[Math.min(active, bike.gallery.length - 1)]}
                  alt={`${bike.name} - ảnh thực tế ${active + 1}`}
                  width={1400}
                  height={1050}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="clip-tag absolute left-0 top-4 bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black">
                  Ảnh thực tế
                </span>
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 px-2.5 py-1.5 text-[10px] text-white backdrop-blur">
                  <ZoomIn className="h-3.5 w-3.5" /> {active + 1}/{bike.gallery.length}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {bike.gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActive(index)}
                    className={`relative overflow-hidden border ${index === active ? "border-primary ring-1 ring-primary" : "border-white/10 hover:border-primary/50"}`}
                    aria-label={`Xem ảnh ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      width={260}
                      height={195}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <section className="mt-10">
                <SectionTitle eyebrow="Specifications" title="THÔNG SỐ KỸ THUẬT" />
                <div className="mt-4 grid sm:grid-cols-2">
                  {bike.specs
                    .filter(
                      (spec) =>
                        !["Hộp số", "Phanh"].includes(spec.label) &&
                        !(spec.label === "Bảo hành / ODO" && /\b(?:odo|km)\b/i.test(spec.value)),
                    )
                    .map((spec, index) => (
                      <div
                        key={spec.label}
                        className={`flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 ${index % 2 === 0 ? "sm:border-r" : ""}`}
                      >
                        <span className="text-xs uppercase tracking-wider text-steel">
                          {spec.label === "Bảo hành / ODO" ? "Bảo hành / Cam kết" : spec.label}
                        </span>
                        <strong className="text-right text-sm text-white">{spec.value}</strong>
                      </div>
                    ))}
                </div>
              </section>

              <section className="mt-10">
                <SectionTitle eyebrow="Vehicle story" title="MÔ TẢ CHI TIẾT" />
                <div className="mt-4 border border-white/10 bg-surface/70 p-5 sm:p-7">
                  <p className="text-sm leading-7 text-muted-foreground">{bike.description}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      "Kiểm tra giấy tờ và số khung số máy",
                      "Đánh giá động cơ và hệ thống điện",
                      "Công khai tình trạng thực tế của xe",
                      "Hỗ trợ sang tên, trả góp và vận chuyển",
                    ].map((item) => (
                      <p key={item} className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> {item}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            </section>

            <aside className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <div className="border border-primary/25 bg-surface/90 p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="clip-tag bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                      Xe cũ tuyển chọn
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-steel">
                      Mã xe: {bike.slug.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {bike.brand} · {bike.type}
                  </p>
                  <h1 className="mt-2 text-4xl leading-none text-white sm:text-5xl">{bike.name}</h1>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-steel">
                    Đời {bike.year} · {bike.machine || "Máy zin"} · {bike.condition}
                  </p>
                  <div className="my-6 border-y border-white/10 py-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-steel">
                      Giá tham khảo
                    </p>
                    <p className="mt-1 font-display text-4xl text-primary">
                      {getPublicPrice(bike)}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Giá có thể thay đổi theo màu, phiên bản và thời điểm.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bike.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-primary/30 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 grid gap-2">
                    <a
                      href="tel:0353979453"
                      className="flex h-12 items-center justify-center gap-2 bg-primary text-sm font-bold uppercase tracking-wider text-black"
                    >
                      <Phone className="h-4 w-4" /> Gọi 0353.979.453
                    </a>
                    <a
                      href="https://zalo.me/0353979453"
                      className="flex h-12 items-center justify-center gap-2 border border-primary text-sm font-bold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-black"
                    >
                      <MessageCircle className="h-4 w-4" /> Tư vấn qua Zalo
                    </a>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 border border-white/10 bg-background/80 p-3 text-center">
                  {[
                    { a: "32 điểm", b: "Kiểm định" },
                    { a: "Rõ ràng", b: "Giấy tờ" },
                    { a: "Tận tâm", b: "Hậu mãi" },
                  ].map((item) => (
                    <div key={item.b} className="border-r border-white/10 px-2 last:border-0">
                      <ShieldCheck className="mx-auto h-4 w-4 text-primary" />
                      <strong className="mt-1 block text-[10px] text-white">{item.a}</strong>
                      <span className="text-[8px] uppercase tracking-wider text-steel">
                        {item.b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="pb-16 pt-16">
              <SectionTitle eyebrow="Gợi ý từ cửa hàng" title="XE CÙNG PHÂN KHÚC" />
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => (
                  <BikeCard key={item.slug} bike={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between border-b border-white/10 pb-3">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-3xl text-white">{title}</h2>
      </div>
      <span className="hazard-stripes h-1.5 w-16" />
    </div>
  );
}
