export default {
  command: ['contact'], 
  tag: 'fun', 
  description: 'kirim kontak palsu', 
  owner: false,
  admin: false, 
  botAdmin: false, 
  public: true, 
  group: false, // ini group only
  premium: false,
  coin: 5,
  cooldown: 7000,

  async run(criv, { system,  m,  body,  from,  args,  command,  sender,  pushName,  text,  greet, target, amount,  user,  helpers,  mentioned,  readMore,  fakeQuote }) {
  if (!text) return criv.reply('Masukan nama kontak')
  await criv.sendContact(m.chat, [{ name: text , number: '123456789' }], m);
  }
}