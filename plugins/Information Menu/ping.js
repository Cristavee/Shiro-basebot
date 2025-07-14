export default {
  command: ['ping', 'speed'],
  tag: 'information',
  description: 'Cek kecepatan respon bot',
  public: true,
  coin: 2,
  async run(criv, { m }) {
    const start = Date.now()
    await criv.sendMessage(m.chat, { text: '🏓 Mengukur kecepatan...' }, { quoted: m })
    const latency = Date.now() - start
    m.reply(`Pong! Kecepatan respon: *${latency}ms*`)
  }
}