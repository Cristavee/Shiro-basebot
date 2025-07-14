
<h1 align="center">Shiro Base</h1>

<p align="center">
  <img src="https://pomf2.lain.la/f/10xr5ka8.png" alt="Shiro BaseBot Banner" width="420"/>
</p>

<p align="center">
  <em>Base bot WhatsApp buatan seorang amatir.</em>
</p>

<p align="center">
  <a href="#-pesan-dari-developer">Pesan</a> &bull;
  <a href="#%EF%B8%8F-instalasi">Instalasi</a> &bull;
  <a href="#-penggunaan">Penggunaan</a> &bull;
  <a href="#-kontribusi">Kontribusi</a> &bull;
  <a href="#-kontak">Kontak</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E=18.0-brightgreen?style=flat" alt="Node.js version" />
  <img src="https://img.shields.io/github/repo-size/Cristavee/Shiro-basebot" alt="Repo size" />
  <img src="https://img.shields.io/github/last-commit/Cristavee/Shiro-basebot" alt="Last commit" />
  <img src="https://img.shields.io/github/license/Cristavee/Shiro-basebot" alt="License" />
</p>

---

## 💬 Pesan dari Developer

Halo! Terima kasih sudah mampir ke base ini.

Shiro BaseBot dibuat untuk kamu yang ingin mempelajari atau membangun bot WhatsApp dengan cara yang lebih mudah dan fleksibel. Strukturnya modular, jadi kamu bisa sesuaikan, tambahkan fitur, atau ubah sesuka hati.

Base ini juga **bebas untuk di-recode**, tanpa kewajiban memberi credit — tapi kalau mau, saya sangat menghargainya 🙌

Kalau kamu merasa base ini bermanfaat, silakan fork, ubah, dan bagikan. Tetap semangat belajar & ngoding, siapa tahu dari sinilah awal perjalanan kamu sebagai developer dimulai.

> “Silahkan ambil saja, saya tidak mempermasalahkan credit, tapi kalau tetap dicantumkan, terimakasih."

---

## ⚙️ Instalasi

### Prasyarat:
* Node.js 18 ke atas
* Git

### Langkah-langkah:

```bash
git clone [https://github.com/Cristavee/Shiro-basebot.git](https://github.com/Cristavee/Shiro-basebot.git)
cd Shiro-basebot
npm install
node .

Konfigurasi Awal (config.js):
Edit file config.js Anda dengan detail berikut:
global.usePairingCode = true // true = pairing code, false = QR

global.bot = {
  name: '', // nama bot
  owner: '6285932203366', // nomor mu
  ownerName: '', // nama owner
  dummy: '', // nomor yang bisa saat kamu ingin mengirim debug
  codeName: '' // nama bot 2
}

Metode Login:
 * Jika menggunakan QR Code (global.usePairingCode = false):
   Buka WhatsApp > Perangkat Tertaut > Tautkan Perangkat, lalu scan QR Code yang muncul di terminal Anda.
 * Jika menggunakan Pairing Code (global.usePairingCode = true):
   Ikuti instruksi di terminal untuk memasukkan pairing code di WhatsApp Anda.
📖 Penggunaan
Berikut adalah beberapa contoh perintah dasar yang bisa Anda coba:
 * .menu         ➜ Menampilkan daftar perintah
 * .ping         ➜ Cek koneksi bot
 * .stiker        ➜ Ubah gambar jadi stiker
Catatan: Prefix bot bisa Anda ubah di file config.js.
🙌 Kontribusi
Kami sangat menghargai kontribusi Anda untuk pengembangan Shiro Base ini!
Jika Anda ingin menambahkan fitur, memperbaiki bug, atau meningkatkan kode, silakan ikuti langkah-langkah berikut:
 * Fork repositori ini.
 * Buat branch baru untuk fitur atau perbaikan Anda (git checkout -b fitur/nama-fitur-baru).
 * Lakukan perubahan dan commit (git commit -m 'Tambahkan: Fitur XYZ').
 * Push ke branch Anda (git push origin fitur/nama-fitur-baru).
 * Buat Pull Request (PR) ke repositori ini.
Kontribusimu sangat saya apresiasi!
📬 Kontak
Jika Anda memiliki pertanyaan, saran, atau ingin berkolaborasi, jangan ragu untuk menghubungi saya:
📧 Email: cristaveoffc@gmail.com
<p align="center">
<i>Dibuat dengan penuh semangat oleh <strong>Cristavee</strong><br>Base ini <strong>bebas direcode</strong> dan dikembangkan ulang oleh siapa pun.</i>
</p>

