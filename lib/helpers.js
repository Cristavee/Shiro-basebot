import fs from 'fs'
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type'
import { JSDOM } from 'jsdom'
import axios from 'axios'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { downloadMediaMessage } from 'baileys'
import { jidDecode } from 'baileys'

export function safeJidDecode(jid) {
  if (!jid) {
    return { user: '' };
  }
  try {
    const decoded = jidDecode(jid);
    return decoded || { user: '' };
  } catch (e) {
    console.error("Error decoding JID:", jid, e);
    return { user: '' };
  }
}

export function decodeJid(jid = '') {
  if (!jid || typeof jid !== 'string') return jid
  if (jid.includes(':')) return jid.split(':')[0] + '@s.whatsapp.net'
  return jid
}

export function getTarget(m, args) {
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    return decodeJid(m.message.extendedTextMessage.contextInfo.mentionedJid[0])
  }

  if (m.quoted?.sender) {
    return decodeJid(m.quoted.sender)
  }

  if (args && args.length > 0) {
    for (const arg of args) {
      const potentialJid = arg.replace(/[^0-9]/g, '');
      if (potentialJid.length >= 7 && potentialJid.length <= 15) {
        return decodeJid(potentialJid + '@s.whatsapp.net');
      }
      if (arg.endsWith('@s.whatsapp.net') || arg.endsWith('@g.us')) {
          return decodeJid(arg);
      }
    }
  }
  return decodeJid(m.sender)
}

