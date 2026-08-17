import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_VEHICLE_OPTIONS,
  type VehicleOption,
  type VehicleOptionKind,
} from "@/data/vehicle-options";
import { vehicleOptionRepository } from "@/services/vehicle-option-repository";

export function useVehicleOptions() {
  const [options, setOptions] = useState<VehicleOption[]>(DEFAULT_VEHICLE_OPTIONS);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setOptions(await vehicleOptionRepository.load());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không tải được danh mục xe.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addOption = useCallback(async (kind: VehicleOptionKind, name: string) => {
    const saved = await vehicleOptionRepository.add(kind, name);
    setOptions((current) => [...current, saved]);
    window.dispatchEvent(new CustomEvent("cupi-options-change"));
    return saved;
  }, []);

  const renameOption = useCallback(async (slug: string, name: string) => {
    const saved = await vehicleOptionRepository.rename(slug, name);
    setOptions((current) => current.map((item) => (item.slug === slug ? saved : item)));
    window.dispatchEvent(new CustomEvent("cupi-options-change"));
    window.dispatchEvent(new CustomEvent("cupi-inventory-change"));
    return saved;
  }, []);

  const removeOption = useCallback(async (slug: string) => {
    await vehicleOptionRepository.remove(slug);
    setOptions((current) => current.filter((item) => item.slug !== slug));
    window.dispatchEvent(new CustomEvent("cupi-options-change"));
  }, []);

  useEffect(() => {
    const sync = () => void refresh();
    window.addEventListener("cupi-options-change", sync);
    return () => window.removeEventListener("cupi-options-change", sync);
  }, [refresh]);

  return { options, error, refresh, addOption, renameOption, removeOption };
}
