/**
 * Color presets for QR codes.
 * Selected for high contrast and reliable optical scanning.
 * Only modifies foreground and background colors.
 */
export const PRESETS = [
  {
    id: "classic",
    name: "Classic",
    fgColor: "#000000",
    bgColor: "#ffffff",
    description: "Black on white",
  },
  {
    id: "slate",
    name: "Slate",
    fgColor: "#0f172a",
    bgColor: "#f8fafc",
    description: "Deep slate on light gray",
  },
  {
    id: "ocean",
    name: "Ocean",
    fgColor: "#1e3a8a",
    bgColor: "#eff6ff",
    description: "Navy blue on soft blue",
  },
  {
    id: "forest",
    name: "Forest",
    fgColor: "#14532d",
    bgColor: "#f0fdf4",
    description: "Forest green on mint",
  },
];
