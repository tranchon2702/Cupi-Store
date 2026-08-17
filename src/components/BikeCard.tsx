import { Link } from "@tanstack/react-router";
import { getPublicPrice, type Bike } from "@/data/bikes";

export function BikeCard({ bike }: { bike: Bike }) {
  return (
    <Link
      to="/xe/$slug"
      params={{ slug: bike.slug }}
      className="card-garage clip-blade group block border border-border"
    >
      <div className="relative overflow-hidden">
        <img
          src={bike.cover}
          alt={bike.name}
          loading="lazy"
          width={1200}
          height={900}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <span className="clip-tag absolute left-0 top-3 bg-primary px-3 py-1 font-display text-sm tracking-widest text-primary-foreground">
          {bike.type}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-steel">
            {bike.brand} · {bike.year}
          </p>
          <h3 className="mt-1 text-2xl leading-none text-foreground transition-colors group-hover:text-primary">
            {bike.name}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 border-y border-border py-3 text-center">
          <Spec label="Máy" value={bike.machine || "Máy zin"} />
          <Spec label="Đời" value={String(bike.year)} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {bike.tags.map((t) => (
            <span
              key={t}
              className="border border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between pt-1">
          <p className="font-display text-2xl text-primary">{getPublicPrice(bike)}</p>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
            Chi tiết →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-steel">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
