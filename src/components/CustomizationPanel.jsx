import { checkQrContrast } from "../utils/qrUtils";

const ERROR_LEVELS = [
  { value: "L", label: "L - Low (7% recovery)" },
  { value: "M", label: "M - Medium (15% recovery)" },
  { value: "Q", label: "Q - Quartile (25% recovery)" },
  { value: "H", label: "H - High (30% recovery)" },
];

const QUICK_FG_SWATCHES = [
  { label: "Ink", hex: "#111113" },
  { label: "Black", hex: "#000000" },
  { label: "Navy", hex: "#1E3A8A" },
  { label: "Forest", hex: "#14532D" },
  { label: "Crimson", hex: "#991B1B" },
];

const QUICK_BG_SWATCHES = [
  { label: "White", hex: "#FFFFFF" },
  { label: "Cream", hex: "#F8F7F4" },
  { label: "Soft Blue", hex: "#EFF6FF" },
  { label: "Soft Mint", hex: "#F0FDF4" },
  { label: "Light Gray", hex: "#F1F5F9" },
];

const SIZE_PRESETS = [256, 512, 768, 1024];

export default function CustomizationPanel({
  size,
  onChangeSize,
  fgColor,
  onChangeFgColor,
  bgColor,
  onChangeBgColor,
  level,
  onChangeLevel,
  margin,
  onChangeMargin,
}) {
  const handleSwapColors = () => {
    const tempFg = fgColor;
    const tempBg = bgColor;
    onChangeFgColor(tempBg);
    onChangeBgColor(tempFg);
  };

  const contrast = checkQrContrast(fgColor, bgColor);

  return (
    <section className="customization-section" aria-labelledby="customization-heading">
      <div className="customization-header-row">
        <h2 id="customization-heading" className="section-heading">Appearance</h2>
        <button
          type="button"
          onClick={handleSwapColors}
          className="btn-swap-colors"
          title="Swap foreground and background colors"
          aria-label="Swap foreground and background colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>SWAP</span>
        </button>
      </div>

      {/* COLOR PICKERS */}
      <div className="color-pickers-grid">
        {/* FOREGROUND COLOR */}
        <div className="color-field">
          <label htmlFor="fg-color-picker">Foreground</label>
          <div className="color-picker-box">
            <input
              id="fg-color-picker"
              type="color"
              className="color-swatch-input"
              value={fgColor}
              onChange={(e) => onChangeFgColor(e.target.value)}
              aria-label="Foreground color picker"
            />
            <input
              type="text"
              className="color-hex-input"
              value={fgColor.toUpperCase()}
              onChange={(e) => {
                let v = e.target.value.trim();
                if (!v.startsWith("#")) v = "#" + v;
                onChangeFgColor(v);
              }}
              maxLength={7}
              placeholder="#000000"
              aria-label="Foreground color hex code"
            />
          </div>
          <div className="quick-swatches-row" aria-label="Foreground quick swatches">
            {QUICK_FG_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                className={`quick-swatch-dot ${fgColor.toLowerCase() === swatch.hex.toLowerCase() ? "swatch-active" : ""}`}
                style={{ backgroundColor: swatch.hex }}
                onClick={() => onChangeFgColor(swatch.hex)}
                title={`${swatch.label} (${swatch.hex})`}
                aria-label={`Set foreground to ${swatch.label}`}
              />
            ))}
          </div>
        </div>

        {/* BACKGROUND COLOR */}
        <div className="color-field">
          <label htmlFor="bg-color-picker">Background</label>
          <div className="color-picker-box">
            <input
              id="bg-color-picker"
              type="color"
              className="color-swatch-input"
              value={bgColor}
              onChange={(e) => onChangeBgColor(e.target.value)}
              aria-label="Background color picker"
            />
            <input
              type="text"
              className="color-hex-input"
              value={bgColor.toUpperCase()}
              onChange={(e) => {
                let v = e.target.value.trim();
                if (!v.startsWith("#")) v = "#" + v;
                onChangeBgColor(v);
              }}
              maxLength={7}
              placeholder="#FFFFFF"
              aria-label="Background color hex code"
            />
          </div>
          <div className="quick-swatches-row" aria-label="Background quick swatches">
            {QUICK_BG_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                className={`quick-swatch-dot ${bgColor.toLowerCase() === swatch.hex.toLowerCase() ? "swatch-active" : ""}`}
                style={{ backgroundColor: swatch.hex }}
                onClick={() => onChangeBgColor(swatch.hex)}
                title={`${swatch.label} (${swatch.hex})`}
                aria-label={`Set background to ${swatch.label}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CONTRAST HEURISTIC FEEDBACK */}
      <div className={`control-contrast-badge ${contrast.isLowContrast ? "contrast-warn" : "contrast-good"}`}>
        <span className="contrast-dot" />
        <span>
          {contrast.isLowContrast
            ? "LOW CONTRAST — MAY BE HARD TO SCAN"
            : contrast.isInverted
            ? "INVERTED COLORS — DARK PATTERN RECOMMENDED"
            : "GOOD OPTICAL CONTRAST"}
        </span>
      </div>

      {/* DOWNLOAD SIZE AND QUIET ZONE SLIDERS */}
      <div className="sliders-grid">
        {/* DOWNLOAD SIZE */}
        <div className="slider-field">
          <div className="slider-label-row">
            <label htmlFor="size-slider">Download size</label>
            <span className="slider-value-pill">{size}px</span>
          </div>
          <input
            id="size-slider"
            type="range"
            min="256"
            max="1024"
            step="64"
            value={size}
            onChange={(e) => onChangeSize(Number(e.target.value))}
            className="styled-slider"
          />
          <div className="quick-size-buttons">
            {SIZE_PRESETS.map((pSize) => (
              <button
                key={pSize}
                type="button"
                className={`quick-size-btn ${size === pSize ? "size-btn-active" : ""}`}
                onClick={() => onChangeSize(pSize)}
              >
                {pSize}
              </button>
            ))}
          </div>
        </div>

        {/* QUIET ZONE */}
        <div className="slider-field">
          <div className="slider-label-row">
            <label htmlFor="margin-slider">Quiet zone</label>
            <span className="slider-value-pill">{margin} modules</span>
          </div>
          <input
            id="margin-slider"
            type="range"
            min="4"
            max="8"
            step="1"
            value={margin}
            onChange={(e) => onChangeMargin(Number(e.target.value))}
            className="styled-slider"
          />
          <span className="field-hint-text">
            4-8 modules required for reliable edge detection.
          </span>
        </div>
      </div>

      {/* ERROR CORRECTION SELECT */}
      <div className="form-group margin-top-md">
        <label htmlFor="error-correction-select">
          Error correction
        </label>
        <select
          id="error-correction-select"
          className="form-control select-control"
          value={level}
          onChange={(e) => onChangeLevel(e.target.value)}
        >
          {ERROR_LEVELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="field-hint-text">
          Higher levels improve damage tolerance but reduce available data capacity.
        </span>
      </div>
    </section>
  );
}
