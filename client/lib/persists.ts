export function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return safeParseJSON<T>(window.localStorage.getItem(key), fallback);
}

export function storageSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function storageRemove(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}