# Panduan Konfigurasi Variabel Lingkungan (.env)

Sistem telah beralih penuh ke autentikasi internal mandiri (Nomor Anggota & Kata Sandi) berbasis sesi HTTP-only cookie di PostgreSQL. Seluruh variabel Better Auth telah dihapus.

---

## 1. Variabel Lingkungan Aktif

Isi berkas `.env.local` di root proyek Anda (`D:\Coding\pandawa-app\.env.local`) hanya memerlukan variabel berikut:

```env
# 1. Database Neon (PostgreSQL Serverless)
DATABASE_URL=postgresql://username:password@ep-xxxx-pooler.us-east-2.aws.neon.tech/pandawadb?sslmode=require

# 2. Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. Google Drive API (Penyimpanan Berkas Organisasi)
GOOGLE_CLIENT_ID=ganti_dengan_google_oauth_client_id
GOOGLE_CLIENT_SECRET=ganti_dengan_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=ganti_dengan_google_oauth_refresh_token
GOOGLE_DRIVE_ROOT_FOLDER_ID=ganti_dengan_root_drive_folder_id
```

---

## 2. Variabel yang Sudah Dihapus (Boleh Dihapus dari .env.local Anda)
Variabel berikut sudah **tidak digunakan** dan aman untuk dihapus:
* `BETTER_AUTH_SECRET`
* `BETTER_AUTH_URL`
* `BETTER_AUTH_API_KEY`
