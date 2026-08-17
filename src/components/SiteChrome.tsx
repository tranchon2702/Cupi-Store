import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo-web.png";
import { goToHomeSection } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16">
        <Link to="/" className="group flex items-center" aria-label="CU PI STORE - Trang chủ">
          <img
            src={logo}
            alt="Racing Cu Pi Biên Hòa"
            width={800}
            height={337}
            className="h-auto w-[90px] object-contain transition group-hover:brightness-110 sm:w-[105px]"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground md:flex">
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              goToHomeSection("kho-xe");
            }}
            className="transition hover:text-primary"
          >
            Xe tại cửa hàng
          </a>
          <Link to="/den-led-xe-may" className="transition hover:text-primary">
            Làm đèn LED
          </Link>
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              goToHomeSection("lien-he");
            }}
            className="transition hover:text-primary"
          >
            Liên hệ
          </a>
        </nav>

        <a
          href="tel:0353979453"
          className="flex items-center gap-2 text-primary md:hidden"
          aria-label="Gọi CU PI STORE"
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs font-bold">GỌI NGAY</span>
        </a>
      </div>
      <nav className="grid grid-cols-3 border-t border-white/10 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground md:hidden">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            goToHomeSection("kho-xe");
          }}
          className="flex min-h-10 items-center justify-center px-2 py-2 transition hover:bg-white/5 hover:text-primary"
        >
          Xe tại cửa hàng
        </a>
        <Link
          to="/den-led-xe-may"
          className="flex min-h-10 items-center justify-center border-x border-white/10 px-2 py-2 transition hover:bg-white/5 hover:text-primary"
        >
          Làm đèn LED
        </Link>
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            goToHomeSection("lien-he");
          }}
          className="flex min-h-10 items-center justify-center px-2 py-2 transition hover:bg-white/5 hover:text-primary"
        >
          Liên hệ
        </a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <>
      <footer id="lien-he" className="border-t border-white/10 bg-black">
        <div className="hazard-stripes h-1.5 w-full" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <img
              src={logo}
              alt="Racing Cu Pi Biên Hòa"
              width={800}
              height={337}
              loading="lazy"
              className="h-auto w-full max-w-[190px] object-contain"
            />
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Thu mua · trao đổi · bán xe máy cũ tuyển chọn. Kiểm tra kỹ trước khi giao và hỗ trợ
              hậu mãi tận tâm.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Biên Hòa, Đồng Nai
              </span>
              <a href="tel:0353979453" className="flex items-center gap-2 hover:text-primary">
                <Phone className="h-4 w-4 text-primary" /> 0353.979.453
              </a>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-steel">
            © {new Date().getFullYear()} CU PI STORE
          </p>
        </div>
      </footer>
      <SocialChatWidget />
    </>
  );
}

const SOCIAL_LINKS = [
  { name: "Zalo", href: "https://zalo.me/0353979453", icon: "/brands/zalo.svg" },
  {
    name: "Facebook",
    href: "https://www.facebook.com/ho.can.544249",
    icon: "/brands/facebook.svg",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@chxm139?_r=1&_t=ZS-98wlWYQXAGX",
    icon: "/brands/tiktok.svg",
  },
] as const;

function SocialChatWidget() {
  return (
    <div className="fixed bottom-4 right-3 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <div className="flex flex-col items-end gap-2">
        {SOCIAL_LINKS.map((social, index) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className="contact-option group flex items-center gap-2"
            style={{ animationDelay: `${index * 110}ms` }}
            aria-label={`Liên hệ qua ${social.name}`}
          >
            <span className="hidden rounded-full border border-white/10 bg-black/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl sm:block sm:opacity-0 sm:transition sm:group-hover:opacity-100">
              {social.name}
            </span>
            <span className="social-racing-ring grid h-11 w-11 place-items-center transition group-hover:scale-105 sm:h-12 sm:w-12">
              <img
                src={social.icon}
                alt={`Logo ${social.name}`}
                width={24}
                height={24}
                className={social.name === "TikTok" ? "brightness-0 invert" : ""}
              />
            </span>
          </a>
        ))}
      </div>

      <a
        href="tel:0353979453"
        className="contact-attention group flex items-center gap-2"
        aria-label="Gọi CU PI STORE"
      >
        <span className="hidden rounded-full border border-white/10 bg-black/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl sm:block sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          Gọi ngay
        </span>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-black shadow-[0_12px_38px_rgba(250,190,22,0.35)] transition group-hover:scale-105 sm:h-14 sm:w-14">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
      </a>
    </div>
  );
}
