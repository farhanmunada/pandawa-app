# Panduan Integrasi Neon PostgreSQL & Better Auth (Neon Auth)

Betul sekali! Neon memiliki fitur resmi bernama **Neon Auth**, yaitu layanan autentikasi terkelola (*Managed Identity*) yang didukung langsung oleh arsitektur **Better Auth**.

Berikut adalah penjelasan dua model integrasi yang tersedia di Neon dan rekomendasi untuk **Pandawa App**:

---

## Opsi 1: Self-Hosted Better Auth dengan Neon (Sudah Terpasang di Proyek Kita - Rekomendasi Utama)

Pada model ini, logika Better Auth berjalan langsung di dalam Next.js (pada `src/lib/auth/better-auth.ts`), sementara database Neon bertindak sebagai penyimpan data via **Drizzle ORM**.

### Keunggulan untuk Pandawa App:
1. **Relasi Foreign Key Langsung:** Tabel `user` berada di satu skema dengan tabel `members`, `cash_transactions`, `letters`, dan `events`. Ini memudahkan query `JOIN` dan menjaga integritas data tanpa batasan *cross-schema*.
2. **Kustomisasi Role Bebas Biaya:** Skema Dynamic RBAC divisi (Ketua, Wakil, Sekretaris, Bendahara, dll.) langsung menyatu dengan `drizzle/` migrasi kita.
3. **Mendukung Dashboard Better Auth (`@better-auth/infra`):** Tetap dapat terhubung ke dasbor Better Auth Cloud yang Anda buat sebelumnya.

### Cara Menghubungkannya ke Neon:
1. Buka [Neon Console](https://console.neon.tech/).
2. Pada Dashboard proyek Neon Anda, salin **Connection String** (pilih mode **Pooled connection** / `-pooler`).
3. Tempelkan ke `.env.local`:
   ```env
   DATABASE_URL=postgresql://neondb_owner:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Jalankan perintah migrasi untuk membuat seluruh 24 tabel ke Neon:
   ```bash
   npx drizzle-kit push
   ```

---

## Opsi 2: Managed Better Auth (Fitur "Auth" di Neon Console)

Jika Anda ingin mengaktifkan fitur bawaan dari Neon Console:

### Cara Mengaktifkan di Neon Console:
1. Buka [Neon Console](https://console.neon.tech/).
2. Pilih proyek Anda, lalu di menu bilah sisi (sidebar) kiri, klik menu **Auth**.
3. Klik tombol **Enable Auth**.
4. Neon secara otomatis membuat skema `neon_auth` di database PostgreSQL Anda dan memberikan URL layanan autentikasi terkelola.

### Karakteristik Model Ini:
* Skema pengguna dan sesi otomatis dibuat oleh Neon di bawah skema `neon_auth.*`.
* Mendukung fitur database branching Neon (saat membuat branch database preview untuk pengujian, status user & sesi otomatis ikut ter-copy).
* Menggunakan SDK `@neon/neon-js/auth` di sisi klien.

---

## Rekomendasi Langkah Anda Saat Ini:
Karena kita sudah menyusun skema 24 tabel relasional terpadu (lengkap dengan penugasan divisi untuk Wakil Ketua, persuratan Sekretaris, dan kas Bendahara):
1. Anda cukup mengambil **Connection String** dari Neon Console (Dashboard -> Connection Details).
2. Isi `DATABASE_URL` di file `.env.local`.
3. Jalankan `npx drizzle-kit push` agar database Neon Anda langsung terisi 24 tabel siap pakai!
