# Pandawa App (Sistem Informasi Manajemen Organisasi Kepemudaan)

Platform tata kelola administrasi, keuangan, persuratan resmi, sirkulasi aset, manajemen kegiatan, dan penanganan insiden organisasi kepemudaan (seperti Karang Taruna, himpunan pemuda tingkat RW/Desa/Kelurahan). Dibangun dengan arsitektur full-stack modern, hemat biaya (*serverless free tier*), dan antarmuka responsif *mobile-first*.

---

## 🛠️ Spesifikasi Arsitektur & Tech Stack

* **Frontend & Backend Framework:** Next.js 16 (React 19, App Router, Server Actions, TypeScript)
* **Database Utama:** Neon (PostgreSQL Serverless) dengan connection pooling (`-pooler`)
* **ORM & Migrations:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
* **Autentikasi & Dynamic RBAC:** Better Auth (`better-auth`, `@better-auth/infra`) dengan hierarki izin granular berbasis Divisi/Jabatan
* **Penyimpanan Berkas & Media:** Google Drive API v3 (OAuth 2.0 Refresh Token) dengan kompresi gambar di sisi peramban (*client-side compression*)
* **UI & Desain Sistem:** Tailwind CSS v4, Lucide Icons, Mobile-First Layout (BottomNav, AppDrawer, HeaderBar)

---

## 🏛️ Struktur Divisi & Hak Akses Organisasi

Sistem menerapkan model **Dynamic Multi-Role RBAC** tanpa istilah "Admin", melainkan disesuaikan dengan struktur kepengurusan:

1. **Ketua Umum:** Supervisi menyeluruh, persetujuan pengeluaran kas bernominal besar (`> Rp500.000`), penandatanganan surat resmi, dan investigasi insiden rahasia.
2. **Wakil Ketua (Bidang Internal):** Pengelola tunggal tata keorganisasian ke dalam, pendaftaran anggota, penetapan jabatan struktural, dan pembagian divisi.
3. **Divisi Kesekretariatan (Sekretaris):** Pengelola tata persuratan resmi (Surat Masuk, Surat Keluar berpenomoran otomatis: Undangan, Peringatan SP 1–3, Girik Iuran, Surat Tugas) dengan pengesahan TTD digital resmi (tanpa barcode).
4. **Divisi Keuangan (Bendahara):** Pengelola arus kas multi-wallet (Kas Utama, Kas Sosial, Kas Usaha, Kas Acara), pencatatan nota transaksi wajib, dan rekonsiliasi iuran rutin.
5. **Divisi Acara:** Perencanaan kegiatan, Rencana Anggaran Biaya (RAB), kepanitiaan, dan generator formulir tracking iuran khusus per acara.
6. **Divisi Humas:** Pengelola Kalender Agenda Terpadu (*Big Interactive Calendar View*) yang tersinkronisasi otomatis ke seluruh dashboard anggota, serta generator pesan siaran (*sounding*) WhatsApp.
7. **Divisi Logistik & Inventaris:** Pengelola katalog aset perlengkapan dengan **Skema Harga Ganda** (Harga Dalam untuk anggota/warga vs Harga Luar untuk pihak komersial).
8. **Divisi Keamanan & Konseling:** Penanganan insiden lapangan, tiket pengaduan publik vs laporan rahasia (*confidential*), dan notula mediasi.
9. **Anggota (Member):** Akses kalender terpadu, pemantauan tagihan iuran, pengajuan pinjam inventaris harga subsidi, dan forum aspirasi publik.

---

## 📂 Struktur Direktori Proyek

```
pandawa-app/
├── docs/                 # Dokumentasi Lengkap Sistem (PRD, Arsitektur, Riset)
│   ├── PRD.md            # Product Requirements Document (v1.1.0)
│   ├── ARCHITECTURE.md   # Desain Arsitektur Sistem & Drizzle Schema
│   ├── RESEARCH.md       # Riset Teknis & Evaluasi Infrastruktur
│   ├── SETUP_ENV.md      # Panduan Konfigurasi Environment & Better Auth
│   └── GOOGLE_DRIVE_SETUP.md # Panduan Kredensial Google Drive API
├── drizzle/              # Berkas SQL Migrasi Database Drizzle (24 Tabel)
├── src/
│   ├── app/
│   │   ├── (auth)/       # Portal Autentikasi (sign-up, sign-in)
│   │   ├── (dashboard)/  # Modul Operasional & Layanan Divisi
│   │   │   └── internal/members/ # Manajemen Anggota & Jabatan (Wakil Ketua)
│   │   ├── api/auth/     # Endpoint Server Better Auth (/api/auth/[...all])
│   │   └── page.tsx      # Dashboard Utama & Ringkasan 6 Modul
│   ├── components/
│   │   └── layout/       # Komponen Mobile-First (BottomNav, HeaderBar, Drawer)
│   └── lib/
│       ├── auth/         # Konfigurasi Better Auth, RBAC Guard, Matriks Izin
│       └── db/           # Koneksi Neon DB, Skema Relasional, Script Seed
└── tasks/
    └── todo.md           # Pelacak Progres Implementasi Fase 1–5
```

---

## 🚀 Panduan Memulai di Lingkungan Lokal

### 1. Prasyarat
* Node.js v20+ atau v24+
* Database PostgreSQL (Neon Serverless)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan
Salin berkas `.env.example` menjadi `.env.local` dan lengkapi variabel yang dibutuhkan:
```bash
cp .env.example .env.local
```

### 4. Sinkronisasi Database
Jalankan migrasi skema tabel ke database:
```bash
npx drizzle-kit push --force
```

### 5. Inisialisasi Data Peran Divisi
```bash
npx tsx -e "import { seedInitialData } from './src/lib/db/seed'; seedInitialData();"
```

### 6. Menjalankan Server Development
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 📜 Perintah Pemeliharaan Sistem

* **Linting Kode:** `npm run lint`
* **Pemeriksaan Type Safety:** `npx tsc --noEmit`
* **Build Produksi:** `npm run build`
* **Generate Migrasi SQL:** `npx drizzle-kit generate`
