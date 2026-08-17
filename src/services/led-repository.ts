import type { LedService } from "@/data/led-services";

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

export const ledRepository = {
  load: () => request<LedService[]>("/api/led-services"),
  upsert: (service: LedService) =>
    request<LedService>("/api/led-services", {
      method: "PUT",
      body: JSON.stringify(service),
    }),
  remove: (slug: string) =>
    request<{ deleted: boolean }>(`/api/led-services/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }),
  reset: (items: LedService[]) =>
    request<LedService[]>("/api/led-services/reset", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};
