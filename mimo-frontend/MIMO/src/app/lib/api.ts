const rawBackendUrl = (import.meta.env.VITE_BACKEND_API_URL || "").trim();

if (!rawBackendUrl) {
  throw new Error("Missing VITE_BACKEND_API_URL. Set it in Vercel project environment variables.");
}

export const API_BASE_URL = rawBackendUrl.replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with '/': ${path}`);
  }
  return `${API_BASE_URL}${path}`;
};

type ApiFetchOptions = {
  timeoutMs?: number;
  retry?: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiFetch = async (
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
) => {
  const timeoutMs = options?.timeoutMs ?? 10000;
  const retry = options?.retry ?? ((init?.method || "GET").toUpperCase() === "GET" ? 1 : 0);

  let attempt = 0;
  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(apiUrl(path), {
        ...init,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error) {
        error.message = `${error.message} (request: ${apiUrl(path)})`;
      }
      if (attempt >= retry) {
        throw error;
      }
      attempt += 1;
      await wait(250 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }
};
