import { Sticker, StickerTypes } from 'wa-sticker-formatter'

export default {
  command: ['smeme'],
  tag: 'utility',
  description: 'Membuat stiker meme dari stiker yang di-reply. Gunakan | sebagai pemisah teks atas dan bawah.',
  public: true,
  coin: 3,
    
  async run(criv, { m, text }) {
    if (!m.quoted || !m.quoted.isSticker) {
      return m.reply('Reply stiker dengan teks untuk membuat stiker meme.\nContoh: .smeme teks atas | teks bawah')
    }

    if (!text) {
      return m.reply('Masukkan teks atas dan bawah yang dipisahkan dengan `|`.\nContoh: .smeme HALO | DUNIA')
    }

    const [upperText, lowerText] = text.split('|').map(s => s.trim())
    
    let media = await m.quoted.download()
    if (!media) return m.reply('Gagal mengunduh stiker. Coba lagi.')

    try {
      const sticker = new Sticker(media, {
        pack: global.packname, // Menggunakan packname global dari config
        author: global.author, // Menggunakan author global dari config
        type: StickerTypes.FULL,
        quality: 100,
        convertTo: 'webp',
        category: ['😂'], // Opsional: kategori stiker
        id: 'smeme_sticker',
        background: '#000000', // Opsional: warna latar belakang
        keepScale: true,
        circle: false,
        
        // Pengaturan untuk teks meme
        cmd: 'meme',
        args: [upperText || '', lowerText || '']
      })

      const stikerBuffer = await sticker.toBuffer()
      criv.sendMessage(m.chat, { sticker: stikerBuffer }, { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply('Gagal membuat stiker meme. Pastikan teks tidak terlalu panjang atau coba lagi.')
    }
  }
}
