import axios from 'axios';
import { formatDuration, decodeJid } from '../../lib/helpers.js';

const activeGameTimeouts = {};

export default {
  command: ['tebakheroml', 'thml'], 
  tag: 'Game', 
  description: 'Tebak nama hero Mobile Legends.', 
  owner: false,
  admin: false, 
  botAdmin: false, 
  public: true, 
  group: true,
  premium: false,
  coin: 0,
  cooldown: 5000,

  async run(criv, { system, m, body, from, args, command, sender, pushName, text, greet, target, amount, user, helpers, mentioned, readMore, fakeQuote }) {
    const chatId = m.chat;
    const now = Date.now();

    system.db.data.games = system.db.data.games || {};
    let games = system.db.data.games;

    if (games[chatId] && games[chatId].active) {
        if (games[chatId].gameType === 'tebakheroml') {
            const remainingTime = Math.ceil((games[chatId].endTime - now) / 1000);
            return criv.reply(m, `Masih ada game Tebak Hero ML yang sedang berlangsung di sini! Sisa waktu: ${remainingTime} detik.\n\nClue: ${games[chatId].question}`);
        }
    }
    
    let apiResponse;
    try {
        const response = await axios.get('https://api.siputzx.my.id/api/games/tebakheroml');
        apiResponse = response.data;

        if (!apiResponse || !apiResponse.status || !apiResponse.result || !apiResponse.result.question || !apiResponse.result.answer || !apiResponse.result.img) {
            return criv.reply(m, '❌ Gagal mendapatkan soal dari API. Data tidak lengkap atau format salah.');
        }
    } catch (error) {
        console.error('Error fetching Tebak Hero ML from API:', error);
        return criv.reply(m, '❌ Terjadi kesalahan saat menghubungi API Tebak Hero ML. Coba lagi nanti.');
    }

    const question = apiResponse.result.question;
    const answer = apiResponse.result.answer;
    const imageUrl = apiResponse.result.img;

    let questionImageBuffer;
    try {
        questionImageBuffer = await criv.fetchBuffer(imageUrl);
    } catch (e) {
        console.error('Failed to fetch hero image from API URL:', e);
        return criv.reply(m, 'Gagal mengambil gambar hero dari API. Coba lagi nanti.');
    }

    const gameDuration = 60 * 1000;
    const reward = 15;

    await system.gamePlayed(sender);

    games[chatId] = {
        gameType: 'tebakheroml',
        active: true,
        question: question,
        answer: answer.toLowerCase(),
        sender: sender,
        startTime: now,
        endTime: now + gameDuration,
        reward: reward,
        cost: this.coin,
    };
    await system.saveDb();

    await criv.sendImage(chatId, questionImageBuffer, `🎮 *Tebak Hero Mobile Legends!* 🎮\n\nClue: *${question}*\n\nKetik jawabanmu dalam ${formatDuration(gameDuration)}! (Contoh: ${answer})\n\nHadiah: ${reward} Koin\nBiaya: ${this.coin} Koin`);

    activeGameTimeouts[chatId] = setTimeout(async () => {
        if (games[chatId] && games[chatId].active && games[chatId].gameType === 'tebakheroml') {
            criv.reply(chatId, `Waktu habis! Tidak ada yang berhasil menebak hero. Jawabannya adalah *${answer}*.`);
            delete games[chatId];
            await system.saveDb();
        }
    }, gameDuration);
  },

  async onMessage(criv, m) {
    const chatId = m.chat;
    const sender = m.sender;
    const body = m.body?.toLowerCase() || '';
    
    if (!global.system || !global.system.db || !global.system.db.data) {
        console.error("System database not initialized in onMessage context.");
        return;
    }
    const games = global.system.db.data.games || {};

    if (games[chatId] && games[chatId].active && games[chatId].gameType === 'tebakheroml') {
        if (body === games[chatId].answer) {
            criv.reply(m, `🎉 Selamat @${decodeJid(sender).user}! Anda berhasil menebaknya!\nJawabannya adalah *${games[chatId].answer}*.\n\nAnda mendapatkan ${games[chatId].reward} koin!`);
            
            await global.system.addCoin(sender, games[chatId].reward);
            await global.system.gameWin(sender);
            
            if (activeGameTimeouts[chatId]) {
                clearTimeout(activeGameTimeouts[chatId]);
                delete activeGameTimeouts[chatId];
            }
            delete games[chatId];
            await global.system.saveDb();
        }
    }
  }
};
