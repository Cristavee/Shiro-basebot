export default {
  command: ['add', 'tambah'],
  tag: 'group',
  description: 'Menambahkan anggota ke grup.',
  owner: false,
  admin: true,
  botAdmin: true,
  public: false,
  premium: false,
  coin: 0,
  cooldown: 5000,

  async run(criv, { m, text, mentioned, quoted }) {
    let usersToAdd = [];

    if (mentioned) {
      usersToAdd.push(mentioned);
    } else if (quoted && quoted.sender) {
      usersToAdd.push(quoted.sender);
    } else if (text) {
      const cleanText = text.replace(/[^0-9+]/g, '');
      const numberMatch = cleanText.match(/(?:62|0)?([8-9]\d{7,11})/);
      if (numberMatch && numberMatch[1]) {
        let number = `62${numberMatch[1]}@s.whatsapp.net`;
        usersToAdd.push(number);
      }
    }

    if (usersToAdd.length === 0) {
      return m.reply('Tidak ada pengguna valid. Gunakan: `.add` (reply/mention) atau `.add <nomor>` (contoh: `.add 62812xxxxxx`)');
    }

    let successCount = 0;
    let failedList = [];

    for (let userJid of usersToAdd) {
      if (!userJid.endsWith('@s.whatsapp.net')) {
          userJid = userJid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      }
      if (userJid.startsWith('0')) {
          userJid = '62' + userJid.substring(1);
      }

      try {
        const response = await criv.groupParticipantsUpdate(m.chat, [userJid], 'add');

        // Untuk debugging, log respons API
        // console.log(`[DEBUG] Response for ${userJid}:`, response);

        // PERBAIKAN: Gunakan perbandingan longgar (==) atau konversi tipe jika status adalah string "200"
        if (response[0] && response[0].status == 200) { // Mengubah === menjadi ==
          successCount++;
        } else {
          let statusMessage = response[0]?.status ? `Status: ${response[0].status}` : 'Tidak diketahui';
          
          if (response[0]?.status === 403) {
            try {
              const groupInviteCode = await criv.groupInviteCode(m.chat);
              const inviteLink = `https://chat.whatsapp.com/${groupInviteCode}`;
              
              const groupMetadata = await criv.groupMetadata(m.chat);
              const groupName = groupMetadata.subject || 'Grup Ini';

              await criv.sendMessage(userJid, { text: `Halo! Kami mencoba menambahkan Anda ke grup "${groupName}", tetapi pengaturan privasi Anda tidak mengizinkannya. Anda bisa bergabung menggunakan link ini:\n\n${inviteLink}` });
              statusMessage = 'Pengguna tidak bisa diundang (privasi), link grup telah dikirim.';
            } catch (inviteError) {
              statusMessage = `Pengguna tidak bisa diundang (privasi), gagal mengirim link grup: ${inviteError.message}`;
            }
          } else if (response[0]?.status === 408) {
            statusMessage = 'Pengguna keluar baru-baru ini atau pengaturan privasi.';
          } else if (response[0]?.status === 409) {
            statusMessage = 'Pengguna sudah di grup.';
          } else if (response[0]?.status === 401) {
            statusMessage = 'Nomor tidak valid/tidak terdaftar di WhatsApp.';
          } else if (response[0]?.code === 404) {
            statusMessage = 'Nomor tidak terdaftar di WhatsApp.';
          } else if (response[0]?.status === 400 && response[0]?.code === '400') {
            statusMessage = 'Kesalahan permintaan / Tidak dapat mengundang.';
          }

          failedList.push(`${userJid.split('@')[0]} (${statusMessage})`);
        }
      } catch (error) {
        if (error.message === 'bad-request') {
          failedList.push(`${userJid.split('@')[0]} (Gagal: Permintaan tidak valid/nomor tidak terdaftar di WhatsApp)`);
        } else {
          failedList.push(`${userJid.split('@')[0]} (Error: ${error.message})`);
        }
      }
    }

    let result = `*Status Penambahan Anggota:*\n`;
    result += `Berhasil menambahkan ${successCount} anggota.\n`;
    
    if (failedList.length > 0 ) {
      result += `Gagal menambahkan ${failedList.length} anggota:\n- ${failedList.join('\n- ')}\n`;
    }

    await m.reply(result);
  }
};






