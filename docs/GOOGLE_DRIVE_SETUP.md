# Panduan Lengkap Memperoleh Kredensial Google Drive API

Panduan ini menuntun Anda langkah demi langkah untuk mendapatkan 4 variabel Google Drive di Google Cloud Console dan Google Drive.

---

## 1. Buat Proyek & Aktifkan Google Drive API

1. Buka browser dan kunjungi [Google Cloud Console](https://console.cloud.google.com/).
2. Login menggunakan **akun Google resmi organisasi/komunitas**.
3. Di bagian atas, klik **Select a project** -> klik **New Project**.
4. Beri nama proyek: `Pandawa App Storage` -> klik **Create**.
5. Masuk ke menu **APIs & Services** -> **Enabled APIs & Services** -> klik **+ ENABLE APIS AND SERVICES**.
6. Cari `Google Drive API` -> klik hasil pencarian -> klik tombol **Enable**.

---

## 2. Konfigurasi OAuth Consent Screen

1. Di menu sebelah kiri, klik **OAuth consent screen**.
2. Pilih User Type: **External** -> klik **Create**.
3. Isi informasi dasar:
   * **App name:** `Pandawa App`
   * **User support email:** (pilih email Anda)
   * **Developer contact information:** (masukkan email Anda)
4. Klik **Save and Continue** melewati tab Scopes.
5. Pada tab **Test users**, klik **+ ADD USERS**, masukkan alamat email Google Anda yang sedang dipakai ini -> klik **Save and Continue**.

---

## 3. Dapatkan GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET

1. Di menu sebelah kiri, klik **Credentials**.
2. Di bagian atas, klik **+ CREATE CREDENTIALS** -> pilih **OAuth client ID**.
3. Pada **Application type**, pilih **Web application**.
4. Beri nama: `Pandawa Web Client`.
5. Di bagian **Authorized redirect URIs**, klik **+ ADD URI** dan tambahkan:
   * `https://developers.google.com/oauthplayground`
   *(URI ini diperlukan agar Anda bisa generate Refresh Token melalui Google OAuth Playground)*
6. Klik **CREATE**.
7. Jendela pop-up akan menampilkan:
   * **Client ID** -> salin ke `GOOGLE_CLIENT_ID` di `.env.local`
   * **Client Secret** -> salin ke `GOOGLE_CLIENT_SECRET` di `.env.local`

---

## 4. Dapatkan GOOGLE_REFRESH_TOKEN (Menggunakan OAuth Playground)

1. Buka tab baru di browser dan kunjungi [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Di pojok kanan atas, klik ikon **Roda Gigi (OAuth 2.0 configuration)**:
   * Centang opsi **Use your own OAuth credentials**.
   * Masukkan **OAuth Client ID** Anda dari Langkah 3.
   * Masukkan **OAuth Client secret** Anda dari Langkah 3.
3. Di panel sebelah kiri (**Step 1: Select & authorize APIs**):
   * Scroll ke bawah ke `Drive API v3`.
   * Centang scope: `https://www.googleapis.com/auth/drive` (atau `https://www.googleapis.com/auth/drive.file`).
4. Klik tombol biru **Authorize APIs**.
5. Google akan meminta izin login -> pilih akun Google organisasi Anda -> jika muncul peringatan "Google hasn't verified this app", klik **Advanced** -> klik **Go to Pandawa App (unsafe)** -> klik **Continue**.
6. Anda akan diarahkan ke **Step 2: Exchange authorization code for tokens**:
   * Klik tombol biru **Exchange authorization code for tokens**.
7. Di panel kanan, Anda akan melihat kolom **Refresh token**:
   * Salin nilai tersebut ke `GOOGLE_REFRESH_TOKEN` di `.env.local`.

---

## 5. Dapatkan GOOGLE_DRIVE_ROOT_FOLDER_ID

1. Buka [Google Drive](https://drive.google.com/) menggunakan akun organisasi Anda.
2. Buat folder baru khusus, beri nama misalnya: `PANDAWA_APP_STORAGE`.
3. Buka (masuk ke dalam) folder tersebut.
4. Perhatikan URL pada browser Anda di address bar:
   ```
   https://drive.google.com/drive/folders/1aBcD_xyz1234567890-AbCdEfGhIjKl
   ```
5. Bagian kode acak setelah `/folders/` (contoh: `1aBcD_xyz1234567890-AbCdEfGhIjKl`) adalah ID folder induk.
6. Salin kode tersebut ke `GOOGLE_DRIVE_ROOT_FOLDER_ID` di `.env.local`.

---

## Ringkasan Format pada `.env.local`:
```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REFRESH_TOKEN=1//04xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_ROOT_FOLDER_ID=1aBcD_xyz1234567890-AbCdEfGhIjKl
```
