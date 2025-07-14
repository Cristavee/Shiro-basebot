export default {
  command: ['stiker', 'sticker', 's'],
  tag: 'utility',
  description: 'Ubah gambar atau video menjadi stiker',
  async run(criv, { m, sourceMessage }) { 
    let targetMessage = null;

    if (m.quoted && m.quoted.message) {
      targetMessage = m.quoted;
    } else if (sourceMessage) {
      targetMessage = sourceMessage;
    } else {
     
      return m.reply(msg.reply); 
    }

    const qmsg = targetMessage.message;
    const qType = Object.keys(qmsg)[0];

    if (!['imageMessage', 'videoMessage'].includes(qType)) {
      return m.reply('Balas gambar atau video, atau kirim gambar/video dengan caption perintah stiker.');
    }

    let buffer;
    if (targetMessage.download) {
      buffer = await targetMessage.download();
    } else {
      buffer = await criv.downloadMediaMessage(targetMessage);
    }

    if (!buffer) return m.reply('Gagal mengunduh media.');

    await criv.sendAsSticker(m.chat, buffer, { quoted: m });
  }
};
