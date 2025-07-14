 import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import util from 'util'
import { exec, execSync } from 'child_process' 
import chalk from 'chalk'
import chokidar from 'chokidar'
import * as helpers from './lib/helpers.js'
import system from './lib/system.js'
import './config.js'

// --- Definisi __filename dan __dirname yang TUNGGAL dan konsisten ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- Lokasi folder plugins ---
const pluginsDir = path.join(__dirname, 'plugins')

const cooldowns = new Map()
const spamMap = new Map()
const SPAM_THRESHOLD = 5
const SPAM_INTERVAL = 10000
const gamePlugins = {};
const activeGameTimeouts = {};
const lastActivity = new Map()

const ERROR_LOG_FILE = path.resolve(__dirname, './error.log') // Pastikan menggunakan __dirname di sini

if (!global.processedMessageIds) global.processedMessageIds = new Set()
const MESSAGE_ID_LIFESPAN = 5000

global.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
global.sleep = global.delay

function logErrorToFile(error) {
  const timestamp = new Date().toISOString()
  const errorMessage = `[${timestamp}] ${error.stack || error.message}\n`
  fs.appendFileSync(ERROR_LOG_FILE, errorMessage, 'utf8')
  console.error(chalk.red(`Error dicatat ke ${ERROR_LOG_FILE}`))
}

function updateLastActivity(senderId) {
  lastActivity.set(senderId, Date.now())
}

function isSpamming(senderId, command) {
  const key = `${senderId}:${command}`
  const now = Date.now()
  const spamData = spamMap.get(key) || { count: 0, lastTime: 0 } // Perbaikan: Gunakan lastTime bukan firstTime untuk interval

  if (now - spamData.lastTime < SPAM_INTERVAL) {
    spamData.count++
  } else {
    spamData.count = 1
  }
  spamData.lastTime = now
  spamMap.set(key, spamData)

  return spamData.count >= SPAM_THRESHOLD // Perbaikan: Gunakan >= bukan >
}


function logCommand(sender, command, from, isGroup) {
  const chatType = isGroup ? 'Group' : 'Private';
  // Waktu lokal dengan format yang mudah dibaca
  const time = chalk.hex('#888888')(`[${new Date().toLocaleTimeString('id-ID', { hour12: false })}]`);
  
  // Ambil nama pengguna atau ID jika tidak ada nama
  const senderTag = typeof sender === 'string' && sender.includes('@') ? sender.split('@')[0] : sender;

  // Ikon berdasarkan tipe chat
  const icon = isGroup ? '👥' : '👤'; 

  // Warna untuk tipe chat (Hijau terang untuk Grup, Ungu/Lavender untuk Private)
  const chatTypeColor = isGroup ? chalk.hex('#90EE90') : chalk.hex('#D8BFD8'); 

  // Warna untuk pengirim dan perintah
  const senderColor = chalk.whiteBright.bold;
  const commandColor = chalk.hex('#ADD8E6'); // Biru muda untuk perintah
  const fromColor = chalk.hex('#AAAAAA'); // Abu-abu terang untuk JID

  console.log(
    `${icon} ${chatTypeColor(`[${chatType}]`)} ${senderColor(senderTag)} ${time}\n` +
    `  ${chalk.hex('#666666')('└─')} ${commandColor(`Command:`)} ${chalk.whiteBright(command)} ${fromColor(`(in ${from})`)}\n`
  );
}

// ==========================================================
// >>> LOGIKA PEMUATAN PLUGIN <<<
// ==========================================================

if (!global.plugins) {
    global.plugins = {};
}

