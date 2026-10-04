# QR Studio Testing

Testing was performed on the deployed QR Studio application.

## 1. QR Type Testing

| Test | Input / Action | Result |
|---|---|---|
| URL | `https://google.com` | PASS |
| Plain Text | Sample text | PASS |
| Email | Valid email address | PASS |
| Phone | Valid phone number | PASS |
| Wi-Fi | SSID + security type | PASS |

## 2. Real-Time Preview

- Changed QR content and verified that the preview updates.
- Changed QR customization settings and verified that the preview updates.

**Result:** PASS

## 3. Customization Testing

Tested:

- Foreground color
- Background color
- Error correction level
- QR size
- Margin
- Presets

**Result:** PASS

## 4. Download Testing

- PNG download tested.
- SVG download tested.
- Downloaded QR codes were opened and checked against the preview.

**Result:** PASS

## 5. Validation Testing

Tested incomplete and invalid inputs for the supported QR types.

**Result:** PASS

## 6. Scan Reliability

QR codes were scanned using a mobile device after customization.

**Result:** PASS

## 7. Recent QR Codes

- Generated multiple QR codes.
- Verified that recent QR codes appear in history.
- Refreshed the page and verified that history remains available.
- Tested reuse of a recent QR code.

**Result:** PASS

## 8. Wi-Fi Privacy

- Generated a Wi-Fi QR code.
- Verified that the Wi-Fi password is not displayed in recent QR history.
- Verified that the password is not retained when restoring a saved Wi-Fi QR code.

**Result:** PASS

## 9. Responsive Design

Tested the application on desktop and mobile-sized screens.

Checked:

- Layout
- Controls
- QR preview
- Buttons
- History
- No horizontal overflow

**Result:** PASS

## 10. Browser

Browser: Google Chrome


## 11. Deployment

Live application:

https://qr-studio-five-coral.vercel.app/
