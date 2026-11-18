const question = (topic, text, options, correctIndex, explanation) => ({
  topic,
  text,
  options,
  correctIndex,
  explanation,
});

export const courseMaterials = {
  'react-typescript-fundamentals': {
    moduleTitles: ['Komponen dan Tipe Data', 'State, Interaksi, dan Proyek'],
    learningOutcomes: [
      'Membagi antarmuka menjadi komponen React yang dapat digunakan ulang.',
      'Menentukan tipe props dan state dengan TypeScript.',
      'Membuat antarmuka interaktif dan memeriksa hasilnya.',
    ],
    requirements: ['Mampu menggunakan browser dan editor teks.', 'Node.js disarankan untuk menjalankan proyek latihan secara lokal.'],
    lessons: [
      {
        stableKey: 'Tujuan dan Peta Belajar',
        title: 'Tujuan dan Peta Belajar',
        type: 'text',
        duration: 8,
        isPreview: true,
        content: `# Mulai dengan React dan TypeScript

Kursus ini membawa kamu dari komponen kecil sampai antarmuka daftar buku yang dapat dicari. React membantu kita menyusun tampilan dari komponen, sedangkan TypeScript memeriksa bentuk data sebelum aplikasi dijalankan.

## Hasil akhir
- Komponen menerima data melalui \`props\` yang bertipe.
- Daftar data dirender dengan \`map\` dan kunci yang stabil.
- Form pencarian memperbarui tampilan melalui \`state\`.

## Pemanasan
Bayangkan kartu buku yang berisi judul, penulis, dan status ketersediaan. Tuliskan tiga bagian yang sebaiknya menjadi data, lalu satu bagian yang menjadi perilaku. Di materi praktik nanti, kamu akan mengubah rancangan tersebut menjadi komponen.

Kamu tidak perlu menguasai TypeScript lebih dahulu. Siapkan browser dan editor teks; bila ingin menjalankan contoh, gunakan proyek lokal milikmu.`,
      },
      {
        stableKey: 'Konsep Inti',
        title: 'Konsep Inti: Props, State, dan Tipe',
        type: 'text',
        duration: 18,
        content: `# Props, state, dan tipe

\`props\` adalah masukan dari komponen induk; komponen sebaiknya tidak mengubahnya. \`state\` menyimpan nilai yang berubah karena interaksi, misalnya teks pencarian. TypeScript mendeskripsikan bentuk nilai agar kesalahan seperti salah mengeja nama properti dapat ditemukan lebih awal.

\`\`\`tsx
type Book = { id: string; title: string; author: string; available: boolean };
type BookCardProps = { book: Book };

function BookCard({ book }: BookCardProps) {
  return <article>{book.title} — {book.author}</article>;
}
\`\`\`

Saat merender array, gunakan \`book.id\` sebagai \`key\`, bukan indeks, agar React dapat mencocokkan item ketika daftar berubah. Untuk form terkontrol, nilai input berasal dari state dan \`onChange\` memperbarui state.

## Coba pahami
Jika judul buku berubah dari data server, gunakan props. Jika pengguna mengetik filter, gunakan state. Pisahkan data dari tampilan supaya komponen mudah diuji.`,
      },
      {
        stableKey: 'Latihan dan Ringkasan',
        title: 'Latihan dan Ringkasan',
        type: 'pdf',
        duration: 20,
        content: `# Lembar kerja: Kartu Buku

Kerjakan sebelum membuka ruang praktik:
1. Definisikan tipe \`Book\` dengan \`id\`, \`title\`, \`author\`, dan \`available\`.
2. Buat komponen \`BookCard\` yang menerima satu \`Book\`.
3. Rancang tiga data contoh dengan ID yang berbeda.
4. Catat tampilan untuk buku tersedia dan tidak tersedia.

## Kriteria pemeriksaan
- Props diberi tipe, bukan \`any\`.
- Status ketersediaan ditampilkan dengan kondisi yang benar.
- Data contoh tidak ditulis berulang di dalam komponen kartu.

Simpan hasil atau potongan kode pada ruang praktik materi berikutnya. Bila menjalankan proyek lokal, periksa juga pesan TypeScript di editor.`,
        pdfLines: ['Tipe Book: id, title, author, available', 'Buat komponen BookCard bertipe', 'Siapkan tiga buku dengan ID stabil', 'Periksa status tersedia dan tidak tersedia'],
      },
      {
        stableKey: 'Refleksi dan Langkah Berikutnya',
        title: 'Praktik: Daftar Buku Interaktif',
        type: 'lab',
        duration: 25,
        content: `# Tugas praktik: Daftar Buku Interaktif

Bangun rancangan komponen untuk menampilkan daftar buku dan memfilter judulnya.

## Langkah
1. Tulis tipe \`Book\` dan minimal empat data buku.
2. Buat rancangan \`BookCard\` yang menerima satu buku.
3. Tulis komponen daftar yang memakai \`books.map\` dan \`book.id\` sebagai \`key\`.
4. Tambahkan state \`query\`; tampilkan hanya judul yang cocok tanpa membedakan huruf besar/kecil.
5. Catat satu kasus kosong dan pesan yang akan ditampilkan.

**Hasil yang dikumpulkan:** tipe, potongan komponen, serta satu contoh input dan hasil filter.

**Cek mandiri:** tidak ada \`any\`; props tidak diubah; key berasal dari ID; input pencarian memperbarui hasil. Ruang praktik menyimpan draf jawaban, bukan menjalankan kode.`,
      },
    ],
    questions: [
      question('Props dan state', 'Nilai pencarian berubah ketika peserta mengetik. Di mana nilai itu sebaiknya disimpan?', ['Sebagai state pada komponen yang mengelola form', 'Sebagai prop yang diubah langsung', 'Di dalam nama file komponen', 'Sebagai key pada daftar'], 0, 'Input berubah karena interaksi, jadi nilainya dikelola sebagai state.'),
      question('TypeScript', 'Apa manfaat mendefinisikan tipe BookCardProps?', ['Membuat React merender tanpa browser', 'Memastikan komponen menerima bentuk data yang diharapkan', 'Menghapus kebutuhan data buku', 'Mengubah props menjadi state otomatis'], 1, 'Tipe props membantu pemeriksaan bentuk data saat pengembangan.'),
      question('Rendering daftar', 'Nilai mana yang paling tepat dipakai sebagai key daftar buku?', ['Indeks array yang selalu berubah', 'Judul buku yang boleh duplikat', 'ID unik yang stabil dari setiap buku', 'Warna kartu'], 2, 'ID stabil membantu React mengenali item yang sama ketika daftar berubah.'),
      question('Form interaktif', 'Apa yang perlu dilakukan handler onChange pada input terkontrol?', ['Memperbarui state dari nilai input terbaru', 'Menghapus seluruh daftar buku', 'Mengubah tipe Book', 'Memuat ulang halaman'], 0, 'State perlu diperbarui agar nilai dan tampilan input tetap selaras.'),
      question('Pemisahan komponen', 'Mengapa BookCard sebaiknya menerima data melalui props?', ['Agar data dan tampilan lebih mudah dipisah serta digunakan ulang', 'Agar setiap kartu menyimpan salinan data server', 'Agar komponen induk tidak dapat menampilkan daftar', 'Agar TypeScript dinonaktifkan'], 0, 'Komponen presentasi yang menerima props lebih mudah digunakan ulang dan dirawat.'),
    ],
  },
  'ui-ux-product-design': {
    moduleTitles: ['Riset Pengguna dan Alur', 'Wireframe, Prototipe, dan Evaluasi'],
    learningOutcomes: [
      'Merumuskan masalah pengguna berdasarkan bukti riset.',
      'Membuat alur dan wireframe untuk tugas utama.',
      'Menguji prototipe dengan skenario dan metrik yang jelas.',
    ],
    requirements: ['Tidak memerlukan perangkat desain berbayar.', 'Siapkan kertas atau alat wireframe sederhana.'],
    lessons: [
      {
        stableKey: 'Tujuan dan Peta Belajar',
        title: 'Tujuan dan Peta Belajar',
        type: 'text',
        duration: 8,
        isPreview: true,
        content: `# Rancang produk dari kebutuhan pengguna

Desain produk bukan sekadar membuat layar menarik. Kamu akan berlatih menemukan kebutuhan, menyusun alur, membuat wireframe, lalu menguji apakah orang dapat menyelesaikan tugasnya.

## Hasil akhir
- Satu pernyataan masalah yang didukung temuan.
- Alur tugas yang menunjukkan langkah dan keputusan pengguna.
- Prototipe sederhana yang dapat diuji dengan skenario nyata.

## Pemanasan
Pilih aplikasi yang sering kamu gunakan. Tuliskan satu tugas yang ingin diselesaikan, misalnya memesan makanan. Catat bagian yang membingungkan tanpa langsung mengusulkan solusinya.

Kursus ini dapat dikerjakan dengan kertas dan pena. Untuk uji kegunaan, mintalah satu orang mencoba prototipe tanpa kamu memberi petunjuk.`,
      },
      {
        stableKey: 'Konsep Inti',
        title: 'Riset, Alur Tugas, dan Wireframe',
        type: 'text',
        duration: 18,
        content: `# Mulai dari bukti, bukan asumsi

Wawancara yang baik menanyakan perilaku masa lalu: “Ceritakan terakhir kali kamu…”. Hindari pertanyaan yang mengarahkan atau meminta orang menebak perilaku masa depan. Kelompokkan temuan menjadi kebutuhan dan hambatan; persona hanyalah ringkasan pola, bukan tokoh rekaan yang menggantikan data.

Peta alur tugas mencatat tujuan, langkah, titik keputusan, dan kemungkinan gagal. Wireframe berfokus pada hierarki informasi serta tindakan utama. Letakkan tombol utama dekat informasi yang dibutuhkan untuk mengambil keputusan.

Dalam uji kegunaan, berikan skenario dan amati tanpa mengajari. Ukur penyelesaian tugas, waktu, dan titik ragu. Catat kutipan terpisah dari interpretasi. Satu sesi kecil dapat menemukan masalah alur, tetapi jangan menganggapnya sebagai bukti statistik untuk semua pengguna.`,
      },
      {
        stableKey: 'Latihan dan Ringkasan',
        title: 'Latihan dan Ringkasan',
        type: 'pdf',
        duration: 20,
        content: `# Lembar kerja: Alur Pemesanan

Pilih layanan yang kamu pahami dan kerjakan:
1. Tulis satu tugas pengguna dengan kata kerja dan tujuan yang jelas.
2. Buat lima pertanyaan wawancara netral tentang pengalaman terakhir.
3. Susun langkah alur, termasuk satu kondisi gagal.
4. Gambar tiga layar inti dengan satu tindakan utama per layar.
5. Tulis skenario uji tanpa menyebut tombol yang harus diklik.

## Kriteria pemeriksaan
- Setiap keputusan desain terkait kebutuhan atau temuan.
- Skenario menjelaskan tujuan, bukan instruksi langkah demi langkah.
- Catatan uji memisahkan observasi dari opini.

Gunakan lembar ini untuk menyiapkan praktik wireframe pada materi berikutnya.`,
        pdfLines: ['Tulis satu tugas pengguna yang jelas', 'Siapkan lima pertanyaan wawancara netral', 'Gambar tiga layar inti', 'Uji skenario dan catat titik ragu'],
      },
      {
        stableKey: 'Refleksi dan Langkah Berikutnya',
        title: 'Praktik: Wireframe dan Uji Kegunaan',
        type: 'lab',
        duration: 25,
        content: `# Tugas praktik: Alur dari Masalah ke Prototipe

Buat rancangan untuk membantu mahasiswa menemukan dan meminjam buku perpustakaan.

## Langkah
1. Tulis pernyataan masalah: pengguna, kebutuhan, dan alasan berdasarkan satu bukti.
2. Buat alur minimal enam langkah dari pencarian sampai konfirmasi peminjaman.
3. Gambarkan tiga layar inti dalam bentuk daftar komponen atau sketsa.
4. Susun satu skenario uji: “Temukan buku X dan simpan untuk dipinjam”.
5. Minta satu orang mencoba, lalu catat langkah yang berhasil dan titik ragu.

**Hasil yang dikumpulkan:** pernyataan masalah, alur, wireframe teks, dan dua temuan uji.

**Cek mandiri:** pertanyaan riset tidak mengarahkan; tindakan utama jelas; temuan berasal dari observasi. Ruang praktik menyimpan draf, bukan mengirimnya ke pengajar.`,
      },
    ],
    questions: [
      question('Riset pengguna', 'Pertanyaan mana yang paling netral untuk wawancara?', ['“Kamu pasti suka fitur ini, kan?”', '“Ceritakan terakhir kali kamu mencari buku di perpustakaan.”', '“Kalau ada aplikasi baru, kamu akan memakainya?”', '“Menurutmu desain ini bagus?”'], 1, 'Pengalaman terakhir memberi contoh perilaku nyata tanpa mengarahkan jawaban.'),
      question('Alur tugas', 'Apa yang perlu ditunjukkan peta alur tugas?', ['Hanya warna dan tipografi', 'Tujuan, langkah, keputusan, dan kemungkinan gagal', 'Hanya daftar halaman final', 'Pendapat desainer tentang pengguna'], 1, 'Alur yang baik menunjukkan perjalanan dan titik keputusan pengguna.'),
      question('Wireframe', 'Apa fokus utama wireframe awal?', ['Hierarki informasi dan tindakan utama', 'Animasi akhir dan bayangan', 'Semua detail visual merek', 'Kode produksi'], 0, 'Wireframe membantu mengevaluasi struktur sebelum detail visual.'),
      question('Uji kegunaan', 'Saat peserta mencoba prototipe, apa tindakan penguji yang tepat?', ['Memberi tahu tombol yang harus ditekan', 'Mengamati dan mencatat tanpa mengajari', 'Mengubah skenario di tengah jalan', 'Menyimpulkan semua pengguna dari satu orang'], 1, 'Pengamat perlu melihat perilaku nyata, bukan menuntun peserta.'),
      question('Evaluasi', 'Metrik mana yang membantu menilai keberhasilan tugas?', ['Waktu penyelesaian dan titik kegagalan', 'Jumlah warna pada layar', 'Preferensi pribadi desainer', 'Jumlah komponen di file desain'], 0, 'Penyelesaian, waktu, dan hambatan memberi bukti tentang kegunaan alur.'),
    ],
  },
  'data-analysis-python': {
    moduleTitles: ['Memahami dan Membersihkan Data', 'Analisis, Visualisasi, dan Rekomendasi'],
    learningOutcomes: [
      'Memeriksa struktur, tipe, dan kualitas dataset.',
      'Menggunakan ringkasan dan pengelompokan untuk menjawab pertanyaan.',
      'Memilih visualisasi dan menyampaikan batasan temuan.',
    ],
    requirements: ['Dasar penggunaan komputer dan spreadsheet.', 'Python serta pandas disarankan untuk menjalankan praktik secara lokal.'],
    lessons: [
      {
        stableKey: 'Tujuan dan Peta Belajar',
        title: 'Tujuan dan Peta Belajar',
        type: 'text',
        duration: 8,
        isPreview: true,
        content: `# Dari pertanyaan ke insight data

Analisis data dimulai dengan pertanyaan yang dapat dijawab, bukan langsung membuat grafik. Kamu akan memeriksa struktur dataset, membersihkan nilai yang bermasalah, menghitung ringkasan, lalu menyampaikan hasil beserta batasannya.

## Hasil akhir
- Catatan kualitas data dan keputusan pembersihan.
- Ringkasan per kelompok yang menjawab pertanyaan.
- Grafik dengan label, sumber, dan interpretasi yang tidak berlebihan.

## Pemanasan
Bayangkan tabel transaksi berisi tanggal, kategori, jumlah barang, dan nilai penjualan. Tuliskan satu pertanyaan bisnis yang bisa dijawab dari kolom tersebut dan satu kolom yang perlu diperiksa sebelum menghitung.

Materi menjelaskan pandas; kamu dapat mengetik solusi di ruang praktik atau menjalankannya di notebook lokal.`,
      },
      {
        stableKey: 'Konsep Inti',
        title: 'Membaca dan Membersihkan Dataset',
        type: 'text',
        duration: 18,
        content: `# Periksa sebelum menyimpulkan

Mulai dengan \`head()\`, \`shape\`, \`info()\`, dan \`describe()\`. Periksa tipe tanggal dan angka, nilai unik, duplikasi, serta data kosong. Jangan menghapus baris kosong otomatis: cari tahu apakah kosong berarti tidak tercatat, tidak berlaku, atau nol.

\`\`\`python
df.head()
df.info()
df.isna().sum()
df.duplicated().sum()
\`\`\`

Nilai ekstrem perlu diperiksa ke sumbernya. Median lebih tahan terhadap pencilan daripada rata-rata, tetapi pilihan ringkasan bergantung pada pertanyaan. Gunakan \`groupby\` untuk membandingkan kategori, lalu validasi jumlah baris sebelum dan sesudah transformasi.

Grafik batang cocok untuk membandingkan kategori; garis untuk perubahan waktu. Judul grafik sebaiknya menyampaikan pertanyaan, sumbu diberi satuan, dan kesimpulan tidak mengklaim sebab-akibat dari korelasi saja.`,
      },
      {
        stableKey: 'Latihan dan Ringkasan',
        title: 'Latihan dan Ringkasan',
        type: 'pdf',
        duration: 20,
        content: `# Lembar kerja: Audit Penjualan

Gunakan contoh mini: Senin—Buku—2—100000; Selasa—Alat tulis—3—45000; Rabu—Buku—1—50000; Kamis—Alat tulis—kosong—15000.

1. Tentukan tipe data untuk tanggal, kategori, jumlah, dan nilai.
2. Catat pemeriksaan untuk menemukan nilai kosong dan duplikasi.
3. Tentukan apakah baris Kamis perlu diperbaiki atau dikeluarkan; jelaskan alasannya.
4. Hitung total nilai per kategori setelah keputusan dicatat.
5. Pilih grafik yang tepat dan tulis satu kalimat insight.

## Kriteria pemeriksaan
- Keputusan pembersihan dapat dijelaskan.
- Satuan dan jumlah baris diperiksa.
- Insight membatasi klaim sesuai data.`,
        pdfLines: ['Periksa tipe data, nilai kosong, dan duplikasi', 'Catat keputusan atas baris Kamis', 'Ringkas nilai per kategori', 'Pilih grafik dan tulis insight terbatas'],
      },
      {
        stableKey: 'Refleksi dan Langkah Berikutnya',
        title: 'Praktik: Analisis Penjualan Sederhana',
        type: 'lab',
        duration: 25,
        content: `# Tugas praktik: Analisis Penjualan

Pakai empat baris contoh pada lembar kerja atau buat tabel serupa dengan minimal delapan transaksi.

## Langkah
1. Tulis pertanyaan analisis, misalnya kategori mana yang memberi nilai penjualan tertinggi.
2. Tunjukkan pemeriksaan tipe, data kosong, dan duplikasi.
3. Jelaskan aturan pembersihan sebelum mengubah data.
4. Tulis kode pandas atau langkah spreadsheet untuk menghitung total per kategori.
5. Rancang grafik batang lengkap dengan judul dan satuan.
6. Sampaikan satu insight dan satu keterbatasan dataset.

**Hasil yang dikumpulkan:** pertanyaan, langkah pembersihan, tabel ringkasan, dan interpretasi.

**Cek mandiri:** hasil dapat direproduksi; total baris masuk akal; nilai kosong tidak diubah menjadi nol tanpa alasan. Ruang praktik menyimpan draf, tidak menjalankan Python.`,
      },
    ],
    questions: [
      question('Eksplorasi data', 'Pemeriksaan awal mana yang menampilkan tipe kolom dan jumlah nilai terisi?', ['df.info()', 'df.sort_values()', 'df.plot()', 'df.rename()'], 0, 'info() merangkum tipe data dan nilai non-null per kolom.'),
      question('Data kosong', 'Apa langkah tepat ketika menemukan nilai kosong?', ['Selalu mengganti semua dengan nol', 'Memahami arti kosong lalu memilih aturan yang dapat dijelaskan', 'Menghapus seluruh kolom tanpa pemeriksaan', 'Menganggapnya sebagai nilai rata-rata'], 1, 'Penanganan missing value harus mengikuti makna data dan pertanyaan analisis.'),
      question('Statistik', 'Mengapa median dapat lebih sesuai untuk data dengan pencilan ekstrem?', ['Median tidak berubah karena urutan baris', 'Median lebih tahan terhadap nilai ekstrem', 'Median selalu sama dengan total', 'Median menghapus data kosong'], 1, 'Median tidak tertarik kuat oleh nilai ekstrem seperti rata-rata.'),
      question('Pengelompokan', 'Operasi apa yang digunakan untuk menghitung total penjualan per kategori di pandas?', ['groupby kategori lalu sum pada nilai', 'dropna pada semua kolom', 'rename semua label', 'head pada satu baris'], 0, 'groupby membagi data per kategori; sum menghitung agregatnya.'),
      question('Visualisasi', 'Grafik apa yang umumnya tepat untuk membandingkan total beberapa kategori?', ['Grafik batang dengan label dan satuan', 'Diagram garis tanpa sumbu', 'Peta tanpa lokasi', 'Animasi tanpa data'], 0, 'Grafik batang memudahkan perbandingan antar-kategori diskret.'),
    ],
  },
  'digital-marketing-practice': {
    moduleTitles: ['Tujuan, Audiens, dan Konten', 'Kampanye, Kanal, dan Pengukuran'],
    learningOutcomes: [
      'Menentukan tujuan kampanye dan audiens yang spesifik.',
      'Membuat pesan serta kalender konten yang sesuai kanal.',
      'Mengukur hasil menggunakan metrik dan UTM yang konsisten.',
    ],
    requirements: ['Tidak memerlukan akun iklan berbayar.', 'Siapkan satu produk atau layanan sebagai studi kasus.'],
    lessons: [
      {
        stableKey: 'Tujuan dan Peta Belajar',
        title: 'Tujuan dan Peta Belajar',
        type: 'text',
        duration: 8,
        isPreview: true,
        content: `# Rencanakan kampanye yang dapat diukur

Praktik digital marketing menghubungkan tujuan bisnis, audiens, pesan, kanal, dan pengukuran. Banyak tayangan tidak otomatis berarti hasil baik; tentukan tindakan yang ingin dilakukan calon pelanggan dan ukur langkah menuju tindakan itu.

## Hasil akhir
- Tujuan kampanye dengan target dan tenggat.
- Pesan untuk audiens yang spesifik.
- Kalender konten sederhana dan rencana pelacakan UTM.

## Pemanasan
Pilih satu produk lokal. Tuliskan siapa yang paling mungkin membutuhkannya, masalah apa yang diselesaikan, dan satu tindakan yang diharapkan setelah melihat konten.

Latihan dapat dilakukan tanpa membeli iklan. Gunakan data contoh dan jangan memasukkan data pribadi pelanggan ke dalam catatan.`,
      },
      {
        stableKey: 'Konsep Inti',
        title: 'Tujuan, Audiens, dan Metrik',
        type: 'text',
        duration: 18,
        content: `# Hubungkan pesan dan metrik

Tujuan SMART menyebutkan hasil, ukuran, target, relevansi, dan waktu. Segmentasi audiens sebaiknya berdasarkan kebutuhan atau perilaku yang relevan, bukan asumsi sensitif. Cocokkan kanal dengan kebiasaan audiens dan format pesan.

Awareness dapat diukur dengan jangkauan yang relevan; kunjungan dengan klik; tindakan akhir dengan konversi. CTR adalah klik dibagi tayangan, sedangkan conversion rate adalah tindakan selesai dibagi jumlah pengunjung atau klik sesuai definisi yang disepakati. Jangan mencampur definisi denominator.

Tambahkan UTM \`source\`, \`medium\`, dan \`campaign\` yang konsisten pada tautan. Kalender konten mencatat tanggal, kanal, format, pesan, CTA, dan metrik. Setelah kampanye, bandingkan hasil dengan target dan catat satu eksperimen lanjutan.`,
      },
      {
        stableKey: 'Latihan dan Ringkasan',
        title: 'Latihan dan Ringkasan',
        type: 'pdf',
        duration: 20,
        content: `# Lembar kerja: Kampanye Tujuh Hari

Pilih produk studi kasus, lalu:
1. Buat tujuan SMART untuk periode tujuh hari.
2. Definisikan satu audiens berdasarkan kebutuhan yang dapat diamati.
3. Susun tiga ide konten berbeda dengan satu CTA yang jelas.
4. Buat pola UTM yang memakai source, medium, dan campaign.
5. Tentukan target jangkauan, klik, serta tindakan yang akan dihitung.

## Kriteria pemeriksaan
- Setiap konten mendukung tujuan yang sama.
- CTA menyebut tindakan yang spesifik.
- Metrik memiliki definisi dan sumber data.
- Tidak ada klaim hasil yang belum dibuktikan.`,
        pdfLines: ['Tetapkan target SMART tujuh hari', 'Pilih audiens dan kebutuhan yang relevan', 'Susun tiga konten dengan CTA', 'Gunakan UTM konsisten dan definisikan metrik'],
      },
      {
        stableKey: 'Refleksi dan Langkah Berikutnya',
        title: 'Praktik: Rencana Kampanye Mini',
        type: 'lab',
        duration: 25,
        content: `# Tugas praktik: Kampanye Mini

Rancang kampanye organik untuk memperkenalkan satu produk lokal kepada audiens yang kamu tentukan.

## Langkah
1. Tulis tujuan SMART selama tujuh hari.
2. Gambarkan perjalanan audiens dari mengenal produk sampai melakukan tindakan.
3. Buat kalender tiga konten: tanggal, kanal, format, pesan, CTA.
4. Tulis satu contoh caption dengan manfaat yang dapat dibuktikan.
5. Buat satu tautan UTM dan jelaskan arti setiap parameternya.
6. Tentukan cara membaca hasil jika tayangan tinggi tetapi klik rendah.

**Hasil yang dikumpulkan:** brief kampanye, tiga baris kalender, caption, UTM, dan satu hipotesis perbaikan.

**Cek mandiri:** target terukur; pesan sesuai audiens; UTM konsisten; metrik tidak disamakan. Ruang praktik menyimpan draf pribadi, bukan mempublikasikan kampanye.`,
      },
    ],
    questions: [
      question('Tujuan kampanye', 'Komponen mana yang membuat tujuan kampanye dapat dievaluasi?', ['Target dan tenggat yang terukur', 'Warna logo saja', 'Jumlah ide tanpa batas waktu', 'Jumlah platform sebanyak mungkin'], 0, 'Target dan tenggat menjadikan kemajuan dapat dibandingkan dengan hasil.'),
      question('Audiens', 'Segmentasi audiens yang paling relevan sebaiknya berangkat dari apa?', ['Kebutuhan atau perilaku yang berkaitan dengan produk', 'Asumsi tentang data sensitif', 'Nama panggilan acak', 'Warna perangkat yang digunakan'], 0, 'Kebutuhan dan perilaku relevan membantu membuat pesan yang berguna.'),
      question('Metrik', 'CTR biasanya dihitung sebagai apa?', ['Klik dibagi tayangan', 'Konversi dibagi biaya produksi', 'Tayangan dibagi jumlah konten', 'Pengikut baru dibagi komentar'], 0, 'CTR membandingkan klik terhadap tayangan.'),
      question('Pelacakan', 'Apa manfaat parameter UTM pada tautan kampanye?', ['Membedakan sumber dan kampanye kunjungan', 'Memastikan konten viral', 'Menghapus kebutuhan metrik', 'Mengubah halaman tujuan secara otomatis'], 0, 'UTM membantu mengidentifikasi sumber, medium, dan kampanye.'),
      question('Optimasi', 'Tayangan tinggi tetapi klik rendah paling tepat memicu pemeriksaan apa?', ['Kesesuaian pesan, audiens, dan CTA', 'Menghapus semua data', 'Mengganti semua metrik dengan tayangan', 'Menghentikan pencatatan'], 0, 'Kesenjangan antara tayangan dan klik dapat menunjukkan pesan atau CTA kurang relevan.'),
    ],
  },
  'startup-business-foundation': {
    moduleTitles: ['Masalah, Pelanggan, dan Nilai', 'Eksperimen, Model, dan Keputusan'],
    learningOutcomes: [
      'Menyusun hipotesis masalah berdasarkan wawancara pelanggan.',
      'Merumuskan proposisi nilai dan asumsi paling berisiko.',
      'Merancang eksperimen kecil dengan metrik keputusan.',
    ],
    requirements: ['Tidak memerlukan modal atau perusahaan yang sudah berjalan.', 'Pilih satu masalah yang ingin diuji sebagai studi kasus.'],
    lessons: [
      {
        stableKey: 'Tujuan dan Peta Belajar',
        title: 'Tujuan dan Peta Belajar',
        type: 'text',
        duration: 8,
        isPreview: true,
        content: `# Uji masalah sebelum membangun produk

Ide bisnis belum menjadi bukti kebutuhan. Kursus ini membantu kamu memilih segmen pelanggan, memahami masalah yang mereka alami, menawarkan nilai yang jelas, dan menguji asumsi dengan eksperimen berbiaya rendah.

## Hasil akhir
- Pernyataan masalah yang didukung percakapan pelanggan.
- Proposisi nilai dan asumsi yang perlu diuji.
- Rencana eksperimen dengan metrik lanjut, ubah, atau berhenti.

## Pemanasan
Pilih satu masalah yang pernah kamu lihat. Tuliskan siapa yang mengalaminya, kapan masalah muncul, dan solusi apa yang dipakai sekarang. Jangan mulai dengan daftar fitur.

Tidak perlu membuat perusahaan atau membelanjakan uang. Materi praktik menggunakan hipotesis dan prototipe sederhana.`,
      },
      {
        stableKey: 'Konsep Inti',
        title: 'Masalah, Segmen, dan Proposisi Nilai',
        type: 'text',
        duration: 18,
        content: `# Temukan bukti kebutuhan

Mulai dari segmen yang sempit agar wawancara dan eksperimen terarah. Tanyakan contoh terbaru: “Kapan terakhir kali masalah ini terjadi?” Gali proses, waktu, biaya, dan solusi saat ini. Hindari pertanyaan “Apakah kamu akan membeli?” karena jawaban hipotetis bukan perilaku pembelian.

Rumusan masalah menyebutkan segmen, kebutuhan, dan konteks. Proposisi nilai menjelaskan hasil yang lebih baik dibanding cara yang digunakan sekarang. Daftar asumsi: siapa pelanggan, seberapa sering masalah terjadi, dan apakah solusi cukup bernilai.

Pilih asumsi paling berisiko lalu uji dengan eksperimen kecil: wawancara, halaman penjelasan, atau prototipe layanan manual. Tentukan metrik dan ambang sebelum melihat hasil. Contoh: jika sedikit dari sepuluh calon pengguna bersedia meluangkan waktu untuk uji coba, ubah hipotesis atau segmennya.`,
      },
      {
        stableKey: 'Latihan dan Ringkasan',
        title: 'Latihan dan Ringkasan',
        type: 'pdf',
        duration: 20,
        content: `# Lembar kerja: Eksperimen Masalah

1. Tentukan satu segmen pelanggan yang dapat kamu jangkau.
2. Tulis masalah dan situasi saat masalah muncul.
3. Buat lima pertanyaan tentang pengalaman terbaru, bukan fitur impian.
4. Catat solusi yang dipakai sekarang serta pengorbanannya.
5. Pilih asumsi paling berisiko dan rancang eksperimen satu minggu.
6. Tetapkan metrik serta keputusan yang akan diambil untuk setiap hasil.

## Kriteria pemeriksaan
- Hipotesis dapat dibantah dengan bukti.
- Eksperimen mengukur perilaku, bukan hanya pujian.
- Ambang keputusan ditentukan sebelum hasil dikumpulkan.`,
        pdfLines: ['Pilih satu segmen yang dapat dijangkau', 'Tanyakan pengalaman terbaru pelanggan', 'Uji asumsi paling berisiko', 'Tentukan metrik dan keputusan sebelum eksperimen'],
      },
      {
        stableKey: 'Refleksi dan Langkah Berikutnya',
        title: 'Praktik: Eksperimen Validasi Pelanggan',
        type: 'lab',
        duration: 25,
        content: `# Tugas praktik: Uji Satu Asumsi

Rancang eksperimen untuk satu masalah nyata, misalnya sulit menemukan jadwal belajar kelompok yang cocok.

## Langkah
1. Tulis segmen, konteks masalah, dan solusi yang dipakai saat ini.
2. Susun lima pertanyaan wawancara netral tentang kejadian terakhir.
3. Pilih satu asumsi paling berisiko.
4. Rancang eksperimen tujuh hari yang dapat dilakukan tanpa membangun aplikasi.
5. Tentukan jumlah percobaan, metrik, dan ambang keputusan.
6. Tulis keputusan “lanjut”, “ubah”, dan “hentikan” untuk tiga kemungkinan hasil.

**Hasil yang dikumpulkan:** hipotesis, pertanyaan wawancara, desain eksperimen, dan aturan keputusan.

**Cek mandiri:** mengukur perilaku nyata; biaya serta risiko kecil; hasil negatif tetap berguna. Ruang praktik menyimpan draf, bukan menilai ide bisnis secara otomatis.`,
      },
    ],
    questions: [
      question('Wawancara pelanggan', 'Pertanyaan mana yang memberi bukti perilaku paling kuat?', ['“Apakah kamu suka ide saya?”', '“Ceritakan terakhir kali kamu menghadapi masalah itu.”', '“Fitur apa yang harus saya buat?”', '“Kalau murah, kamu pasti beli?”'], 1, 'Kejadian terakhir membantu memahami perilaku dan solusi yang benar-benar dipakai.'),
      question('Segmen', 'Mengapa memulai dari segmen pelanggan yang sempit?', ['Agar hipotesis dan eksperimen lebih terarah', 'Agar tidak perlu berbicara dengan pelanggan', 'Agar semua orang dianggap sama', 'Agar produk langsung memiliki banyak fitur'], 0, 'Segmen awal yang jelas membuat bukti lebih mudah ditafsirkan.'),
      question('Proposisi nilai', 'Apa yang perlu dibandingkan dalam proposisi nilai?', ['Hasil yang ditawarkan dengan cara yang dipakai pelanggan saat ini', 'Logo dengan warna pesaing', 'Jumlah fitur dengan jumlah halaman', 'Nama produk dengan nama pendiri'], 0, 'Nilai terlihat dari perbaikan dibanding alternatif yang digunakan sekarang.'),
      question('Eksperimen', 'Kapan ambang keputusan eksperimen sebaiknya ditentukan?', ['Sebelum hasil dikumpulkan', 'Setelah memilih hasil yang disukai', 'Hanya jika hasilnya positif', 'Tidak perlu ditentukan'], 0, 'Ambang di awal mengurangi bias dalam membaca hasil.'),
      question('Validasi', 'Mengapa pertanyaan “apakah kamu akan membeli?” kurang kuat?', ['Jawabannya hipotetis dan belum menunjukkan perilaku nyata', 'Tidak bisa ditulis di kertas', 'Selalu menghasilkan data angka', 'Mengukur biaya akuisisi secara langsung'], 0, 'Niat hipotetis tidak setara dengan tindakan pelanggan.'),
    ],
  },
  'cloud-deployment-basics': {
    moduleTitles: ['Build dan Konfigurasi Aplikasi', 'Rilis, Pemeriksaan, dan Pemulihan'],
    learningOutcomes: [
      'Membedakan build, konfigurasi, dan proses rilis.',
      'Menyiapkan variabel lingkungan tanpa membocorkan rahasia.',
      'Menyusun pemeriksaan pasca-deploy dan rencana rollback.',
    ],
    requirements: ['Memahami dasar aplikasi web.', 'Tidak perlu melakukan deploy ke layanan berbayar selama latihan.'],
    lessons: [
      {
        stableKey: 'Tujuan dan Peta Belajar',
        title: 'Tujuan dan Peta Belajar',
        type: 'text',
        duration: 8,
        isPreview: false,
        content: `# Rilis aplikasi dengan aman

Deployment bukan hanya menekan tombol publish. Kamu akan menyiapkan build yang dapat diulang, memisahkan konfigurasi dari kode, menjaga rahasia, memeriksa aplikasi setelah rilis, dan menyiapkan cara pemulihan.

## Hasil akhir
- Checklist build dan konfigurasi.
- Peta variabel lingkungan yang aman.
- Rencana pemeriksaan kesehatan dan rollback.

## Pemanasan
Pilih aplikasi web latihan. Catat perbedaan nilai yang berubah antara komputer lokal dan layanan hosting, misalnya URL API. Jangan menyalin token atau kata sandi ke catatan maupun repository.`,
      },
      {
        stableKey: 'Konsep Inti',
        title: 'Build, Environment, dan Rahasia',
        type: 'text',
        duration: 18,
        content: `# Pisahkan kode dan konfigurasi

Build mengubah sumber menjadi artefak siap disajikan. Jalankan build dan tes sebelum rilis; pastikan variabel yang dibutuhkan tersedia pada environment tujuan. Variabel publik boleh tertanam jika memang dirancang untuk browser, tetapi service-role key, token privat, dan kata sandi tidak boleh masuk ke frontend.

Gunakan nama variabel yang konsisten dan dokumentasikan nilai yang dibutuhkan tanpa menuliskan rahasianya. Periksa file ignore dan log CI agar rahasia tidak tercetak. Deploy sebaiknya memiliki versi yang dapat dikenali, misalnya commit atau tag.

Setelah rilis, periksa halaman utama, autentikasi, API, dan log error. Pantau health check dan error rate. Rollback harus mengembalikan artefak atau konfigurasi ke versi terakhir yang diketahui baik; jangan menghapus data produksi sebagai cara pemulihan.`,
      },
      {
        stableKey: 'Latihan dan Ringkasan',
        title: 'Latihan dan Ringkasan',
        type: 'pdf',
        duration: 20,
        content: `# Lembar kerja: Checklist Rilis

Untuk aplikasi latihan, tulis:
1. Perintah build dan tes yang dijalankan sebelum rilis.
2. Nama variabel environment yang diperlukan; jangan tulis nilainya.
3. Pemeriksaan rahasia pada repository dan log.
4. Lima smoke test pasca-rilis untuk halaman, login, API, dan error.
5. Versi terakhir yang diketahui baik serta langkah rollback.

## Kriteria pemeriksaan
- Build dan tes dapat diulang.
- Rahasia hanya berada di konfigurasi aman.
- Ada pemeriksaan setelah deploy dan pemilik tindakan.
- Rollback tidak menghapus data pengguna.`,
        pdfLines: ['Jalankan build dan tes sebelum rilis', 'Catat nama variabel, bukan nilai rahasia', 'Lakukan smoke test setelah deploy', 'Siapkan rollback ke versi yang diketahui baik'],
      },
      {
        stableKey: 'Refleksi dan Langkah Berikutnya',
        title: 'Praktik: Rencana Rilis Aman',
        type: 'lab',
        duration: 25,
        content: `# Tugas praktik: Rencana Rilis Aman

Buat rencana untuk merilis aplikasi latihan ke environment staging. Jangan masukkan rahasia atau menjalankan perubahan pada layanan produksi.

## Langkah
1. Tulis urutan pemeriksaan: lint, tes, build, dan artefak.
2. Buat daftar nama environment variable dan tandai mana yang publik atau rahasia.
3. Tentukan smoke test untuk halaman utama, login, API, dan log error.
4. Pilih indikator yang memicu penghentian rilis atau rollback.
5. Tulis langkah kembali ke versi sebelumnya dan siapa yang menyetujuinya.

**Hasil yang dikumpulkan:** checklist rilis, klasifikasi konfigurasi, smoke test, dan rencana rollback.

**Cek mandiri:** tidak ada nilai rahasia dalam dokumen; ada pemeriksaan pasca-rilis; rollback dapat dilakukan tanpa menghapus data.`,
      },
    ],
    questions: [
      question('Build', 'Apa yang sebaiknya dilakukan sebelum artefak aplikasi dirilis?', ['Menjalankan tes dan build yang dapat diulang', 'Menghapus konfigurasi environment', 'Mencetak semua token ke log', 'Mengubah kode langsung di server produksi'], 0, 'Tes dan build sebelum rilis membantu mendeteksi masalah sebelum pengguna terdampak.'),
      question('Rahasia', 'Di mana service-role key seharusnya disimpan?', ['Di source code frontend', 'Di konfigurasi rahasia pada environment server', 'Di URL publik', 'Di README repository'], 1, 'Service-role key harus berada di lingkungan server yang aman, bukan di browser.'),
      question('Environment', 'Apa yang aman untuk dicantumkan dalam dokumentasi konfigurasi?', ['Nama variabel dan tujuan tanpa nilai rahasia', 'Token aktif untuk memudahkan tim', 'Kata sandi database', 'Kunci service-role dalam contoh'], 0, 'Dokumentasi kebutuhan konfigurasi tidak perlu mengungkap nilai rahasia.'),
      question('Pascadeploy', 'Apa yang harus diperiksa setelah aplikasi dirilis?', ['Smoke test dan log kesehatan aplikasi', 'Hanya warna tombol', 'Hanya jumlah file di repository', 'Tidak ada karena build sudah berhasil'], 0, 'Build berhasil tidak menjamin layanan berfungsi; lakukan pemeriksaan pasca-rilis.'),
      question('Rollback', 'Rencana rollback yang baik mengembalikan aplikasi ke apa?', ['Versi artefak dan konfigurasi terakhir yang diketahui baik', 'Database yang dikosongkan', 'Token yang dibagikan publik', 'Versi acak tanpa pemeriksaan'], 0, 'Rollback seharusnya memulihkan versi baik tanpa menghapus data pengguna.'),
    ],
  },
};

