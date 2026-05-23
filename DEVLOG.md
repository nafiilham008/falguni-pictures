# 📋 DEVLOG — Falguni Photography Web App
> Catatan semua perubahan dan pengembangan yang dilakukan sejak awal hingga sekarang.

---

## 🗓️ Fase 1 — Inisialisasi & Desain Konsep (Awal Maret 2026)

### Perencanaan Awal
- Diskusi awal: membangun **portfolio website fotografer** bernama **Falguni**
- Konsep utama: **dual-theme** — satu website, dua persona berbeda:
  - **Portrait/Wisuda** → tema elegan, tone terang, nuansa rose/amber
  - **Sport/Olahraga** → tema bold, cinematic dark, nuansa merah/hitam
- Dibuat wireframe kasar untuk layout halaman utama, portfolio, dan admin dashboard
- Dibuat beberapa konsep desain visual (minimalist light, cinematic dark, edgy brutalist, dll)

---

## 🗓️ Fase 2 — Pembangunan Frontend Publik

### Struktur Halaman Utama (`src/`)
Halaman dibuat sebagai **Single Page Application (SPA)** menggunakan React + Vite + TailwindCSS v4.

Komponen yang dibangun:
| Komponen | Deskripsi |
|---|---|
| `Navbar.jsx` | Navigasi atas dengan toggle tema Sport/Portrait |
| `Hero.jsx` | Section pembuka dengan headline berbasis tema |
| `Portfolio.jsx` | Grid galeri foto dinamis dari database, dilengkapi Lightbox |
| `Lightbox.jsx` | Modal viewer foto full-screen dengan navigasi prev/next |
| `Pricing.jsx` | Kartu harga paket dari database, tema-aware |
| `About.jsx` | Section profil fotografer |
| `Testimonials.jsx` | Slider testimoni klien dari database |
| `Contact.jsx` | Form pemesanan sesi foto dengan redirect ke WhatsApp |
| `Footer.jsx` | Footer dinamis dengan link Instagram dari database |

### Dual-Theme System
- Toggle tema disimpan di `localStorage` (key: `falguni_theme`)
- Saat tema berubah, seluruh halaman transisi mulus (body class, warna, font)
- Tema Sport: `bg-dark`, font `font-sans`, accent merah
- Tema Portrait: `bg-light`, font `font-serif`, accent rose/amber

### Visitor Tracking
- Setiap kunjungan halaman/perpindahan tema otomatis di-track ke `POST /api/analytics`
- Klik ke detail portfolio event juga di-track (`event_type: 'view_event'`)

---

## 🗓️ Fase 3 — Backend API (Node.js + PostgreSQL)

### Stack Backend (`server/`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (lokal) via library `pg`
- **Autentikasi**: JWT (`jsonwebtoken`) + Bcrypt
- **File Storage**: Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3`
- **Image Processing**: `sharp` — auto-convert semua gambar upload ke format WebP (quality 80)

### File Server
| File | Deskripsi |
|---|---|
| `index.js` | Entry point, semua route API |
| `db.js` | Koneksi pool ke PostgreSQL |
| `auth.js` | Middleware `verifyToken`, helper JWT |
| `init.sql` | Skema database + default seed data |
| `migrate.js` | Script migrasi database |
| `.env` | Variabel environment (tidak di-commit ke Git) |

### Database Schema
Terdiri dari 7 tabel:
- `events` — daftar portfolio (judul + tema)
- `event_images` — gambar per event, dengan flag `is_cover`
- `packages` — paket harga fotografer
- `testimonials` — ulasan klien
- `bookings` — log pemesanan dari form website
- `analytics` — log kunjungan & interaksi pengunjung
- `admin_users` — akun administrator
- `site_settings` — pengaturan dinamis (WA number, Instagram username)

---

## 🗓️ Fase 4 — Admin Dashboard

### Rute Admin
```
/login              → Halaman login admin
/dashboard          → Protected route (butuh JWT token)
/dashboard/bookings → Manajemen pemesanan
/dashboard/portfolio → Manajemen galeri/portfolio
/dashboard/packages  → Manajemen paket harga
/dashboard/testimonials → Manajemen testimoni
/dashboard/settings → Pengaturan umum & keamanan
```

### Halaman Admin
| File | Fitur Utama |
|---|---|
| `Login.jsx` | Form login, simpan JWT ke localStorage |
| `ProtectedRoute.jsx` | Guard route — redirect ke /login jika tidak ada token |
| `AdminLayout.jsx` | Shell layout dengan sidebar navigasi + global search |
| `Dashboard.jsx` | Statistik analytics: total views, bookings, top content |
| `ManagePortfolio.jsx` | CRUD event portfolio, upload multi-gambar, set cover |
| `ManagePackages.jsx` | CRUD paket harga per tema |
| `ManageTestimonials.jsx` | CRUD testimoni klien |
| `ManageBookings.jsx` | Lihat & hapus booking, ubah status (pending/approved) |
| `Settings.jsx` | Ubah nomor WhatsApp redirect & username Instagram; ganti password admin |

### Fitur Admin Lanjutan
- **Global Search**: searchbar di sidebar men-query booking, portfolio, dan testimoni sekaligus
- **Upload Gambar**: drag & drop, auto-convert ke WebP, upload ke Cloudflare R2
- **Set Cover**: klik gambar di event untuk jadikan cover (tampil di kartu portfolio publik)
- **Analytics Dashboard**: stat card views, bookings, total portfolio, top 5 konten

---

## 🗓️ Fase 5 — Perbaikan & Penambahan Fitur (Mei 2026)

### Perubahan Terminologi
- Label `Campus/Team` pada form booking diganti menjadi `Location / Venue` agar lebih universal

### Perbaikan Tema Dinamis Pricing
- Diperbaiki bug di mana komponen `Pricing.jsx` menggunakan warna tema yang salah (sport vs portrait tertukar)
- Root cause: pengecekan `isSport` tidak sinkron dengan prop `theme` yang diterima

### Bug Fix: `packages.map` Loop
- Ditemukan bug di `Pricing.jsx` di mana wrapper `packages.map((pkg, idx) => (...))` tidak sengaja terhapus saat refactor, menyebabkan error render

### Emoji Encoding di WhatsApp Redirect
- Emoji mentah di source code terkadang rusak saat dibundel Vite di Windows
- Dicoba 3 pendekatan: emoji literal → `\u{...}` escape → `String.fromCodePoint()` → akhirnya menggunakan **UTF-16 surrogate pair** (`\uXXXX\uXXXX`)
- Bug terakhir: `let waText;` declaration tidak sengaja ikut terhapus saat edit → `ReferenceError: waText is not defined`

### WhatsApp Redirect URL
- Awalnya menggunakan `https://wa.me/...` — server wa.me ternyata memiliki bug internal yang merusak karakter UTF-8 saat proses redirect 302
- **Solusi final**: Diganti menjadi `https://api.whatsapp.com/send?phone=...&text=...` — melewati wa.me redirector langsung ke API WhatsApp

