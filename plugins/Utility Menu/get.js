import axios from 'axios';

export default {
  command: ['get'],
  tag: 'utility',
  description: 'Mengambil isi dari halaman URL menggunakan metode GET.',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  group: false,
  premium: false,
  coin: 5,
  cooldown: 5000,

  async run(criv, { m, text }) {
    if (!text) return m.reply('> Silakan masukkan URL yang ingin diambil.');

    const isValidUrl = /^(http|https):\/\/[^ "]+$/.test(text);
    if (!isValidUrl) return m.reply('> Masukkan URL yang valid dan diawali dengan http:// atau https://');

    try {
      const res = await axios.get(text);
      let content = res.data;

      if (typeof content !== 'string') content = JSON.stringify(content, null, 2);
      if (content.length > 4000) content = content.slice(0, 4000) + '\n\n> ...(dipotong)';

      await m.reply(`> Hasil GET dari ${text}:\n\n${content}`);
    } catch (err) {
      console.error(err);
      await m.reply('> Gagal mengambil isi URL. Periksa URL atau coba lagi nanti.');
    }
  }
};