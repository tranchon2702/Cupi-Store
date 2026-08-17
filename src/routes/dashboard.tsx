import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Bike as BikeIcon,
  Check,
  ExternalLink,
  ImagePlus,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { getPublicPrice, type Bike } from "@/data/bikes";
import { LED_CATEGORIES, type LedService } from "@/data/led-services";
import { optionNames, type VehicleOption, type VehicleOptionKind } from "@/data/vehicle-options";
import dashboardLogo from "@/assets/logo-web.png";
import { useBikeInventory } from "@/hooks/use-bike-inventory";
import { useLedCatalog } from "@/hooks/use-led-catalog";
import { useVehicleOptions } from "@/hooks/use-vehicle-options";
import { optimizeImages } from "@/lib/image-utils";
import {
  formatPublicPrice,
  formatVehiclePrice,
  getPriceMillion,
  inferVehiclePriceBand,
  type PriceMode,
} from "@/lib/price-utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Quản lý xe — CU PI STORE" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

type BikeForm = {
  originalSlug: string;
  name: string;
  brand: string;
  type: Bike["type"];
  year: string;
  priceMode: PriceMode;
  priceMillion: string;
  priceBandMode: "head" | "auto";
  engine: string;
  machine: string;
  condition: Bike["condition"];
  description: string;
  tags: string;
  power: string;
  weight: string;
  warranty: string;
  images: string[];
};

type LedForm = {
  originalSlug: string;
  name: string;
  category: LedService["category"];
  priceMode: PriceMode;
  priceMillion: string;
  description: string;
  tags: string;
  warranty: string;
  images: string[];
};

const emptyForm = (): BikeForm => ({
  originalSlug: "",
  name: "",
  brand: "Honda",
  type: "Tay ga",
  year: String(new Date().getFullYear()),
  priceMode: "range",
  priceMillion: "1",
  priceBandMode: "head",
  engine: "150",
  machine: "Máy zin",
  condition: "Đã qua sử dụng",
  description: "",
  tags: "ABS, Smartkey",
  power: "",
  weight: "",
  warranty: "36 tháng",
  images: [],
});

const emptyLedForm = (): LedForm => ({
  originalSlug: "",
  name: "",
  category: "Bi cầu LED",
  priceMode: "range",
  priceMillion: "1",
  description: "",
  tags: "Ánh sáng gom, Chống nước",
  warranty: "Bảo hành 12 tháng",
  images: [],
});

