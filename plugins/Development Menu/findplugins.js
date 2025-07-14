export default {
  command: ['searchplugin', 'findplugin'],
  tag: 'development',
  description: 'Cari plugin berdasarkan kata kunci',
  owner: true,

  async run(criv, { m, text }) {
    if (!text) return m.reply('Contoh: .searchplugin yt')

    const result = Object.entries(criv.plugins)
      .map(([cmd, plugin]) => {
        const desc = plugin.description || ''
        return `${cmd} - ${desc}`
      })
      .filter(line => line.toLowerCase().includes(text.toLowerCase()))

    if (result.length === 0) return m.reply('🔍 Tidak ada plugin ditemukan.')
    m.reply('🔍 Plugin ditemukan:\n\n' + result.join('\n'))
  }
}