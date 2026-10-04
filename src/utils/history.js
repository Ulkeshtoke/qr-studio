/**
 * History storage, migration, and privacy utilities for QR Studio.
 */

export const OLD_STORAGE_KEY = "gdg_qr_studio_history_v1";
export const STORAGE_KEY = "gdg_qr_studio_history_v2";

const VALID_TYPES = ["url", "text", "email", "phone", "wifi"];
const VALID_LEVELS = ["L", "M", "Q", "H"];

/**
 * Sanitizes a single history item using an explicit allow-list.
 * Ensures Wi-Fi passwords and payloads are never retained.
 * Clamps margins below 4 to 4.
 */
export function sanitizeHistoryItem(rawItem) {
  if (!rawItem || typeof rawItem !== "object") return null;

  const type = String(rawItem.type || "").toLowerCase();
  if (!VALID_TYPES.includes(type)) return null;

  const id = typeof rawItem.id === "string" && rawItem.id ? rawItem.id : `qr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = typeof rawItem.timestamp === "number" ? rawItem.timestamp : Date.now();
  const title = typeof rawItem.title === "string" ? rawItem.title.slice(0, 100) : "QR Code";

  // Wi-Fi privacy rule: Never store passwords or payloads containing credentials
  let payload = "";
  if (type !== "wifi" && typeof rawItem.payload === "string") {
    payload = rawItem.payload;
  }

  // Sanitize config
  const rawConfig = rawItem.config && typeof rawItem.config === "object" ? rawItem.config : {};
  const fgColor = typeof rawConfig.fgColor === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(rawConfig.fgColor) ? rawConfig.fgColor : "#000000";
  const bgColor = typeof rawConfig.bgColor === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(rawConfig.bgColor) ? rawConfig.bgColor : "#ffffff";
  const level = VALID_LEVELS.includes(rawConfig.level) ? rawConfig.level : "M";

  // Margins must be strictly clamped between 4 and 8
  const rawMargin = Number(rawConfig.margin);
  const margin = isNaN(rawMargin) ? 4 : Math.min(8, Math.max(4, rawMargin));

  // Sizes clamped between 256 and 1024
  const rawSize = Number(rawConfig.size);
  const size = isNaN(rawSize) ? 512 : Math.min(1024, Math.max(256, rawSize));

  // Sanitize formState
  const rawFormState = rawConfig.formState && typeof rawConfig.formState === "object" ? rawConfig.formState : {};
  const formState = {
    url: typeof rawFormState.url === "string" ? rawFormState.url : "",
    text: typeof rawFormState.text === "string" ? rawFormState.text : "",
    email: typeof rawFormState.email === "string" ? rawFormState.email : "",
    emailSubject: typeof rawFormState.emailSubject === "string" ? rawFormState.emailSubject : "",
    emailBody: typeof rawFormState.emailBody === "string" ? rawFormState.emailBody : "",
    phone: typeof rawFormState.phone === "string" ? rawFormState.phone : "",
    wifiSsid: typeof rawFormState.wifiSsid === "string" ? rawFormState.wifiSsid : "",
    wifiAuth: typeof rawFormState.wifiAuth === "string" && ["WPA", "WEP", "nopass"].includes(rawFormState.wifiAuth) ? rawFormState.wifiAuth : "WPA",
    wifiPassword: "", // Privacy rule: ALWAYS blank
  };

  return {
    id,
    timestamp,
    type,
    title,
    payload,
    config: {
      type,
      formState,
      fgColor,
      bgColor,
      size,
      level,
      margin,
    },
  };
}

/**
 * Checks whether two history items are exact duplicates.
 * Never uses password as a comparison key.
 * Distinguishes Wi-Fi entries with same SSID but different security types.
 */
export function isDuplicateHistoryItem(a, b) {
  if (!a || !b) return false;
  if (a.type !== b.type) return false;

  // Colors and visual configuration must match to be considered a duplicate
  if (
    a.config?.fgColor !== b.config?.fgColor ||
    a.config?.bgColor !== b.config?.bgColor ||
    a.config?.level !== b.config?.level ||
    a.config?.margin !== b.config?.margin ||
    a.config?.size !== b.config?.size
  ) {
    return false;
  }

  // Type-specific content comparison
  if (a.type === "wifi") {
    const aSsid = a.config?.formState?.wifiSsid || "";
    const bSsid = b.config?.formState?.wifiSsid || "";
    const aAuth = a.config?.formState?.wifiAuth || "WPA";
    const bAuth = b.config?.formState?.wifiAuth || "WPA";
    // Must have same SSID AND same security type
    return aSsid === bSsid && aAuth === bAuth;
  }

  return a.payload === b.payload && a.title === b.title;
}

/**
 * Migrates old history from gdg_qr_studio_history_v1 to gdg_qr_studio_history_v2.
 * ALWAYS deletes the old key regardless of whether parsing/sanitization succeeded.
 */
export function migrateOldHistory(storage = (typeof window !== "undefined" ? window.localStorage : null)) {
  if (!storage) return [];

  let oldItems = [];
  let oldKeyFound = false;

  try {
    const oldRaw = storage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      oldKeyFound = true;
      try {
        const parsed = JSON.parse(oldRaw);
        if (Array.isArray(parsed)) {
          oldItems = parsed;
        }
      } catch {
        // Corrupt JSON - ignore corrupt data, privacy priority
      }
    }
  } finally {
    // Privacy invariant: ALWAYS remove the old key
    if (oldKeyFound) {
      try {
        storage.removeItem(OLD_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }

  const sanitizedOld = oldItems
    .map(sanitizeHistoryItem)
    .filter(Boolean);

  return sanitizedOld;
}

/**
 * Loads and initializes history from storage, performing migration if needed.
 */
export function loadHistory(storage = (typeof window !== "undefined" ? window.localStorage : null)) {
  if (!storage) return [];

  // Check for migrated items from old key
  const migratedItems = migrateOldHistory(storage);

  let currentItems = [];
  try {
    const currentRaw = storage.getItem(STORAGE_KEY);
    if (currentRaw) {
      const parsed = JSON.parse(currentRaw);
      if (Array.isArray(parsed)) {
        currentItems = parsed.map(sanitizeHistoryItem).filter(Boolean);
      }
    }
  } catch {
    currentItems = [];
  }

  // Merge migrated items into current history without duplicates
  const combined = [...currentItems];
  for (const item of migratedItems) {
    if (!combined.some((c) => isDuplicateHistoryItem(c, item))) {
      combined.push(item);
    }
  }

  const result = combined.slice(0, 10);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Storage quota or unavailable
  }

  return result;
}

/**
 * Persists history to storage under the versioned key.
 */
export function persistHistory(items, storage = (typeof window !== "undefined" ? window.localStorage : null)) {
  if (!storage) return;
  const sanitized = items.map(sanitizeHistoryItem).filter(Boolean).slice(0, 10);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Storage quota or unavailable
  }
}
