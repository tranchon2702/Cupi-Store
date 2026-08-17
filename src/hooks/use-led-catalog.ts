import { useCallback, useEffect, useState } from "react";
import { ledServices as seedServices, type LedService } from "@/data/led-services";
import { ledRepository } from "@/services/led-repository";

export function useLedCatalog() {
  const [services, setServices] = useState<LedService[]>(seedServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setServices(await ledRepository.load());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không tải được dịch vụ LED.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsertService = useCallback(async (service: LedService) => {
    const saved = await ledRepository.upsert(service);
    setServices((current) => {
      const found = current.some((item) => item.slug === saved.slug);
      return found
        ? current.map((item) => (item.slug === saved.slug ? saved : item))
        : [saved, ...current];
    });
    window.dispatchEvent(new CustomEvent("cupi-led-change"));
    return saved;
  }, []);

  const removeService = useCallback(async (slug: string) => {
    await ledRepository.remove(slug);
    setServices((current) => current.filter((item) => item.slug !== slug));
    window.dispatchEvent(new CustomEvent("cupi-led-change"));
  }, []);

  const resetServices = useCallback(async () => {
    const records = await ledRepository.reset(seedServices);
    setServices(records);
    window.dispatchEvent(new CustomEvent("cupi-led-change"));
  }, []);

  useEffect(() => {
    const sync = () => void refresh();
    window.addEventListener("cupi-led-change", sync);
    return () => window.removeEventListener("cupi-led-change", sync);
  }, [refresh]);

  return { services, loading, error, refresh, upsertService, removeService, resetServices };
}
