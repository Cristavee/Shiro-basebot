import axios from 'axios';

export default {
  command: ['cuaca'],
  tag: 'utility',
  description: 'Melihat informasi cuaca di kota tertentu.',
  public: true,
  cooldown: 5000,
  coin: 5,

  async run(criv, { m, args }) {
    if (!args[0]) {
      return m.reply(`> Penggunaan:\n> ${global.prefix[0]}cuaca [nama_kota]\n> Contoh: ${global.prefix[0]}cuaca Jakarta`);
    }

    const kota = args.join(' ');
    try {
      const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(kota)}?format=%t %c %w %p`, {
        headers: { 'User-Agent': 'curl/7.64.1' }
      });

      const weatherInfo = data.trim();
      if (!weatherInfo || weatherInfo.toLowerCase().includes('unknown location')) {
        return m.reply(`> Gagal menemukan informasi cuaca untuk kota *${kota}*.`);
      }

      await m.reply(`> Cuaca di *${kota}*:\n> ${weatherInfo}`);
    } catch (e) {
      console.error('Gagal mengambil info cuaca:', e);
      await m.reply('> Terjadi kesalahan saat mengambil data cuaca. Silakan coba lagi nanti.');
    }
  }
};
