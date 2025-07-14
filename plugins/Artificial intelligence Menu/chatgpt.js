import axios from 'axios'

export default {
  command: ['chatgt', 'gpt'],
  tag: 'ai',
  description: 'Tanya AI',
  public: true,
  coin: 5,
  
  async run(criv, { m, text, sender }) {
      if (!text) return m.reply('Ada yang bisa saya bantu?')
    try {
      const res = await axios.get('https://api.siputzx.my.id/api/ai/gpt3', {
        params: {
          prompt: 'Kamu ai pintar bernama Shiro, dan menggunakan bahasa Indonesia',
          content: text
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
        }
      })

      const msg = res.data.data
      await m.reply(msg)
    } catch (err) {
      console.error(err)
      await m.reply('Gagal mengambil data dari AI.')
    }
  }
}
