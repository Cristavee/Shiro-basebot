export default {
  command: ['mode'],
  tag: 'owner',
  description: 'Ganti mode bot: self atau public',
  owner: true,
  public: true,
  coin: 0,
  cooldown: 5000,

  async run(criv, { m, text }) {
    if (!text) return m.reply('Gunakan:\n.mode self → mode pribadi\n.mode public → mode umum\n.mode private → hanya personal chat')

    let mode = text.toLowerCase()

    if (mode === 'self') {
      criv.public = false
      criv.private = false
    } else if (mode === 'public') {
      criv.public = true
      criv.private = false
    } else if (mode === 'private') {
      criv.public = true
      criv.private = true
    }else {
      return m.reply('Input tidak dikenali. Gunakan: self, public atau private.')
    }

    let status = criv.public ? 'umum (public)' : 'pribadi (self)'
    status = criv.private ? 'private' : status
    
    return m.reply(`Bot sekarang berjalan dalam mode ${status}.`)
  }
}