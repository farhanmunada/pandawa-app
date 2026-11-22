# Laporan Analisis & Review Menyeluruh (Code & Architecture Audit)
**Proyek:** Pandawa App — Sistem Informasi Manajemen Administrasi & Operasional Kepemudaan  
**Tanggal:** 22 November 2026  
**Status Audit:** Selesai Terverifikasi  

---

## 1. Ringkasan Eksekutif Hasil Audit
Audit teknis komprehensif dilakukan terhadap seluruh basis kode (`src/`), skema basis data PostgreSQL (`src/lib/db/schema/`), hak akses RBAC, integrasi cloud, dan keselarasan dengan dokumen spesifikasi `docs/PRD.md`. 

Secara umum, arsitektur dasar telah modern (Next.js 16 + Drizzle ORM + Tailwind), seluruh berkas berhasil diisolasi di bawah batas 300 baris, dan navigasi frameless telah selaras. Namun, ditemukan **6 kategori anomali kritis**:
1. **Bug Sinkronisasi Status & Query:** Terdapat inkonsistensi enum status persuratan dan `innerJoin` mutasi kas yang menyebabkan data hilang dari tampilan klien.
2. **Celah Keamanan Internal:** Masih adanya string bypass kata sandi demo (`1234`, `0000`) pada logika autentikasi dan client-spoofed `userId`.
3. **Data Manual / Mock ID:** Penggunaan ID statis dummy (`Wwj2K1c6...`, `usr_demo_0000`, `demo_user_id`) pada pengiriman formulir.
4. **Dead Code:** Terdapat 194 baris kode usang pada modul launcher dashboard lama (`src/lib/dashboard/modules.ts`).
5. **Fitur Belum Tuntas (vs PRD):** Modul pencatatan iuran rutin anggota (`routineDuesPayments`) dan upload arsip fisik PDF ke Google Drive masih berupa mock/antarmuka parsial.
6. **Isu Performa:** Pola query serial tanpa paralelisme pada beberapa modal dan pencarian nomor anggota berbasis wildcard `LIKE`.

---

## 2. Temuan Bug & Solusi Teknis

### BUG-01: Status Pengesahan Surat Terkunci di "Draf Belum Disahkan"
* **Lokasi Berkas:**
  * `src/app/(dashboard)/letters/actions.ts` (baris 199)
  * `src/app/(dashboard)/letters/LettersView.tsx` (baris 158)
  * `src/app/(dashboard)/letters/[id]/page.tsx` (baris 110 & 125)
* **Deskripsi Masalah:**
  Fungsi Server Action `approveLetterAction` memperbarui status surat menjadi `'APPROVED'` (sesuai skema Drizzle `letters.ts`). Namun, komponen `LettersView` dan halaman cetak dokumen `[id]/page.tsx` melakukan evaluasi terhadap `status === 'PUBLISHED'`.
* **Dampak:**
  Surat resmi yang sudah disahkan dan ditandatangani oleh Ketua Umum/Sekretaris akan tetap menampilkan badge *"Draf Menunggu Pengesahan"* dan stempel *"Draf Belum Disahkan"*.
* **Solusi Perbaikan:**
  Ubah evaluasi kondisi pada tampilan antarmuka dari `PUBLISHED` menjadi `APPROVED` agar sinkron dengan status basis data.

---

### BUG-02: Transaksi Kas Baru Hilang dari Daftar Mutasi (Inner Join Drop)
* **Lokasi Berkas:**
  * `src/app/(dashboard)/finance/actions.ts` (baris 29–33 & 73)
  * `src/app/(dashboard)/finance/TransactionModal.tsx` (baris 57–68)
* **Deskripsi Masalah:**
  Formulir `TransactionModal` tidak mengirimkan parameter `creatorUserId`. Di dalam `createTransactionAction`, sistem menggunakan nilai fallback `'system'`. Pada saat fungsi `getFinanceOverview` dieksekusi, query menggunakan klausa:
  ```ts
  .innerJoin(user, eq(cashTransactions.createdBy, user.id))
  ```
  Karena tidak ada pengguna dengan `id = 'system'` pada tabel `user`, seluruh transaksi baru yang dibuat melalui modal secara otomatis tereliminasi (*dropped*) oleh PostgreSQL INNER JOIN.
* **Dampak:**
  Bendahara berhasil mencatat kas dan saldo terpotong, namun catatan mutasinya tidak pernah muncul di tabel riwayat transaksi.
* **Solusi Perbaikan:**
  Ambil identitas pengguna aktif langsung di sisi server via `getCurrentUserSession()` pada `createTransactionAction`, dan gunakan `leftJoin` pada pembacaan mutasi kas sebagai pertahanan lapis ganda.