async function loadPlugin(filePath) {
      try {
          const pluginModule = await import(pathToFileURL(filePath).href + `?update=${Date.now()}`);
          const plugin = pluginModule.default;
  
          if (plugin && plugin.command && Array.isArray(plugin.command)) {
              for (const cmd of plugin.command) {
                  global.plugins[cmd.toLowerCase()] = plugin;
                  global.plugins[cmd.toLowerCase()].filePath = filePath;
              }
              if (typeof plugin.onMessage === 'function') {
                  gamePlugins[plugin.command[0].toLowerCase()] = plugin;
              }
              console.log(`✅ Plugin '${path.basename(filePath)}' dimuat: ${plugin.command.join(', ')}`);
              return true;
          } else {
              console.warn(`⚠️ Plugin '${path.basename(filePath)}' dilewati: Tidak ada properti 'command' atau bukan array.`);
              return false;
          }
      } catch (e) {
          console.error(chalk.red(`❌ Gagal memuat plugin '${path.basename(filePath)}':`), e);
          logErrorToFile(e);
          return false;
      }
  }


// Fungsi loadPlugin diperbarui untuk konsistensi dengan loadAllPlugins
async function loadAllPlugins() {
    console.log(chalk.yellow('🔄 Memuat ulang semua plugin...'));
    global.plugins = {};
    Object.keys(gamePlugins).forEach(key => delete gamePlugins[key]);

    try {
        const items = fs.readdirSync(pluginsDir);
        let totalLoaded = 0;

        for (const item of items) {
            const itemPath = path.join(pluginsDir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                const pluginFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
                for (const file of pluginFiles) {
                    const filePath = path.join(itemPath, file);
                    const loaded = await loadPlugin(filePath);
                    if (loaded) {
                        totalLoaded++;
                    }
                }
            } else if (stat.isFile() && item.endsWith('.js')) {
                 const loaded = await loadPlugin(itemPath);
                 if (loaded) {
                     totalLoaded++;
                 }
            }
        }
        global.totalFeature = totalLoaded;
        console.log(chalk.green(`✅ Semua plugin selesai dimuat. Total fitur: ${totalLoaded}`));
    } catch (dirError) {
        console.error(chalk.red(`❌ Gagal membaca direktori plugin '${pluginsDir}':`), dirError);
        logErrorToFile(dirError);
    }
}

// Panggil sekali untuk pemuatan awal
loadAllPlugins();

// Untuk Chokidar Watcher
chokidar.watch(pluginsDir, { ignored: /(^|[\/\\])\../, persistent: true, ignoreInitial: true })
    .on('change', async p => {
        console.log(chalk.magenta(`Plugin diubah: ${p}. Memuat ulang...`));
        if (fs.statSync(p).isFile() && p.endsWith('.js')) {
            const absolutePath = path.resolve(p);
            let oldCommandsCount = 0;
            for (const cmd in global.plugins) {
                if (global.plugins[cmd]?.filePath && path.resolve(global.plugins[cmd].filePath) === absolutePath) {
                    delete global.plugins[cmd];
                    oldCommandsCount++;
                }
            }
            const loaded = await loadPlugin(absolutePath);
            if (loaded) {
                global.totalFeature = global.totalFeature - oldCommandsCount + 1;
                console.log(chalk.green('✅ Reloaded:'), path.basename(absolutePath));
            } else {
                global.totalFeature = global.totalFeature - oldCommandsCount;
                console.warn(chalk.yellow(`⚠️ Tidak ada command di ${path.basename(absolutePath)} saat reload.`));
            }
        } else {
            loadAllPlugins();
        }
    })
    .on('add', async p => {
        console.log(chalk.magenta(`Plugin baru ditambahkan: ${p}. Memuat ulang...`));
        if (fs.statSync(p).isFile() && p.endsWith('.js')) {
            const absolutePath = path.resolve(p);
            const loaded = await loadPlugin(absolutePath);
            if (loaded) {
                global.totalFeature++;
            }
        } else {
            loadAllPlugins();
        }
    })
    .on('unlink', p => {
        console.log(chalk.magenta(`Plugin dihapus: ${p}. Memuat ulang...`));
        if (fs.statSync(p).isFile() && p.endsWith('.js')) {
            const absolutePath = path.resolve(p);
            let removedCommandsCount = 0;
            for (const cmd in global.plugins) {
                if (global.plugins[cmd]?.filePath && path.resolve(global.plugins[cmd].filePath) === absolutePath) {
                    delete global.plugins[cmd];
                    console.log(chalk.red(`  -> Dihapus: ${cmd}`));
                    removedCommandsCount++;
                }
            }
            global.totalFeature -= removedCommandsCount;
        } else {
            loadAllPlugins();
        }
    });


