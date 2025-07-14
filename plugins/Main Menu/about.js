import moment from 'moment-timezone'
import system from '../../lib/system.js'
import * as helpers from '../../lib/helpers.js'
import '../../config.js'

export default {
  command: ['about', 'bot'],
  tag: 'main',
  description: 'Informasi bot',
  public: true,
  coin: 0,

  async run(criv, { m }) {
    const waktu = moment().tz('Asia/Jakarta').format('dddd, DD MMMM YYYY • HH:mm:ss')
    const ownerNumber = global.bot?.owner || '-'

    const teks = `
*───「 About this bot 」───*

\`\`\`
› Bot Name     : ${global.bot?.name || 'Bot'}
› Owner Name   : ${global.bot?.ownerName || 'Owner'}
› Owner Number : @${ownerNumber}
› Prefix       : ${Array.isArray(global.prefix) ? global.prefix[0] : global.prefix}
› Codename     : ${global.bot?.codeName || 'undefined'}
› Total Fitur  : ${global.totalFeature}
\`\`\`

*───「 Social Media 」───*

\`\`\`
› WhatsApp  : @${global.wa || '-'}
› Instagram : ${global.ig || '-'}
› Facebook  : ${global.fb || '-'}
› YouTube   : ${global.yt || '-'}
› GitHub    : ${global.git || '-'}
\`\`\`

*Note:*
> Bot ini masih dalam tahap pengembangan.
> Beberapa fitur mungkin belum optimal dan masih terdapat error.

 *Waktu Sekarang:* ${waktu}
    `.trim()

    await criv.sendMessage(m.chat, {
      text: teks,
      contextInfo: {
            externalAdReply: {
            showAdAttribution: false,
            title: "Shiro Menu",
            body: "Shiro",
            thumbnailUrl: global.thumb,
            sourceUrl: "https://github.com/Cristavee",
            mediaType: 1,
            renderLargerThumbnail: true
          },
          isForwarded: true
        },
      mentions: [ownerNumber + '@s.whatsapp.net']
    }, { quoted: m })
  }
}