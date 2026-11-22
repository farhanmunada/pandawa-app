# Panduan Konfigurasi Variabel Lingkungan (.env) & Better Auth Dashboard

## 1. Penjelasan Variabel Lingkungan
Buat berkas `.env.local` di root proyek (`D:\Coding\pandawa-app\.env.local`) dan isi dengan konfigurasi berikut:

```env
# 1. Database Neon
DATABASE_URL=postgresql://username:password@ep-xxxx-pooler.us-east-2.aws.neon.tech/pandawadb?sslmode=require

# 2. Better Auth
BETTER_AUTH_SECRET=buat_random_secret_32_karakter
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_API_KEY=ba_v0k2ujpl19uwtoiqth893uc39mw8hh7q

NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. Google Drive API (Untuk Fase berikutnya)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
```

---

## 2. Di mana Posisi BETTER_AUTH_URL dan Apa Fungsinya?
* **Di mana diletakkan?** Di dalam file `.env.local` pada baris: `BETTER_AUTH_URL=http://localhost:3000`.
* **Apa fungsinya?** Memberitahu Better Auth di mana server aplikasi Anda berada (origin URL) agar pengalihan cookie sesi, verifikasi callback, dan CORS berjalan aman.

---

## 3. Cara Menghubungkan ke Better Auth Cloud Dashboard

Pada form **"Hubungkan Aplikasi Anda"** di dasbor Better Auth Cloud:
1. **URL tempat aplikasi Anda diunggah:**
   * **Saat di Localhost:** Karena server dasbor Better Auth berada di cloud publik, mereka tidak dapat langsung menembus `http://localhost:3000` di laptop Anda. Maka Anda perlu menjalankan tunnel di terminal:
     ```bash
     npx ngrok http 3000
     ```
     atau
     ```bash
     cloudflared tunnel --url localhost:3000
     ```
     Lalu **salin URL https hasil tunnel tersebut** (misal: `https://abcd-1234.ngrok-free.app`) dan tempelkan ke kolom form tersebut.
   * **Saat sudah di Vercel (Produksi):** Masukkan domain produksi Anda (misal: `https://pandawa-app.vercel.app`).
2. **Jalur menuju API Better Auth Anda:**
   * Tetap gunakan nilai bawaan: `/api/auth` (karena rute handler telah kami buat di `src/app/api/auth/[...all]/route.ts`).
3. **Header kustom:**
   * Kosongkan saja (opsional).