### Footer SVG Instagram Icon
- Ditemukan placeholder `M12 2.163c3.204... (Instagram icon)` di path SVG yang menyebabkan console error `<path> attribute d: Expected number`
- Diganti dengan path SVG Instagram resmi yang valid

### Settings Dinamis
- Menambahkan field `instagram_username` ke tabel `site_settings`
- Seeded default value ke database
- Di `Settings.jsx`: tambah input field dengan custom inline SVG icon (karena `Instagram` tidak di-export oleh versi lucide-react yang terinstal)
- Di `Footer.jsx`: link Instagram sekarang dinamis, di-fetch dari `/api/settings`

### Footer Copy Profesional
- Teks `"All rights reserved. Styled with Tailwind CSS & React."` diganti menjadi `"All rights reserved. Professional Photography & Visual Storytelling."`
- Nama brand di footer dinamis mengikuti tema: `Falguni Picture` (sport) / `Falguni Portrait` (portrait)

---

## 🐛 Bug Log

| # | Bug | Penyebab | Solusi |
|---|---|---|---|
| 1 | Pricing pakai warna tema salah | `isSport` di-evaluate berbeda saat prop awal belum arrive | Pastikan prop `theme` digunakan langsung dan konsisten |
| 2 | `packages.map` hilang | Terhapus saat refactor manual | Tambahkan kembali wrapper `.map()` |
| 3 | `waText is not defined` | Deklarasi `let waText;` terhapus saat edit | Tambahkan kembali sebelum blok `if (isSport)` |
| 4 | Emoji rusak di WA preview | Bundler Windows merusak byte emoji di source file | Gunakan UTF-16 surrogate pair notation `\uXXXX` |
| 5 | Emoji tetap rusak di WA dialog | Server wa.me merusak UTF-8 saat 302 redirect | Pindah ke `api.whatsapp.com/send?phone=...` |
| 6 | Console error SVG path | Placeholder teks di attribute `d` path SVG | Ganti dengan path SVG Instagram yang valid |
| 7 | `Instagram` not exported from lucide-react | Versi lucide-react yang terinstall tidak memiliki export `Instagram` | Ganti dengan inline SVG |

---

## 🔧 Environment & Konfigurasi

### `.env` Server
```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=falguni_db
DB_PASSWORD=P@ssw0rd
DB_PORT=5432
R2_REGION=auto
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_BUCKET_NAME=falguni-portofolio
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
```

### Menjalankan Lokal
```bash
# Frontend (port 5173/5174)
cd web-dian-react
npm run dev

# Backend (port 5000)
cd web-dian-react/server
node index.js
```

### Default Admin
- Username: `admin`
- Password: `admin123` *(harus diganti setelah setup pertama)*

---

## 📡 API Endpoints (Dokumentasi Lengkap)

Lihat `AI_CONTEXT.md` untuk dokumentasi API yang lebih lengkap.
