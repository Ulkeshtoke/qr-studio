import QRCode from "qrcode";

/**
 * Escapes reserved characters for Wi-Fi QR strings (ZXing standard).
 * Reserved characters include: backslash, semicolon, colon, comma, and double quote.
 */
export function escapeWifiString(str) {
  if (!str) return "";
  return str.replace(/([\\;,:"])/g, "\\$1");
}

/**
 * Normalizes phone numbers by removing spaces and separators while keeping leading '+'.
 * Example: "+91 98765 43210" -> "+919876543210"
 */
export function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Normalizes a URL input, prepending 'https://' if protocol is omitted.
 * Preserves paths, query parameters, and fragments.
 * Example: "example.com?ref=gdg#section" -> "https://example.com?ref=gdg#section"
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validates a URL using the standard URL constructor.
 * Accepts http:// and https:// protocols.
 * Supports paths, query strings, and fragments.
 */
export function isValidUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  const normalized = normalizeUrl(trimmed);
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname;
    if (!host || host.includes(" ") || host.startsWith(".") || host.endsWith(".")) {
      return false;
    }
    if (host !== "localhost" && !host.includes(".")) {
      return false;
    }
    if (host !== "localhost") {
      const parts = host.split(".");
      const tld = parts[parts.length - 1];
      if (!tld || tld.length < 2 || !/^[a-zA-Z0-9-]+$/.test(tld)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts a hex color string (#RGB or #RRGGBB) to numeric RGB values.
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return { r: 0, g: 0, b: 0 };
  let cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates relative luminance according to WCAG 2.1 specification:
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B.
 */
export function calculateRelativeLuminance(color) {
  const rgb = typeof color === "string" ? hexToRgb(color) : color;
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors.
 */
export function calculateContrastRatio(fgColor, bgColor) {
  const lum1 = calculateRelativeLuminance(fgColor);
  const lum2 = calculateRelativeLuminance(bgColor);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Contrast threshold is a heuristic, not a guarantee of QR scan success.
export const WCAG_QR_MIN_CONTRAST = 3.0;

/**
 * Checks whether colors meet the 3:1 contrast heuristic for QR readability.
 */
export function checkQrContrast(fgColor, bgColor) {
  const ratio = calculateContrastRatio(fgColor, bgColor);
  const isLowContrast = ratio < WCAG_QR_MIN_CONTRAST;
  const lum1 = calculateRelativeLuminance(fgColor);
  const lum2 = calculateRelativeLuminance(bgColor);
  const isInverted = lum1 > lum2;

  return {
    ratio: Number(ratio.toFixed(2)),
    isLowContrast,
    isInverted,
    isGoodContrast: !isLowContrast,
  };
}

/**
 * Builds the standard payload string for the selected QR type.
 */
export function buildQrPayload(type, formState) {
  switch (type) {
    case "url": {
      return normalizeUrl(formState.url);
    }
    case "text":
      return formState.text.trim();
    case "email": {
      const email = formState.email.trim();
      if (!email) return "";
      const params = [];
      if (formState.emailSubject?.trim()) {
        params.push(`subject=${encodeURIComponent(formState.emailSubject.trim())}`);
      }
      if (formState.emailBody?.trim()) {
        params.push(`body=${encodeURIComponent(formState.emailBody.trim())}`);
      }
      const query = params.length > 0 ? `?${params.join("&")}` : "";
      return `mailto:${email}${query}`;
    }
    case "phone": {
      const normalized = normalizePhone(formState.phone);
      if (!normalized) return "";
      return `tel:${normalized}`;
    }
    case "wifi": {
      const ssid = formState.wifiSsid.trim();
      if (!ssid) return "";
      const auth = formState.wifiAuth || "WPA";
      const escapedSsid = escapeWifiString(ssid);
      if (auth === "nopass") {
        return `WIFI:T:nopass;S:${escapedSsid};;`;
      }
      const escapedPass = escapeWifiString(formState.wifiPassword);
      return `WIFI:T:${auth};S:${escapedSsid};P:${escapedPass};;`;
    }
    default:
      return "";
  }
}

/**
 * Validates inputs for the active QR type.
 */
export function validateForm(type, formState) {
  const errors = {};

  switch (type) {
    case "url": {
      const url = formState.url?.trim() || "";
      if (!url) {
        errors.url = "URL is required.";
      } else if (!isValidUrl(url)) {
        errors.url = "Please enter a valid URL (e.g. example.com or https://example.com).";
      }
      break;
    }
    case "text": {
      if (!formState.text?.trim()) {
        errors.text = "Text content cannot be empty.";
      }
      break;
    }
    case "email": {
      const email = formState.email?.trim() || "";
      if (!email) {
        errors.email = "Email address is required.";
      } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          errors.email = "Please enter a valid email address.";
        }
      }
      break;
    }
    case "phone": {
      const phone = formState.phone?.trim() || "";
      if (!phone) {
        errors.phone = "Phone number is required.";
      } else {
        const normalized = normalizePhone(phone);
        const digits = normalized.replace(/\D/g, "");
        if (digits.length < 6 || digits.length > 15) {
          errors.phone = "Please enter a valid phone number (6 to 15 digits).";
        }
      }
      break;
    }
    case "wifi": {
      const ssid = formState.wifiSsid?.trim() || "";
      if (!ssid) {
        errors.wifiSsid = "Network name (SSID) is required.";
      }
      if (formState.wifiAuth !== "nopass") {
        const pass = formState.wifiPassword || "";
        if (!pass) {
          errors.wifiPassword = "Password is required for secured networks.";
        } else if (formState.wifiAuth === "WPA" && pass.length < 8) {
          errors.wifiPassword = "WPA passwords must be at least 8 characters.";
        } else if (formState.wifiAuth === "WEP" && pass.length < 5) {
          errors.wifiPassword = "WEP passwords must be at least 5 characters.";
        }
      }
      break;
    }
    default:
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Centrally builds QR rendering options from the configuration.
 * Single source of truth for Preview, PNG, SVG, and Copy.
 * Strictly enforces Quiet Zone (4 to 8 modules, default 4).
 * Sizes clamped to 256px - 1024px.
 */
export function buildQrOptions(config = {}, overrideOptions = {}) {
  const level = overrideOptions.level || overrideOptions.errorCorrectionLevel || config.level || config.errorCorrectionLevel || "M";
  const rawMargin = overrideOptions.margin !== undefined ? overrideOptions.margin : config.margin;
  const margin = Math.min(8, Math.max(4, Number(rawMargin !== undefined && !isNaN(Number(rawMargin)) ? rawMargin : 4)));
  const fgColor = overrideOptions.fgColor || config.fgColor || "#000000";
  const bgColor = overrideOptions.bgColor || config.bgColor || "#ffffff";
  const rawSize = overrideOptions.size || config.size || 512;
  const size = Math.min(1024, Math.max(256, Number(rawSize !== undefined && !isNaN(Number(rawSize)) ? rawSize : 512)));

  return {
    width: size,
    margin,
    errorCorrectionLevel: level,
    color: {
      dark: fgColor,
      light: bgColor,
    },
    size,
    level,
    fgColor,
    bgColor,
  };
}

export const QR_ERROR_TOO_LARGE = "This content is too large for the current QR settings. Try shorter content or a lower error-correction level.";

/**
 * Generates a PNG data URL using the unified QR options.
 */
export async function generateQrDataUrl(text, config = {}, overrideOptions = {}) {
  if (!text) return "";
  const opts = buildQrOptions(config, overrideOptions);

  try {
    return await QRCode.toDataURL(text, {
      width: opts.width,
      margin: opts.margin,
      errorCorrectionLevel: opts.errorCorrectionLevel,
      color: opts.color,
    });
  } catch (err) {
    if (err && (String(err).includes("too big") || String(err).includes("too much"))) {
      throw new Error(QR_ERROR_TOO_LARGE, { cause: err });
    }
    throw err;
  }
}

/**
 * Generates an SVG string using the unified QR options.
 */
export async function generateQrSvg(text, config = {}, overrideOptions = {}) {
  if (!text) return "";
  const opts = buildQrOptions(config, overrideOptions);

  try {
    return await QRCode.toString(text, {
      type: "svg",
      width: opts.width,
      margin: opts.margin,
      errorCorrectionLevel: opts.errorCorrectionLevel,
      color: opts.color,
    });
  } catch (err) {
    if (err && (String(err).includes("too big") || String(err).includes("too much"))) {
      throw new Error(QR_ERROR_TOO_LARGE, { cause: err });
    }
    throw err;
  }
}
