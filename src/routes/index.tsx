import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Gauge, Search, SlidersHorizontal } from "lucide-react";
import banner from "@/assets/cupi-garage-banner.jpg";
import { BikeCard } from "@/components/BikeCard";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { BIKE_BRANDS, BIKE_TYPES } from "@/data/bikes";
import { useBikeInventory } from "@/hooks/use-bike-inventory";
import { matchesPriceFilter, PRICE_FILTERS } from "@/lib/price-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CU PI STORE — Mua bán, trao đổi & nâng cấp xe máy" },
      {
        name: "description",
        content:
          "Mua bán, thu mua và trao đổi xe máy cũ Honda, Yamaha, Suzuki, Piaggio, Vespa tại CU PI STORE. Xe được kiểm tra kỹ, thông tin rõ ràng và hỗ trợ tận tâm.",
      },
      { property: "og:title", content: "CU PI STORE — Xe máy tuyển chọn tại Biên Hòa" },
      {
        property: "og:description",
        content: "Mua xe an tâm, bán xe giá tốt, thu mua và trao đổi xe máy tại Biên Hòa.",
      },
    ],
  }),
  component: Home,
});

const SORTS = [
  { id: "new", label: "Mới đăng gần đây" },
  { id: "year", label: "Đời xe cao nhất" },
  { id: "odo", label: "Số km thấp nhất" },
] as const;

