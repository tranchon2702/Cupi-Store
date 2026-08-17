import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Lightbulb, Search, ShieldCheck, Zap } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { LED_CATEGORIES } from "@/data/led-services";
import { useLedCatalog } from "@/hooks/use-led-catalog";
import { formatPublicPrice } from "@/lib/price-utils";

export const Route = createFileRoute("/den-led-xe-may")({
  head: () => ({
    meta: [
      { title: "Làm đèn LED xe máy — CU PI STORE" },
      {
        name: "description",
        content:
          "Nâng cấp bi cầu LED, đèn trợ sáng, mạch LED và combo ánh sáng xe máy tại CU PI STORE.",
      },
    ],
  }),
  component: LedPage,
});

function LedPage() {
  const { services } = useLedCatalog();
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi");
    return services.filter(
      (service) =>
        (category === "Tất cả" || service.category === category) &&
        (!keyword ||
          `${service.name} ${service.category} ${service.tags.join(" ")}`
            .toLocaleLowerCase("vi")
            .includes(keyword)),
    );
  }, [services, category, query]);

  return (
    <div className="grid-tech min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-black">
          <div className="hero-aurora absolute inset-0" />
          <div className="relative mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:py-20">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[10px] sm:tracking-[0.25em]">
                Ánh sáng đúng chuẩn · Đi đêm an tâm hơn
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                LÀM ĐÈN LED <span className="block text-primary">CHO XE MÁY</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Tư vấn cấu hình theo nhu cầu đi phố, đi tour và công suất điện của từng xe. Thi công
                gọn dây, chống nước và căn chỉnh ánh sáng trước khi bàn giao.
              </p>
            </div>
            <a
              href="https://zalo.me/0353979453"
              className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-6 text-xs font-bold uppercase tracking-wider text-black"
            >
              Gửi hình xe qua Zalo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Hạng mục đang nhận làm
              </p>
              <h2 className="mt-2 text-4xl text-white sm:text-5xl">CẤU HÌNH ÁNH SÁNG</h2>
            </div>
            <label className="relative block w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm bi cầu, trợ sáng, mạch LED..."
                className="h-11 w-full border border-white/10 bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-steel focus:border-primary"
              />
            </label>
          </div>

          <div className="no-scrollbar -mx-1 mb-7 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {["Tất cả", ...LED_CATEGORIES].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`min-h-10 shrink-0 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition ${category === item ? "bg-primary text-black" : "border border-white/10 bg-surface text-muted-foreground hover:border-primary hover:text-primary"}`}
              >
                {item}
              </button>
            ))}
          </div>

          {filtered.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((service) => (
                <article
                  key={service.slug}
                  className="card-garage clip-blade overflow-hidden border border-white/10 bg-surface"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={service.cover}
                      alt={service.name}
                      loading="lazy"
                      width={1200}
                      height={900}
                      className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                    />
                    <span className="clip-tag absolute left-0 top-3 bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                      {service.category}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-4">
                      <h3 className="text-2xl leading-none text-white">{service.name}</h3>
                      <p className="shrink-0 font-display text-2xl font-bold text-primary">
                        {formatPublicPrice(service)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {service.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-primary/30 bg-primary/5 px-2 py-1 text-[9px] uppercase tracking-wider text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-steel">
                        <ShieldCheck className="h-4 w-4 text-primary" /> {service.warranty}
                      </span>
                      <a
                        href="https://zalo.me/0353979453"
                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        Tư vấn →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-white/15 py-16 text-center">
              <Lightbulb className="mx-auto h-9 w-9 text-steel" />
              <p className="mt-4 text-lg font-semibold">Chưa có hạng mục phù hợp</p>
            </div>
          )}

          <div className="mt-12 grid gap-3 border border-primary/20 bg-primary/[0.04] p-5 sm:grid-cols-3">
            {[
              { icon: Zap, text: "Kiểm tra nguồn sạc trước khi lên cấu hình" },
              { icon: CheckCircle2, text: "Căn cos/pha và kiểm tra thực tế sau lắp" },
              { icon: ShieldCheck, text: "Lưu thông tin cấu hình để hỗ trợ bảo hành" },
            ].map(({ icon: Icon, text }) => (
              <p key={text} className="flex items-center gap-3 text-xs leading-5 text-foreground">
                <Icon className="h-5 w-5 shrink-0 text-primary" /> {text}
              </p>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
