export default {
  command: ['reply'],
  tag: 'development',
  description: 'reply',
  async run(criv, { m }) {
    if (!m.quoted) return m.reply('⚠️ Tidak ada pesan yang direply.')

    const type = Object.keys(m.quoted.message)[0]
    const content = m.quoted.message[type]

    let info = `📥 *Debug Quoted Message*\n`
    info += `• Type: ${type}\n`
    info += `• From: ${m.quoted.sender}\n`
    info += `• Mimetype: ${m.quoted.mimetype || 'N/A'}\n`
    info += `• Caption: ${content?.caption || 'N/A'}\n`
    info += `• File size: ${content?.fileLength || 0} bytes`

    return m.reply(info)
  }
}