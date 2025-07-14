import axios from 'axios'

export default {
  command: ['ai'],
  tag: 'ai',
  description: 'Tanya AI',
  public: true,
  coin: 5,
  
  async run(criv, { m, text }) {
     if (!text) return criv.reply('Hai, ada yang bisa saya bantu')
    try {
      const res = await axios.get('https://api.siputzx.my.id/api/ai/perplexity', {
        params: {
          text,
          model: 'sonar-pro'
        }
      })

      const msg = res.data.data.output
      await m.reply(msg)
    } catch (err) {
      console.error(err)
      await m.reply('Gagal mengambil data dari AI.')
    }
  }
}
