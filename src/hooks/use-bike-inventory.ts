import { useCallback, useEffect, useState } from "react";
import { bikes as seedBikes, type Bike } from "@/data/bikes";
import { bikeRepository } from "@/services/bike-repository";

export function useBikeInventory() {
  const [inventory, setInventory] = useState<Bike[]>(seedBikes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setInventory(await bikeRepository.load());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không tải được danh sách xe.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsertBike = useCallback(async (bike: Bike) => {
    const saved = await bikeRepository.upsert(bike);
    setInventory((current) => {
      const found = current.some((item) => item.slug === saved.slug);
      return found
        ? current.map((item) => (item.slug === saved.slug ? saved : item))
        : [saved, ...current];
    });
    window.dispatchEvent(new CustomEvent("cupi-inventory-change"));
    return saved;
  }, []);

  const removeBike = useCallback(async (slug: string) => {
    await bikeRepository.remove(slug);
    setInventory((current) => current.filter((bike) => bike.slug !== slug));
    window.dispatchEvent(new CustomEvent("cupi-inventory-change"));
  }, []);

  const resetInventory = useCallback(async () => {
    const records = await bikeRepository.reset(seedBikes);
    setInventory(records);
    window.dispatchEvent(new CustomEvent("cupi-inventory-change"));
  }, []);

  useEffect(() => {
    const sync = () => void refresh();
    window.addEventListener("cupi-inventory-change", sync);
    return () => window.removeEventListener("cupi-inventory-change", sync);
  }, [refresh]);

  return { inventory, loading, error, refresh, upsertBike, removeBike, resetInventory };
}
