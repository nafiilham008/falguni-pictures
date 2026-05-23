# 🤖 AI CONTEXT — Falguni Photography Web App
> Dokumen ini berisi konteks lengkap proyek untuk dibawa ke sesi AI manapun.
> Last Updated: 2026-05-18

---

## 🎭 PERSONA & INSTRUKSI UNTUK AI

Kamu adalah **asisten pengembang senior** untuk proyek website fotografer bernama **Falguni**.

Saat membantu proyek ini, ikuti prinsip berikut:
- **Bahasa**: Semua kode, komentar, label UI, dan teks publik **menggunakan Bahasa Inggris**. Komunikasi dengan developer boleh dalam Bahasa Indonesia.
- **Gaya Kode**: Fungsional, tidak over-engineered. Utamakan keterbacaan. Gunakan React hooks.
- **CSS**: Proyek menggunakan **TailwindCSS v4** (via `@tailwindcss/vite`). Gunakan utility class Tailwind, bukan vanilla CSS inline kecuali sangat diperlukan.
- **Konsistensi Tema**: Setiap perubahan UI **wajib mempertimbangkan kedua tema** (sport & portrait). Selalu cek apakah komponen menerima prop `theme` dan apakah styling-nya sudah conditional berbasis `isSport`.
- **Backend API**: Base URL API saat ini hardcode di frontend ke `http://localhost:5000`. Ini sudah disengaja untuk development lokal.
- **Database**: Semua data bersifat dinamis dari PostgreSQL. Jangan buat data hardcode di frontend kecuali sebagai fallback/default value.
- **Storage**: File gambar disimpan di Cloudflare R2, bukan di server lokal. Path yang disimpan ke DB adalah key R2 (format: `assets/media/upload_xxx.webp`).

---

## 📁 RINGKASAN PROYEK

| Atribut | Nilai |
|---|---|
| **Nama Proyek** | Falguni Photography Web App |
| **Pemilik/Klien** | Falguni (fotografer) |
| **Tujuan** | Portfolio website sekaligus sistem admin untuk fotografer dual-persona |
| **Status** | In Development (Local) |
| **Lokasi File** | `C:\Users\NDS-NB-ASUS-082\Downloads\web-dian-react\` |

---

## 🏗️ ARSITEKTUR SISTEM

```
┌─────────────────────────────────┐
│       BROWSER (User/Admin)      │
└───────────────┬─────────────────┘
                │ HTTP
┌───────────────▼─────────────────┐
│    VITE DEV SERVER              │
│    React 19 + TailwindCSS v4    │
│    Port: 5173 / 5174            │
└───────────────┬─────────────────┘
                │ Fetch API (REST)
┌───────────────▼─────────────────┐
│    EXPRESS.JS BACKEND           │
│    Node.js + JWT Auth           │
│    Port: 5000                   │
└──────┬────────────────┬─────────┘
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│ PostgreSQL  │  │ Cloudflare R2   │
│ (local)     │  │ (Object Storage)│
│ Port: 5432  │  │ S3-compatible   │
└─────────────┘  └─────────────────┘
```

---

## 🎨 DUAL-THEME SYSTEM

Website ini memiliki **dua persona/tema** yang bisa di-toggle oleh pengunjung:

| Aspek | Sport / Olahraga | Portrait / Wisuda |
|---|---|---|
| **Nama Brand** | Falguni Picture | Falguni Portrait |
| **Background** | Dark (`bg-dark`) | Light (`bg-light`) |
| **Typography** | `font-sans`, bold/uppercase | `font-serif`, italic/elegant |
| **Accent Color** | Merah (#ef4444), Abu Tua | Rose/Amber (#f43f5e, #fbbf24) |
| **Key Value** | `'sport'` | `'wedding'` (atau selain sport) |

**Logika Tema:**
```jsx
// Di setiap komponen
const isSport = theme === 'sport';

