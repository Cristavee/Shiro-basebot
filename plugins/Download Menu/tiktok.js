import axios from 'axios'

export default {
  command: ['tiktok', 'tt', 'ttdl', 'ttmp3'],
  tag: 'download',
  description: 'Unduh video TikTok',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 0,
  cooldown: 5000,

  async run(criv, { m, text }) {
    if (!text) return m.reply('Masukkan URL TikTok!\nContoh: .tiktok https://vt.tiktok.com/ZSBXL2RKS/')

    try {
      const api = `https://ytdlpyton.nvlgroup.my.id/tiktok?url=${encodeURIComponent(text)}`
      const { data } = await axios.get(api)

      if (!data || (!data.video_url && !data.slide_images?.length)) {
        return m.reply('Gagal mengambil data TikTok.')
      }

      // Bersihkan hashtag dari title & caption
      const cleanTitle = (data.title || '').replace(/#\S+/g, '').trim()
      const cleanCaption = (data.caption || '').replace(/#\S+/g, '').trim()

      const caption = `
> *Judul:* ${cleanTitle}\n
> *Author:* ${data.author} (@${data.username})
> *Upload:* ${data.uploaded}
> *Views:* ${data.play_count.toLocaleString()}
> *Like:* ${data.like_count.toLocaleString()}
> *Comment:* ${data.comment_count.toLocaleString()}
> *Share:* ${data.share_count.toLocaleString()}
`.trim()

      if (data.slide_images?.length > 0) {
        for (let i = 0; i < data.slide_images.length; i++) {
          await criv.sendMessage(m.chat, {
            image: { url: data.slide_images[i] },
            caption: i === 0 ? caption : undefined,
          }, { quoted: m })
        }
      } else {    
        await criv.sendMessage(m.chat, {
          video: { url: data.video_url },
          caption
        }, { quoted: m })
      }


      if (data.music_url) {
        await criv.sendMessage(m.chat, {
          audio: { url: data.music_url },
          mimetype: 'audio/mpeg',
          ptt: false
        }, { quoted: m })
      }

    } catch (err) {
      console.error(err)
      m.reply('Terjadi kesalahan saat memproses permintaan TikTok.')
    }
  }
}