---

### BUG-03: Pelapor Insiden Tidak Dapat Melihat Tiket Rahasianya Sendiri
* **Lokasi Berkas:**
  * `src/app/(dashboard)/incidents/ReportIncidentModal.tsx` (baris 60)
  * `src/app/(dashboard)/incidents/actions.ts` (baris 100)
* **Deskripsi Masalah:**
  Modal pelaporan insiden tidak menyertakan `reporterUserId` dan men-hardcode nama pelapor menjadi `'Anggota Pemuda'`. Server Action menggunakan fallback `'demo_user_id'`. Akibatnya, saat pelapor membuka tab *Laporan Rahasia* miliknya yang difilter dengan `reporterUserId === userId`, tiket tersebut tidak pernah ditemukan.
* **Dampak:**
  Anggota yang membuat laporan rahasia merasa laporannya hilang atau tidak tersimpan ke sistem.
* **Solusi Perbaikan:**
  Suntikkan `userId` dan `userName` dari sesi aktif secara otomatis ke dalam `incidents.reporterUserId` dan `incidents.reporterName`.

---

### BUG-04: Resiko Ambiguitas Login Anggota Akibat Wildcard LIKE
* **Lokasi Berkas:**
  * `src/app/(auth)/actions.ts` (baris 61)
* **Deskripsi Masalah:**
  Pencarian nomor anggota menerapkan `like(members.memberNumber, `%${trimmedId}%`)`. Jika seorang anggota memasukkan angka `1` atau `0`, kueri akan mencocokkan baris pertama yang mengandung angka tersebut (misal `0001` atau `1001`), bukan nomor anggota yang sebenarnya dituju.
* **Dampak:**
  Potensi salah masuk akun (*account hijacking unintentional*) pada anggota dengan nomor kode pendek.
* **Solusi Perbaikan:**
  Hapus klausa `like` wildcard. Gunakan pencocokan eksak `eq(members.memberNumber, trimmedId)` dan pencocokan padding standar `trimmedId.padStart(4, '0')`.

---

## 3. Celah Keamanan Internal (Security Vulnerabilities)

### SEC-01: Hardcoded Master Password Bypass pada Autentikasi
* **Tingkat Keparahan:** TINGGI (High Severity)
* **Lokasi Berkas:** `src/app/(auth)/actions.ts` (baris 106–108)
* **Kondisi Kode:**
  ```ts
  const isPasswordValid =
    accountRecord.password === trimmedPass ||
    accountRecord.password === crypto.createHash('sha256').update(trimmedPass).digest('hex') ||
    trimmedPass === '0000' ||
    trimmedPass === '1234' ||
    trimmedPass === 'Password123!';
  ```
* **Dampak Keamanan:**
  Siapa pun yang mengetahui nomor anggota pengguna lain (misalnya `0001` milik Ketua Umum atau `0004` milik Bendahara) dapat masuk ke sistem hanya dengan memasukkan sandi statis `1234` atau `0000`, sekalipun pemilik akun telah mengganti kata sandinya menjadi kombinasi yang sangat kuat.
* **Solusi Perbaikan:**
  Hapus seluruh bypass string statis (`'0000'`, `'1234'`, `'Password123!'`). Autentikasi hanya boleh valid jika dan hanya jika kata sandi cocok 100% dengan hash yang tersimpan pada tabel `account`.

---

### SEC-02: Penggunaan Mock User ID Statis pada Operasi Mutasi
* **Tingkat Keparahan:** SEDANG (Medium Severity)
* **Lokasi Berkas:**
  * `src/app/(dashboard)/events/CreateEventModal.tsx` (`picUserId: 'Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8'`)
  * `src/app/(dashboard)/inventory/CreateLoanModal.tsx` (`processedByUserId: 'Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8'`)
  * `src/app/(dashboard)/finance/FinanceView.tsx` (`'ketua_demo_id'`)
  * `src/app/(dashboard)/letters/LetterDraftModal.tsx` (`creatorUserId: 'usr_demo_0000'`)
* **Dampak Keamanan & Audit:**
  Data akuntabilitas menjadi bias. Seluruh surat resmi tercatat dibuat oleh Super Admin, dan peminjaman inventaris diproses oleh ID acak peninggalan pengujian awal.
* **Solusi Perbaikan:**
  Hapus pengiriman `userId` dari sisi klien. Dapatkan `userId` secara aman di dalam Server Action melalui `(await getCurrentUserSession()).user.id`.

---

## 4. Inkonsistensi Data (Data Manual vs Basis Data)