// Contoh conditional styling
className={isSport ? 'bg-red-600 text-white' : 'bg-rose-50 text-slate-900'}
```

**State Management:**
- Tema disimpan di `localStorage` (key: `falguni_theme`)
- Prop `theme` di-pass dari `App.jsx` ke semua komponen
- Default tema: `'sport'`

---

## 🖥️ FRONTEND STACK

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| CSS Framework | TailwindCSS | v4.2.x |
| Routing | React Router DOM | v7.x |
| Date Picker | react-datepicker | 9.x |
| Alert/Modal | SweetAlert2 + sweetalert2-react-content | 11.x |
| Icons | lucide-react | 1.16.x |
| AWS SDK (R2) | @aws-sdk/client-s3 | 3.x |

### Struktur `src/`
```
src/
├── App.jsx                   # Root component, routing, tema logic
├── main.jsx                  # Entry point React
├── index.css                 # Global styles, custom utilities
├── App.css                   # App-level styles
├── components/               # Public-facing components
│   ├── Navbar.jsx            # Navigasi + theme toggle
│   ├── Hero.jsx              # Landing section
│   ├── Portfolio.jsx         # Galeri portfolio + Lightbox trigger
│   ├── Lightbox.jsx          # Full-screen image viewer
│   ├── Pricing.jsx           # Paket harga dari DB
│   ├── About.jsx             # Profil fotografer
│   ├── Testimonials.jsx      # Slider review klien
│   ├── Contact.jsx           # Booking form → redirect WhatsApp
│   └── Footer.jsx            # Footer dinamis (Instagram dari settings)
├── admin/                    # Admin dashboard pages
│   ├── AdminLayout.jsx       # Shell layout sidebar + global search
│   ├── Dashboard.jsx         # Stat cards analytics
│   ├── Login.jsx             # Form autentikasi
│   ├── ProtectedRoute.jsx    # Route guard (cek JWT di localStorage)
│   ├── ManagePortfolio.jsx   # CRUD portfolio + upload gambar
│   ├── ManagePackages.jsx    # CRUD paket harga
│   ├── ManageTestimonials.jsx # CRUD testimoni
│   ├── ManageBookings.jsx    # Lihat + kelola booking
│   └── Settings.jsx          # WA number, Instagram, password admin
├── assets/                   # Static assets
├── config/                   # Config files
├── data/                     # Static data (jika ada)
└── hooks/                    # Custom hooks (jika ada)
```

### Routing
```
/               → Halaman publik utama (SPA, semua section)
/login          → Admin login page
/dashboard      → Protected (butuh JWT token)
  ├── /         → Dashboard (statistik)
  ├── /bookings → Manajemen booking
  ├── /portfolio → Manajemen portfolio
  ├── /packages  → Manajemen paket
  ├── /testimonials → Manajemen testimoni
  └── /settings  → Pengaturan & keamanan
```

### Autentikasi Frontend
- JWT token disimpan di `localStorage` dengan key `falguni_admin_token`
- Setiap request protected ke backend menyertakan header: `Authorization: Bearer <token>`
- `ProtectedRoute.jsx` mengecek token dan redirect ke `/login` jika tidak valid

---

## ⚙️ BACKEND STACK

| Layer | Teknologi | Versi |
|---|---|---|
| Runtime | Node.js | 20.x |
| Framework | Express.js | 4.x |
| Database Driver | pg (node-postgres) | - |
| Auth | jsonwebtoken + bcrypt | - |
| File Upload | multer (memory storage) | - |
| Image Processing | sharp (auto WebP convert) | - |
| Object Storage | @aws-sdk/client-s3 (R2) | 3.x |
| Env Config | dotenv + dotenvx | - |

### Struktur `server/`
```
server/
├── index.js          # Entry point, semua API route
├── db.js             # Pool koneksi PostgreSQL
├── auth.js           # verifyToken middleware, JWT_SECRET
├── init.sql          # Skema tabel + seed data awal
├── migrate.js        # Script migrasi
└── .env              # Variabel lingkungan (JANGAN di-commit)
```

### Environment Variables (`.env`)
```env
PORT=5000

# PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=falguni_db
DB_PASSWORD=<password>
DB_PORT=5432

