export default {
  command: ['restart'],
  tag: 'owner',
  description: 'Memulai ulang bot',
  owner: true,
  public: false,

  async run(criv, { m }) {
    await m.reply('🔄 Memulai ulang bot...')
    process.exit(0) // keluar dengan sukses, akan restart kalau pakai PM2/nodemon
  }
}