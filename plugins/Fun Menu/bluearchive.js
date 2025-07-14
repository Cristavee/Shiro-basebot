export default {
  command: ['bluearchive', 'ba'], 
  tag: 'fun', 
  description: 'Dapatkan random blue archive.',
  owner: false,
  admin: false, 
  botAdmin: false, 
  public: true, 
  premium: false,
  coin: 5,
  cooldown: 5000,

  async run(criv, { m, text }) {
    const waifu = `https://api.siputzx.my.id/api/r/blue-archive`

    await criv.sendMessage(m.chat, {
      image: { url: waifu },
      caption: `> *Suspicious!*`
    }, { quoted: m })
  }
}