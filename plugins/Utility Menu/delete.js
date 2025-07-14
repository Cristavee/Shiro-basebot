import { decodeJid } from '../../lib/helpers.js';

export default {
  command: ['del', 'delete'],
  tag: 'utility',
  description: 'Menghapus pesan yang dibalas. Membutuhkan izin khusus.',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 0,
  cooldown: 2000,

  async run(criv, { system, m }) {
    if (!m.quoted) {
      return criv.sendMessage(m.chat, { text: '🚩 Balas pesan yang ingin Anda hapus.' }, { quoted: m });
    }

    const quotedMessageKey = m.quoted.key;

    if (m.quoted.fromMe) {
      // Jika pesan yang dibalas adalah pesan bot sendiri
      if (!m.isOwner) {
        return criv.sendMessage(m.chat, { text: '❌ Anda harus menjadi *Owner Bot* untuk menghapus pesan bot sendiri.' }, { quoted: m });
      }
    } else {
      // Jika pesan yang dibalas adalah pesan orang lain
      if (m.isGroup) {
        // Di dalam grup, untuk menghapus pesan orang lain
        if (!m.isBotAdmin) {
          return criv.sendMessage(m.chat, { text: '❌ Bot harus menjadi *Admin Grup* untuk menghapus pesan anggota lain.' }, { quoted: m });
        }
        if (!m.isAdmin) {
          return criv.sendMessage(m.chat, { text: '❌ Anda harus menjadi *Admin Grup* untuk menghapus pesan anggota lain.' }, { quoted: m });
        }
      } else {
        // Di chat pribadi (Pesan yang dibalas dari orang lain di chat pribadi)
        // Bot tidak bisa menghapus pesan orang lain di chat pribadi.
        return criv.sendMessage(m.chat, { text: '❌ Bot tidak dapat menghapus pesan pengguna lain di chat pribadi.' }, { quoted: m });
      }
    }

    // Lakukan penghapusan pesan
    try {
      await criv.sendMessage(m.chat, { delete: quotedMessageKey });
      // Pesan sukses tidak perlu dikirim karena pesan akan langsung hilang
    } catch (error) {
      console.log(error); // Log error jika penghapusan gagal
      return criv.sendMessage(m.chat, { text: '❌ Gagal menghapus pesan. Mungkin pesan terlalu lama, bot tidak memiliki izin yang cukup, atau ada kesalahan lain.' }, { quoted: m });
    }
  }
};
