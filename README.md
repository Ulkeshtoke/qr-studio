# QR Studio

A browser-based QR code generator built with React.

## Features

- URL, Text, Email, Phone and Wi-Fi QR codes
- Live QR preview
- Color and error-correction controls
- PNG and SVG export
- Recent QR history stored locally

## Screenshot

Pending actual screenshots.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech

- React
- Vite
- JavaScript
- CSS
- qrcode

## Known limitations

- Dense QR codes: Long content or high error correction produces dense module grids that may be harder for legacy camera hardware to scan from a distance.
- Inverted colors: Modern smartphone cameras scan light-on-dark codes easily, but some hardware scanners only read dark patterns on light backgrounds.
- Image clipboard API: Direct image clipboard copying requires browser support for `navigator.clipboard.write` with `ClipboardItem`.
