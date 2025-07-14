export default {
  command: ['setgrupname', 'setgcname'],
  tag: 'group',
  description: 'Mengganti nama grup.',
  owner: false,
  admin: true,
  botAdmin: true,
  public: false,
  premium: false,
  coin: 0,
  cooldown: 5000,

  async run(criv, { m, text }) {
    if (!text) {
      return m.reply('Sertakan nama grup baru. Contoh: `.setname Grup Baru Keren`');
    }

    try {
      await criv.groupUpdateSubject(m.chat, text);
      await m.reply(`Nama grup berhasil diubah menjadi: *${text}*`);
    } catch (error) {
      console.error('Error changing group name:', error);
      await m.reply('Gagal mengubah nama grup. Pastikan saya admin grup.');
    }
  }
};