const slugify = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function Dashboard() {
  const { inventory, error: bikeLoadError, upsertBike, removeBike } = useBikeInventory();
  const { services, error: ledLoadError, upsertService, removeService } = useLedCatalog();
  const {
    options: vehicleOptions,
    error: optionLoadError,
    addOption,
    renameOption,
    removeOption,
  } = useVehicleOptions();
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "guest">("loading");
  const [form, setForm] = useState<BikeForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [initialForm, setInitialForm] = useState("");
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState("");
  const [ledForm, setLedForm] = useState<LedForm>(emptyLedForm);
  const [showLedEditor, setShowLedEditor] = useState(false);
  const [initialLedForm, setInitialLedForm] = useState("");
  const [confirmingLedClose, setConfirmingLedClose] = useState(false);
  const [ledProcessing, setLedProcessing] = useState(false);
  const [ledNotice, setLedNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [ledSaving, setLedSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "inventory" | "led">("overview");
  const [showOptionManager, setShowOptionManager] = useState(false);
  const [optionDrafts, setOptionDrafts] = useState<Record<VehicleOptionKind, string>>({
    brand: "",
    type: "",
    machine: "",
  });
  const [editingOption, setEditingOption] = useState<{ slug: string; name: string } | null>(null);
  const [deletingOption, setDeletingOption] = useState("");
  const [optionNotice, setOptionNotice] = useState("");
  const [optionSaving, setOptionSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then((response) => response.json())
      .then((session: { authenticated?: boolean }) =>
        setAuthState(session.authenticated ? "authenticated" : "guest"),
      )
      .catch(() => setAuthState("guest"));
  }, []);

  useEffect(() => {
    const clearLegacyHash = () => {
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
    };
    clearLegacyHash();
    window.addEventListener("hashchange", clearLegacyHash);
    return () => window.removeEventListener("hashchange", clearLegacyHash);
  }, []);

  useEffect(() => {
    if (authState !== "authenticated") return;
    const updateActiveSection = () => {
      const inventoryTop =
        document.getElementById("inventory")?.getBoundingClientRect().top ??
        Number.POSITIVE_INFINITY;
      const ledTop =
        document.getElementById("led-services")?.getBoundingClientRect().top ??
        Number.POSITIVE_INFINITY;
      const marker = Math.min(220, window.innerHeight * 0.32);
      const pageIsScrollable = document.documentElement.scrollHeight > window.innerHeight + 24;
      const atBottom =
        pageIsScrollable &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24;
      setActiveSection(
        atBottom || ledTop <= marker ? "led" : inventoryTop <= marker ? "inventory" : "overview",
      );
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [authState]);

  const scrollToDashboardSection = (id: "overview" | "inventory" | "led-services") => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    setActiveSection(id === "led-services" ? "led" : id);
  };

  const filtered = useMemo(
    () =>
      inventory.filter((bike) =>
        `${bike.name} ${bike.brand}`
          .toLocaleLowerCase("vi")
          .includes(query.toLocaleLowerCase("vi")),
      ),
    [inventory, query],
  );

  const editBike = (bike: Bike) => {
    const find = (label: string) => bike.specs.find((spec) => spec.label === label)?.value ?? "";
    const priceMillion = getPriceMillion(bike);
    const nextForm: BikeForm = {
      originalSlug: bike.slug,
      name: bike.name,
      brand: bike.brand,
      type: bike.type,
      year: String(bike.year),
      priceMode: priceMillion === null ? "contact" : "range",
      priceMillion: String(priceMillion ?? 1),
      priceBandMode: bike.priceBand && bike.priceBand !== "head" ? "auto" : "head",
      engine: String(bike.engine),
      machine: bike.machine || "Máy zin",
      condition: bike.condition,
      description: bike.description,
      tags: bike.tags.join(", "),
      power: find("Công suất"),
      weight: find("Khối lượng"),
      warranty:
        find("Bảo hành / Cam kết") || find("Bảo hành / ODO") || "Cam kết máy móc tại cửa hàng",
      images: bike.gallery,
    };
    setForm(nextForm);
    setInitialForm(JSON.stringify(nextForm));
    setShowEditor(true);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startNew = () => {
    const nextForm = {
      ...emptyForm(),
      brand: optionNames(vehicleOptions, "brand")[0] || "",
      type: optionNames(vehicleOptions, "type")[0] || "",
      machine: optionNames(vehicleOptions, "machine")[0] || "",
    };
    setForm(nextForm);
    setInitialForm(JSON.stringify(nextForm));
    setShowEditor(true);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setProcessing(true);
    setNotice("Đang tối ưu ảnh để tải nhanh mà vẫn sắc nét...");
    try {
      const optimized = await optimizeImages(Array.from(files));
      setForm((current) => ({ ...current, images: [...current.images, ...optimized].slice(0, 8) }));
      setNotice(`Đã tối ưu ${optimized.length} ảnh (WebP, tối đa 1440px).`);
    } catch {
      setNotice("Không xử lý được ảnh này. Vui lòng thử ảnh JPG, PNG hoặc WebP khác.");
    } finally {
      setProcessing(false);
    }
  };

  const saveBike = async (closeAfter = false) => {
    const priceMillion = form.priceMode === "range" ? Number(form.priceMillion) : null;
    const priceBand = form.priceBandMode === "auto" ? inferVehiclePriceBand(priceMillion) : "head";
    if (!form.name.trim() || !form.images.length) {
      setNotice("Vui lòng nhập tên và ít nhất một ảnh xe.");
      return false;
    }
    if (
      form.priceMode === "range" &&
      (!Number.isInteger(priceMillion) ||
        priceMillion === null ||
        priceMillion < 1 ||
        priceMillion > 100)
    ) {
      setNotice("Mức giá phải là số triệu nguyên từ 1 đến 100.");
      return false;
    }
    const slug = form.originalSlug || `${slugify(form.name)}-${Date.now().toString().slice(-5)}`;
    const bike: Bike = {
      slug,
      name: form.name.trim(),
      brand: form.brand,
      type: form.type,
      year: Number(form.year),
      price: 0,
      priceMillion,
      priceBand,
      priceLabel: formatVehiclePrice({ priceMillion, priceBand }),
      engine: Number(form.engine),
      machine: form.machine,
      condition: form.condition,
      cover: form.images[0]!,
      gallery: form.images,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 5),
      description: form.description.trim(),
      specs: [
        { label: "Động cơ", value: `${form.engine}cc` },
        { label: "Công suất", value: form.power || "Đang cập nhật" },
        { label: "Khối lượng", value: form.weight || "Đang cập nhật" },
        {
          label: "Bảo hành / Cam kết",
          value: form.warranty || "Cam kết máy móc tại cửa hàng",
        },
      ],
    };
    setSaving(true);
    try {
      const savedBike = await upsertBike(bike);
      setNotice(form.originalSlug ? "Đã cập nhật thông tin xe." : "Đã đăng xe mới lên kho.");
      const savedForm = { ...form, originalSlug: slug, images: savedBike.gallery };
      setForm(savedForm);
      setInitialForm(JSON.stringify(savedForm));
      setConfirmingClose(false);
      if (closeAfter) setShowEditor(false);
      return true;
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Không thể lưu xe lên máy chủ.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const requestCloseEditor = () => {
    if (JSON.stringify(form) === initialForm) {
      setShowEditor(false);
      return;
    }
    setConfirmingClose(true);
  };

  const confirmDelete = async (bike: Bike) => {
    if (window.confirm(`Xóa ${bike.name} và toàn bộ ảnh lưu kèm?`)) {
      try {
        await removeBike(bike.slug);
        setNotice(`Đã xóa ${bike.name} và dữ liệu ảnh đi kèm.`);
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Không thể xóa xe.");
      }
    }
  };

  const startNewLed = () => {
    const nextForm = emptyLedForm();
    setLedForm(nextForm);
    setInitialLedForm(JSON.stringify(nextForm));
    setLedNotice("");
    setShowLedEditor(true);
  };

  const editLed = (service: LedService) => {
    const priceMillion = getPriceMillion(service);
    const nextForm: LedForm = {
      originalSlug: service.slug,
      name: service.name,
      category: service.category,
      priceMode: priceMillion === null ? "contact" : "range",
      priceMillion: String(priceMillion ?? 1),
      description: service.description,
      tags: service.tags.join(", "),
      warranty: service.warranty,
      images: service.gallery,
    };
    setLedForm(nextForm);
    setInitialLedForm(JSON.stringify(nextForm));
    setLedNotice("");
    setShowLedEditor(true);
  };

  const onLedImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setLedProcessing(true);
    setLedNotice("Đang tối ưu ảnh LED...");
    try {
      const optimized = await optimizeImages(Array.from(files));
      setLedForm((current) => ({
        ...current,
        images: [...current.images, ...optimized].slice(0, 8),
      }));
      setLedNotice(`Đã tối ưu ${optimized.length} ảnh WebP.`);
    } catch {
      setLedNotice("Không xử lý được ảnh. Vui lòng chọn JPG, PNG hoặc WebP khác.");
    } finally {
      setLedProcessing(false);
    }
  };

  const saveLed = async (closeAfter = false) => {
    const priceMillion = ledForm.priceMode === "range" ? Number(ledForm.priceMillion) : null;
    if (!ledForm.name.trim() || !ledForm.images.length) {
      setLedNotice("Vui lòng nhập tên và ít nhất một ảnh.");
      return false;
    }
    if (
      ledForm.priceMode === "range" &&
      (!Number.isInteger(priceMillion) ||
        priceMillion === null ||
        priceMillion < 1 ||
        priceMillion > 100)
    ) {
      setLedNotice("Mức giá phải là số triệu nguyên từ 1 đến 100.");
      return false;
    }
    const slug =
      ledForm.originalSlug || `${slugify(ledForm.name)}-${Date.now().toString().slice(-5)}`;
    const service: LedService = {
      slug,
      name: ledForm.name.trim(),
      category: ledForm.category,
      priceMillion,
      priceLabel: formatPublicPrice({ priceMillion }),
      description: ledForm.description.trim(),
      tags: ledForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 5),
      warranty: ledForm.warranty.trim() || "Liên hệ bảo hành",
      cover: ledForm.images[0]!,
      gallery: ledForm.images,
    };
    setLedSaving(true);
    try {
      const savedService = await upsertService(service);
      const savedForm = { ...ledForm, originalSlug: slug, images: savedService.gallery };
      setLedForm(savedForm);
      setInitialLedForm(JSON.stringify(savedForm));
      setLedNotice(
        ledForm.originalSlug ? "Đã cập nhật dịch vụ đèn LED." : "Đã đăng dịch vụ đèn LED.",
      );
      setConfirmingLedClose(false);
      if (closeAfter) setShowLedEditor(false);
      return true;
    } catch (reason) {
      setLedNotice(reason instanceof Error ? reason.message : "Không thể lưu dịch vụ lên máy chủ.");
      return false;
    } finally {
      setLedSaving(false);
    }
  };

  const requestCloseLed = () => {
    if (JSON.stringify(ledForm) === initialLedForm) {
      setShowLedEditor(false);
      return;
    }
    setConfirmingLedClose(true);
  };

  const confirmDeleteLed = async (service: LedService) => {
    if (window.confirm(`Xóa ${service.name} và toàn bộ ảnh lưu kèm?`)) {
      try {
        await removeService(service.slug);
        setLedNotice(`Đã xóa ${service.name} và dữ liệu ảnh đi kèm.`);
      } catch (reason) {
        setLedNotice(reason instanceof Error ? reason.message : "Không thể xóa dịch vụ.");
      }
    }
  };

  const createVehicleOption = async (kind: VehicleOptionKind) => {
    const name = optionDrafts[kind].trim();
    if (!name) return;
    setOptionSaving(true);
    setOptionNotice("");
    try {
      await addOption(kind, name);
      setOptionDrafts((current) => ({ ...current, [kind]: "" }));
      setOptionNotice(`Đã thêm “${name}”.`);
    } catch (reason) {
      setOptionNotice(reason instanceof Error ? reason.message : "Không thể thêm danh mục.");
    } finally {
      setOptionSaving(false);
    }
  };

  const saveVehicleOptionName = async () => {
    if (!editingOption?.name.trim()) return;
    setOptionSaving(true);
    setOptionNotice("");
    try {
      await renameOption(editingOption.slug, editingOption.name.trim());
      setOptionNotice("Đã đổi tên và cập nhật các xe đang sử dụng.");
      setEditingOption(null);
    } catch (reason) {
      setOptionNotice(reason instanceof Error ? reason.message : "Không thể đổi tên danh mục.");
    } finally {
      setOptionSaving(false);
    }
  };

  const confirmRemoveVehicleOption = async (slug: string) => {
    setOptionSaving(true);
    setOptionNotice("");
    try {
      await removeOption(slug);
      setDeletingOption("");
      setOptionNotice("Đã xóa danh mục.");
    } catch (reason) {
      setOptionNotice(reason instanceof Error ? reason.message : "Không thể xóa danh mục.");
    } finally {
      setOptionSaving(false);
    }
  };

  if (authState === "loading") return <DashboardLoading />;
  if (authState === "guest")
    return <AdminLogin onAuthenticated={() => setAuthState("authenticated")} />;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setAuthState("guest");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0c0e] text-foreground">
      <header className="border-b border-white/10 bg-[#101114]">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={dashboardLogo}
              alt="CU PI STORE"
              className="h-10 w-auto max-w-[170px] object-contain sm:h-12 sm:max-w-[210px]"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Xem website <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="grid h-9 w-9 place-items-center border border-white/10 text-steel hover:border-primary hover:text-primary"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 grid grid-cols-2 border-b border-white/10 bg-[#0f1012] lg:hidden">
        <button
          type="button"
          onClick={() => scrollToDashboardSection("inventory")}
          className={`flex h-11 items-center justify-center gap-2 border-r border-white/10 text-xs font-bold uppercase tracking-wider ${activeSection === "inventory" ? "bg-primary text-black" : "text-white"}`}
        >
          <BikeIcon
            className={`h-4 w-4 ${activeSection === "inventory" ? "text-black" : "text-primary"}`}
          />{" "}
          Kho xe
        </button>
        <button
          type="button"
          onClick={() => scrollToDashboardSection("led-services")}
          className={`flex h-11 items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider ${activeSection === "led" ? "bg-primary text-black" : "text-white"}`}
        >
          <Lightbulb
            className={`h-4 w-4 ${activeSection === "led" ? "text-black" : "text-primary"}`}
          />{" "}
          Đèn LED
        </button>
      </nav>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[230px_1fr]">
        <aside className="sticky top-0 hidden h-screen self-start overflow-y-auto border-r border-white/10 bg-[#0f1012] p-4 lg:block">
          <p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[0.24em] text-steel">
            Quản trị
          </p>
          <button
            type="button"
            onClick={() => scrollToDashboardSection("overview")}
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${activeSection === "overview" ? "bg-primary text-black" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
          >
            <LayoutDashboard className="h-4 w-4" /> Tổng quan
          </button>
          <button
            type="button"
            onClick={() => scrollToDashboardSection("inventory")}
            className={`mt-1 flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${activeSection === "inventory" ? "bg-primary text-black" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
          >
            <BikeIcon className="h-4 w-4" /> Kho xe
          </button>
          <button
            onClick={startNew}
            className="mt-1 flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <Plus className="h-4 w-4" /> Đăng xe mới
          </button>
          <button
            type="button"
            onClick={() => scrollToDashboardSection("led-services")}
            className={`mt-1 flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${activeSection === "led" ? "bg-primary text-black" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
          >
            <Lightbulb className="h-4 w-4" /> Dịch vụ đèn LED
          </button>
          <button
            onClick={startNewLed}
            className="mt-1 flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <Plus className="h-4 w-4" /> Thêm dịch vụ LED
          </button>
        </aside>

        <main id="overview" className="min-w-0 scroll-mt-14 p-4 sm:p-6 lg:p-8">
          {(bikeLoadError || ledLoadError || optionLoadError) && (
            <div className="mb-5 border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
              Không kết nối được dữ liệu máy chủ. {bikeLoadError || ledLoadError || optionLoadError}
            </div>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Khu vực quản trị
              </p>
              <h1 className="mt-1 text-3xl text-white sm:text-4xl">QUẢN LÝ CỬA HÀNG</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Chọn việc cần làm, nhập thông tin rồi bấm lưu để cập nhật website.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowOptionManager((current) => !current)}
                className="flex h-11 items-center justify-center gap-2 border border-white/15 px-5 text-xs font-bold uppercase tracking-wider text-white hover:border-primary hover:text-primary"
              >
                <Settings2 className="h-4 w-4" /> Danh mục xe
              </button>
              <button
                onClick={startNewLed}
                className="flex h-11 items-center justify-center gap-2 border border-primary px-5 text-xs font-bold uppercase tracking-wider text-primary"
              >
                <Lightbulb className="h-4 w-4" /> Thêm dịch vụ LED
              </button>
              <button
                onClick={startNew}
                className="flex h-11 items-center justify-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-wider text-black"
              >
                <Plus className="h-4 w-4" /> Thêm xe mới
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Stat
              label="Tổng xe trong kho"
              value={String(inventory.length)}
              sub="Đang hiển thị trên website"
            />
            <Stat
              label="Dịch vụ đèn LED"
              value={String(services.length)}
              sub="Dịch vụ đang hiển thị"
            />
            <Stat
              label="Hãng xe đang có"
              value={String(new Set(inventory.map((bike) => bike.brand)).size)}
              sub="Hãng hiện có xe trong kho"
            />
          </div>

          {showOptionManager && (
            <VehicleOptionManager
              options={vehicleOptions}
              drafts={optionDrafts}
              editing={editingOption}
              deletingSlug={deletingOption}
              notice={optionNotice}
              saving={optionSaving}
              onDraftChange={(kind, value) =>
                setOptionDrafts((current) => ({ ...current, [kind]: value }))
              }
              onAdd={(kind) => void createVehicleOption(kind)}
              onStartEdit={(slug, name) => setEditingOption({ slug, name })}
              onEditChange={(name) =>
                setEditingOption((current) => (current ? { ...current, name } : null))
              }
              onSaveEdit={() => void saveVehicleOptionName()}
              onCancelEdit={() => setEditingOption(null)}
              onAskDelete={setDeletingOption}
              onConfirmDelete={(slug) => void confirmRemoveVehicleOption(slug)}
              onCancelDelete={() => setDeletingOption("")}
            />
          )}

          {!inventory.length && !services.length && (
            <section className="mt-5 border border-primary/25 bg-primary/[0.04] p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Bắt đầu nhanh
              </p>
              <h2 className="mt-1 text-2xl text-white">BẠN MUỐN ĐĂNG NỘI DUNG GÌ?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Chỉ cần nhập thông tin chính và chọn ảnh; hệ thống sẽ tự tối ưu ảnh trước khi lưu.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={startNew}
                  className="flex items-center gap-4 border border-primary bg-primary px-4 py-4 text-left text-black"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center bg-black/10">
                    <BikeIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <strong className="block text-sm uppercase">Đăng một chiếc xe</strong>
                    <small className="mt-1 block text-[11px]">
                      Thông tin xe, giá và tối đa 8 ảnh
                    </small>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={startNewLed}
                  className="flex items-center gap-4 border border-white/15 bg-[#121316] px-4 py-4 text-left text-white hover:border-primary"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center bg-primary/10 text-primary">
                    <Lightbulb className="h-5 w-5" />
                  </span>
                  <span>
                    <strong className="block text-sm uppercase">Đăng dịch vụ đèn LED</strong>
                    <small className="mt-1 block text-[11px] text-muted-foreground">
                      Loại dịch vụ, giá, bảo hành và hình ảnh
                    </small>
                  </span>
                </button>
              </div>
            </section>
          )}

          {showEditor && (
            <div
              className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) requestCloseEditor();
              }}
            >
              <section className="mx-auto w-full max-w-6xl border border-primary/30 bg-[#121316] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
                  <div>
                    <p className="font-display text-2xl text-white">
                      {form.originalSlug ? "CHỈNH SỬA XE" : "ĐĂNG XE MỚI"}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-steel">
                      Ảnh đầu tiên là ảnh đại diện ngoài card
                    </p>
                  </div>
                  <button
                    onClick={requestCloseEditor}
                    className="p-2 text-steel hover:text-white"
                    aria-label="Đóng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveBike();
                  }}
                  className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[1fr_380px]"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tên xe *" className="sm:col-span-2">
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Honda SH160i ABS"
                        required
                      />
                    </Field>
                    <Field label="Hãng xe">
                      <select
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      >
                        {optionNames(vehicleOptions, "brand").map((brand) => (
                          <option key={brand}>{brand}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Loại xe">
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as Bike["type"] })}
                      >
                        {optionNames(vehicleOptions, "type").map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Năm sản xuất">
                      <input
                        type="number"
                        min="1990"
                        max="2035"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                      />
                    </Field>
                    <Field label="Cách hiển thị giá">
                      <select
                        value={form.priceMode}
                        onChange={(event) =>
                          setForm({ ...form, priceMode: event.target.value as PriceMode })
                        }
                      >
                        <option value="range">Ẩn theo đầu giá — 2X, 3X...</option>
                        <option value="contact">Liên hệ</option>
                      </select>
                    </Field>
                    <Field
                      label={
                        form.priceMode === "range"
                          ? "Mốc giá để lọc (không công khai) *"
                          : "Hiển thị"
                      }
                    >
                      {form.priceMode === "range" ? (
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          value={form.priceMillion}
                          onChange={(event) =>
                            setForm({ ...form, priceMillion: event.target.value })
                          }
                          placeholder="Ví dụ: 31"
                          required
                        />
                      ) : (
                        <input value="Liên hệ" readOnly />
                      )}
                      {form.priceMode === "range" && (
                        <small className="mt-1.5 block text-[10px] leading-4 text-steel">
                          Ví dụ nhập 38 để xe nằm đúng bộ lọc giá; khách không thấy số 38.
                        </small>
                      )}
                      <small className="mt-1.5 block text-[10px] text-primary">
                        Khách sẽ thấy:{" "}
                        {formatVehiclePrice({
                          priceMillion:
                            form.priceMode === "range" ? Number(form.priceMillion) : null,
                          priceBand:
                            form.priceBandMode === "auto"
                              ? inferVehiclePriceBand(
                                  form.priceMode === "range" ? Number(form.priceMillion) : null,
                                )
                              : "head",
                        })}
                      </small>
                    </Field>
                    {form.priceMode === "range" &&
                      Number(form.priceMillion) >= 10 &&
                      Number(form.priceMillion) < 100 && (
                        <Field label="Cách ghi công khai">
                          <select
                            value={form.priceBandMode}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                priceBandMode: event.target.value as "head" | "auto",
                              })
                            }
                          >
                            <option value="head">Chỉ hiện đầu — 3X triệu</option>
                            <option value="auto">Tự ghi nhỏ / trung / lớn theo mốc giá</option>
                          </select>
                          <small className="mt-1.5 block text-[10px] leading-4 text-steel">
                            31 → 3X nhỏ · 35 → 3X trung · 38 → 3X lớn.
                          </small>
                        </Field>
                      )}
                    <Field label="Phân khối (cc)">
                      <input
                        type="number"
                        min="49"
                        value={form.engine}
                        onChange={(e) => setForm({ ...form, engine: e.target.value })}
                      />
                    </Field>
                    <Field label="Máy">
                      <select
                        value={form.machine}
                        onChange={(event) => setForm({ ...form, machine: event.target.value })}
                      >
                        {optionNames(vehicleOptions, "machine").map((machine) => (
                          <option key={machine}>{machine}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Công suất">
                      <input
                        value={form.power}
                        onChange={(e) => setForm({ ...form, power: e.target.value })}
                        placeholder="15,4 HP / 8.500 rpm"
                      />
                    </Field>
                    <Field label="Khối lượng">
                      <input
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        placeholder="134 kg"
                      />
                    </Field>
                    <Field label="Bảo hành">
                      <input
                        value={form.warranty}
                        onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                        placeholder="36 tháng chính hãng"
                      />
                    </Field>
                    <Field label="Nhãn nổi bật" className="sm:col-span-2">
                      <input
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="ABS, Smartkey, Một chủ (ngăn cách bằng dấu phẩy)"
                      />
                    </Field>
                    <Field label="Mô tả chi tiết" className="sm:col-span-2">
                      <textarea
                        rows={5}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Tình trạng xe, lịch sử bảo dưỡng, phụ kiện đi kèm..."
                      />
                    </Field>
                  </div>

                  <div>
                    <label className="group grid min-h-36 cursor-pointer place-items-center border border-dashed border-white/20 bg-background/50 p-5 text-center transition hover:border-primary">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => onImages(e.target.files)}
                      />
                      <span>
                        <ImagePlus className="mx-auto h-8 w-8 text-primary" />
                        <strong className="mt-3 block text-sm text-white">Tải ảnh xe lên</strong>
                        <small className="mt-1 block text-[10px] leading-5 text-steel">
                          Tối đa 8 ảnh · tự làm nhẹ nhưng vẫn giữ độ nét
                          <br />
                          Ảnh được chuẩn hóa để website tải nhanh
                        </small>
                      </span>
                    </label>
                    {processing && (
                      <div className="mt-3 h-1 overflow-hidden bg-white/10">
                        <div className="h-full w-2/3 animate-pulse bg-primary" />
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {form.images.map((image, index) => (
                        <div
                          key={`${image.slice(-20)}-${index}`}
                          className="group relative aspect-square overflow-hidden border border-white/10"
                        >
                          <img
                            src={image}
                            alt={`Ảnh xe ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 text-[8px] text-white">
                            {index === 0 ? "Ảnh card" : index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                images: current.images.filter((_, i) => i !== index),
                              }))
                            }
                            className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-black/80 text-white opacity-0 transition group-hover:opacity-100"
                            aria-label={`Xóa ảnh ${index + 1}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {notice && (
                      <p className="mt-3 border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-primary">
                        {notice}
                      </p>
                    )}
                    <div className="mt-5 flex gap-2">
                      <button
                        type="submit"
                        disabled={saving || processing}
                        className="flex h-11 flex-1 items-center justify-center gap-2 bg-primary px-4 text-xs font-bold uppercase tracking-wider text-black"
                      >
                        <Check className="h-4 w-4" />{" "}
                        {saving ? "Đang lưu..." : form.originalSlug ? "Lưu thay đổi" : "Đăng xe"}
                      </button>
                      <button
                        type="button"
                        onClick={requestCloseEditor}
                        className="h-11 border border-white/15 px-4 text-xs font-bold uppercase text-muted-foreground"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </form>
              </section>
              {confirmingClose && (
                <UnsavedChangesDialog
                  onSave={() => {
                    void saveBike(true);
                  }}
                  onDiscard={() => {
                    setConfirmingClose(false);
                    setShowEditor(false);
                  }}
                  onContinue={() => setConfirmingClose(false)}
                />
              )}
            </div>
          )}

          {showLedEditor && (
            <div
              className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) requestCloseLed();
              }}
            >
              <section className="mx-auto w-full max-w-5xl border border-primary/30 bg-[#121316] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
                  <div>
                    <p className="font-display text-2xl text-white">
                      {ledForm.originalSlug ? "CHỈNH SỬA DỊCH VỤ LED" : "ĐĂNG DỊCH VỤ LED"}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-steel">
                      Ảnh đầu tiên là ảnh đại diện ngoài card
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={requestCloseLed}
                    className="p-2 text-steel hover:text-white"
                    aria-label="Đóng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveLed();
                  }}
                  className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_340px]"
                >
                  <div className="grid content-start gap-4 sm:grid-cols-2">
                    <Field label="Tên dịch vụ *" className="sm:col-span-2">
                      <input
                        value={ledForm.name}
                        onChange={(event) => setLedForm({ ...ledForm, name: event.target.value })}
                        placeholder="Ví dụ: Nâng cấp bi cầu LED cho Honda SH"
                        required
                      />
                    </Field>
                    <Field label="Nhóm dịch vụ">
                      <select
                        value={ledForm.category}
                        onChange={(event) =>
                          setLedForm({
                            ...ledForm,
                            category: event.target.value as LedService["category"],
                          })
                        }
                      >
                        {LED_CATEGORIES.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cách hiển thị giá">
                      <select
                        value={ledForm.priceMode}
                        onChange={(event) =>
                          setLedForm({
                            ...ledForm,
                            priceMode: event.target.value as PriceMode,
                          })
                        }
                      >
                        <option value="range">Giá khoảng — trXXX</option>
                        <option value="contact">Liên hệ</option>
                      </select>
                    </Field>
                    <Field
                      label={ledForm.priceMode === "range" ? "Số triệu (1–100) *" : "Hiển thị"}
                    >
                      {ledForm.priceMode === "range" ? (
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          value={ledForm.priceMillion}
                          onChange={(event) =>
                            setLedForm({ ...ledForm, priceMillion: event.target.value })
                          }
                          placeholder="Ví dụ: 2"
                          required
                        />
                      ) : (
                        <input value="Liên hệ" readOnly />
                      )}
                      <small className="mt-1.5 block text-[10px] text-primary">
                        Khách sẽ thấy:{" "}
                        {formatPublicPrice({
                          priceMillion:
                            ledForm.priceMode === "range" ? Number(ledForm.priceMillion) : null,
                        })}
                      </small>
                    </Field>
                    <Field label="Bảo hành" className="sm:col-span-2">
                      <input
                        value={ledForm.warranty}
                        onChange={(event) =>
                          setLedForm({ ...ledForm, warranty: event.target.value })
                        }
                        placeholder="Bảo hành 12 tháng"
                      />
                    </Field>
                    <Field label="Nhãn nổi bật" className="sm:col-span-2">
                      <input
                        value={ledForm.tags}
                        onChange={(event) => setLedForm({ ...ledForm, tags: event.target.value })}
                        placeholder="Ánh sáng gom, Chống nước (ngăn cách bằng dấu phẩy)"
                      />
                    </Field>
                    <Field label="Thông tin chi tiết" className="sm:col-span-2">
                      <textarea
                        rows={6}
                        value={ledForm.description}
                        onChange={(event) =>
                          setLedForm({ ...ledForm, description: event.target.value })
                        }
                        placeholder="Dòng xe phù hợp, cấu hình đèn, thời gian thi công..."
                      />
                    </Field>
                  </div>

                  <div>
                    <label className="group grid min-h-36 cursor-pointer place-items-center border border-dashed border-white/20 bg-background/50 p-5 text-center transition hover:border-primary">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(event) => onLedImages(event.target.files)}
                      />
                      <span>
                        <ImagePlus className="mx-auto h-8 w-8 text-primary" />
                        <strong className="mt-3 block text-sm text-white">
                          Tải ảnh dịch vụ lên
                        </strong>
                        <small className="mt-1 block text-[10px] leading-5 text-steel">
                          Tối đa 8 ảnh · tự làm nhẹ nhưng vẫn giữ độ nét
                          <br />
                          Xóa dịch vụ sẽ xóa luôn các ảnh lưu kèm
                        </small>
                      </span>
                    </label>
                    {ledProcessing && (
                      <div className="mt-3 h-1 overflow-hidden bg-white/10">
                        <div className="h-full w-2/3 animate-pulse bg-primary" />
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {ledForm.images.map((image, index) => (
                        <div
                          key={`${image.slice(-20)}-${index}`}
                          className="group relative aspect-square overflow-hidden border border-white/10"
                        >
                          <img
                            src={image}
                            alt={`Ảnh LED ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 text-[8px] text-white">
                            {index === 0 ? "Ảnh card" : index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setLedForm((current) => ({
                                ...current,
                                images: current.images.filter(
                                  (_, imageIndex) => imageIndex !== index,
                                ),
                              }))
                            }
                            className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-black/80 text-white opacity-0 transition group-hover:opacity-100"
                            aria-label={`Xóa ảnh LED ${index + 1}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {ledNotice && (
                      <p className="mt-3 border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-primary">
                        {ledNotice}
                      </p>
                    )}
                    <div className="mt-5 flex gap-2">
                      <button
                        type="submit"
                        disabled={ledSaving || ledProcessing}
                        className="flex h-11 flex-1 items-center justify-center gap-2 bg-primary px-4 text-xs font-bold uppercase tracking-wider text-black"
                      >
                        <Check className="h-4 w-4" />
                        {ledSaving
                          ? "Đang lưu..."
                          : ledForm.originalSlug
                            ? "Lưu thay đổi"
                            : "Đăng dịch vụ"}
                      </button>
                      <button
                        type="button"
                        onClick={requestCloseLed}
                        className="h-11 border border-white/15 px-4 text-xs font-bold uppercase text-muted-foreground"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              {confirmingLedClose && (
                <UnsavedChangesDialog
                  onSave={() => {
                    void saveLed(true);
                  }}
                  onDiscard={() => {
                    setConfirmingLedClose(false);
                    setShowLedEditor(false);
                  }}
                  onContinue={() => setConfirmingLedClose(false)}
                />
              )}
            </div>
          )}

          <section id="inventory" className="mt-6 scroll-mt-14 border border-white/10 bg-[#121316]">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl text-white">DANH SÁCH XE</h2>
                <p className="text-[10px] uppercase tracking-wider text-steel">
                  {filtered.length} bản ghi
                </p>
              </div>
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm trong kho..."
                    className="h-10 w-full min-w-56 border border-white/10 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] uppercase tracking-[0.18em] text-steel">
                    <th className="px-4 py-3">Xe</th>
                    <th className="px-4 py-3">Hãng / Loại</th>
                    <th className="px-4 py-3">Giá bán</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {!filtered.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <BikeIcon className="mx-auto h-8 w-8 text-primary" />
                        <strong className="mt-3 block text-sm text-white">
                          {query ? "Không tìm thấy xe phù hợp" : "Kho xe đang trống"}
                        </strong>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {query
                            ? "Thử từ khóa khác hoặc xóa nội dung tìm kiếm."
                            : "Thêm chiếc xe đầu tiên để hiển thị trên website."}
                        </p>
                        {!query && (
                          <button
                            type="button"
                            onClick={startNew}
                            className="mt-4 inline-flex h-10 items-center gap-2 bg-primary px-4 text-xs font-bold uppercase text-black"
                          >
                            <Plus className="h-4 w-4" /> Thêm xe đầu tiên
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                  {filtered.map((bike) => (
                    <tr
                      key={bike.slug}
                      className="border-b border-white/5 text-sm last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={bike.cover}
                            alt=""
                            className="h-12 w-16 border border-white/10 object-cover"
                          />
                          <div>
                            <strong className="block text-white">{bike.name}</strong>
                            <span className="text-[10px] text-steel">
                              {bike.year} · {bike.machine || "Máy zin"} · {bike.condition}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white">{bike.brand}</span>
                        <span className="block text-[10px] text-steel">{bike.type}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {getPublicPrice(bike)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to="/xe/$slug"
                            params={{ slug: bike.slug }}
                            className="inline-flex h-8 items-center gap-1.5 border border-white/10 px-2 text-steel hover:border-primary hover:text-primary"
                            title="Xem trang xe"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Xem</span>
                          </Link>
                          <button
                            onClick={() => editBike(bike)}
                            className="inline-flex h-8 items-center gap-1.5 border border-white/10 px-2 text-steel hover:border-primary hover:text-primary"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Sửa</span>
                          </button>
                          <button
                            onClick={() => confirmDelete(bike)}
                            className="inline-flex h-8 items-center gap-1.5 border border-white/10 px-2 text-steel hover:border-red-500 hover:text-red-400"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="led-services"
            className="mt-6 scroll-mt-14 border border-white/10 bg-[#121316]"
          >
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl text-white">DỊCH VỤ ĐÈN LED</h2>
                <p className="text-[10px] uppercase tracking-wider text-steel">
                  {services.length} dịch vụ đang hiển thị
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startNewLed}
                  className="flex h-10 items-center gap-2 bg-primary px-4 text-xs font-bold uppercase text-black"
                >
                  <Plus className="h-4 w-4" /> Thêm dịch vụ
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {!services.length && (
                <div className="border border-dashed border-white/15 p-8 text-center md:col-span-2 xl:col-span-3">
                  <Lightbulb className="mx-auto h-8 w-8 text-primary" />
                  <strong className="mt-3 block text-sm text-white">Chưa có dịch vụ đèn LED</strong>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Thêm dịch vụ đầu tiên để khách xem thông tin và hình ảnh thi công.
                  </p>
                  <button
                    type="button"
                    onClick={startNewLed}
                    className="mt-4 inline-flex h-10 items-center gap-2 bg-primary px-4 text-xs font-bold uppercase text-black"
                  >
                    <Plus className="h-4 w-4" /> Thêm dịch vụ đầu tiên
                  </button>
                </div>
              )}
              {services.map((service) => (
                <article
                  key={service.slug}
                  className="overflow-hidden border border-white/10 bg-background/50"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-black">
                    <img
                      src={service.cover}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 bg-black/85 px-2 py-1 text-[9px] font-bold uppercase text-primary">
                      {service.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-base text-white">{service.name}</h3>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <strong className="text-sm text-primary">{formatPublicPrice(service)}</strong>
                      <span className="text-[9px] text-steel">{service.gallery.length} ảnh</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                      {service.warranty}
                    </p>
                    <div className="mt-3 flex justify-end gap-1 border-t border-white/10 pt-3">
                      <Link
                        to="/den-led-xe-may"
                        className="inline-flex h-8 items-center gap-1.5 border border-white/10 px-2 text-steel hover:border-primary hover:text-primary"
                        title="Xem trang dịch vụ LED"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Xem</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => editLed(service)}
                        className="inline-flex h-8 items-center gap-1.5 border border-white/10 px-2 text-steel hover:border-primary hover:text-primary"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDeleteLed(service)}
                        className="inline-flex h-8 items-center gap-1.5 border border-white/10 px-2 text-steel hover:border-red-500 hover:text-red-400"
                        title="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const VEHICLE_OPTION_GROUPS: Array<{
  kind: VehicleOptionKind;
  title: string;
  placeholder: string;
}> = [
  { kind: "brand", title: "Hãng xe", placeholder: "Ví dụ: Ducati" },
  { kind: "type", title: "Loại xe", placeholder: "Ví dụ: Xe điện" },
  { kind: "machine", title: "Máy", placeholder: "Ví dụ: 62zz" },
];

function VehicleOptionManager({
  options,
  drafts,
  editing,
  deletingSlug,
  notice,
  saving,
  onDraftChange,
  onAdd,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  options: VehicleOption[];
  drafts: Record<VehicleOptionKind, string>;
  editing: { slug: string; name: string } | null;
  deletingSlug: string;
  notice: string;
  saving: boolean;
  onDraftChange: (kind: VehicleOptionKind, value: string) => void;
  onAdd: (kind: VehicleOptionKind) => void;
  onStartEdit: (slug: string, name: string) => void;
  onEditChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onAskDelete: (slug: string) => void;
  onConfirmDelete: (slug: string) => void;
  onCancelDelete: () => void;
}) {
  return (
    <section className="mt-5 border border-primary/25 bg-[#121316] p-4 sm:p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Danh mục dùng chung
        </p>
        <h2 className="mt-1 text-2xl text-white">HÃNG XE · LOẠI XE · MÁY</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Đổi tên sẽ cập nhật các xe đang dùng. Chỉ xóa được mục chưa gán cho xe nào.
        </p>
      </div>

      {notice && (
        <p className="mt-4 border border-primary/25 bg-primary/5 p-3 text-xs text-primary">
          {notice}
        </p>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {VEHICLE_OPTION_GROUPS.map((group) => (
          <div key={group.kind} className="border border-white/10 bg-black/20 p-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{group.title}</h3>
            <div className="mt-3 flex gap-2">
              <input
                value={drafts[group.kind]}
                onChange={(event) => onDraftChange(group.kind, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAdd(group.kind);
                  }
                }}
                placeholder={group.placeholder}
                className="h-10 min-w-0 flex-1 border border-white/10 bg-background px-3 text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={saving || !drafts[group.kind].trim()}
                onClick={() => onAdd(group.kind)}
                className="grid h-10 w-10 shrink-0 place-items-center bg-primary text-black disabled:opacity-40"
                aria-label={`Thêm ${group.title}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {options
                .filter((option) => option.kind === group.kind)
                .map((option) => (
                  <div
                    key={option.slug}
                    className="flex min-h-10 items-center gap-2 border border-white/10 px-2"
                  >
                    {editing?.slug === option.slug ? (
                      <>
                        <input
                          value={editing.name}
                          onChange={(event) => onEditChange(event.target.value)}
                          className="h-8 min-w-0 flex-1 bg-transparent text-xs text-white outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={saving || !editing.name.trim()}
                          onClick={onSaveEdit}
                          className="p-1.5 text-primary disabled:opacity-40"
                          aria-label="Lưu tên"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEdit}
                          className="p-1.5 text-steel hover:text-white"
                          aria-label="Hủy sửa"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : deletingSlug === option.slug ? (
                      <>
                        <span className="min-w-0 flex-1 truncate text-xs text-red-300">
                          Xóa “{option.name}”?
                        </span>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onConfirmDelete(option.slug)}
                          className="px-2 py-1 text-[10px] font-bold uppercase text-red-300"
                        >
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          onClick={onCancelDelete}
                          className="p-1.5 text-steel hover:text-white"
                          aria-label="Hủy xóa"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-xs text-white">
                          {option.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onStartEdit(option.slug, option.name)}
                          className="p-1.5 text-steel hover:text-primary"
                          aria-label={`Sửa ${option.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAskDelete(option.slug)}
                          className="p-1.5 text-steel hover:text-red-300"
                          aria-label={`Xóa ${option.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0b0c0e] px-4">
      <div className="text-center">
        <LockKeyhole className="mx-auto h-9 w-9 animate-pulse text-primary" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-steel">
          Đang kiểm tra phiên quản trị
        </p>
      </div>
    </div>
  );
}

function AdminLogin({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          statusMessage?: string;
          message?: string;
        } | null;
        throw new Error(body?.statusMessage || body?.message || "Không thể đăng nhập.");
      }
      setPassword("");
      onAuthenticated();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Không thể đăng nhập.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid-tech grid min-h-screen place-items-center bg-[#070809] px-4 py-10">
      <div className="w-full max-w-md border border-primary/25 bg-[#111215] p-5 shadow-2xl sm:p-8">
        <Link to="/" className="mx-auto block w-fit">
          <img
            src={dashboardLogo}
            alt="CU PI STORE"
            className="h-20 w-auto max-w-full object-contain"
          />
        </Link>
        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            Khu vực dành cho quản trị viên
          </p>
          <h1 className="mt-2 text-3xl text-white">ĐĂNG NHẬP CMS</h1>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="Tên đăng nhập">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="h-12 w-full border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-primary"
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="h-12 w-full border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-primary"
            />
          </Field>
          {message && (
            <p className="border border-red-500/30 bg-red-500/5 p-3 text-xs leading-5 text-red-300">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 bg-primary text-xs font-bold uppercase tracking-wider text-black disabled:opacity-60"
          >
            <LockKeyhole className="h-4 w-4" />
            {submitting ? "Đang kiểm tra..." : "Đăng nhập quản trị"}
          </button>
        </form>
        <Link
          to="/"
          className="mt-5 block text-center text-[10px] font-bold uppercase tracking-wider text-steel hover:text-primary"
        >
          ← Quay lại website
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-white/10 bg-[#121316] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-steel">{label}</p>
      <p className="mt-2 font-display text-4xl text-primary">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-steel">
        {label}
      </span>
      <div className="cms-field">{children}</div>
    </label>
  );
}

function UnsavedChangesDialog({
  onSave,
  onDiscard,
  onContinue,
}: {
  onSave: () => void;
  onDiscard: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4">
      <div className="w-full max-w-md border border-primary/30 bg-[#151619] p-5 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Có thay đổi chưa lưu
        </p>
        <h3 className="mt-2 text-2xl text-white">BẠN CÓ MUỐN LƯU TRƯỚC KHI ĐÓNG?</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Nếu bỏ thay đổi, nội dung và ảnh vừa nhập sẽ không được giữ lại.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onSave}
            className="bg-primary px-3 py-2.5 text-xs font-bold uppercase text-black"
          >
            Lưu và đóng
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="border border-red-500/40 px-3 py-2.5 text-xs font-bold uppercase text-red-300"
          >
            Bỏ thay đổi
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="border border-white/15 px-3 py-2.5 text-xs font-bold uppercase text-white"
          >
            Nhập tiếp
          </button>
        </div>
      </div>
    </div>
  );
}
