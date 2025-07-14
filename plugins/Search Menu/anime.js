import axios from 'axios'

export default {
  command: ['anime', 'otakudesu'],
  tag: 'search',
  description: 'Cari dan lihat detail anime dari Otakudesu',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 3,
  cooldown: 5000,

  async run(criv, { m, text }) {
    if (!text) return m.reply('Masukkan judul anime yang ingin dicari.')

    try {
      // 🔍 Cari anime
      const res = await axios.get('https://api.siputzx.my.id/api/anime/otakudesu/search', {
        params: { s: text }
      })

      const list = res.data.data
      if (!list || !list.length) return m.reply('Anime tidak ditemukan.')

      const anime = list[0] // ambil hasil pertama
      const detailUrl = anime.link

      // 📄 Ambil detail anime
      const detailRes = await axios.get('https://api.siputzx.my.id/api/anime/otakudesu/detail', {
        params: { url: detailUrl }
      })

      const info = detailRes.data.data.animeInfo
      const eps = detailRes.data.data.episodes

      // Format episode terbaru (maks 5)
      const latestEpisodes = eps.slice(0, 1).map((ep, i) =>
        `${i + 1}.  *${ep.title}* \n\n${ep.date}\n${ep.link}`
      ).join('\n\n')
      
      const teks = `
> *${info.title}*
> Judul Jepang: ${info.japaneseTitle}
> Tanggal Rilis: ${info.releaseDate}
> Status: ${info.status}
> Tipe: ${info.type}
> Skor: ${info.score}
> Genre: ${info.genres}
> Durasi: ${info.duration}
> Studio: ${info.studio}
> Produser: ${info.producer}
> Total Episode: ${info.totalEpisodes}

*Episode Terbaru:*
${latestEpisodes}
`.trim()

      await criv.sendMediaUrl(m.chat, info.imageUrl, 'auto', teks)

    } catch (err) {
      console.error(err)
      m.reply('Terjadi kesalahan saat mengambil data.')
    }
  }
}