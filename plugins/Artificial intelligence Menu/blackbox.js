import axios from 'axios'

export default {
  command: ['blackbox'],
  tag: 'ai',
  description: 'Tanya AI',
  public: true,
  coin: 5,
  
  async run(criv, { m, text }) {
    if (!text) return criv.reply('Hai, ada yang bisa saya bantu')
    try {
      const res = await axios.get('https://api.siputzx.my.id/api/ai/blackboxai', {
        params: {
          content: text
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
