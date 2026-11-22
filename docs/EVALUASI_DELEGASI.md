# Evaluasi Kegagalan Delegasi & Panduan Manajemen AI Agent

Dokumen ini menganalisis penyebab teknis dan manajerial mengapa hasil implementasi terasa tidak matang ("setengah jadi") meskipun sudah dilengkapi PRD, Arsitektur, Riset, dan Desain Sistem yang lengkap, serta panduan praktis bagi Manajer untuk mendelegasikan tugas ke AI Agent agar menghasilkan kode berstandar produksi.

---

## 1. Akar Masalah (Mengapa Hasil Terasa Dangkal / "Ampas")

### A. Pola Horizontal Scaffolding (Lebar tapi Dangkal)
Ketika AI diberikan PRD skala besar yang mencakup 5 modul utama (Anggota, Keuangan, Surat, Acara, Inventaris, Keamanan) dalam satu arahan besar, AI cenderung mengutamakan "kelengkapan cakupan" (horizontal coverage) daripada "kedalaman fitur" (vertical depth).
- AI membuat semua halaman dan rute agar terlihat sesuai struktur PRD.
- Namun, komponen di dalamnya hanya berupa kerangka dasar (biasanya hanya Read dan Create sederhana).
- Fitur krusial seperti Edit, Delete, Validasi Formulir, State Kosong (Empty State), State Error, dan Modal Konfirmasi terlewat karena kapasitas konteks dan fokus terbagi ke puluhan berkas sekaligus.

### B. Ilusi Selesai pada Task Checklist ("False Positive Done")
Pada berkas `tasks/todo.md`, seluruh poin dicentang `[x]` hanya berdasarkan kriteria:
1. Skema database sudah didefinisikan.
2. Halaman bisa di-render tanpa crash.
3. Perintah `npm run build` dan `npm run lint` menghasilkan kode status 0 (lolos kompilasi).
Kompilasi yang sukses tidak sama dengan fungsionalitas yang lengkap. Sebuah tombol yang belum ada kodenya tidak akan memicu error kompilasi, sehingga AI menganggap tugas telah tuntas.

### C. Kelemahan Alami LLM Tanpa Guardrail Atomik
Model bahasa bekerja secara probabilistik dan optimistik. Tanpa batasan ruang lingkup yang sempit per siklus perintah, AI akan mengambil jalan pintas (shortcut) implementasi untuk menghemat token dan menyelesaikan instruksi secepat mungkin.

---

## 2. Refleksi & Evaluasi Peran Manajer (Apa yang Perlu Disesuaikan)

Dokumen PRD, Arsitektur, dan Riset yang Anda buat sudah berada pada standar spesifikasi yang sangat baik. Yang kurang bukan pada kualitas dokumen, melainkan pada **mekanisme kendali operasional (execution governance)** saat mendelegasikannya ke AI:

| Aspek | Pendekatan Sebelumnya | Pendekatan Manajerial yang Efektif |
|---|---|---|
| **Cakupan Instruksi** | Big-Bang (Semua modul langsung dikerjakan berurutan dalam satu sesi). | Vertical Slicing (Satu modul tunggal diselesaikan tuntas dari backend hingga UI sebelum menyentuh modul lain). |
| **Kriteria Keberhasilan** | Mengacu pada PRD umum ("Selesaikan modul X sesuai PRD"). | Definition of Done (DoD) eksplisit per fungsi ("Wajib ada: List, Create, Edit prefilled, Delete konfirmasi modal, Zod validation, Toast"). |
| **Kontrol Verifikasi** | Bergantung pada laporan `npm run build` dan checklist agen. | Uji petik fitur per modul: Manajer menguji tombol & interaksi sebelum memberi izin pindah ke modul berikutnya. |
| **Manajemen Checklist** | Agen diizinkan mencentang `tasks/todo.md` secara mandiri tanpa verifikasi interaksi. | Checklist hanya boleh dicentang setelah seluruh use-case interaktif diverifikasi. |

---

## 3. Framework Delegasi Presisi (Cara Mengarahkan AI Agent)

Untuk mendapatkan hasil berkualitas tinggi, manajer perlu memperlakukan AI Agent seperti tim pengembang junior yang sangat cepat mengetik tetapi membutuhkan batasan kerja mikro yang ketat:

### Prinsip 1: One Feature, One Turn (Satu Fitur Per Putaran)
Jangan meminta: *"Kerjakan modul inventaris dan persuratan sesuai PRD."*
Mintalah: *"Fokus hanya pada modul Inventaris: Aset Barang. Buat fitur Tambah Barang dan Edit Barang beserta upload foto ke Google Drive dan validasi form Zod. Jangan sentuh modul lain sampai fitur ini kita uji."*

### Prinsip 2: Terapkan Definition of Done (DoD) Standar
Sertakan checklist DoD wajib pada setiap delegasi fitur:
1. **CRUD Utuh:** Create, Read (dengan filter/search), Update (modal prefilled), Delete (modal konfirmasi bahaya).
2. **Kondisi Tampilan (UI States):** Loading skeleton, Empty state jika data kosong, Error alert jika API gagal.
3. **Validasi & Umpan Balik:** Pesan error di bawah input jika invalid, notifikasi Toast sukses/gagal.
4. **Audit Trail:** Catat mutasi data (Create, Update, Delete) ke tabel `audit_logs`.
5. **Desain & Aset:** Ikuti palet warna (Putih bersih `#FFFFFF`, Aksen Gold `#D8AC41`, Slate `#0F172A`), ikon Lucide, tanpa emotikon, gunakan `/favicon.png`.

### Prinsip 3: Terapkan Stop-and-Review Gate
Setelah AI menyelesaikan satu potongan fitur:
1. Hentikan agen.
2. Buka browser atau periksa kode: Apakah tombol Edit berfungsi? Apakah tombol Delete meminta konfirmasi?
3. Berikan umpan balik perbaikan mikro jika ada kekurangan sebelum melangkah ke modul berikutnya.

---

## 4. Rencana Tindak Lanjut untuk Proyek Pandawa App

Untuk memperbaiki sistem yang saat ini masih dangkal di beberapa modul, kita ubah strategi menjadi audit dan penuntasan modul per modul:

1. **Modul Anggota (Selesai):** CRUD lengkap (Create, Read, Update modal, Delete modal), audit log, status badge sudah diimplementasikan dan diverifikasi.
2. **Modul Inventaris & Peminjaman (Target Berikutnya):**
   - Audit CRUD Aset (Edit data barang, hapus barang non-aktif).
   - Form Peminjaman internal vs komersial.
   - Integrasi pencatatan denda & kondisi fisik pengembalian.
3. **Modul Keuangan & Iuran:**
   - Audit CRUD Transaksi Kas (Edit deskripsi, Pembatalan transaksi).
   - Form Approval transaksi pengeluaran > Rp500.000 oleh Ketua Umum.
4. **Modul Persuratan:**
   - Audit siklus status surat (Draf -> Verifikasi -> Terbit -> Arsip/Batal).
   - Penomoran otomatis dan pratinjau surat resmi kop Pandawa.
5. **Modul Acara & Insiden:**
   - Audit manajemen kepanitiaan dan pelaporan rahasia vs publik.
