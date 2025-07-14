import axios from 'axios'

export default {
  command: ['server'],
  name: 'server',
  tag: 'information',
  description: 'Menampilkan informasi server',
  public: true,

  async run(criv, { m }) {
    try {
      const apiUrl = 'https://api.ryzumi.vip/api/misc/server-info';
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36'
        }
      });

      const data = response.data;

      const osInfo = data.os;
      const cpuInfo = data.cpu;
      const ramInfo = data.ram;
      const storageInfo = data.storage;

      const totalRamGB = parseFloat(ramInfo.totalMemory.replace(' GB', ''));
      const freeRamGB = parseFloat(ramInfo.freeMemory.replace(' GB', ''));
      const usedRamGB = (totalRamGB - freeRamGB).toFixed(2);

      let storageDetails = '';
      if (storageInfo && storageInfo.length > 0) {
        storageDetails = '\n*Storage Disks:*\n';
        storageInfo.forEach(drive => {
          storageDetails += `› Drive ${drive.drive}: Total ${drive.total}, Terpakai ${drive.used}, Bebas ${drive.free}\n`;
        });
      }

      const teks = `
Server Information:
› OS Platform : ${osInfo.platform}
› OS Type     : ${osInfo.type}
› OS Release  : ${osInfo.release}
› CPU Model   : ${cpuInfo.model}
› CPU Cores   : ${cpuInfo.cores}
› RAM Total   : ${ramInfo.totalMemory}
› RAM Terpakai: ${usedRamGB} GB
› RAM Bebas   : {ramInfo.freeMemory}{storageDetails}
`.trim();
          await criv.sendMessage(m.chat, {
            text: teks
          }, { quoted: m });

        } catch (error) {
          console.error('Error saat mengambil informasi server:', error);
          if (error.response) {
            console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            await m.reply(`Maaf, gagal mengambil informasi server. Status: ${error.response.status}.`);
          } else {
            await m.reply('Maaf, terjadi kesalahan saat mengambil informasi server. Silakan coba lagi nanti.');
          }
        }
      }
    };