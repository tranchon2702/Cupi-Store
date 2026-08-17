import type { VehicleOption, VehicleOptionKind } from "@/data/vehicle-options";

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch("/api/vehicle-options", {
    credentials: "same-origin",
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      statusMessage?: string;
      message?: string;
    } | null;
    throw new Error(body?.statusMessage || body?.message || "Không thể cập nhật danh mục xe.");
  }
  return response.json() as Promise<T>;
}

export const vehicleOptionRepository = {
  load: () => request<VehicleOption[]>(),
  add: (kind: VehicleOptionKind, name: string) =>
    request<VehicleOption>({ method: "POST", body: JSON.stringify({ kind, name }) }),
  rename: (slug: string, name: string) =>
    request<VehicleOption>({ method: "PUT", body: JSON.stringify({ slug, name }) }),
  remove: (slug: string) =>
    request<{ deleted: boolean }>({ method: "DELETE", body: JSON.stringify({ slug }) }),
};
