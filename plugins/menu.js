import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export default {
  command: ['menu'],
  tag: 'main',
  description: 'Menampilkan daftar perintah',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  coin: 3,
  premium: false,

  async run(criv, { m, args, pushName, readMore, fakeQuote }) {
    const plugins = criv.plugins || {}
    const categorized = {}

    for (const plug of Object.values(plugins)) {
      const tag = plug.tag ? plug.tag.toUpperCase() : 'OTHERS'
      if (!categorized[tag]) categorized[tag] = []

      let commandToDisplay = Array.isArray(plug.command)
        ? plug.command[0]
        : plug.command

      if (!commandToDisplay) continue
      if (!categorized[tag].includes(commandToDisplay)) {
        categorized[tag].push(commandToDisplay)
      }
    }

    const filterTag = args[0]?.toUpperCase()
    const tagsToShow = filterTag && categorized[filterTag]
      ? { [filterTag]: categorized[filterTag] }
      : categorized

    if (filterTag && !categorized[filterTag]) {
      const available = Object.keys(categorized).map(t => `- ${t}`).join('\n')
      return m.reply(`[ ! ] Kategori *${filterTag}* tidak ditemukan.\n\nKategori yang tersedia:\n${available}`)
    }

    let menu = ` ${global.getGreet(pushName)}\n\n${readMore}\n`

    for (const [tag, cmds] of Object.entries(tagsToShow)) {
      menu += `\n*☰  ${tag} MENU:*\n`
      for (const cmd of cmds) {
        menu += `> *${global.prefix[0]}${cmd}*\n`
      }
    }

    try {
      await criv.sendMessage(m.chat, {
        text: menu,
        contextInfo: {
            externalAdReply: {
            showAdAttribution: false,
            title: "Shiro Menu",
            body: "Shiro",
            thumbnailUrl: global.thumb,
            sourceUrl: "https://github.com/Cristavee",
            mediaType: 1,
            renderLargerThumbnail: true
          },
          isForwarded: true
        }
      }, { quoted: m })
    } catch (error) {
      console.error('❌ Error mengirim menu:', error)
      m.reply('Terjadi kesalahan saat mengirim menu.')
    }
  }
}