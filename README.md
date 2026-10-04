# QR Studio

A browser-based QR code generator and designer built with React.

## Live Demo

https://qr-studio-five-coral.vercel.app/

## Features

- Generate QR codes for:
  - URL
  - Plain Text
  - Email
  - Phone Number
  - Wi-Fi
- Real-time QR preview
- Foreground and background color customization
- Error correction level
- QR size and margin controls
- Presets
- PNG and SVG download
- Copy QR image to clipboard when supported
- Recent QR codes stored locally in the browser
- Wi-Fi passwords are not stored in QR history
- Input validation and scan-reliability warnings
- Responsive desktop and mobile design

## Screenshots

### QR Studio

![QR Studio](docs/screenshots/main.png)

### QR Customization

![QR Customization](docs/screenshots/customization.png)

### Recent QR Codes

![Recent QR Codes](docs/screenshots/history.png)

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- `qrcode` library



```bash
npm install
npm run dev