# Cloudflare R2
R2_REGION=auto
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=falguni-portofolio
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
```

### JWT & Autentikasi Backend
- Token berlaku 24 jam
- Middleware `verifyToken` di `auth.js` melindungi semua route write/admin
- Default admin: username `admin`, password `admin123` (auto-created jika belum ada)

---

## 🗄️ DATABASE SCHEMA (PostgreSQL)

### Tabel `events` — Portfolio
```sql
id           SERIAL PRIMARY KEY
title        VARCHAR(255) NOT NULL
theme        VARCHAR(50) NOT NULL  -- 'sport' atau 'wedding'
created_at   TIMESTAMP WITH TIME ZONE
UNIQUE(title, theme)
```

### Tabel `event_images` — Gambar Portfolio
```sql
id           SERIAL PRIMARY KEY
event_id     INTEGER → events(id) ON DELETE CASCADE
url          TEXT NOT NULL  -- Key R2: 'assets/media/upload_xxx.webp'
is_cover     BOOLEAN DEFAULT FALSE
created_at   TIMESTAMP WITH TIME ZONE
```

### Tabel `packages` — Paket Harga
```sql
id           SERIAL PRIMARY KEY
theme        VARCHAR(50) NOT NULL  -- 'sport' atau 'portrait'
name         VARCHAR(255) NOT NULL
tag          VARCHAR(100)          -- Badge promo, e.g. 'Best Seller'
features     JSONB NOT NULL        -- Array of strings
is_popular   BOOLEAN DEFAULT FALSE
created_at   TIMESTAMP WITH TIME ZONE
```

### Tabel `testimonials` — Ulasan Klien
```sql
id           SERIAL PRIMARY KEY
client_name  VARCHAR(255) NOT NULL
role         VARCHAR(255)          -- e.g. 'Wisudawan UGM 2025'
review       TEXT NOT NULL
rating       INTEGER DEFAULT 5
created_at   TIMESTAMP WITH TIME ZONE
```

### Tabel `bookings` — Log Pemesanan
```sql
id           SERIAL PRIMARY KEY
client_name  VARCHAR(255) NOT NULL
event        VARCHAR(255) NOT NULL  -- Nama paket yang dipilih
event_date   TIMESTAMP WITH TIME ZONE
message      TEXT                   -- Pesan tambahan
location     VARCHAR(255)           -- Lokasi/venue sesi
theme_ref    VARCHAR(255)           -- Referensi tema/konsep
instagram    VARCHAR(255)           -- Username Instagram klien
status       VARCHAR(50) DEFAULT 'pending'  -- 'pending' / 'approved'
created_at   TIMESTAMP WITH TIME ZONE
```

### Tabel `analytics` — Tracking Pengunjung
```sql
id           SERIAL PRIMARY KEY
event_type   VARCHAR(100) NOT NULL  -- 'page_view', 'view_event', dll
theme        VARCHAR(50)            -- Tema aktif saat event
metadata     JSONB                  -- Info tambahan (path, title, dll)
created_at   TIMESTAMP WITH TIME ZONE
```

### Tabel `admin_users` — Akun Admin
```sql
id             SERIAL PRIMARY KEY
username       VARCHAR(100) UNIQUE NOT NULL
password_hash  VARCHAR(255) NOT NULL
created_at     TIMESTAMP WITH TIME ZONE
```

### Tabel `site_settings` — Pengaturan Dinamis
```sql
id             SERIAL PRIMARY KEY
setting_key    VARCHAR(100) UNIQUE NOT NULL
setting_value  TEXT NOT NULL
created_at     TIMESTAMP WITH TIME ZONE
updated_at     TIMESTAMP WITH TIME ZONE
```
**Data default:**
- `whatsapp_number` → `'6282136009894'`
- `instagram_username` → `'falgunipicture'`

---

## 📡 API ENDPOINTS REFERENCE

Base URL: `http://localhost:5000`

### 🔐 Auth
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/login` | Public | Login admin, return JWT token |

**Request Body POST `/api/login`:**
```json
{ "username": "admin", "password": "admin123" }
```
**Response:**
```json
{ "success": true, "token": "<jwt_token>" }
```

---

### 📊 Analytics
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/analytics` | Public | Track event (page_view, view_event, dll) |
| GET | `/api/analytics/stats` | JWT | Statistik dashboard admin |

**Request Body POST `/api/analytics`:**
```json
{
  "event_type": "page_view",
  "theme": "sport",
  "metadata": { "path": "/" }
}
```
**Response GET `/api/analytics/stats`:**
```json
{
  "totalViews": 120,
  "sportViews": 80,
  "weddingViews": 40,
  "totalEvents": 15,
  "totalBookings": 7,
  "topContent": [
    { "title": "Arema FC vs Persija", "views": 23 }
  ]
}
```

---

### 🖼️ Events (Portfolio)
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/events` | Public | Ambil semua event (+ gambarnya) |
| GET | `/api/events?theme=sport` | Public | Filter by tema |
| POST | `/api/events` | JWT | Buat event baru |
| PUT | `/api/events/:id` | JWT | Update judul/tema event |
| DELETE | `/api/events/:id` | JWT | Hapus event + semua gambar dari R2 |
| POST | `/api/events/:eventId/images` | JWT | Tambah gambar ke event yang ada |
| DELETE | `/api/events/:eventId/images/:imageId` | JWT | Hapus 1 gambar dari event + R2 |
| PUT | `/api/events/:eventId/images/:imageId/cover` | JWT | Set gambar sebagai cover event |

**Response GET `/api/events`:**
```json
[
  {
    "id": 1,
    "title": "Arema FC vs Persija 2025",
    "theme": "sport",
    "images": [
      { "id": 5, "url": "assets/media/upload_xxx.webp", "is_cover": true },
      { "id": 6, "url": "assets/media/upload_yyy.webp", "is_cover": false }
    ]
  }
]
```

---

### 📦 Packages (Paket Harga)
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/packages` | Public | Ambil semua paket |
| POST | `/api/packages` | JWT | Buat paket baru |
| PUT | `/api/packages/:id` | JWT | Update paket |
| DELETE | `/api/packages/:id` | JWT | Hapus paket |

