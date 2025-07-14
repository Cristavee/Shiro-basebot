import fs from 'fs';  // Pastikan fs diimpor untuk membaca file

export default {
  command: ['demo'],
  tag: 'development',
  description: 'Demo helper',
  owner: true,
  async run(criv, { m }) {
    // Mengirimkan kontak
    await criv.sendContact(m.chat, [{ name: 'Mark Zuckerberg', number: '628123456789' }], m);

    // Mengirimkan sticker
    await criv.sendAsSticker(m.chat, './lib/media/sticker.webp', m);

    // Mengirimkan audio dengan stream
    const audioPath = './lib/media/audio.mp3';
    const audioStream = fs.createReadStream(audioPath); // Membaca file sebagai stream
    await criv.sendAudio(m.chat, audioStream, m);

    // Mengirimkan file sebagai buffer
    const filePath = './lib/media/file.pdf';
    const fileBuffer = fs.readFileSync(filePath);  // Membaca file sebagai buffer
    await criv.sendFile(m.chat, fileBuffer, 'contoh.pdf', 'application/pdf', m);
  }
}