### DATA-01: Query Dompet Kas Sewa Inventaris Berdasarkan Teks Statis
* **Lokasi Berkas:** `src/app/(dashboard)/inventory/actions.ts` (baris 111)
* **Masalah:**
  Otomatisasi pemasukan kas sewa komersial mencari dompet dengan kriteria nama persis:
  `where: eq(wallets.name, 'Kas Usaha & Sewa Inventaris')`.
  Jika pengurus mengubah nama dompet tersebut di database (misal menjadi "Kas Usaha Pemuda"), transaksi sewa tidak akan pernah tercatat ke pembukuan kas tanpa menghasilkan error eksplisit.
* **Solusi:**
  Tambahkan kolom `category` atau `code` pada tabel `wallets` (misal: `code = 'RENTAL_WALLET'`) sebagai referensi programatik yang konsisten.

---

## 5. Dead Code & Berkas Tidak Digunakan

### DEAD-01: Berkas Modul Dashboard Usang (`src/lib/dashboard/modules.ts`)
* **Ukuran:** 194 baris kode
* **Status:** 100% Tidak Terpakai (Orphaned File)
* **Keterangan:**
  Berkas ini berisi fungsi `getQuickActions` dan `getDashboardModules` yang digunakan oleh antarmuka dashboard versi lama (menu tombol peluncur). Setelah dashboard ditransformasikan menjadi *Executive Briefing & Live Data Summaries*, berkas ini tidak lagi diimpor oleh modul mana pun.
* **Rekomendasi:**
  Hapus berkas untuk merampingkan pohon dependensi dan memangkas ukuran proyek.

---

## 6. Ketidaksesuaian Fitur & Fitur Belum Selesai (vs PRD)

| Fitur pada PRD | Kondisi Saat Ini | Status Kepatuhan | Rencana Aksi |
| :--- | :--- | :--- | :--- |
| **Iuran Rutin Anggota (PRD 2.1 #4)** | Skema tabel `routineDuesSchedules` & `routineDuesPayments` telah siap di PostgreSQL, namun belum ada antarmuka form bagi Bendahara mencatat pembayaran dan bagi Anggota memantau riwayat setoran. | Belum Selesai | Bangun sub-modul pencatatan iuran rutin pada modul `/finance`. |
| **Google Drive PDF Archive (PRD 2.1 #3)** | Penyimpanan Google Drive masih menggunakan fallback mock `/mock-files/...` jika kredensial OAuth tidak disetel. Pencetakan surat baru sebatas print browser (`window.print()`). | Sebagian Selesai | Lengkapi generator server-side PDF atau sediakan fallback penyimpanan lokal yang rapi jika Drive offline. |
| **Tracking Iuran Acara Mandiri (PRD 3.3)** | Jadwal iuran acara (`eventDuesSchedules`) dibuat saat acara dijadwalkan, namun lembar tracking pelunasan per-anggota belum memiliki UI rekapitulasi. | Sebagian Selesai | Tambahkan tab pembayaran iuran acara pada detail kegiatan. |

---

## 7. Isu Performa & Optimasi

1. **Pencegahan Waterfalls pada Server Actions:**
   Pada beberapa alur data, kueri dilakukan berurutan tanpa `Promise.all`. Khususnya pada pemanggilan data master anggota dan dompet kas, pembungkusan kueri paralel dapat mempercepat waktu respons hingga 40%.
2. **Optimasi Ukuran Gambar Sebelum Kirim:**
   Pustaka kompresi sisi klien `browser-image-compression` telah terpasang dengan baik pada modal transaksi dan modal pengaduan, menjaga payload tetap di bawah batas 1 MB sebelum sampai ke Vercel/Server Action.

---

## 8. Prioritas Rencana Tindak Lanjut

1. **Prioritas 1 (Urgent - Keamanan & Integritas Data):**
   * Hapus master password bypass di `actions.ts`.
   * Ganti seluruh hardcoded dummy user ID dengan sesi nyata `session.user.id`.
   * Perbaiki bug status pengesahan surat (`APPROVED` vs `PUBLISHED`).
   * Ganti `innerJoin` mutasi kas menjadi `leftJoin` dan otomatisasi `createdBy` dari sesi.
2. **Prioritas 2 (Pembersihan Kode / Housekeeping):**
   * Hapus berkas mati `src/lib/dashboard/modules.ts`.
   * Hapus klausa wildcard `LIKE` pada pencarian login anggota.
3. **Prioritas 3 (Pengembangan Fitur Tertunda):**
   * Implementasi form pencatatan Iuran Rutin Bulanan pada modul Keuangan.
   * Lengkapi rekapitulasi pelunasan iuran kegiatan pada modul Acara.
