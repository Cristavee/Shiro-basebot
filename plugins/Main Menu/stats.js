
import db from '../../lib/db.js'
import moment from 'moment-timezone'
import os from 'os'

export default {
  command: ['stats', 'statistik', 'stat'],
  tag: 'information',
  description: 'Menampilkan statistik bot dan data sistem.',
  public: true,

  async run(criv, { m, system }) {
    const users = Object.keys(db.data.users || {}).length
    const blacklist = system.listBl().length
    const owner = system.getOwnerList().length
    const fitur = global.totalFeature || Object.keys(criv.plugins || {}).length
    const uptime = process.uptime() * 1000
    const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss')

    const teks = `*Statistik Bot:*
> Pengguna: ${users}
> Blacklist: ${blacklist || 0}
> Total Fitur: ${fitur}
> Owner Aktif: ${owner}
> Uptime: ${moment.duration(uptime).humanize()}
> Jam: ${waktu}`

    await m.reply(teks.trim())
  }
}