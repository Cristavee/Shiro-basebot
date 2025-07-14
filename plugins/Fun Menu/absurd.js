export default {
  command: ['absurd', 'gaje'],
  tag: 'fun',
  description: 'Mengubah teks menjadi absurd dengan kombinasi huruf besar-kecil acak dan spasi diganti emoji.',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 2,
  cooldown: 5000,
  
  async run(criv, { m, text }) {
    const content = m.quoted?.body || text;
    const MAX_CHARS = 150; 
    if (!content) {
      return m.reply('❌ Masukkan teks! Kamu bisa membalas pesan atau mengetik teks langsung setelah perintah.\nContoh: `.absurd Halo dunia`');
    }

    if (content.length > MAX_CHARS) {
      return m.reply(`⚠️ Teks terlalu panjang! Maksimal ${MAX_CHARS} karakter. Teks kamu: ${content.length} karakter.`);
    }
    
  const emojis = ['😈', '🤯', '😀', '🤓', '😡', '😉', '🤭', '😘', '☺️', '🤪', '🤡', '😜', '🥶', '😱'];
    
    const result = [...content]
      .map(char => {
        if (char === ' ') {
          return emojis[Math.floor(Math.random() * emojis.length)];
        }
        return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
      })
      .join(''); 
    await m.reply(result);
  }
}
