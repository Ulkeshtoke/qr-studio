const TYPE_LABELS = {
  url: "URL",
  text: "Text",
  email: "Email",
  phone: "Phone",
  wifi: "Wi-Fi",
};

export default function RecentQRs({
  history,
  onRestoreItem,
  onDeleteItem,
  onClearHistory,
}) {
  return (
    <section className="recent-history-section" aria-labelledby="history-heading">
      <div className="history-header">
        <div className="history-title-group">
          <h2 id="history-heading" className="section-heading">Recent QR codes</h2>
          <span className="history-privacy-notice">Stored locally in your browser</span>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="btn-clear-history"
            onClick={onClearHistory}
            title="Clear all saved QR codes"
          >
            Clear history
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history-box">
          <p>No saved QR codes yet.</p>
          <span className="subtext">
            Exporting a QR code saves it locally in this browser.
          </span>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-card-body">
                <div
                  className="history-color-indicator"
                  style={{
                    backgroundColor: item.config?.bgColor || "#ffffff",
                    borderColor: item.config?.fgColor || "#000000",
                  }}
                >
                  <div
                    className="history-color-dot"
                    style={{ backgroundColor: item.config?.fgColor || "#000000" }}
                  />
                </div>

                <div className="history-details">
                  <div className="history-top-row">
                    <span className="history-type-tag">
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                  </div>
                  <h3 className="history-title" title={item.title}>
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="history-actions-row">
                <button
                  type="button"
                  className="btn-use-again"
                  onClick={() => onRestoreItem(item)}
                  title="Use this QR configuration again"
                >
                  Use again
                </button>
                <button
                  type="button"
                  className="history-delete-btn"
                  onClick={() => onDeleteItem(item.id)}
                  title={`Remove ${item.title} from history`}
                  aria-label={`Remove ${item.title} from history`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
