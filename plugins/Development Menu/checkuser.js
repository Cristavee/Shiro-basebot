import system from '../../lib/system.js'

export default {
  command: ['checkuser'],
  tag: 'development',
  description: 'Melihat data lengkap user dari ID',
  owner: true,

  async run(criv, { m, text }) {
    if (!text) return m.reply('Contoh: .checkuser 628xxxxx')
    const user = system.getUser(text + '@s.whatsapp.net')
    await m.reply('json\n' + JSON.stringify(user, null, 2) + '\n')
  }
}