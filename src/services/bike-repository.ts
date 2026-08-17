import type { Bike } from "@/data/bikes";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      statusMessage?: string;
      message?: string;
    } | null;
    throw new Error(body?.statusMessage || body?.message || "Không thể kết nối máy chủ.");
  }
  return response.json() as Promise<T>;
}

export const bikeRepository = {
  load: () => request<Bike[]>("/api/bikes"),
  upsert: (bike: Bike) =>
    request<Bike>("/api/bikes", { method: "PUT", body: JSON.stringify(bike) }),
  remove: (slug: string) =>
    request<{ deleted: boolean }>(`/api/bikes/${encodeURIComponent(slug)}`, { method: "DELETE" }),
  reset: (items: Bike[]) =>
    request<Bike[]>("/api/bikes/reset", { method: "PUT", body: JSON.stringify({ items }) }),
};
