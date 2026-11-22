# Dokumen Riset Teknis (Technical Research)

**Proyek:** Sistem Informasi Manajemen Administrasi & Operasional Organisasi Kepemudaan (Pandawa App)  
**Tanggal:** 22 November 2026  
**Status:** Selesai / Terverifikasi  

---

## 1. Latar Belakang & Masalah
Organisasi kepemudaan (seperti Karang Taruna atau komunitas pemuda) memiliki dinamika operasional lapangan yang unik:
1. **Pergantian Pengurus Berkala:** Masa bakti periodik (misal 2–3 tahun) seringkali menyebabkan hilangnya riwayat keuangan, arsip surat, dan inventaris barang.
2. **Multi-Peran (Dynamic Multi-Role):** Satu orang pengurus sering kali merangkap peran (misalnya anggota Sie Acara sekaligus bendahara kepanitiaan tertentu).
3. **Keterbatasan Anggaran IT:** Sistem harus berjalan di infrastruktur gratis / murah (*serverless free tier*) tanpa biaya langganan database atau storage cloud komersial (seperti AWS S3).
4. **Operasional Mobile-First:** Mayoritas admin dan anggota mengakses aplikasi melalui smartphone saat berkegiatan di lapangan atau balai pertemuan.

---

## 2. Riset & Pemilihan Tech Stack

### 2.1 Frontend & Backend Framework: Next.js 15+ (App Router & Server Actions)
* **Karakteristik:** Full-stack React framework dengan arsitektur hybrid (Server Components + Client Components) dan TypeScript.
* **Keunggulan:**
  * Server Actions menyederhanakan mutasi data tanpa perlu membuat REST API boilerplate terpisah.
  * Server Components mengurangi beban JavaScript di sisi klien, mempercepat *first paint* di perangkat mobile.
  * Dukungan native untuk deployment cepat di Vercel.
* **Tantangan & Solusi:**
  * *Batas Request Body Vercel:* 4.5 MB per request. File foto nota dan dokumentasi harus dikompresi di browser (< 1 MB) sebelum diunggah melalui Server Action atau menggunakan Google Drive Resumable Upload session.

### 2.2 Database & ORM: Neon PostgreSQL + Drizzle ORM
* **Neon PostgreSQL:**
  * Serverless Postgres dengan arsitektur pemisahan *storage* dan *compute*.
  * *Scale-to-zero* saat tidak ada traffic (sangat hemat untuk tier gratis).
  * Dilengkapi built-in connection pooler (`-pooler`) berbasis PgBouncer untuk menangani lonjakan koneksi serverless.
* **Drizzle ORM:**
  * Sangat ringan (zero overhead, query builder transparan mirip SQL asli).
  * Waktu *cold start* mendekati nol, jauh lebih cepat dibanding Prisma pada lingkungan serverless.
  * Skema didefinisikan secara deklaratif di TypeScript (`schema.ts`) dengan migrasi aman via `drizzle-kit`.

### 2.3 Autentikasi & Dynamic Multi-Role RBAC: Better Auth
* **Evaluasi Solusi:**
  * *NextAuth (Auth.js v5):* Stabil, namun pengelolaan multi-role dinamis dan permission matrix memerlukan kustomisasi token/session callback yang cukup rumit.
  * *Better Auth:* Native TypeScript, mendukung multi-role dan RBAC secara bawaan, manajemen session berbasis database yang aman, dan mendukung ekstensi custom role/permission dengan rapi.
* **Pola Otorisasi:**
  * Sesi divalidasi di layer middleware (untuk route protection) dan *Server Actions* (untuk otorisasi fungsional di server-side).
  * Tabel relasi `user_roles` dan matriks permission granular (`module:action`) untuk memastikan pengguna hanya dapat mengeksekusi aksi yang diizinkan.

### 2.4 Penyimpanan File & Dokumen: Google Drive API v3 (OAuth 2.0)
* **Strategi Biaya Rp0:**
  * Menggunakan akun Google resmi organisasi (15 GB Google Drive gratis).
  * Autentikasi server-to-server menggunakan OAuth 2.0 dengan *Refresh Token* yang disimpan aman di environment variable.
* **Hierarki Folder Otomatis:**
  * Saat pertama kali diinisialisasi, sistem membuat root folder `/PANDAWA_APP_ROOT/`.
  * Modul membuat sub-folder otomatis:
    * `01_KAS_NOTA/`
    * `02_PERSURATAN/`
    * `03_INVENTARIS/`
    * `04_KEGIATAN/<tahun-bulan>_<nama-kegiatan>/`
    * `05_LAPORAN_KEJADIAN/<id-kejadian>/`
* **Pola Kompresi Gambar Klien:**
  * Menggunakan pustaka klien `browser-image-compression`.
  * Gambar dikompresi ke format WebP/JPEG dengan resolusi maksimal 1920x1080 dan ukuran file target < 800 KB sebelum dikirim ke server.

### 2.5 UI / UX & Komponen: Tailwind CSS + shadcn/ui
* **Mobile-First Layout:**
  * Navigasi bawah (*Bottom Navigation Bar*) untuk navigasi cepat di smartphone (Beranda, Keuangan, Persuratan, Inventaris, Profil).
  * *Drawer / Sheet* untuk menu aksi sekunder dan filter data.
  * Komponen data table responsif (tampilan kartu di mobile, tabel lebar di desktop/tablet).
* **Komponen Aksesibilitas:** Berbasis Radix UI primitives yang responsif dan mendukung keyboard/screen-reader.

---

## 3. Matriks Risiko & Mitigasi Teknis

| Risiko Teknis | Dampak | Probabilitas | Strategi Mitigasi |
| :--- | :--- | :--- | :--- |
| **Cold Start Database Neon** | Query pertama setelah idle memakan waktu 1–3 detik | Tinggi | Implementasikan skeleton loading state di Next.js; optimalkan connection pooler; query hanya field yang dibutuhkan. |
| **Batas Request Payload Vercel (4.5 MB)** | Upload foto nota/kegiatan gagal dengan error HTTP 413 | Sedang | Kompresi wajib di browser sebelum upload; validasi ukuran file di sisi klien & server. |
| **Google Drive Token Expired / Revoked** | Upload file gagal | Rendah | Implementasikan auto-refresh mechanism pada Google OAuth2 Client menggunakan Refresh Token tersimpan; buat mekanisme fallback retry. |
| **Konflik Multi-Role Pengurus** | Kebingungan izin akses saat user memiliki >1 role | Sedang | Matriks izin menggunakan prinsip *additive union* (hak akses tertinggi yang berlaku); catat audit log untuk setiap aksi pengurus. |
| **Integritas Transaksi Kas** | Selisih saldo akibat eksekusi konkuren | Rendah | Gunakan PostgreSQL transactional blocks (`db.transaction()`) saat mencatat mutasi kas dan mengupdate saldo dompet. |

---

## 4. Kesimpulan Riset
Arsitektur yang diusulkan (Next.js 15 + Neon + Drizzle + Better Auth + Google Drive API) memenuhi seluruh kriteria: biaya operasional Rp0 (serverless & cloud gratis), tahan terhadap pergantian pengurus, performa optimal di perangkat mobile, serta menjamin integritas data dan audit trail organisasi.
