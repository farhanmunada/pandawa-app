# Pandawa App (Sistem Informasi Manajemen Organisasi Kepemudaan)

Platform tata kelola administrasi, keuangan, persuratan resmi, sirkulasi aset, manajemen kegiatan, dan penanganan insiden organisasi kepemudaan (Karang Taruna / Himpunan Pemuda). Dibangun dengan arsitektur full-stack modern, hemat biaya (Rp0 / serverless tier), dan responsif *mobile-first*.

---

## 🔑 Kredensial Akun Demo (Testing & Pengembangan)

Seluruh akun demo telah di-seed langsung ke database Neon dan siap digunakan untuk masuk di halaman `http://localhost:3000/sign-in`:

| Peran / Divisi | Alamat Email | Kata Sandi | Deskripsi & Hak Akses |
| :--- | :--- | :--- | :--- |
| **Ketua Umum** | `ketua@pandawa.test` | `Password123!` | Pimpinan tertinggi, supervisi seluruh divisi, approval kas `> Rp500.000`, laporan rahasia. |
| **Wakil Ketua** | `wakil@pandawa.test` | `Password123!` | Pengelola keorganisasian internal, CRUD anggota, struktur kepengurusan, dan divisi. |
| **Sekretaris** | `sekretaris@pandawa.test` | `Password123!` | Pengelola persuratan resmi (Surat Masuk/Keluar, SP 1-3, Girik Iuran, TTD Digital tanpa barcode). |
| **Bendahara** | `bendahara@pandawa.test` | `Password123!` | Pengelola arus kas multi-wallet, rekonsiliasi iuran rutin, dan iuran acara. |
| **Divisi Humas** | `humas@pandawa.test` | `Password123!` | Pengelola kalender agenda terpadu (tersinkron ke anggota) & pembuat pesan sounding WhatsApp. |
| **Anggota** | `anggota@pandawa.test` | `Password123!` | Akses kalender tersinkronisasi, cek tagihan iuran, peminjaman aset (harga dalam), forum aspirasi. |

> *Catatan: Anda juga dapat mendaftarkan akun baru secara langsung melalui halaman `/sign-up`.*

---

## 🚀 Menjalankan Aplikasi di Lokal

1. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
2. Buka peramban dan akses:
   * **Beranda:** [http://localhost:3000](http://localhost:3000)
   * **Halaman Masuk (Sign In):** [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
   * **Halaman Daftar (Sign Up):** [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
   * **Internal Anggota (Wakil Ketua):** [http://localhost:3000/internal/members](http://localhost:3000/internal/members)

---

## 🛠️ Stack Teknologi

* **Frontend & Backend:** Next.js 16 (App Router, Server Actions, TypeScript)
* **Database:** Neon PostgreSQL Serverless (`@neondatabase/serverless`)
* **ORM & Migrations:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
* **Autentikasi & Otorisasi:** Better Auth (`better-auth`, `@better-auth/infra`) dengan Dynamic Multi-Role RBAC
* **Styling & UI:** Tailwind CSS v4, Lucide React, Layout Mobile-First (BottomNav, AppDrawer, HeaderBar)
* **Media & File Storage:** Google Drive API v3 (OAuth 2.0 Refresh Token)

---

## 📂 Struktur Direktori Proyek

```
pandawa-app/
├── docs/                 # Dokumentasi PRD, Arsitektur, Riset, dan Panduan Setup
│   ├── PRD.md            # Product Requirements Document (v1.1.0)
│   ├── ARCHITECTURE.md   # Desain Arsitektur & Skema Database
│   ├── RESEARCH.md       # Riset Teknis
│   ├── SETUP_ENV.md      # Panduan Konfigurasi .env & Better Auth Cloud
│   └── GOOGLE_DRIVE_SETUP.md # Panduan Kredensial Google Drive API
├── drizzle/              # Berkas SQL Migrasi Database Drizzle
├── src/
│   ├── app/
│   │   ├── (auth)/       # Rute Registrasi & Login (sign-up, sign-in)
│   │   ├── (dashboard)/  # Rute Operasional & Layanan Divisi
│   │   │   └── internal/members/ # CRUD Anggota Khusus Wakil Ketua
│   │   ├── api/auth/     # Endpoint Handler Better Auth (/api/auth/[...all])
│   │   └── page.tsx      # Beranda & Ringkasan 6 Modul Divisi
│   ├── components/
│   │   └── layout/       # BottomNav, HeaderBar, MobileDrawer, AppShell
│   └── lib/
│       ├── auth/         # Better Auth instance, client, RBAC guard, permissions
│       └── db/           # Koneksi Neon DB, skema relasional 24 tabel, seed script
└── tasks/
    └── todo.md           # Pelacak Progres Fase 1 - 5
```

---

## 📜 Perintah Database yang Sering Digunakan

* **Generate Migrasi Baru:**
  ```bash
  npx drizzle-kit generate
  ```
* **Push Skema ke Database Neon:**
  ```bash
  npx drizzle-kit push --force
  ```
* **Seed Ulang Akun Demo & Peran:**
  ```bash
  npx tsx -e "import { seedInitialData } from './src/lib/db/seed'; seedInitialData();"
  ```