function Home() {
  const { inventory } = useBikeInventory();
  const [type, setType] = useState("Tất cả");
  const [brand, setBrand] = useState("Tất cả");
  const [engine, setEngine] = useState("Tất cả");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("new");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    const filtered = inventory.filter((bike) => {
      const inEngine =
        engine === "Tất cả" ||
        (engine === "Dưới 150cc"
          ? bike.engine < 150
          : engine === "150–175cc"
            ? bike.engine >= 150 && bike.engine <= 175
            : bike.engine > 175);
      return (
        (type === "Tất cả" || bike.type === type) &&
        (brand === "Tất cả" || bike.brand === brand) &&
        matchesPriceFilter(bike, price) &&
        inEngine &&
        (!normalized ||
          `${bike.name} ${bike.brand} ${bike.tags.join(" ")}`
            .toLocaleLowerCase("vi")
            .includes(normalized))
      );
    });
    return [...filtered].sort((a, b) =>
      sort === "odo" ? a.odo - b.odo : sort === "year" ? b.year - a.year : 0,
    );
  }, [inventory, type, brand, engine, price, sort, query]);

  const resetFilters = () => {
    setType("Tất cả");
    setBrand("Tất cả");
    setEngine("Tất cả");
    setPrice("all");
    setQuery("");
  };

  return (
    <div className="grid-tech min-h-screen">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#070809]">
        <div className="hero-aurora absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:gap-10 sm:py-10 lg:min-h-[650px] lg:grid-cols-2 lg:items-center lg:py-12">
          <div className="z-10 min-w-0">
            <p className="mb-3 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs sm:tracking-[0.24em]">
              Kiểm tra kỹ · Thông tin rõ · Hỗ trợ tận tâm
            </p>
            <h1 className="text-[clamp(1.9rem,4.55vw,3.65rem)] leading-[1.08] tracking-[0.005em] text-white">
              <span className="block whitespace-nowrap">MUA CỦA NGƯỜI CHÁN</span>
              <span className="mt-1.5 block whitespace-nowrap text-primary sm:mt-2">
                BÁN CHO NGƯỜI CẦN
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Xe cũ rõ nguồn gốc, được kiểm tra kỹ trước khi giao và hỗ trợ tận tâm sau mua. CU PI
              STORE nhận thu mua, trao đổi xe nhanh gọn — định giá minh bạch, thủ tục rõ ràng.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#kho-xe"
                className="clip-tag inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-black sm:text-sm"
              >
                Xem xe tại cửa hàng <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://zalo.me/0353979453"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:border-primary hover:text-primary sm:text-sm"
              >
                Thu mua / đổi xe <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[660px]">
            <div className="absolute -inset-5 bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden border border-primary/30 bg-black/80 p-2 shadow-[0_0_70px_-20px_rgba(250,190,22,0.35)]">
              <img
                src={banner}
                alt="CU PI STORE và dàn xe tại cửa hàng"
                width={1254}
                height={1254}
                fetchPriority="high"
                className="aspect-square h-auto w-full object-contain"
              />
              <span className="absolute left-0 top-0 h-12 w-12 border-l-2 border-t-2 border-primary" />
              <span className="absolute bottom-0 right-0 h-12 w-12 border-b-2 border-r-2 border-primary" />
            </div>
          </div>
        </div>
        <div className="hazard-stripes h-2" />
      </section>

      <section id="kho-xe" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:py-14">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Danh sách xe · Cập nhật liên tục
            </p>
            <h2 className="mt-2 text-4xl text-white sm:text-5xl">
              XE TẠI <span className="text-outline">CỬA HÀNG</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Honda, Yamaha, Suzuki, Piaggio, Vespa và các thương hiệu phổ biến — tìm đúng xe chỉ
            trong vài thao tác.
          </p>
        </div>

        <div className="filter-panel border border-white/10 bg-surface/90 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm SH, Exciter, Vespa..."
                className="h-12 w-full border border-white/10 bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-steel focus:border-primary"
              />
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-12 border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
            >
              {SORTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <FilterButtons
              label="Hãng xe"
              options={["Tất cả", ...BIKE_BRANDS]}
              value={brand}
              onChange={setBrand}
            />
            <FilterButtons
              label="Loại xe"
              options={["Tất cả", ...BIKE_TYPES]}
              value={type}
              onChange={setType}
            />
          </div>

          <div className="mt-5 grid gap-5 border-t border-white/10 pt-5 lg:grid-cols-[1fr_1.35fr_auto] lg:items-end">
            <FilterButtons
              label="Phân khối"
              options={["Tất cả", "Dưới 150cc", "150–175cc", "Trên 175cc"]}
              value={engine}
              onChange={setEngine}
            />
            <FilterButtons
              label="Khoảng giá"
              options={PRICE_FILTERS}
              value={price}
              onChange={setPrice}
            />
            <button
              onClick={resetFilters}
              className="flex h-10 items-center justify-center gap-2 border border-white/10 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <SlidersHorizontal className="h-4 w-4" /> Đặt lại
            </button>
          </div>
        </div>

        <div className="mb-5 mt-9 flex items-center justify-between border-b border-white/10 pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">
            <span className="text-primary">{list.length}</span> xe phù hợp
          </p>
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-steel">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Thông tin minh bạch
          </span>
        </div>

        {list.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((bike) => (
              <BikeCard key={bike.slug} bike={bike} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/15 py-16 text-center">
            <Gauge className="mx-auto h-9 w-9 text-steel" />
            <p className="mt-4 text-lg font-semibold">Chưa có xe khớp bộ lọc</p>
            <button onClick={resetFilters} className="mt-2 text-sm text-primary hover:underline">
              Xóa bộ lọc để xem toàn bộ kho xe
            </button>
          </div>
        )}

        <div className="mt-12 border border-primary/25 bg-primary/[0.06] p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-3xl text-white">CHƯA THẤY MẪU XE BẠN CẦN?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Gửi yêu cầu, đội ngũ Cu Pi sẽ hỗ trợ tìm xe phù hợp ngân sách.
            </p>
          </div>
          <a
            href="tel:0353979453"
            className="mt-4 inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-black sm:mt-0"
          >
            Gọi tư vấn <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FilterButtons({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly (string | { id: string; label: string })[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-steel">{label}</p>
      <div className="no-scrollbar -mx-1 flex flex-nowrap gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.id;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <button
              key={optionValue}
              onClick={() => onChange(optionValue)}
              className={`min-h-10 shrink-0 px-2.5 py-2 text-[11px] font-semibold transition ${value === optionValue ? "bg-primary text-black" : "border border-white/10 bg-background text-muted-foreground hover:border-primary/60 hover:text-primary"}`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
