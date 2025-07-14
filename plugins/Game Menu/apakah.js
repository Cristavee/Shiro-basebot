export default {
  command: ['apakah'], 
  tag: 'game', 
  description: 'Menjawab pertanyaan acak dengan ya/tidak/mungkin',
  owner: false,
  admin: false, 
  botAdmin: false, 
  public: true, 
  group: false,
  premium: false,
  coin: 3,
  cooldown: 5000,

  async run(criv, { m, text, pushName }) {
    if (!text) return m.reply('Tulis pertanyaannya!\nContoh: .apakah saya jodohnya?')

    const jawaban = [
      'Oh jelas.',
      'Mungkin ya.',
      'Bisa jadi.',
      'Bisa jadi tidak.',
      'Tidak.',
      'Mustahil.'
    ]

    const hasil = await criv.pickRandom(jawaban)

    const hasilText = `
Pertanyaan: ${text}
Penanya   : ${pushName}
Jawaban   : ${hasil}
    `.trim()

    await m.reply(hasilText)
  }
}