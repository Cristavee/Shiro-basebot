import system from '../../lib/system.js'

// Daftar item gacha yang lebih bervariasi
const items = [
  'JACKPOT 500 COIN ⚡⚡', // Hadiah koin besar
  '50 Coin', // Hadiah koin menengah
  '20 Coin', // Hadiah koin kecil

  'Zonk', 'Zonk', 'Zonk', 'Zonk', 'Zonk', 'Zonk', 'Zonk', 'Zonk', // Lebih banyak Zonk agar gacha lebih menantang

  'Uang 1 miliar (khusus mata uang monopoly)', // Candaan
  'Iphone 20 Ultra Pro Max (versi mainan)', // Candaan
  'Ucapan terimakasih dari Developer (tulus kok)', // Candaan
  'Tiket ke Planet Pluto (sekali jalan)', // Candaan
  'Mantanmu kembali (tapi cuma jadi teman biasa)', // Candaan
  'Sebuah kecoak bersayap (masih hidup)', // Candaan
  'Janji manis (tanpa bukti)', // Candaan
  'Kuota 1GB (hanya untuk membuka Google.com)', // Candaan
  'Pesan suara dari kucing tetangga (meong!)', // Candaan
  'Diskon 50% untuk gacha selanjutnya (tidak berlaku)', // Candaan
  'Sepatu sebelah kiri (ukuran random)' // Candaan
];

export default {
  command: ['gacha'],
  tag: 'game',
  description: 'Gacha item random dengan biaya coin.',
  public: true,
  premium: false, // Sesuaikan jika gacha bisa gratis untuk premium
  coin: 10, // Biaya gacha: 10 coin
  cooldown: 5000, // Cooldown 5 detik

  async run(criv, { m, sender }) {
    const GACHA_COST = 10; // Biaya gacha, harus sama dengan 'coin' di atas

    // Cek apakah pengguna memiliki cukup coin untuk gacha
    if (!system.subtractCoinIfEnough(sender, GACHA_COST)) {
      return m.reply(`🪙 Maaf, kamu tidak memiliki cukup coin untuk gacha. Butuh ${GACHA_COST} coin. Coin kamu saat ini: ${system.getCoin(sender)}`);
    }

    // --- PERBAIKAN ERROR 1: Logika pemilihan indeks yang benar ---
    const rewardIndex = Math.floor(Math.random() * items.length);
    const reward = items[rewardIndex];
    // --- AKHIR PERBAIKAN ---

    // --- PERBAIKAN ERROR 2 & PENINGKATAN: Menggunakan perbandingan string dan pesan spesifik ---
    if (reward === 'JACKPOT 500 COIN ⚡⚡') {
      await system.giveReward(sender, 500);
      return m.reply(`🎉 Selamat! Kamu mendapatkan: *${reward}*! Coin kamu bertambah 500.`);
    } else if (reward === '50 Coin') {
      await system.giveReward(sender, 50);
      return m.reply(`🎉 Selamat! Kamu mendapatkan: *${reward}*! Coin kamu bertambah 50.`);
    } else if (reward === '20 Coin') {
      await system.giveReward(sender, 20);
      return m.reply(`🎉 Selamat! Kamu mendapatkan: *${reward}*! Coin kamu bertambah 20.`);
    } else if (reward === 'Zonk') {
      return m.reply(`😞 Kamu mendapatkan: *Zonk*. Jangan menyerah, coba lagi lain kali!`);
    } else {
      // Untuk semua hadiah candaan lainnya
      return m.reply(`🎉 Kamu mendapatkan: *${reward}*`);
    }
    // --- AKHIR PERBAIKAN & PENINGKATAN ---
  }
}
