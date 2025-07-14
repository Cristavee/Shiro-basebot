import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export default {
  command: ['detailmenu', 'menus'],
  tag: 'main',
  description: 'Menampilkan deskripsi',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  coin: 5,
  premium: false,

  async run(criv, { m, args, pushName }) {
    const plugins = criv.plugins || {}
    const categorized = {}

    for (const plug of Object.values(plugins)) {
      const tag = plug.tag ? plug.tag.toUpperCase() : 'OTHERS'
      if (!categorized[tag]) categorized[tag] = []

      const commands = Array.isArray(plug.command) ? plug.command : [plug.command]

      for (const cmd of commands) {
        const isExist = categorized[tag].some(c => c.command === cmd)
        if (cmd && !isExist) {
          categorized[tag].push({
            command: cmd,
            description: plug.description || ''
          })
        }
      }
    }

    const filterTag = args[0] ? args[0].toUpperCase() : null
    const tagsToShow = filterTag && categorized[filterTag] ?
      {
        [filterTag]: categorized[filterTag]
      } :
      categorized

    if (filterTag && !categorized[filterTag]) {
      const available = Object.keys(categorized).map(t => `- ${t}`).join('\n')
      return m.reply(`[ ! ] Kategori *${filterTag}* tidak ditemukan.\n\nKategori yang tersedia:\n${available}`)
    }
  
    let menu = `${global.getGreet(pushName || m.pushName)}\n\n`
  
    for (const [tag, cmdsArr] of Object.entries(tagsToShow)) {
      menu += `*☰  ${tag} MENU:*\n`
      for (const item of cmdsArr) {
        menu += ` › *${global.prefix[0]}${item.command}* –\n> ${item.description || 'Tanpa Deskripsi'}\n`
      }
      menu += '\n'
    }

    try {
        await criv.sendMessage(m.chat, {
            text: menu.trim(),
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
        console.error('Error sending detail menu with interactive buttons:', error);
        await m.reply(menu.trim());
    }
  }
}
