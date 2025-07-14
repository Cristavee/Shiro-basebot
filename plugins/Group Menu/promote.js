export default {
  command: ['promote', 'pm'],
  tag: 'group',
  description: 'Mempromosikan anggota menjadi admin grup.',
  owner: false,
  admin: true,
  botAdmin: true,
  public: false,
  premium: false,
  coin: 0,
  cooldown: 5000,

  async run(criv, { m, mentioned, quoted }) {
    let targetJid = mentioned || (quoted && quoted.sender);

    if (!targetJid) {
      return m.reply('Siapa yang ingin dipromosikan? Reply pesan atau mention targetnya.');
    }

    try {
      await criv.groupParticipantsUpdate(m.chat, [targetJid], 'promote');
      await m.reply(`Berhasil mempromosikan @${targetJid.split('@')[0]} menjadi admin grup.`);
    } catch (error) {
      console.error('Error promoting:', error);
      await m.reply('Gagal mempromosikan anggota. Pastikan saya admin grup dan target adalah anggota biasa.');
    }
  }
};