# QR Studio Testing Log

Browser: 
OS: 
Phone model: 
Date: 

---

## Test Checklist

| # | Test | Expected | Result | Notes |
|---|------|----------|--------|-------|
| 1 | URL QR generation | Produces valid QR preview encoding the full URL | CODE VERIFIED | Tested with standard URLs, query params, fragments, and localhost |
| 2 | Plain Text QR generation | Produces valid QR preview encoding raw text | CODE VERIFIED | Verified encoding and real-time character counting |
| 3 | Email QR generation | Encodes `mailto:` scheme with recipient, subject, and body | CODE VERIFIED | Generates standard mailto RFC URI |
| 4 | Phone QR generation | Encodes `tel:` URI with normalized digits | CODE VERIFIED | Strips separators and formatting spaces |
| 5 | Wi-Fi QR generation | Encodes standard `WIFI:T:...;S:...;P:...;;` string | CODE VERIFIED | Tested with WPA, WEP, and Open network configurations |
| 6 | URL validation | Accepts valid URLs including paths, query params, fragments; rejects clearly invalid inputs | CODE VERIFIED | Tested via `isValidUrl` with URL constructor |
| 7 | Email validation | Validates standard email address format | CODE VERIFIED | Validates user@domain.tld syntax |
| 8 | Phone validation | Requires 6 to 15 digits, allows international `+` prefix | CODE VERIFIED | Tested with international formats |
| 9 | Wi-Fi validation | Requires SSID; requires password for WPA (>=8 chars) and WEP (>=5 chars) | CODE VERIFIED | Validated across auth types |
| 10 | Foreground color | Updates pattern color across preview and all export formats | CODE VERIFIED | Uses unified `buildQrOptions` config |
| 11 | Background color | Updates background color across preview and all export formats | CODE VERIFIED | Uses unified `buildQrOptions` config |
| 12 | Error correction | Supports L, M, Q, H levels; applies selected level to preview, PNG, SVG, and copy | CODE VERIFIED | Unified parameter mapping fixes parameter mismatch |
| 13 | Quiet zone | Enforces 4 to 8 modules range (default 4); disallows <4 | CODE VERIFIED | Verified margin clamping in `buildQrOptions` |
| 14 | Download size | Range 256px to 1024px; determines PNG and SVG export dimensions without distorting preview container | CODE VERIFIED | Preview scales responsively while export uses exact size |
| 15 | Presets | Classic, Slate, Ocean, Forest change foreground and background only | CODE VERIFIED | Preserves error correction, margin, and size settings |
| 16 | PNG download | Downloads raster image file matching preview content, colors, margin, and selected size | CODE VERIFIED | Triggers `.png` file download with user feedback toast |
| 17 | SVG download | Downloads valid vector SVG XML with delayed object URL cleanup | CODE VERIFIED | Verified SVG markup string generation and delayed revoke |
| 18 | Clipboard copy | Copies PNG blob to clipboard when ClipboardItem API is supported | CODE VERIFIED | Displays visible success / error toast |
| 19 | Recent history | Saves up to 10 items locally on intentional export actions | CODE VERIFIED | Saved in versioned key `gdg_qr_studio_history_v2` |
| 20 | Restore / Use again | Restores previous type, fields, and styling into active form | CODE VERIFIED | Restores fields via dedicated "Use again" button |
| 21 | Wi-Fi password privacy | Wi-Fi password is NEVER stored in localStorage or history payload | CODE VERIFIED | Password and payload are scrubbed before storage |
| 22 | Old history migration | Migrates `gdg_qr_studio_history_v1`, sanitizes entries, clamps margin to >=4, and deletes old key | CODE VERIFIED | Verified via migration test script with corrupt and legacy data |
| 23 | Invalid input handling | Shows inline field errors after touch/blur or submit; disables export buttons | CODE VERIFIED | Untouched fields remain clean; export buttons disabled |
| 24 | Long content handling | Displays clear warning if payload exceeds QR matrix capacity | CODE VERIFIED | Catches "too much data" and guides user to reduce length or level |
| 25 | Desktop responsiveness | Two-column layout with sticky preview card at >=860px | CODE VERIFIED | Tested CSS grid and sticky positioning |
| 26 | Mobile responsiveness | Single-column stacked order: Controls -> Preview -> Download -> Recent QR Codes | CODE VERIFIED | Verified breakpoint layout rules |
| 27 | 320px layout | No horizontal scrolling or content clipping at 320px viewport width | CODE VERIFIED | Verified with fluid grids, wrapping, and no forced min-widths |
| 28 | Keyboard navigation | All controls, buttons, and inputs are reachable and operable via keyboard | CODE VERIFIED | Standard button and form elements with logical DOM order |
| 29 | Focus states | Visible focus outlines on all interactive controls (`:focus-visible`) | CODE VERIFIED | High-visibility focus indicators on all inputs and buttons |
| 30 | Export consistency | Preview, PNG, SVG, and Copy all derive settings from `buildQrOptions` | CODE VERIFIED | Eliminates export drift across output channels |
| 31 | Real phone scanning | Camera scanner decodes generated QR code on actual mobile hardware | NOT RUN | Requires physical device testing by operator |
