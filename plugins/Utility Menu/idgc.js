export default {
  command: ['idgc', 'idgroup'],
  tag: 'utility', 
  description: 'Mendapatkan informasi detail grup dari tautan undangan grup WhatsApp.',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 2,
  cooldown: 3000,

  async run(criv, { m, text }) {
    if (!text) {
      return criv.sendMessage(m.chat, { text: '🚩 Berikan tautan undangan grup WhatsApp (contoh: *.idgc https://chat.whatsapp.com/ABCDEFG12345*) untuk mendapatkan ID grupnya.' });
    }

    const groupLinkRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]+)/;
    const match = text.match(groupLinkRegex);

    if (!match || !match[1]) {
      return criv.sendMessage(m.chat, { text: '🚩 Tautan yang diberikan bukan tautan undangan grup WhatsApp yang valid. Pastikan formatnya benar.' });
    }

    const inviteCode = match[1];
    const fullGroupLink = `https://chat.whatsapp.com/${inviteCode}`; // Tentukan link grup secara jelas

    try {
      const groupInfo = await criv.groupGetInviteInfo(inviteCode);

      if (!groupInfo) {
        return criv.sendMessage(m.chat, { text: '❗ Gagal mengambil informasi grup. Tautan mungkin tidak valid, sudah kadaluwarsa, atau grup tidak ditemukan.' });
      }

      const groupId = groupInfo.id;
      const groupName = groupInfo.subject || 'Nama Grup Tidak Diketahui';
      const groupOwner = groupInfo.owner ? groupInfo.owner.split('@')[0] + ' (Owner)' : 'Tidak Diketahui';
      const memberCount = groupInfo.size || 'Tidak Diketahui';
        
      return criv.sendMessage(m.chat, { 
         interactiveButtons: [
         {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                 display_text: "Copy ID Grup",
                 id: groupId,
                 copy_code: groupId 
            })
          }],
        text: `*Informasi Grup:*\n` +
              `> ID Grup: ${groupId}\n` +
              `> Nama Grup: *${groupName.trim()}*\n` +
              `> Link Grup: ${fullGroupLink}\n` +
              `> Owner Grup: @${groupOwner}\n` + 
              `> Jumlah Member: ${memberCount} anggota` 
      }); 
      
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan internal saat mencoba mengambil informasi grup.';
      
      if (error.message.includes('not a group invite') || error.message.includes('404')) {
          errorMessage = 'Tautan undangan grup tidak valid, sudah kedaluwarsa, atau grup tidak ditemukan.';
      } else if (error.message.includes('401')) {
          errorMessage = 'Bot tidak memiliki izin untuk mengambil informasi dari tautan ini.';
      }

      return criv.sendMessage(m.chat, { text: errorMessage });
    }
  }
};