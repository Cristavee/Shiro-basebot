import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

export default {
  command: ['bratvid'],
  tag: 'utility',
  description: 'Membuat stiker Brat video.',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 10,
  cooldown: 7000,

  async run(criv, { system, m, text, args }) {
    if (!text) {
      return m.reply('Tolong berikan teks untuk membuat stiker Brat animasi. Contoh: .bratvid sangat bahagia');
    }

    const isAnimated = true;

    const delayArg = args.find(arg => arg.startsWith('-d='));
    const delay = delayArg ? parseInt(delayArg.split('=')[1]) : 600;

    if (isNaN(delay) || delay < 100 || delay > 1500) {
      return m.reply('Delay harus berupa angka antara 100 dan 1500 ms (misal: -d=700).');
    }

    const searchParams = new URLSearchParams();
    searchParams.append('text', text);
    searchParams.append('isAnimated', isAnimated);
    searchParams.append('delay', delay);

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?${searchParams.toString()}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        return m.reply('Terjadi kesalahan saat menghubungi API Brat. Mohon coba lagi nanti.');
      }

      const buffer = await response.buffer();

      await criv.sendAsSticker(m.chat, buffer, { quoted: m });

    } catch (error) {
      m.reply('Terjadi kesalahan tak terduga saat membuat stiker Brat animasi. Silakan coba lagi.');
      if (criv.user && global.bot.owner) {
        await criv.sendMessage(global.bot.owner, { text: `Error Brat Sticker Animasi: ${error.message}\nPada teks: ${text}` });
      }
    }
  }
};