export function parseAmount(args = []) {
  const amountStr = args.find(arg => /^\d+$/.test(arg))
  const amount = parseInt(amountStr)
  return isNaN(amount) || amount <= 0 ? 1 : amount
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatDuration(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return 'Invalid duration';
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let parts = [];
  if (days > 0) {
    parts.push(`${days} hari`);
  }
  if (hours % 24 > 0) {
    parts.push(`${hours % 24} jam`);
  }
  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60} menit`);
  }
  if (seconds % 60 > 0) {
    parts.push(`${seconds % 60} detik`);
  }

  return parts.length > 0 ? parts.join(', ') : 'kurang dari 1 detik';
}

export function extendHelper(criv) {
  if (!criv || typeof criv.sendMessage !== 'function') {
    console.error("Error: Objek 'criv' bukan instance socket Baileys yang valid. Fungsi helper tidak akan ditambahkan.")
    return
  }
    
criv.fetchBuffer = async (url) => {
  try {
    if (!url) {
      throw new Error('URL is required');
    }

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);

    return buffer;
  } catch (error) {
    console.error('Error fetching buffer:', error);
    throw new Error('Failed to fetch buffer: ' + error.message);
  }
};
    
    
  criv.sleep = async (s) => {
  return new Promise(resolve => setTimeout(resolve, s * 1000))
}
    
  criv.downloadMediaMessage = async (msg) => {
    return await downloadMediaMessage(msg, 'buffer', {})
  }

  criv.pickRandom = (list) => list[Math.floor(Math.random() * list.length)]

  criv.sendFormattedMessage = async (jidOrMessage, content, options = {}) => {
    let actualJid = jidOrMessage;
    let messageToQuote = null;

    if (typeof jidOrMessage === 'object' && jidOrMessage.chat) {
      messageToQuote = jidOrMessage;
      actualJid = jidOrMessage.chat;
      if (!options.quoted) {
        options.quoted = messageToQuote;
      }
    }

    try {
      if (!actualJid || typeof actualJid !== 'string' || !actualJid.includes('@')) {
        console.warn('[sendFormattedMessage] ⚠️ JID tidak valid atau tidak terdefinisi. Tidak dapat mengirim pesan.')
        return
      }

      if (!content) {
        console.warn('[sendFormattedMessage] ⚠️ Konten pesan kosong.')
        return await criv.sendMessage(actualJid, { text: '[⚠️ Konten kosong]' }, options)
      }

      let messageToSend = {}

      if (typeof content === 'string') {
        messageToSend.text = content.trim() || '[Kosong]'
      } else if (typeof content === 'object' && (
          content.text || content.image || content.video || content.audio ||
          content.document || content.contacts || content.sticker || content.location ||
          content.react || content.delete || content.poll || content.buttons || content.sections ||
          content.templateButtons
      )) {
        messageToSend = { ...content }
      } else {
        console.warn('[sendFormattedMessage] ⚠️ Format konten tidak didukung atau kosong:', typeof content, content)
        return await criv.sendMessage(actualJid, { text: '[⚠️ Format konten tidak dikenali]' }, options)
      }

      if (options.status) {
        await criv.sendPresenceUpdate(options.status, actualJid)
        delete options.status
        await criv.sleep(500)
      }

      if (options.quoted && typeof options.quoted !== 'object') {
        delete options.quoted
      }

      if (messageToSend.text) {
        const textMentions = (messageToSend.text.match(/@(\d+)/g) || []).map(jid => decodeJid(jid.replace('@', '') + '@s.whatsapp.net'));
        if (textMentions.length > 0) {
            messageToSend.mentions = [...(messageToSend.mentions || []), ...textMentions];
        }
      }


      return await criv.sendMessage(actualJid, messageToSend, options)

    } catch (e) {
      console.error(`❌ Error di sendFormattedMessage ke ${actualJid}:`, e)

      try {
        let fallbackText = '';
        if (typeof content === 'string') {
          fallbackText = content;
        } else if (content?.text) {
          fallbackText = content.text;
        } else {
          fallbackText = '[❌ Gagal mengirim pesan: Error internal]';
        }
        return await criv.sendMessage(actualJid, { text: fallbackText }, options)
      } catch (err2) {
        console.error('❌ Fallback Error di sendFormattedMessage:', err2)
      }
    }
  }

  criv.sendMessages = async (jid, message, quoted = null) => {
    return await criv.sendFormattedMessage(jid, message, { quoted })
  }

  criv.reply = async (m, teks, options = {}) => {
    return await criv.sendFormattedMessage(m, teks, options)
  }

  criv.sendText = async (jid, text, quoted = null) => {
    return await criv.sendFormattedMessage(jid, { text }, { quoted })
  }

  criv.sendContact = async (jid, contacts, quoted = null) => {
    const vcards = contacts.map(({ name, number }) => {
      const formattedNumber = number.startsWith('0') ? '62' + number.substring(1) : number;
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;waid=${formattedNumber}:${formattedNumber}\nEND:VCARD`
    })

    return await criv.sendFormattedMessage(jid, {
      contacts: {
        displayName: contacts.length > 1 ? `${contacts.length} Kontak` : contacts[0].name,
        contacts: vcards.map(vcard => ({ vcard }))
      }
    }, { quoted })
  }

  criv.sendImage = async (jid, buffer, caption = '', quoted = null, options = {}) => {
    return await criv.sendFormattedMessage(jid, {
      image: buffer,
      caption
    }, { quoted, ...options })
  }

  criv.sendVideo = async (jid, buffer, caption = '', quoted = null, options = {}) => {
    return await criv.sendFormattedMessage(jid, {
      video: buffer,
      caption
    }, { quoted, ...options })
  }

  criv.sendAudio = async (jid, buffer, ptt = false, quoted = null, options = {}) => {
    return await criv.sendFormattedMessage(jid, {
      audio: buffer,
      ptt
    }, { quoted, ...options })
  }

  criv.sendFile = async (jid, buffer, mimetype = '', fileName = 'file', quoted = null, options = {}) => {
    const type = await fileTypeFromBuffer(buffer) || { mime: mimetype }
    const mime = type.mime || mimetype || 'application/octet-stream'
    const isImage = mime.startsWith('image/')
    const isVideo = mime.startsWith('video/')
    const isAudio = mime.startsWith('audio/')
    const isGif = mime === 'image/gif'

    if (isImage) {
      return await criv.sendImage(jid, buffer, fileName, quoted, options)
    } else if (isVideo || isGif) {
      return await criv.sendVideo(jid, buffer, fileName, quoted, options)
    } else if (isAudio) {
      return await criv.sendAudio(jid, buffer, false, quoted, options)
    } else {
      return await criv.sendFormattedMessage(jid, {
        document: buffer,
        fileName,
        mimetype: mime
      }, { quoted, ...options })
    }
  }

  criv.sendAsSticker = async (jid, buffer, options = {}) => {
    try {
      if (!buffer) throw new Error('Buffer is required for sendAsSticker.')

      const sticker = new Sticker(buffer, {
        pack: global.pack || 'Bot Sticker',
        author: global.author || 'Bot',
        type: StickerTypes.FULL,
        quality: 100,
      })

      const stickerBuffer = await sticker.toBuffer()

      return await criv.sendFormattedMessage(jid, { sticker: stickerBuffer }, options)

    } catch (e) {
      console.error(`❌ Error in sendAsSticker to ${jid}:`, e)
      await criv.reply(jid, 'Gagal mengirim stiker. File tidak valid atau terlalu besar.', options)
    }
  }

  criv.sendLocation = async (jid, latitude, longitude, name = '', address = '', quoted = null, options = {}) => {
    return await criv.sendFormattedMessage(jid, {
      location: {
        degreesLatitude: latitude,
        degreesLongitude: longitude,
        name: name,
        address: address
      }
    }, { quoted, ...options })
  }

  criv.sendReaction = async (jid, messageKey, emoji) => {
    return await criv.sendFormattedMessage(jid, {
      react: {
        key: messageKey,
        text: emoji
      }
    }, { quoted: false })
  }

  criv.deleteMessage = async (jid, messageKey) => {
    return await criv.sendFormattedMessage(jid, {
      delete: messageKey
    }, { quoted: false })
  }

  criv.sendPoll = async (jid, name, values, options = {}) => {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error('Poll options (values) must be a non-empty array.')
    }
    return await criv.sendFormattedMessage(jid, {
      poll: {
        name: name,
        values: values,
        selectableOptionsCount: options.selectableOptionsCount || 1
      }
    }, options)
  }

  criv.sendListMessage = async (jid, buttonText, description, sections, title = '', footer = '', quoted = null, options = {}) => {
    return await criv.sendFormattedMessage(jid, {
      text: description,
      footer: footer,
      title: title,
      buttonText: buttonText,
      sections: sections
    }, { quoted, ...options })
  }

  criv.sendButtonMessage = async (jid, text, buttons, options = {}) => {
    return await criv.sendFormattedMessage(jid, {
      text: text,
      buttons: buttons.map(btn => ({
        buttonId: btn.id,
        buttonText: { displayText: btn.text },
        type: 1
      }))
    }, options)
  }

  criv.sendStickerFromUrl = async (jid, url, options = {}) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch sticker from URL: ${response.statusText}`)
      const buffer = await response.buffer()
      return await criv.sendAsSticker(jid, buffer, options)
    } catch (e) {
      console.error(`❌ Error in sendStickerFromUrl to ${jid} from ${url}:`, e)
      await criv.reply(jid, 'Gagal mengirim stiker dari URL. Pastikan URL valid dan mengarah ke gambar/video.', options)
    }
  }

  criv.sendMediaUrl = async (jid, url, type = 'auto', caption = '', quoted = null, options = {}) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch media from URL: ${response.statusText}`)
      const buffer = await response.buffer()
      const fileInfo = await fileTypeFromBuffer(buffer) || {}
      const mime = fileInfo.mime || 'application/octet-stream'

      if (type === 'image' || mime.startsWith('image/')) {
        return await criv.sendImage(jid, buffer, caption, quoted, options)
      } else if (type === 'video' || mime.startsWith('video/')) {
        return await criv.sendVideo(jid, buffer, caption, quoted, options)
      } else if (type === 'audio' || mime.startsWith('audio/')) {
        return await criv.sendAudio(jid, buffer, false, quoted, options)
      } else {
        return await criv.sendFormattedMessage(jid, {
          document: buffer,
          fileName: url.substring(url.lastIndexOf('/') + 1) || 'file',
          mimetype: mime,
          caption: caption
        }, { quoted, ...options })
      }
    } catch (e) {
      console.error(`❌ Error in sendMediaUrl to ${jid} from ${url}:`, e)
      await criv.reply(jid, 'Gagal mengirim media dari URL. Pastikan URL valid.', options)
    }
  }
}