**Request Body POST/PUT `/api/packages`:**
```json
{
  "theme": "sport",
  "name": "Basic Sport",
  "tag": "Best Seller",
  "features": ["100 Edited Photos", "2 Hours Session", "Online Gallery"],
  "is_popular": false
}
```

---

### 💬 Testimonials
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/testimonials` | Public | Ambil semua testimoni |
| POST | `/api/testimonials` | JWT | Tambah testimoni |
| PUT | `/api/testimonials/:id` | JWT | Update testimoni |
| DELETE | `/api/testimonials/:id` | JWT | Hapus testimoni |

---

### 📅 Bookings
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/bookings` | JWT | Lihat semua booking (admin) |
| POST | `/api/bookings` | Public | Submit booking baru (dari form publik) |
| DELETE | `/api/bookings/:id` | JWT | Hapus booking |
| PUT | `/api/bookings/:id/status` | JWT | Update status booking |

**Request Body POST `/api/bookings`:**
```json
{
  "client_name": "John Doe",
  "event": "Sport Package Basic",
  "event_date": "2026-06-15T00:00:00Z",
  "message": "Tolong bawa drone juga",
  "location": "Stadion Manahan Solo",
  "theme_ref": "Action, Dynamic",
  "instagram": "@johndoe"
}
```

---

### ☁️ Upload (File ke R2)
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/upload` | JWT | Upload file (multipart/form-data), auto-WebP |
| DELETE | `/api/upload` | JWT | Hapus file orphan dari R2 |

**Request POST `/api/upload`:** multipart/form-data dengan field `file`

**Response:**
```json
{ "success": true, "path": "assets/media/upload_1234567890_abc123.webp" }
```
> ⚠️ `path` yang dikembalikan adalah **key R2**, bukan URL lengkap. Frontend menggunakan helper `getAssetUrl(path)` untuk membentuk URL lengkap dari R2 public domain.

---

### ⚙️ Settings
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/settings` | Public | Ambil semua setting (WA number, Instagram) |
| PUT | `/api/settings` | JWT | Update setting (key-value pairs) |
| PUT | `/api/admin/password` | JWT | Ganti password admin |

**Response GET `/api/settings`:**
```json
{
  "whatsapp_number": "6281299880030",
  "instagram_username": "falgunipicture"
}
```

---

### 🔍 Global Search (Admin)
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/search?q=keyword` | JWT | Cari di bookings, portfolio, testimonials |

---

### ❤️ Health Check
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/health` | Public | Cek apakah backend berjalan |

---

## 🔑 CATATAN TEKNIS PENTING

### Emoji di Template WhatsApp
Emoji di string JavaScript **HARUS** menggunakan format **UTF-16 surrogate pair** agar tidak rusak:
```js
// ✅ BENAR — Dijamin aman dari bundler apapun
const text = 'BOOKING FORM \uD83D\uDCF8\u2728';

// ❌ SALAH — Bisa rusak saat dibundle oleh Vite di Windows
const text = 'BOOKING FORM 📸✨';

// ❌ SALAH — Bisa ditransform oleh Babel/SWC
const text = 'BOOKING FORM \u{1F4F8}\u{2728}';
```

### WhatsApp Redirect URL
```js
// ✅ BENAR — Langsung ke API tanpa wa.me redirector
window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodedText}`, '_blank');

// ❌ SALAH — wa.me merusak UTF-8 emoji saat redirect 302
window.open(`https://wa.me/${waNumber}?text=${encodedText}`, '_blank');
```

### Cloudflare R2 Image URL
```js
// File path dari DB (key R2): 'assets/media/upload_xxx.webp'
// Public URL: `${R2_PUBLIC_DOMAIN}/${filePath}`
// Gunakan helper getAssetUrl() yang sudah ada di config/
```

### Lucide React Exports
Tidak semua ikon tersedia di versi yang terinstal (`^1.16.0`). Jika ada error `does not provide an export named 'X'`, ganti dengan inline SVG.

---

## 🚀 CARA MENJALANKAN LOKAL

```bash
# 1. Jalankan PostgreSQL dan buat database
createdb falguni_db
psql -U postgres -d falguni_db -f server/init.sql

# 2. Jalankan Backend
cd server
node index.js
# → Server running on port 5000

# 3. Jalankan Frontend (terminal terpisah)
cd ..  # ke root web-dian-react
npm run dev
# → Vite dev server at http://localhost:5173
```

### Login Admin
- URL: `http://localhost:5173/login`
- Username: `admin`
- Password: `admin123` *(ganti segera setelah setup)*

---

*Dokumen ini diperbarui terakhir pada: 2026-05-18*
