import { Sticker, StickerTypes } from 'wa-sticker-formatter'

export default {
  command: ['swm'],
  tag: 'utility',
  description: 'Mengganti nama pack dan author stiker yang di-reply. Gunakan | sebagai pemisah pack dan author.',
  public: true,
  coin: 3,
    
  async run(criv, { m, text }) {
    if (!m.quoted || !m.quoted.isSticker) {
      return m.reply('Reply stiker dengan teks pack dan author baru.\nContoh: .swm Pack Baru | Author Keren')
    }

    if (!text) {
      return m.reply('Masukkan nama pack dan author baru yang dipisahkan dengan `|`.\nContoh: .swm Stikerku | Oleh Bot')
    }

    const [newPack, newAuthor] = text.split('|').map(s => s.trim())
    
    let media = await m.quoted.download()
    if (!media) return m.reply('Gagal mengunduh stiker. Coba lagi.')

    try {
      const sticker = new Sticker(media, {
        pack: newPack || global.packname, 
        author: newAuthor || global.author,
        type: StickerTypes.FULL,
        quality: 100,
        convertTo: 'webp',
        id: 'swm_sticker',
        background: '#000000', 
        keepScale: true,
        circle: false,
      })

      const stikerBuffer = await sticker.toBuffer()
      criv.sendMessage(m.chat, { sticker: stikerBuffer }, { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply('Gagal mengganti watermark stiker. Coba lagi.')
    }
  }
}
