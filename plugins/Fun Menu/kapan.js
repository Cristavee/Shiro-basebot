
export default {
  command: ['kapan', 'kapankah'],
  tag: 'fun',
  description: 'Memprediksi kapan sesuatu akan terjadi.',
  public: true,
  cooldown: 5000,
  coin: 5,

  async run(criv, { m, args }) {
    const question = args.join(' ');
    if (!question) {
      return m.reply(`Usage: ${m.prefix}kapankah [pertanyaan]\nExample: ${m.prefix}kapankah saya kaya?`);
    }

    const answers = [
      'Sekarang', 'Besok', 'Lusa', 'Minggu depan', 'Bulan depan', 'Tahun depan',
      'Dalam waktu dekat', 'Dalam waktu yang sangat lama', 'Tidak akan pernah',
      'Kemarin', 'Hanya Tuhan yang tahu',
      'Sepertinya tidak akan terjadi', 'Mungkin nanti', 'Sabar, ya!',
      'Entahlah, tanya rumput yang bergoyang.', 'Setelah kiamat.'
    ];

    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    const text = `
🔮 *Kapankah ${question}?*

Menurut ramalan ${global.bot.name}:
*${randomAnswer}*

_Ingat, ini hanya hiburan (mungkin)._
    `.trim();

    await m.reply(text);
  }
};
