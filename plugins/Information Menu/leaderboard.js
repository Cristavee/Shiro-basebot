export default {
  command: ['leaderboard', 'top'],
  tag: 'main',
  description: 'Menampilkan peringkat pengguna berdasarkan level & EXP.',
  public: true,
  coin: 0,
  cooldown: 5000,

  async run(criv, { m, sender, system }) {
    const allUsers = system.getAllUsers()

    const users = Object.entries(allUsers)
      .map(([id, user]) => ({
        id,
        name: user.name || `@${id.split('@')[0]}`,
        level: user.level || 0,
        exp: user.exp || 0
      }))
      .filter(u => typeof u.id === 'string' && u.id.endsWith('@s.whatsapp.net'))

    if (users.length === 0) {
      return m.reply('❌ Belum ada pengguna yang tercatat di database.')
    }
      
    users.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level
      return b.exp - a.exp
    })

    const topList = users.slice(0, 10)
    const mentions = topList.map(u => u.id)

    const rankText = topList
      .map((u, i) => {
        const mention = `@${u.id.split('@')[0]}`
        const isSender = u.id === sender
        return `${isSender ? '🫵' : `${i + 1}.`} ${mention} — Level ${u.level}, EXP ${u.exp}`
      })
      .join('\n')

    const senderRank = users.findIndex(u => u.id === sender) + 1

    const text = `🏆 *LEADERBOARD*\n\n${rankText}\n\n📍 *Peringkat kamu:* #${senderRank} dari ${users.length} pengguna.`

    await criv.sendMessage(m.chat, {
      text,
      mentions
    }, { quoted: m })
  }
}