// ==========================================================
// <<< AKHIR LOGIKA PEMUATAN PLUGIN >>>
// ==========================================================


// Fungsi untuk membersihkan game yang sudah kadaluarsa
async function cleanupExpiredGames() {
  await system.db.read();
  const now = Date.now();
  let changed = false;
  for (const gameId in system.db.data.games) {
    const game = system.db.data.games[gameId];
    if (game.active && game.endTime && now > game.endTime) {
      console.log(`Membersihkan game kedaluwarsa: ${gameId}`);
      delete system.db.data.games[gameId];
      if (activeGameTimeouts[gameId]) {
          clearTimeout(activeGameTimeouts[gameId]);
          delete activeGameTimeouts[gameId];
      }
      changed = true;
    }
  }
  if (changed) {
    await system.saveDb();
  }
}

// Atur interval untuk membersihkan game yang sudah kadaluarsa
setInterval(cleanupExpiredGames, 60 * 1000);


export default (criv) => {
   criv.decodeJid = helpers.decodeJid
   criv.plugins = global.plugins

  // Listener utama untuk semua pesan yang masuk
  criv.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const m = chatUpdate.messages?.[0]
      if (!m?.message) return

      // --- START: Logika penyimpanan pesan ke database ---
      const { messages, type } = chatUpdate;
      if (type === 'append') {
          if (!system.db.data) system.db.data = {};
          system.db.data.messages = system.db.data.messages || {};
          for (const msg of messages) {
              system.db.data.messages[msg.key.id] = msg;
          }
      }
      // --- END: Logika penyimpanan pesan ---

      // Pencegahan pesan duplikat
      if (m.key.id && global.processedMessageIds.has(m.key.id)) return;
      global.processedMessageIds.add(m.key.id);
      setTimeout(() => global.processedMessageIds.delete(m.key.id), MESSAGE_ID_LIFESPAN);

      m.key = m.key || { remoteJid: m.remoteJid || '', id: m.id || '', fromMe: false }
      const mtype = Object.keys(m.message)[0]
      const content = m.message[mtype]
      m.image = mtype === 'imageMessage' ? content : null
      m.video = mtype === 'videoMessage' ? content : null
      m.audio = mtype === 'audioMessage' ? content : null
      m.document = mtype === 'documentMessage' ? content : null

      const msgContent = Object.values(m.message || {})[0]
      const context = msgContent?.contextInfo

   m.quoted = context?.quotedMessage ? {
    id: context.stanzaId,
    chat: context.remoteJid,
    sender: context.participant ? helpers.decodeJid(context.participant) : m.key.remoteJid,
    fromMe: context.fromMe || false,
    message: context.quotedMessage,
    key: {
        remoteJid: context.remoteJid,
        id: context.stanzaId,
        participant: context.participant,
    },
    
    download: async () => {
        const quotedType = Object.keys(context.quotedMessage)[0];
        const mediaObject = context.quotedMessage[quotedType];
        if (mediaObject?.stream || mediaObject?.url || ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(quotedType)) {
            return await criv.downloadMediaMessage({
                key: {
                    remoteJid: context.remoteJid,
                    id: context.stanzaId,
                    participant: context.participant,
                },
                message: context.quotedMessage,
            });
        }
        return null;
    },
    
    isSticker: !!context.quotedMessage.stickerMessage,
    isImage: !!context.quotedMessage.imageMessage,
    isVideo: !!context.quotedMessage.videoMessage,
    isAudio: !!context.quotedMessage.audioMessage,
    isDocument: !!context.quotedMessage.documentMessage,
    isMedia: !!(context.quotedMessage.imageMessage || context.quotedMessage.videoMessage || context.quotedMessage.audioMessage || context.quotedMessage.documentMessage || context.quotedMessage.stickerMessage),
    isText: !!(context.quotedMessage.conversation || context.quotedMessage.extendedTextMessage),
    isButtons: !!(context.quotedMessage.buttonsMessage || context.quotedMessage.buttonsResponseMessage),
    isList: !!(context.quotedMessage.listMessage || context.quotedMessage.listResponseMessage),
    isTemplate: !!context.quotedMessage.templateButtonReplyMessage,

    mtype: Object.keys(context.quotedMessage)[0],
    text: context.quotedMessage.conversation || context.quotedMessage.extendedTextMessage?.text || context.quotedMessage.imageMessage?.caption || context.quotedMessage.videoMessage?.caption || context.quotedMessage.buttonsResponseMessage?.selectedButtonId || context.quotedMessage.templateButtonReplyMessage?.selectedId || context.quotedMessage.listResponseMessage?.singleSelectReply?.selectedRowId || ''

} : null




      let body = ''
      switch (mtype) {
        case 'conversation': body = m.message.conversation; break
        case 'extendedTextMessage': body = m.message.extendedTextMessage?.text || ''; break
        case 'imageMessage': body = m.message.imageMessage?.caption || ''; break
        case 'videoMessage': body = m.message.videoMessage?.caption || ''; break
        case 'buttonsResponseMessage': body = m.message.buttonsResponseMessage?.selectedButtonId || ''; break
        case 'templateButtonReplyMessage': body = m.message.templateButtonReplyMessage?.selectedId || ''; break
        case 'listResponseMessage': body = m.message.listResponseMessage?.singleSelectReply?.selectedRowId || ''; break
        case 'stickerMessage': body = m.message.stickerMessage ? '[Stiker]' : ''; break;
        case 'audioMessage': body = m.message.audioMessage ? '[Audio]' : ''; break;
        case 'documentMessage': body = m.message.documentMessage ? '[Dokumen]' : ''; break;
        case 'locationMessage': body = m.message.locationMessage ? '[Lokasi]' : ''; break;
        case 'contactMessage': body = m.message.contactMessage ? '[Kontak]' : ''; break;
        case 'reactionMessage': body = m.message.reactionMessage?.text || '[Reaksi]'; break;
        default: break
      }

      if (!body && m.quoted?.message) {
          const quotedMessageType = Object.keys(m.quoted.message)[0];
          switch (quotedMessageType) {
              case 'conversation': body = m.quoted.message.conversation; break;
              case 'extendedTextMessage': body = m.quoted.message.extendedTextMessage?.text || ''; break;
              case 'imageMessage': body = m.quoted.message.imageMessage?.caption || ''; break;
              case 'videoMessage': body = m.quoted.message.videoMessage?.caption || ''; break;
              case 'stickerMessage': body = '[Stiker Dibalas]'; break;
              case 'audioMessage': body = '[Audio Dibalas]'; break;
              case 'documentMessage': body = '[Dokumen Dibalas]'; break;
              case 'locationMessage': body = '[Lokasi Dibalas]'; break;
              case 'contactMessage': body = '[Kontak Dibalas]'; break;
              case 'buttonsResponseMessage': body = m.quoted.message.buttonsResponseMessage?.selectedButtonId || '[Tombol Dibalas]'; break;
              case 'templateButtonReplyMessage': body = m.quoted.message.templateButtonReplyMessage?.selectedId || '[Template Button Dibalas]'; break;
              case 'listResponseMessage': body = m.quoted.message.listResponseMessage?.singleSelectReply?.selectedRowId || '[List Dibalas]'; break;
              default: break;
          }
      }

      if (!body && mtype === 'imageMessage' && m.message.imageMessage?.caption) {
        body = m.message.imageMessage.caption;
      }

      if (!body && !m.quoted) return

      if (!global.prefix || !Array.isArray(global.prefix)) global.prefix = ['.']
      const usedPrefix = global.prefix.find(p => body.startsWith(p))
      const isCommand = !!usedPrefix

      const command = isCommand ? body.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase() : null
      const args = isCommand ? body.trim().split(' ').slice(1) : []
      const text = args.join(' ')

      // Pastikan `from` dan `sender` selalu ada dan valid
      const from = m.key.remoteJid || '';
      const rawSender = m.key.participant || m.participant || m.key.remoteJid || '';
      const sender = m.key.fromMe ? criv.user?.id || '' : rawSender; // Pastikan criv.user.id ada

      const isGroup = from.endsWith('@g.us')
      const isOwner = [helpers.decodeJid(criv.user?.id || ''), ...(global.owner || []).map(id => helpers.decodeJid(id))].includes(helpers.decodeJid(sender)); // Pastikan criv.user.id ada
      const pushName = m.pushName || (typeof sender === 'string' && sender.includes('@') ? sender.split('@')[0] : 'Unknown');

      const target = helpers.getTarget(m, args)
      const amount = helpers.parseAmount(args)
      const jid = m.sender || m.key?.participant || m.key?.remoteJid || ''
      const { user } = jid ? helpers.safeJidDecode(jid) : { user: '' };
      const readMore = '\u200b'.repeat(5000)
      const getName = async (jid) => {
        try {
          if (typeof criv.getName === 'function') {
            return await criv.getName(jid)
          }
        } catch (e) {
            console.error(chalk.red(`Error getting name for ${jid}:`), e);
        }
        return jid.split('@')[0]
      }
      const mentioned = m.quoted?.sender || (Array.isArray(m.message?.extendedTextMessage?.contextInfo?.mentionedJid) ? m.message.extendedTextMessage.contextInfo.mentionedJid[0] : null) || null;
      const mentionedJids = Array.isArray(m.message?.extendedTextMessage?.contextInfo?.mentionedJid) ? m.message.extendedTextMessage.contextInfo.mentionedJid : [];

        
        
     if (system.isUserBanned(sender)) return
        

      const fakeQuote = {
        key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net' },
        message: { extendedTextMessage: { text: global.bot.name } }
      }
   
      const botNumber = helpers.decodeJid(criv.user?.id || ''); 

      const isMedia = (mtype === 'imageMessage' || mtype === 'videoMessage' || mtype === 'stickerMessage' || mtype === 'audioMessage' || mtype === 'documentMessage');
      const isImage = mtype === 'imageMessage';
      const isVideo = mtype === 'videoMessage';
      const isAudio = mtype === 'audioMessage';
      const isSticker = mtype === 'stickerMessage';
      const isDocument = mtype === 'documentMessage';
      const isQuotedImage = m.quoted?.mimetype?.startsWith('image') || false;
      const isQuotedVideo = m.quoted?.mimetype?.startsWith('video') || false;
      const isQuotedAudio = m.quoted?.mimetype?.startsWith('audio') || false;
      const isQuotedSticker = m.quoted?.mimetype?.startsWith('sticker') || false;
      const isQuotedDocument = m.quoted?.mimetype?.startsWith('application') || false;
      const q = m.quoted;
      const isBot = m.key.fromMe;
      const commandPrefix = usedPrefix;
      const groupMetadata = isGroup ? await criv.groupMetadata(from) : {};
      const groupAdmins = isGroup ? groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || [] : [];
      const isBotAdmin = groupAdmins.includes(botNumber);
      const isAdmin = groupAdmins.includes(sender);
      const isWelcome = global.welcome;
      const currentTime = new Date();
      const timestamp = currentTime.getTime();
      const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour12: false });
      const formattedDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      // Memastikan semua properti `m` ada sebelum digunakan
      Object.assign(m, {
        prefix: global.prefix[0] || '.',
        chat: from,
        sender: sender,
        pushName: pushName,
        body: body,
        args: args,
        command: command,
        text: text,
        isReply: !!m.quoted,
        isMention: mentionedJids.length > 0,
        mentionedJids: mentionedJids,
        isOwner: isOwner,
        isGroup: isGroup,
        isAdmin: isAdmin,
        isBotAdmin: isBotAdmin
      });

      m.reply = async (content, options = {}) => {
        // Tambahkan pengecekan jika criv atau from adalah undefined sebelum sendMessage
        if (!criv || !criv.sendMessage || !from) {
            console.error(chalk.red(`[m.reply ERROR] criv, criv.sendMessage, atau from undefined. Tidak bisa mengirim pesan. From: ${from}`));
            logErrorToFile(new Error(`[m.reply ERROR] criv, criv.sendMessage, atau from undefined. From: ${from}`));
            return;
        }

        const defaultOptions = { quoted: m };
        let messageOptions = { ...defaultOptions, ...options };

        if (typeof content === 'string') {
          const textMentions = (content.match(/@(\d+)/g) || []).map(jid => jid.replace('@', '') + '@s.whatsapp.net');
          if (textMentions.length > 0) {
            // Pastikan messageOptions.mentions selalu array sebelum digabungkan
            messageOptions.mentions = [...(messageOptions.mentions || []), ...textMentions];
          }
          await criv.sendMessage(from, { text: content, ...messageOptions });
        } else if (content instanceof Buffer) {
          await criv.sendMessage(from, { ...content, ...messageOptions }, { quoted: m });
        } else if (typeof content === 'object') {
          await criv.sendMessage(from, { ...content, ...messageOptions }, { quoted: m });
        }
      };
      m.replyText = (txt, options = {}) => m.reply(txt, options);
      m.replyImage = (buffer, options = {}) => m.reply({ image: buffer, ...options }, options);
      m.replyVideo = (buffer, options = {}) => m.reply({ video: buffer, ...options }, options);
      m.replySticker = (buffer, options = {}) => m.reply({ sticker: buffer, ...options }, options);
      m.replyAudio = (buffer, options = {}) => m.reply({ audio: buffer, ptt: true, ...options }, options);
      m.download = async () => {
        return await criv.downloadMediaMessage(m)
      }


      system.addUser(sender)
      system.updateLastMessage(sender)
      updateLastActivity(sender)


      if (!criv.public && !isOwner) return
      if (criv.private && from.endsWith('@g.us')) return

      // --- UNIVERSAL GAME REPLY LOGIC START ---
      const game = system.db.data.games?.[m.chat]; // Optional chaining untuk game
      if (game && game.active && gamePlugins[game.gameType] && typeof gamePlugins[game.gameType].onMessage === 'function') {
        const gamePlugin = gamePlugins[game.gameType];
        await gamePlugin.onMessage(criv, m);
        return;
      }

      if (m.isReply && m.quoted?.id) {
        await system.db.read();
        const allActiveGames = Object.values(system.db.data.games || {});

        const gameForReply = allActiveGames.find(game =>
          game.active && game.chatId === from && game.questionMessageId === m.quoted.id
        );
        if (gameForReply) {
          const gamePlugin = gamePlugins[gameForReply.gameType];
          if (gamePlugin && typeof gamePlugin.handleGameReply === 'function') {
            const gameIsEnded = await gamePlugin.handleGameReply(criv, m, system, gameForReply);
            if (gameIsEnded) {
              delete system.db.data.games[gameForReply.gameId];
              if (activeGameTimeouts[gameForReply.gameId]) {
                clearTimeout(activeGameTimeouts[gameForReply.gameId]);
                delete activeGameTimeouts[gameForReply.gameId];
              }
            }
            await system.saveDb();
            return;
          }
        }
      }
      // --- UNIVERSAL GAME REPLY LOGIC END ---

      const chatType = from.endsWith('@g.us') ? 'Group' : 'Private';
      const senderTag = m.pushName || (typeof sender === 'string' && sender.includes('@') ? sender.split('@')[0] : 'Unknown');
      const time = chalk.hex('#888888')(`[${new Date().toLocaleTimeString('id-ID', { hour12: false })}]`); // Abu-abu gelap untuk waktu
      let preview = '';

      switch (mtype) {
        case 'conversation': preview = m.message.conversation; break;
        case 'extendedTextMessage': preview = m.message.extendedTextMessage?.text || ''; break;
        case 'imageMessage': preview = m.message.imageMessage?.caption || '[Foto]'; break;
        case 'videoMessage': preview = m.message.videoMessage?.caption || '[Video]'; break;
        case 'stickerMessage': preview = '[Stiker]'; break;
        case 'audioMessage': preview = '[Audio]'; break;
        case 'documentMessage': preview = '[Dokumen]'; break;
        case 'buttonsResponseMessage': preview = m.message.buttonsResponseMessage?.selectedButtonId || '[Tombol]'; break;
        case 'templateButtonReplyMessage': preview = m.message.templateButtonReplyMessage?.selectedId || '[Template Button]'; break;
        case 'listResponseMessage': preview = m.message.listResponseMessage?.singleSelectReply?.selectedRowId || '[List]'; break;
        case 'reactionMessage': preview = m.message.reactionMessage?.text || '[Reaksi]'; break;
        default: preview = '[Pesan Tidak Dikenali]'; break;
      }

      if (preview.length > 150) preview = preview.slice(0, 150) + '…';

      const icon = m.key.fromMe ? '➡️' : chatType === 'Group' ? '👥' : '👤'; 
      const chatTypeColor = chatType === 'Group' ? chalk.hex('#90EE90') : chalk.hex('#ADD8E6');
      const senderColor = chalk.whiteBright; // Nama pengirim selalu terang
      const jidColor = chalk.hex('#AAAAAA'); // JID sedikit lebih terang dari waktu

      console.log(
        `${icon} ${chatTypeColor(`[${chatType}]`)} ${senderColor.bold(senderTag)} ${jidColor(`(${m.key.remoteJid})`)} ${time}\n` +
        `  ${chalk.hex('#666666')('└─')} ${chalk.white(preview)}\n` // Indentasi 2 spasi dan warna abu-abu untuk panah
      );


      if (!isCommand) {
        await system.saveDb();
        await system.addExp(sender, 5)
        return;
      }

      if (isSpamming(sender, command)) {
        await criv.sendMessage(from, { react: { text: '🚫', key: m.key } })
        await m.reply(global.msg.spam)
        await system.saveDb();
        return
      }
      logCommand(sender, command, from, isGroup)

      if (isOwner && (body.startsWith('>') || body.startsWith('$') || body.startsWith('=>'))) {
    const code = body.slice(1).trim();
    try {
        let result;
        if (body.startsWith('>')) {
            result = await eval(`(async () => { ${code} })()`);
        } else if (body.startsWith('$')) {
            try {
                const { stdout, stderr } = await util.promisify(exec)(code);
                let output = '';
                if (stdout) {
                    output += stdout;
                }
                if (stderr) {
                    if (output) output += '\n';
                    output += `STDERR:\n${stderr}`;
                }
                result = output || 'Perintah dijalankan, tapi tidak ada output.';
            } catch (execError) {
                logErrorToFile(execError);
                result = `Terjadi kesalahan saat menjalankan perintah: ${execError.message}`;
                if (execError.stderr) {
                    result += `\nSTDERR: ${execError.stderr}`;
                }
                if (execError.stdout) {
                    result += `\nSTDOUT: ${execError.stdout}`;
                }
            }
        } else if (body.startsWith('=>')) {
            const shellCode = `${code} 2>&1`;
            result = execSync(shellCode, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
        }
        await m.reply(result !== undefined && result !== null && result !== '' ? util.format(result) : 'Tidak ada respon.');
    } catch (e) {
        logErrorToFile(e);
        if (criv.user && global.bot.owner) {
            await criv.sendMessage(global.bot.owner, {text :'Terjadi kesalahan saat menjalankan command ini. Silakan coba lagi nanti, Error: ' + e} );
        }
    }
    await system.saveDb();
    return;
}

        
        
      const plugin = global.plugins[command]
      if (plugin) {
        const cooldownKey = `${sender}:${command}`
        const now = Date.now()
        const cooldownTime = plugin.cooldown || 5000
        if (cooldowns.has(cooldownKey)) {
          const expire = cooldowns.get(cooldownKey)
          const remaining = expire - now
          if (remaining > 0) {
            await criv.sendMessage(from, { react: { text: '💤', key: m.key } })
            return
          }
        }
        cooldowns.set(cooldownKey, now + cooldownTime)
        setTimeout(() => cooldowns.delete(cooldownKey), cooldownTime)

        if (!system.canUseCommand(sender)) {
            await m.reply(global.msg.limit || 'Maaf, Anda telah mencapai batas penggunaan command harian Anda. Silakan coba lagi besok atau minta premium.');
            await system.saveDb();
            return;
        }

        let failReason = null
        if (plugin.owner && !m.isOwner) failReason = global.msg.owner
        else if (plugin.admin && !m.isAdmin) failReason = global.msg.admin
        else if (plugin.botAdmin && !m.isBotAdmin) failReason = global.msg.botAdmin
        else if (plugin.group && !m.isGroup) failReason = global.msg.group
        else if (!plugin.public && m.isGroup && !m.isOwner) failReason = global.msg.private
        else if (plugin.premium && !m.isOwner && !system.isPremium(sender)) failReason = global.msg.premium
        else if (plugin.coin && !system.subtractCoinIfEnough(sender, plugin.coin)) failReason = global.msg.coin

        if (failReason) {
          await m.reply(failReason)
          await system.saveDb();
          return
        }

        const isStickerCommand = ['stiker', 'sticker', 's'].includes(command);
        const isMediaMessage = ['imageMessage', 'videoMessage'].includes(mtype);

        if (isStickerCommand && isMediaMessage && !m.quoted) {
            try {
                await plugin.run(criv, {
                    m, body, from, args, command, sender, pushName, text,
                    greet: global.getGreet(pushName),
                    target, amount, user, helpers, mentioned, readMore, fakeQuote, getName,
                    delay: global.delay,
                    sleep: global.sleep,
                    system,
                    sourceMessage: m
                });
                await system.addExp(sender, 10);
                await system.saveDb();
            } catch (pluginError) {
                console.error(chalk.red(`❌ Error saat menjalankan plugin '${command}' (direct media):`), pluginError);
                logErrorToFile(pluginError);
                if (criv.user && global.bot.owner) {
                    await criv.sendMessage(global.bot.owner, {text :'Terjadi kesalahan saat menjalankan command ini. Silakan coba lagi nanti, Error: ' + pluginError} );
                }
                await system.saveDb();
            }
            return;
        }

        try {
          await plugin.run(criv, {
            m, body, from, args, command, sender, pushName, text,
            greet: global.getGreet(pushName),
            target, amount, user, helpers, mentioned, readMore, fakeQuote, getName,
            delay: global.delay,
            sleep: global.sleep,
            system
          })
          await system.addExp(sender, 10)
          await system.saveDb()
        } catch (pluginError) {
          console.error(chalk.red(`❌ Error saat menjalankan plugin '${command}':`), pluginError)
          logErrorToFile(pluginError)
          if (criv.user && global.bot.owner) {
             await criv.sendMessage(global.bot.owner, {text :'Terjadi kesalahan saat menjalankan command ini. Silakan coba lagi nanti, Error: ' + pluginError} )
          }
          await system.saveDb()
        }
      } else {
        console.log(chalk.red(`⁉️ Command tidak ditemukan: ${command}`))
        await system.saveDb();
      }

    } catch (handlerError) {
      console.error(chalk.red('❌ Error di handler utama messages.upsert:'), handlerError)
      logErrorToFile(handlerError)
    }
  })
}
