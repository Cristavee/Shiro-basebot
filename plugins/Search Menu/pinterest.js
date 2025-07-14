import axios from 'axios'

export default {
  command: ['pinterest', 'pin'],
  tag: 'search',
  description: 'Cari gambar dari Pinterest (acak).',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 5,
  cooldown: 5000,

  async run(criv, { m, text }) {
    if (!text) return m.reply('Masukkan kata kunci pencarian.\n\nContoh: *.pinterest bunga cantik*')

    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/s/pinterest', {
        params: { query: text, type: 'image' }
      })

      const results = data?.data
      if (!Array.isArray(results) || results.length === 0) {
        return m.reply('Gambar tidak ditemukan, coba kata kunci lain.')
      }

      const random = results[Math.floor(Math.random() * results.length)]?.image_url
      if (!random) return m.reply('Gagal memilih gambar, coba lagi.')

      await criv.sendMessage(m.chat, {
        image: { url: random },
        caption: `Hasil acak untuk: *${text}*`
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply('Terjadi kesalahan saat mengambil gambar dari Pinterest.')
    }
  }
}