import { PRESETS } from "../constants/presets";

export default function PresetSelector({ currentFg, currentBg, onApplyPreset }) {
  return (
    <section className="presets-section" aria-labelledby="presets-heading">
      <h2 id="presets-heading" className="section-heading">Color presets</h2>

      <div className="presets-grid" role="group" aria-label="Style presets">
        {PRESETS.map((preset) => {
          const isActive =
            currentFg.toLowerCase() === preset.fgColor.toLowerCase() &&
            currentBg.toLowerCase() === preset.bgColor.toLowerCase();

          return (
            <button
              key={preset.id}
              type="button"
              className={`preset-card-btn ${isActive ? "preset-active" : ""}`}
              onClick={() => onApplyPreset(preset)}
              title={preset.description}
            >
              <div
                className="preset-preview-chip"
                style={{ backgroundColor: preset.bgColor }}
              >
                <div
                  className="preset-inner-dot"
                  style={{ backgroundColor: preset.fgColor }}
                />
              </div>
              <div className="preset-info">
                <span className="preset-name">{preset.name}</span>
                <span className="preset-desc">{preset.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
