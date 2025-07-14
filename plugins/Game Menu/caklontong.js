import axios from 'axios';
import { setTimeout, clearTimeout } from 'timers';

const activeGames = new Map();

export default {
  command: ['caklontong'], 
  tag: 'game', 
  description: 'Mainkan game Cak Lontong. Gunakan `.caklontong` untuk memulai.', 
  owner: false,
  admin: false, 
  botAdmin: false, 
  public: true, 
  premium: false,
  coin: 0,
  cooldown: 3000,

  async run(criv, { m, text, command, sender, system }) { 
    const chatID = m.chat;
    const playerJid = sender;

    await system.saveDb();

    async function fetchQuestionFromAPI() {
      try {
        const res = await axios.get('https://api.siputzx.my.id/api/games/caklontong');
        const data = res.data.data;

        if (res.data.status && data) {
          return {
            question: data.soal,
            answer: data.jawaban,
            description: data.deskripsi
          };
        } else {
          console.error('API response status is not true or data is missing:', res.data);
          return null;
        }
      } catch (error) {
        console.error('Error fetching Cak Lontong question from API:', error);
        return null;
      }
    }

    async function startNewQuestion(gameData) {
      if (gameData.questionCount >= 5) {
        await criv.sendMessage(chatID, { text: `Game kuis Cak Lontong selesai! Skor akhir:\n${formatScores(gameData.players)}` });
        activeGames.delete(chatID);
        return;
      }

      const qData = await fetchQuestionFromAPI();
      if (!qData) {
        await criv.sendMessage(chatID, { text: 'Maaf, gagal mengambil pertanyaan baru dari API Cak Lontong. Game dihentikan.' });
        activeGames.delete(chatID);
        return;
      }

      gameData.currentQuestion = qData.question;
      gameData.correctAnswer = qData.answer;
      gameData.description = qData.description;
      gameData.questionCount++;
      gameData.answeredBy = null;
      gameData.startTime = Date.now();

      const questionMessage = await criv.sendMessage(chatID, { 
        text: `*Kuis Cak Lontong #${gameData.questionCount}:*\n\n${gameData.currentQuestion}\n\n` +
              `Waktu menjawab: ${gameData.timeoutSeconds} detik.\n` +
              `*Reply pesan ini dengan jawaban Anda!* (atau ketik '.skip' / '.stop' jika me-reply pesan ini)`,
        contextInfo: {
            mentionedJid: []
        }
      });
      gameData.questionMessageId = questionMessage.key.id;

      gameData.timer = setTimeout(async () => {
        if (activeGames.has(chatID) && activeGames.get(chatID).questionMessageId === questionMessage.key.id) {
          await criv.sendMessage(chatID, { 
              text: `Waktu habis! Tidak ada yang menjawab pertanyaan #${gameData.questionCount}.\n` +
                    `Jawaban yang benar adalah: *${gameData.correctAnswer}*\n` +
                    `Deskripsi: _${gameData.description}_` +
                    `\n\nGame dihentikan karena waktu habis.` // Pesan tambahan
          });
          // --- PERUBAHAN DI SINI ---
          activeGames.delete(chatID); // Hentikan game
          // -------------------------
        }
      }, gameData.timeoutSeconds * 1000);
    }

    function formatScores(players) {
      let scoreText = '';
      const sortedPlayers = Object.entries(players).sort(([, a], [, b]) => b - a);
      if (sortedPlayers.length === 0) {
        return 'Belum ada skor.';
      }
      sortedPlayers.forEach(([jid, score], index) => {
        scoreText += `${index + 1}. @${jid.split('@')[0]}: ${score} poin\n`;
      });
      return scoreText;
    }

    if (command === 'caklontong') {
      if (activeGames.has(chatID)) {
        return m.reply('Game kuis Cak Lontong sudah berjalan di grup ini. Untuk menghentikannya, reply pesan kuis dengan ketik `.stop`.');
      }

      const newGameData = {
        currentQuestion: null,
        correctAnswer: null,
        description: null,
        questionMessageId: null,
        timer: null,
        players: {},
        questionCount: 0,
        timeoutSeconds: 30,
        prize: '10 poin',
        scorePerAnswer: 50
      };
      activeGames.set(chatID, newGameData);
      await m.reply('Game kuis Cak Lontong dimulai! Siap-siap dengan jawaban ngeselin...');
      
      await system.gamePlayed(playerJid);
      
      await startNewQuestion(newGameData);
      return;
    }

    const gameData = activeGames.get(chatID);

    if (gameData && m.quoted) {
        const quotedMessageId = m.quoted.id;
        
        if (quotedMessageId === gameData.questionMessageId) {
            const replyText = text?.toLowerCase().trim();

            if (gameData.answeredBy) {
                return m.reply(`Pertanyaan ini sudah dijawab oleh @${playerJid.split('@')[0]}! Tunggu pertanyaan berikutnya.`);
            }

            if (replyText === '.skip' || replyText === 'skip' || replyText === '.lewati' || replyText === 'lewati') {
                clearTimeout(gameData.timer);
                await criv.sendMessage(chatID, { 
                    text: `Pertanyaan dilewati.\nJawaban yang benar adalah: *${gameData.correctAnswer}*\n` +
                          `Deskripsi: _${gameData.description}_`
                })
            }

            if (replyText === '.stop' || replyText === 'stop' || replyText === '.stopquiz' || replyText === 'stopquiz') {
                clearTimeout(gameData.timer);
                await criv.sendMessage(chatID, { text: `Game kuis Cak Lontong dihentikan!\nSkor akhir:\n${formatScores(gameData.players)}` });
                activeGames.delete(chatID);
                return; 
            }
            
            if (!replyText) {
                return m.reply('Silakan ketik jawaban Anda di balasan ini.');
            }

            const userAnswer = replyText;
            const correctAnswer = gameData.correctAnswer.toLowerCase().trim();

            if (userAnswer === correctAnswer) {
                clearTimeout(gameData.timer);
                
                const timeTaken = (Date.now() - gameData.startTime) / 1000;
                let scoreEarned = Math.max(1, Math.floor(gameData.scorePerAnswer - (timeTaken * 2)));
                scoreEarned = Math.min(scoreEarned, gameData.scorePerAnswer * 2);
                
                system.addCoin(playerJid, scoreEarned);
                const leveledUp = system.addExp(playerJid, Math.floor(scoreEarned / 5));
                
                await system.gameWin(playerJid);

                await system.saveDb();

                gameData.players[playerJid] = (gameData.players[playerJid] || 0) + scoreEarned;
                gameData.answeredBy = playerJid;

                let levelUpMessage = '';
                if (leveledUp) {
                    const user = system.getUser(playerJid);
                    levelUpMessage = `\nSelamat! Anda naik ke Level ${user.level} dan mendapatkan ${user.level * 10} koin tambahan!`;
                }

                await criv.sendMessage(chatID, { 
                    text: `🎉 *BENAR!* 🎉\n@${playerJid.split('@')[0]} berhasil menjawab dengan benar!\n` +
                          `Jawaban: *${gameData.correctAnswer}*\n` +
                          `Deskripsi: _${gameData.description}_\n\n` +
                          `Mendapatkan *${scoreEarned} koin* dan EXP! Total koin: ${system.getUser(playerJid).coin || 0}\n` +
                          `Total skor game: ${gameData.players[playerJid]} poin.` +
                          levelUpMessage + `\n\n` +
                          `Skor game saat ini:\n${formatScores(gameData.players)}`,
                    contextInfo: {
                        mentionedJid: [playerJid]
                    }
                });
                
                // --- TIDAK ADA PERUBAHAN DI SINI KARENA JIKA MENANG, LANJUT PERTANYAAN BARU ---
                setTimeout(() => startNewQuestion(gameData), 3000); 
            } else {
                await m.reply('❌ Jawaban Anda salah! Coba lagi.');
            }
            return;
        }
    }
  }
};

