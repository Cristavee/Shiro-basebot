export default {
  command: ['leave', 'out'],
  tag: 'group',
  description: 'Membuat bot keluar dari grup ini.',
  owner: true,
  admin: false,
  botAdmin: false, // Pastikan ini true, karena bot harus admin untuk bisa keluar grup
  public: false,
  group: true,
  premium: false,
  coin: 0,
  cooldown: 10000,

  async run(criv, { m, from }) { // 'from' di sini adalah groupJid, sama dengan m.chat
    try {
      await m.reply('Saya akan keluar dari grup ini. Sayonara!');
      // FUNGSI YANG BENAR UNTUK KELUAR GRUP
      await criv.groupLeave(m.chat); 
    } catch (error) {
      // Tangani error jika bot bukan admin atau kesalahan lainnya
      if (error.output?.statusCode === 403 || error.message.includes('not group admin')) {
          await m.reply('Maaf, saya tidak bisa keluar dari grup ini karena saya bukan admin grup.');
      } else {
          await m.reply('Terjadi kesalahan saat mencoba keluar dari grup. Silakan coba lagi.');
          console.error("Error leaving group:", error); // Tambahkan logging untuk debugging
      }
    }
  }
};
