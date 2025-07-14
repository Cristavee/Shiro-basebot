export default {
  command: ['demote', 'dm'],
  tag: 'group',
  description: 'Menurunkan status admin grup menjadi anggota biasa.',
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
      return m.reply('Siapa yang ingin didemote? Reply pesan atau mention targetnya.');
    }

    try {
      await criv.groupParticipantsUpdate(m.chat, [targetJid], 'demote');
      await m.reply(`Berhasil menurunkan @${targetJid.split('@')[0]} menjadi anggota biasa.`);
    } catch (error) {
      console.error('Error demoting:', error);
      await m.reply('Gagal menurunkan status admin. Pastikan saya admin grup dan target adalah admin lain.');
    }
  }
};