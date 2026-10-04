export default function QRInputForm({
  type,
  formState,
  onChangeField,
  onBlurField,
  errors,
  touched,
  submitted,
}) {
  const isFieldInvalid = (field) => {
    return !!errors[field] && (!!touched[field] || !!submitted);
  };

  return (
    <section className="input-form-section" aria-labelledby="input-form-heading">
      <h2 id="input-form-heading" className="section-heading">Content</h2>

      {/* URL INPUT */}
      {type === "url" && (
        <div className="form-group">
          <label htmlFor="url-input">
            Website URL
          </label>
          <input
            id="url-input"
            type="text"
            className={`form-control ${isFieldInvalid("url") ? "control-error" : ""}`}
            placeholder="example.com or https://example.com"
            value={formState.url}
            onChange={(e) => onChangeField("url", e.target.value)}
            onBlur={() => onBlurField?.("url")}
            aria-invalid={isFieldInvalid("url")}
            aria-describedby={isFieldInvalid("url") ? "url-error" : "url-hint"}
          />
          {isFieldInvalid("url") ? (
            <span id="url-error" className="field-error-text" role="alert">
              {errors.url}
            </span>
          ) : (
            <span id="url-hint" className="field-hint-text">
              If protocol is omitted, https:// will be prepended automatically.
            </span>
          )}
        </div>
      )}

      {/* PLAIN TEXT INPUT */}
      {type === "text" && (
        <div className="form-group">
          <div className="label-with-meta">
            <label htmlFor="text-input">
              Text
            </label>
            <span className="char-counter">{formState.text.length} chars</span>
          </div>
          <textarea
            id="text-input"
            rows="4"
            className={`form-control form-textarea ${isFieldInvalid("text") ? "control-error" : ""}`}
            placeholder="Enter text, notes, or messages..."
            value={formState.text}
            onChange={(e) => onChangeField("text", e.target.value)}
            onBlur={() => onBlurField?.("text")}
            aria-invalid={isFieldInvalid("text")}
            aria-describedby={isFieldInvalid("text") ? "text-error" : undefined}
          />
          {isFieldInvalid("text") && (
            <span id="text-error" className="field-error-text" role="alert">
              {errors.text}
            </span>
          )}
        </div>
      )}

      {/* EMAIL INPUT */}
      {type === "email" && (
        <div className="input-form-subfields">
          <div className="form-group">
            <label htmlFor="email-address">
              Recipient email
            </label>
            <input
              id="email-address"
              type="email"
              className={`form-control ${isFieldInvalid("email") ? "control-error" : ""}`}
              placeholder="name@example.com"
              value={formState.email}
              onChange={(e) => onChangeField("email", e.target.value)}
              onBlur={() => onBlurField?.("email")}
              aria-invalid={isFieldInvalid("email")}
              aria-describedby={isFieldInvalid("email") ? "email-error" : undefined}
            />
            {isFieldInvalid("email") && (
              <span id="email-error" className="field-error-text" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email-subject">Subject (optional)</label>
            <input
              id="email-subject"
              type="text"
              className="form-control"
              placeholder="Email subject"
              value={formState.emailSubject}
              onChange={(e) => onChangeField("emailSubject", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email-body">Message (optional)</label>
            <textarea
              id="email-body"
              rows="3"
              className="form-control form-textarea"
              placeholder="Email body text"
              value={formState.emailBody}
              onChange={(e) => onChangeField("emailBody", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* PHONE INPUT */}
      {type === "phone" && (
        <div className="form-group">
          <label htmlFor="phone-input">
            Phone number
          </label>
          <input
            id="phone-input"
            type="tel"
            className={`form-control ${isFieldInvalid("phone") ? "control-error" : ""}`}
            placeholder="+1 555 123 4567"
            value={formState.phone}
            onChange={(e) => onChangeField("phone", e.target.value)}
            onBlur={() => onBlurField?.("phone")}
            aria-invalid={isFieldInvalid("phone")}
            aria-describedby={isFieldInvalid("phone") ? "phone-error" : "phone-hint"}
          />
          {isFieldInvalid("phone") ? (
            <span id="phone-error" className="field-error-text" role="alert">
              {errors.phone}
            </span>
          ) : (
            <span id="phone-hint" className="field-hint-text">
              Supports country codes, digits, spaces, and hyphens.
            </span>
          )}
        </div>
      )}

      {/* WI-FI INPUT */}
      {type === "wifi" && (
        <div className="input-form-subfields">
          <div className="form-group">
            <label htmlFor="wifi-ssid">
              Network name (SSID)
            </label>
            <input
              id="wifi-ssid"
              type="text"
              className={`form-control ${isFieldInvalid("wifiSsid") ? "control-error" : ""}`}
              placeholder="Network name"
              value={formState.wifiSsid}
              onChange={(e) => onChangeField("wifiSsid", e.target.value)}
              onBlur={() => onBlurField?.("wifiSsid")}
              aria-invalid={isFieldInvalid("wifiSsid")}
              aria-describedby={isFieldInvalid("wifiSsid") ? "wifi-ssid-error" : undefined}
            />
            {isFieldInvalid("wifiSsid") && (
              <span id="wifi-ssid-error" className="field-error-text" role="alert">
                {errors.wifiSsid}
              </span>
            )}
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="wifi-auth">Security</label>
              <select
                id="wifi-auth"
                className="form-control select-control"
                value={formState.wifiAuth}
                onChange={(e) => onChangeField("wifiAuth", e.target.value)}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open network)</option>
              </select>
            </div>

            {formState.wifiAuth !== "nopass" && (
              <div className="form-group">
                <label htmlFor="wifi-password">
                  Password
                </label>
                <input
                  id="wifi-password"
                  type="password"
                  className={`form-control ${isFieldInvalid("wifiPassword") ? "control-error" : ""}`}
                  placeholder="Network password"
                  value={formState.wifiPassword}
                  onChange={(e) => onChangeField("wifiPassword", e.target.value)}
                  onBlur={() => onBlurField?.("wifiPassword")}
                  aria-invalid={isFieldInvalid("wifiPassword")}
                  aria-describedby={isFieldInvalid("wifiPassword") ? "wifi-pass-error" : undefined}
                />
                {isFieldInvalid("wifiPassword") && (
                  <span id="wifi-pass-error" className="field-error-text" role="alert">
                    {errors.wifiPassword}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
