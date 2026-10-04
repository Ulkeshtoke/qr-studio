import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import QRTypeSelector from "./components/QRTypeSelector";
import QRInputForm from "./components/QRInputForm";
import CustomizationPanel from "./components/CustomizationPanel";
import PresetSelector from "./components/PresetSelector";
import QRPreview from "./components/QRPreview";
import RecentQRs from "./components/RecentQRs";
import {
  buildQrPayload,
  validateForm,
  generateQrDataUrl,
} from "./utils/qrUtils";
import {
  loadHistory,
  persistHistory,
  isDuplicateHistoryItem,
} from "./utils/history";
import "./App.css";

const DEFAULT_FORM_STATE = {
  url: "https://example.com",
  text: "",
  email: "",
  emailSubject: "",
  emailBody: "",
  phone: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiAuth: "WPA",
};

export default function App() {
  const [type, setType] = useState("url");
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(512); // Download size (256px - 1024px)
  const [level, setLevel] = useState("M");
  const [margin, setMargin] = useState(4); // Quiet zone (4 - 8 modules)

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const toastTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Initialize history with automatic migration and sanitization
  const [history, setHistory] = useState(() => {
    return loadHistory();
  });

  // Persist history changes to storage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    persistHistory(history);
  }, [history]);

  // Derive QR payload and validation
  const qrData = useMemo(() => {
    return buildQrPayload(type, formState);
  }, [type, formState]);

  const validation = useMemo(() => {
    return validateForm(type, formState);
  }, [type, formState]);

  // Generate QR preview data URL
  useEffect(() => {
    let isCancelled = false;

    if (!validation.isValid || !qrData) {
      return;
    }

    generateQrDataUrl(qrData, {
      size: 512, // Render high-definition raster for crisp display on retina
      fgColor,
      bgColor,
      level,
      margin,
    })
      .then((url) => {
        if (!isCancelled) {
          setQrDataUrl(url);
          setQrError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setQrDataUrl("");
          setQrError(err.message || "Failed to generate QR preview.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [qrData, validation.isValid, fgColor, bgColor, level, margin]);

  // Derived effective preview URL and error
  const effectiveQrDataUrl = validation.isValid && qrData ? qrDataUrl : "";
  const effectiveQrError = validation.isValid && qrData ? qrError : null;

  // Toast notification helper
  const triggerToast = useCallback((msg) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Field change handler
  const handleFieldChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Field blur handler
  const handleFieldBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Switch type handler
  const handleSelectType = (newType) => {
    setType(newType);
    setTouched({});
    setSubmitted(false);
  };

  // Apply preset handler (only modifies foreground and background colors)
  const handleApplyPreset = (preset) => {
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    triggerToast(`Preset applied: ${preset.name}`);
  };

  // Save to history upon export (PNG, SVG, or copy)
  const saveToHistory = useCallback(() => {
    if (!validation.isValid || !qrData) {
      setSubmitted(true);
      return;
    }

    let title = "QR Code";
    if (type === "url") {
      title = formState.url.trim();
    } else if (type === "text") {
      title = formState.text.trim().slice(0, 32) + (formState.text.trim().length > 32 ? "..." : "");
    } else if (type === "email") {
      title = formState.email.trim();
    } else if (type === "phone") {
      title = formState.phone.trim();
    } else if (type === "wifi") {
      title = `Wi-Fi: ${formState.wifiSsid.trim()}`;
    }

    // Privacy rule: Wi-Fi passwords and payloads are never stored
    const safeFormState = {
      ...formState,
      wifiPassword: "",
    };

    const newEntry = {
      id: `qr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      type,
      title,
      payload: type === "wifi" ? "" : qrData,
      config: {
        type,
        formState: safeFormState,
        fgColor,
        bgColor,
        size,
        level,
        margin,
      },
    };

    setHistory((prevHistory) => {
      if (prevHistory.length > 0 && isDuplicateHistoryItem(prevHistory[0], newEntry)) {
        return prevHistory;
      }
      return [newEntry, ...prevHistory.filter((item) => !isDuplicateHistoryItem(item, newEntry))].slice(0, 10);
    });
  }, [validation.isValid, qrData, type, formState, fgColor, bgColor, size, level, margin]);

  // Restore configuration from history
  const handleRestoreHistory = (item) => {
    if (!item.config) return;
    const { config } = item;

    setType(config.type);
    setTouched({});
    setSubmitted(false);

    if (config.formState) {
      setFormState((prev) => ({
        ...prev,
        ...config.formState,
        wifiPassword: "", // Privacy guarantee
      }));
    }

    setFgColor(config.fgColor || "#000000");
    setBgColor(config.bgColor || "#ffffff");
    setSize(config.size ? Math.min(1024, Math.max(256, config.size)) : 512);
    setLevel(config.level || "M");
    setMargin(config.margin ? Math.min(8, Math.max(4, config.margin)) : 4);

    if (item.type === "wifi") {
      triggerToast("Wi-Fi password wasn't saved for privacy. Enter it again.");
    } else {
      triggerToast(`Restored: ${item.title}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a history item
  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm("Clear all saved recent QR codes?")) {
      setHistory([]);
      triggerToast("History cleared");
    }
  };

  return (
    <div className="app-layout">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-group">
            <span className="brand-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <h1 className="brand-title">QR Studio</h1>
          </div>
          <span className="header-tag">Browser Utility</span>
        </div>
      </header>

      {/* TOAST / STATUS LIVE REGION (PERMANENTLY MOUNTED IN DOM) */}
      <div className="toast-live-region" role="status" aria-live="polite" aria-atomic="true">
        {toastMessage && (
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <main className="main-wrapper">
        <div className="generator-two-column-grid">
          {/* LEFT COLUMN: CONTROLS */}
          <section className="controls-card" aria-label="Generator controls">
            <QRTypeSelector
              activeType={type}
              onSelectType={handleSelectType}
            />

            <QRInputForm
              type={type}
              formState={formState}
              onChangeField={handleFieldChange}
              onBlurField={handleFieldBlur}
              errors={validation.errors}
              touched={touched}
              submitted={submitted}
            />

            <PresetSelector
              currentFg={fgColor}
              currentBg={bgColor}
              onApplyPreset={handleApplyPreset}
            />

            <CustomizationPanel
              size={size}
              onChangeSize={setSize}
              fgColor={fgColor}
              onChangeFgColor={setFgColor}
              bgColor={bgColor}
              onChangeBgColor={setBgColor}
              level={level}
              onChangeLevel={setLevel}
              margin={margin}
              onChangeMargin={setMargin}
            />
          </section>

          {/* RIGHT COLUMN: PREVIEW & DOWNLOAD */}
          <aside className="preview-card" aria-label="Preview and download">
            <QRPreview
              qrData={qrData}
              qrDataUrl={effectiveQrDataUrl}
              isValid={validation.isValid}
              qrError={effectiveQrError}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level={level}
              margin={margin}
              type={type}
              onSaveToHistory={saveToHistory}
              onNotify={triggerToast}
            />
          </aside>
        </div>

        {/* RECENT QR CODES */}
        <RecentQRs
          history={history}
          onRestoreItem={handleRestoreHistory}
          onDeleteItem={handleDeleteHistoryItem}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>QR Studio • Client-side QR code generator</p>
      </footer>
    </div>
  );
}
