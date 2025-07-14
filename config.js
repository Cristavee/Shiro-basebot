import moment from 'moment-timezone'

// ─── Pengaturan Bot ─────────────────────────────────
global.usePairingCode = true // true = pairing code, false = QR

global.bot = {
  name: 'Shiro',
  owner: '6285932203366',
  ownerName: 'Cristave',
  dummy: '120363396283957684',
  codeName: 'Shirotaka'
}
global.thumb = 'https://pomf2.lain.la/f/10xr5ka8.png'

// ─── Sticker ──────────────────────────────────

global.pack = 'Shiro Sticker'
global.author = 'Cristave Tumis'

// ─── Daftar Owner ──────────────────────────────────
global.owner = [
  `${global.bot.owner}@s.whatsapp.net`
]

// ─── Prefix Perintah ───────────────────────────────
global.prefix = ['.', '!', '/', ',']

// ─── Sosial Media ──────────────────────────────────
global.ig = ''
global.wa = global.bot.owner
global.git = ''
global.yt = '' // isi jika ada
global.fb = '' // isi jika ada

// ─── Respon Bot Default ────────────────────────────
global.msg = {
  owner: '> [ ! ] Command ini hanya untuk Owner.',
  admin: '> [ ! ] Command ini hanya bisa digunakan Admin grup.',
  botAdmin: '> [ ! ] Bot perlu menjadi Admin terlebih dahulu.',
  group: '> [ ! ] Command ini hanya bisa digunakan di grup.',
  private: '> [ ! ] Command ini hanya untuk chat pribadi.',
  error: '> [ ! ] Terjadi kesalahan saat menjalankan perintah.',
  query: '> [ ! ] Masukkan teks atau query yang sesuai.',
  reply: '> [ ! ] Silakan reply pesan.',
  success: '> [ ✓ ] Berhasil.',
  premium: '> [ ! ] Fitur ini hanya untuk pengguna Premium.',
  coin: '> [ ! ] Coin kamu tidak cukup untuk menggunakan perintah ini.'
}

// ─── API Key ───────────────────────────────────────
global.lolhuman = 'f2372fcca4c31f0c6a2f8d9a' // ganti jika perlu
global.beta = 'Btz-hmKeJ'
// ─── Footer ────────────────────────────────────────
global.footer = '`Shirotaka`'

// ─── Fungsi Sapaan Dinamis ─────────────────────────
function getGreeting() {
  const hour = moment().tz('Asia/Jakarta').hour()
  if (hour >= 4 && hour < 11) return 'Selamat pagi'
  if (hour >= 11 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

// PERUBAHAN DI SINI: Menambahkan parameter senderJid
global.getGreet = (pushName = 'Pengguna', senderJid) => {
  const greet = getGreeting()
  const botName = global.bot.name
  const ownerName = global.bot.ownerName
  
  const prefa = Array.isArray(global.prefix) && global.prefix.length > 0
    ? `[ ${global.prefix.join(' ]─[ ')} ]`
    : '[ Tidak Ada Prefix ]';

  const total = global.totalFeature || 0

  // Menggunakan senderJid untuk membuat tag pengguna
  // Jika senderJid tersedia, gunakan @[bagian nomor JID], jika tidak, gunakan @[pushName] sebagai teks biasa
  const userTag = senderJid ? `@${senderJid.split('@')[0]}` : `@${pushName}`;

  return `Hai ${userTag}, ${greet}.\n\n` + // Menggunakan userTag di sini
    `Saat ini bot masih dalam tahap pengembangan, jadi beberapa fitur mungkin masih belum stabil atau sedang diuji coba.\n\n` +
    `*Informasi bot:*\n` +
    `> Nama bot     : ${botName}\n` +
    `> Pemilik      : ${ownerName}\n` +
    `> Prefix       : ${prefa}\n` +
    `> Total Fitur  : ${total}\n\n` +
    `Untuk melihat daftar perintah, ketik:\n` +
    `\`.menu\` atau \`.menu <tag>\`\n\n` +
    `Jika kamu menemukan bug atau punya saran, silakan kirim via fitur FAQ & Suggestions.\n` +
    `Terima kasih telah menggunakan bot ini.\n` +
    `───────────────────────────────`
}

// ─── Meta Preview / AdReply ────────────────────────

global.adReply = {
  externalAdReply: {
    showAdAttribution: true,
    title: global.bot.codeName || 'Bot',
    body: 'Shiro bot',
    mediaType: 1,
    renderLargerThumbnail: true,
    thumbnailUrl: 'https://pixhost.to/show/7112/620632085_1001614741.png',
    sourceUrl: ''
  }
}

// ─── Ekspos ke Global ──────────────────────────────
globalThis.bot = global.bot
globalThis.msg = global.msg
globalThis.adReply = global.adReply
globalThis.getGreet = global.getGreet
