import * as baileys from 'baileys'
import chalk from 'chalk'
import pino from 'pino'
import readline from 'readline'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { extendHelper } from './lib/helpers.js'
import { groupEventHandler } from './events/group.js'
import './config.js' // Pastikan ini menginisialisasi global.bot, global.prefix, global.owner, global.dummy
import handleMessageEvents from './handler.js' // Mengimpor fungsi handler utama sebagai default export


const { makeWASocket, DisconnectReason, useMultiFileAuthState, makeInMemoryStore } = baileys

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function question(text) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise(resolve => {
    rl.question(text, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

async function begin() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const store = makeInMemoryStore({ logger: pino().silent() });

  const criv = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !global.usePairingCode,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.0.4'],
    keepAliveIntervalMs: 10000,
    getMessage: async (key) => {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        if (msg) return msg;

        try {
            const fetchedMsg = await criv.fetchMessages(key.remoteJid, { count: 1, fromMe: key.fromMe, id: key.id });
            return fetchedMsg.messages[0];
        } catch (error) {
            return undefined;
        }
    }
  })
  criv.welcome = true
  store.bind(criv.ev)

  extendHelper(criv)
  if (criv.welcome) { groupEventHandler(criv) }

  if (!criv.authState.creds.registered) {
    const phoneNumber = process.argv[2] || await question('Enter your WhatsApp number: ')
    const pair = 'AAAAAAAA' // Anda bisa mengubah ini jika ingin menggunakan kode pairing khusus
    const pairCode = await criv.requestPairingCode(phoneNumber, pair)
    console.log(chalk.green(`Your Pairing Code: ${pairCode}`))
  }

  criv.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      console.log(chalk.red(`Disconnected. Reason: ${reason}`))
      switch (reason) {
        case DisconnectReason.badSession:
          console.log('Bad session. Delete session and pair again.')
          const sessionPath = path.resolve(__dirname, 'session');
          if (fs.existsSync(sessionPath)) {
              fs.rmSync(sessionPath, { recursive: true, force: true });
              console.log(chalk.red('Folder sesi dihapus.'));
          }
          begin()
          break
        case DisconnectReason.connectionClosed:
        case DisconnectReason.connectionLost:
        case DisconnectReason.timedOut:
        case DisconnectReason.restartRequired:
          console.log('Connection lost. Reconnecting...')
          begin()
          break
        case DisconnectReason.loggedOut:
          console.log('Logged out. Delete session and pair again.')
          const sessionPathLoggedOut = path.resolve(__dirname, 'session');
          if (fs.existsSync(sessionPathLoggedOut)) {
              fs.rmSync(sessionPathLoggedOut, { recursive: true, force: true });
              console.log(chalk.red('Folder sesi dihapus.'));
          }
          begin()
          break
        default:
          console.log('Unknown reason. Reconnecting...')
          begin()
      }
    } else if (connection === 'open') {
      console.log(chalk.bgGreen('Connected to WhatsApp!'))
      global.welcome = typeof global.welcome === 'boolean' ? global.welcome : true;


      // Inisialisasi handler pesan utama
      // Sekarang handleMessageEvents adalah fungsi yang diimpor dari handler.js
      handleMessageEvents(criv)

      // Semua logika pengelolaan game dan penyimpanan pesan kini ditangani di handler.js
      // Sehingga tidak perlu lagi ada criv.ev.on('messages.upsert') atau cleanupExpiredGames di sini
    }
  })

  criv.ev.on('creds.update', saveCreds)

  criv.public = true
  criv.private = false


  // Blok try-catch untuk error saat memuat atau menginisialisasi handler
  try {
    // Panggilan handleEvents(criv) yang duplikat di akhir begin() telah dihapus
  } catch (err) {
    console.error(chalk.red('❌ Gagal memuat atau menginisialisasi handler:'))
    console.error(chalk.redBright('📄 File:'), __filename)
    console.error(chalk.redBright('🕒 Waktu:'), new Date().toLocaleString('id-ID'))
    console.error(chalk.redBright('📌 Jenis Error:'), err.name || 'UnknownError')
    console.error(chalk.redBright('💬 Pesan:'), err.message || 'Tidak ada pesan error')
    if (err.stack) {
      console.error(chalk.gray('📜 Stack Trace:\n') + chalk.gray(err.stack))
    }

    // Jika global.dummy diatur di config.js, Anda bisa mengirim pesan error
    if (global.dummy) {
      // Perlu diingat, pesan ini hanya akan terkirim jika bot berhasil terhubung
      // dan 'criv' objek sudah valid pada saat error terjadi.
      // Untuk error fatal yang mencegah koneksi, ini tidak akan berfungsi.
      // logErrorToFile() di handler.js lebih handal untuk logging error.
    }
  }

  return criv
}

begin()

// Logika watch file untuk file-file inti (bukan plugin)
// Plugin hot-reload sekarang sepenuhnya ditangani oleh chokidar di handler.js.
// Perubahan pada file-file ini biasanya memerlukan restart bot.
const watchList = ['index.js', 'config.js', 'package.json']

watchList.forEach(file => {
  const fullPath = path.join(__dirname, file)
  // Perhatikan: fs.watchFile mungkin tidak optimal untuk produksi.
  // Untuk hot-reload yang lebih canggih pada file inti, biasanya menggunakan nodemon atau serupa.
  fs.watchFile(fullPath, () => {
    console.log(chalk.greenBright.bold('[ UPDATED ]'), chalk.cyan(file));
    console.log(chalk.yellow('Perubahan pada file inti terdeteksi. Mohon restart bot untuk menerapkan perubahan sepenuhnya.'));
  })
})


