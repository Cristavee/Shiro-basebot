import axios from 'axios'

export default {
  command: ['stickpin', 'spin'],
  tag: 'search',
  description: 'Cari gambar dari Pinterest (acak) berdasarkan jumlah input pengguna.',
  owner: false,
  admin: false,
  botAdmin: false,
  public: true,
  premium: false,
  coin: 10,
  cooldown: 15000,

  async run(criv, { m, text }) {
    if (!text) return m.reply('Masukkan kata kunci pencarian dan opsional jumlah gambar (maks 10).\n\nContoh: *.spin bunga cantik 3* .')

    const args = text.split(' ')
    let query = text
    let count = 1 

    if (args.length > 1) {
      const lastArg = parseInt(args[args.length - 1])
      if (!isNaN(lastArg) && lastArg > 0) {
        count = Math.min(lastArg, 10) 
        query = args.slice(0, -1).join(' ')
      }
    }
    
    if (!query) return m.reply('Masukkan kata kunci pencarian.')

    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/s/pinterest', {
        params: { query: query, type: 'image' }
      })

      const results = data?.data
      if (!Array.isArray(results) || results.length === 0) {
        return m.reply(`Gambar untuk "${query}" tidak ditemukan, coba kata kunci lain.`)
      }

      const numImagesToSend = Math.min(count, results.length);
      const sentImageUrls = new Set(); 

      if (numImagesToSend === 0) {
        return m.reply(`Tidak ada gambar yang cukup untuk "${query}" sesuai permintaan.`)
      }
      for (let i = 0; i < numImagesToSend; i++) {
        let randomIndex;
        let selectedImageUrl;
        let attempts = 0;
        const maxAttempts = results.length * 2; 

        do {
          randomIndex = Math.floor(Math.random() * results.length);
          selectedImageUrl = results[randomIndex]?.image_url;
          attempts++;
        } while (sentImageUrls.has(selectedImageUrl) && attempts < maxAttempts);

        if (!selectedImageUrl || sentImageUrls.has(selectedImageUrl)) {
          console.warn(`Tidak dapat menemukan gambar unik ke-${i + 1} atau semua gambar sudah terkirim.`);
          continue; 
        }

        try {
          const imageBuffer = await axios.get(selectedImageUrl, { responseType: 'arraybuffer' });
          await criv.sendAsSticker(m.chat, Buffer.from(imageBuffer.data), { quoted: m });
          sentImageUrls.add(selectedImageUrl); 
        } catch (stickerErr) {
          console.error(`Gagal mengirim stiker dari URL: ${selectedImageUrl}`, stickerErr);
        }
      }

      if (sentImageUrls.size === 0) {
          m.reply('Gagal mengirim stiker. Mungkin ada masalah dengan URL gambar atau konversi.');
      }

    } catch (err) {
      console.error(err)
      m.reply('Terjadi kesalahan saat mengambil gambar dari Pinterest atau mengonversinya menjadi stiker.')
    }
  }
}
