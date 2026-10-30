# Frontend

Frontend aplikasi ini dibuat dengan React, TypeScript, dan Vite.

## Teknologi

- React 19 dan React DOM
- TypeScript 7
- Vite 8
- React Router DOM 7
- Axios untuk HTTP request
- Tailwind CSS 4 dengan `@tailwindcss/vite`
- Oxlint untuk linting
- `vite-plugin-pwa` untuk Progressive Web App

## Menjalankan project

Pastikan Node.js dan npm sudah terpasang, lalu jalankan:

```bash
npm install
npm run dev
```

Server development Vite biasanya tersedia di `http://localhost:5173`.

## Script npm

| Script            | Keterangan                                        |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Menjalankan server development dengan HMR         |
| `npm run build`   | Memeriksa TypeScript dan membuat production build |
| `npm run lint`    | Menjalankan Oxlint                                |
| `npm run preview` | Menjalankan preview production build              |

## Styling

Tailwind CSS diaktifkan melalui plugin Vite dan diimpor dari
`src/index.css`:

```css
@import "tailwindcss";
```

Konfigurasi linting tersedia di `.oxlintrc.json`. Jalankan `npm run lint`
sebelum melakukan commit.