export function validateCourseMaterials(courseSeeds, materials = courseMaterials) {
  for (const course of courseSeeds) {
    const material = materials[course.slug];
    if (!material) throw new Error(`Materi kursus tidak tersedia: ${course.slug}`);
    if (material.moduleTitles.length !== 2 || material.lessons.length !== 4 || material.questions.length !== 5) {
      throw new Error(`Struktur materi demo tidak lengkap: ${course.slug}`);
    }
    if ((course.status === 'published' && !material.lessons.some((lesson) => lesson.isPreview))
      || !material.lessons.some((lesson) => lesson.type === 'lab')
      || !material.lessons.some((lesson) => lesson.type === 'pdf')) {
      throw new Error(`Pratinjau, praktik, atau lembar kerja belum tersedia: ${course.slug}`);
    }
    if (material.lessons.some((lesson) => lesson.content.trim().length < 250)) {
      throw new Error(`Isi materi terlalu singkat: ${course.slug}`);
    }
    if (material.lessons.some((lesson) => lesson.type === 'lab'
      && (!lesson.content.includes('**Hasil yang dikumpulkan:**') || !lesson.content.includes('**Cek mandiri:**')))) {
      throw new Error(`Tugas praktik perlu hasil dan kriteria cek mandiri: ${course.slug}`);
    }
    if (material.questions.some((item) => item.options.length !== 4
      || item.correctIndex < 0 || item.correctIndex >= item.options.length
      || !item.explanation.trim())) {
      throw new Error(`Kuis belum lengkap: ${course.slug}`);
    }
  }
}
