export default {
  command: ['hidetag'],
  tag: 'group',
  description: 'Mengirim pesan tersembunyi dengan mention semua anggota grup.',
  group: true,
  admin: true,
  botAdmin: true,
  coin: 5,
  cooldown: 10000,
  
  async run(criv, { m, args }) {
    const text = args.join(' ').trim()
    if (!text) return m.reply('✏️ Masukkan teks yang ingin dikirim ke semua anggota.')
    
    const metadata = await criv.groupMetadata(m.chat)
    const participants = metadata.participants.map(p => p.id)
    
    await criv.sendMessage(m.chat, {
      text,
      mentions: participants
    })
  }
}