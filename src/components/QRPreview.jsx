import { useState, useRef, useMemo } from "react";
import { generateQrDataUrl, generateQrSvg, buildQrOptions, checkQrContrast } from "../utils/qrUtils";

export default function QRPreview({
  qrData,
  qrDataUrl,
  isValid,
  qrError,
  size,
  fgColor,
  bgColor,
  level,
  margin,
  type,
  onSaveToHistory,
  onNotify,
}) {
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const svgRevokeTimerRef = useRef(null);

  // Check if browser supports image clipboard write
  const canCopyImage = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof window.ClipboardItem !== "undefined"
    );
  }, []);

  // Shared configuration options for rendering and exporting
  const qrConfig = useMemo(() => {
    return buildQrOptions({
      size,
      fgColor,
      bgColor,
      level,
      margin,
    });
  }, [size, fgColor, bgColor, level, margin]);

  // Contrast heuristic check
  const contrastCheck = useMemo(() => {
    return checkQrContrast(fgColor, bgColor);
  }, [fgColor, bgColor]);

  const hasValidData = !!qrData && isValid && !qrError && !!qrDataUrl;

  // PNG Download (uses the user-selected download size)
  const handleDownloadPNG = async () => {
    if (!hasValidData) return;
    setDownloading(true);

    try {
      const dataUrl = await generateQrDataUrl(qrData, qrConfig);
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${type}-${Date.now()}.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();

      onNotify?.("PNG downloaded.", "success");

      if (onSaveToHistory) {
        onSaveToHistory();
      }
    } catch (err) {
      console.error("Failed to download PNG:", err);
      onNotify?.("Couldn't download the PNG.", "error");
    } finally {
      setDownloading(false);
    }
  };

  // SVG Download (uses the user-selected size, delayed object URL cleanup)
  const handleDownloadSVG = async () => {
    if (!hasValidData) return;

    try {
      const svgString = await generateQrSvg(qrData, qrConfig);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${type}-${Date.now()}.svg`;
      downloadLink.href = svgUrl;
      downloadLink.click();

      // Delay revoke to prevent browsers cancelling the download
      if (svgRevokeTimerRef.current) {
        clearTimeout(svgRevokeTimerRef.current);
      }
      svgRevokeTimerRef.current = setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
      }, 1500);

      onNotify?.("SVG downloaded.", "success");

      if (onSaveToHistory) {
        onSaveToHistory();
      }
    } catch (err) {
      console.error("Failed to download SVG:", err);
      onNotify?.("Couldn't download the SVG.", "error");
    }
  };

  // Copy Image to Clipboard using standard ClipboardItem
  const handleCopyImage = async () => {
    if (!hasValidData || !canCopyImage) return;
    setCopying(true);

    try {
      const highResDataUrl = await generateQrDataUrl(qrData, qrConfig);
      const response = await fetch(highResDataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);

      onNotify?.("QR copied to clipboard.", "success");

      if (onSaveToHistory) {
        onSaveToHistory();
      }
    } catch (err) {
      console.error("Failed to copy image to clipboard:", err);
      onNotify?.("Couldn't copy the QR.", "error");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="preview-component">
      <div className="preview-header-row">
        <h2 className="section-heading">Preview</h2>
      </div>

      {/* QR CONTAINER */}
      <div
        className={`qr-display-frame ${!hasValidData ? "frame-empty" : ""}`}
        style={{
          backgroundColor: hasValidData ? bgColor : undefined,
        }}
      >
        {hasValidData ? (
          <img
            src={qrDataUrl}
            alt="Generated QR code preview"
            className="qr-image-preview"
          />
        ) : qrError ? (
          <div className="empty-preview-placeholder preview-error-placeholder" role="alert">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="qr-error-message">{qrError}</p>
          </div>
        ) : (
          <div className="empty-preview-placeholder">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3v1h-3zM20 14h1v3h-1z" />
            </svg>
            <p>Enter content on the left to generate a QR code.</p>
          </div>
        )}
      </div>

      {/* SCAN CONTRAST STATUS */}
      {hasValidData && (
        <div className="scan-status-indicator" role="status">
          {contrastCheck.isLowContrast ? (
            <div className="status-notice status-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Low contrast may make this QR code harder to scan.</span>
            </div>
          ) : contrastCheck.isInverted ? (
            <div className="status-notice status-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Dark-on-light colors are recommended for better scanning reliability.</span>
            </div>
          ) : (
            <div className="status-notice status-safe">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Good contrast</span>
            </div>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="action-buttons-group">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDownloadPNG}
          disabled={!hasValidData || downloading}
          title={hasValidData ? `Download PNG (${size}x${size})` : "Enter valid QR content first"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? "Preparing..." : `Download PNG (${size}px)`}
        </button>

        <div className="secondary-buttons-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadSVG}
            disabled={!hasValidData}
            title="Download vector SVG"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Download SVG
          </button>

          {canCopyImage && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyImage}
              disabled={!hasValidData || copying}
              title="Copy image to clipboard"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copying ? "Copying..." : "Copy Image"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
