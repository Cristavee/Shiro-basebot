import system from '../../lib/system.js';
import moment from 'moment-timezone'; // Pastikan moment-timezone terinstal

export default {
  command: ['profile', 'profil', 'me'],
  tag: 'main',
  description: 'Menampilkan informasi akun Anda',
  public: true,
  coin: 2,
  cooldown: 5000,

  async run(criv, { m, sender, pushName }) {
    let user = system.getUser(sender);

    user.level = user.level ?? 1;
    user.exp = user.exp ?? 0;
    user.coin = user.coin ?? 0; 
    user.joinedAt = user.joinedAt ?? Date.now(); 
    user.claims = user.claims ?? {}; 
    user.premium = user.premium ?? false;
    user.bio = user.bio ?? 'Belum disetel. Gunakan .setbio [bio]'; 

    // --- Tanggal Bergabung ---
    const joinedAt = moment(user.joinedAt).tz('Asia/Jakarta').format('DD MMMM YYYY, HH:mm:ss');

    // --- Riwayat Klaim ---
    const claimHistory = Object.keys(user.claims).length > 0
      ? Object.entries(user.claims)
          .map(([key, val]) => {
            const timeAgo = moment(val).fromNow();
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return `  - ${formattedKey}: ${timeAgo}`;
          })
          .join('\n')
      : '  - Belum pernah klaim daily/reward lainnya.';

    // --- Kalkulasi EXP dan Level ---
    const needExp = user.level * 100; 
    const barLength = 20; // Panjang bar progress
    const progress = Math.min(barLength, Math.floor((user.exp / needExp) * barLength)); 
    const bar = '█'.repeat(progress) + '░'.repeat(barLength - progress);
    const expProgress = `${user.exp}/${needExp} [${bar}]`;
    
    const allUsersData = system.getAllUsers ? system.getAllUsers() : {}

    const sortedUsers = Object.entries(allUsersData)
      .map(([id, data]) => ({ id, level: data.level || 0, exp: data.exp || 0 })) 
      .sort((a, b) => {
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        return b.exp - a.exp;
      });

    const rank = sortedUsers.findIndex(u => u.id === sender) + 1;

    const phoneNumber = sender.split('@')[0]; 
    const formattedPhoneNumber = `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 5)}-${phoneNumber.slice(5, 9)}-${phoneNumber.slice(9)}`;

    const info = `
┌───「 *PROFIL ${pushName.toUpperCase()}* 」
│
>  *Nama* : ${pushName}
>  *Bio* : ${user.bio}
>  *Nomor* : ${formattedPhoneNumber}
>  *Koin* : ${user.coin.toLocaleString('id-ID')}
>  *Level* : ${user.level}
>  *EXP* : ${expProgress}
>  *Rank Global*: #${rank} / ${sortedUsers.length}
>  *Status* : ${user.premium ? '💎 Premium' : 'Freemium'}
>  *Bergabung* : ${joinedAt}
│
>  *Riwayat Klaim* : ${claimHistory}
│
└───

`;

    await criv.sendMessage(m.chat, { text: info.trim() }, { quoted: m });
  }
};