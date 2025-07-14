import fetch from 'node-fetch'

export default {
  command: ['tes'], 
  tag: 'development', 
  description: '', 
  owner: false,
  admin: false, 
  botAdmin: false, 
  public: true, 
  premium: false,
  coin: 5,
  cooldown: 5000,

  async run(criv, { m, target }) {
 
await criv.sendMessage(m.chat, {
  text: 'Halo, ini menu bot.',
  contextInfo: {
      externalAdReply: {
            title: "Shiro Bot Menu",
            body: "Shiro Smart Assistant",
            thumbnailUrl: global.thumb,
            sourceUrl: "https://github.com/Cristavee",
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
})
      }
    }