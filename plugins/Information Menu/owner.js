import system from '../../lib/system.js'

export default {
  command: ['owner', 'dev', 'developer'],
  tag: 'information',
  description: '',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 5,

  async run(criv, { m }) {
    await criv.sendContact(m.chat, [
      { name: bot.ownerName, number: bot.owner }
    ])
  }
}