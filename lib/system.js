import db from './db.js'
import moment from 'moment-timezone'
import chalk from 'chalk'
import { decodeJid } from './helpers.js'

const system = {
    
  addUser(id) {
    if (!db.data.users) db.data.users = {}
    if (!db.data.users[id]) {
      db.data.users[id] = {
        coin: 100,
        premium: false,
        joinedAt: Date.now(),
        exp: 0,
        level: 1,
        bio: 'Belum disetel. Gunakan .setbio [bio]',
        isBanned: false,
        warn: 0,
        lastMessage: 0,
        commandCount: 0,
        lastClaimed: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
        name: null,
        status: null,
        gameStats: {
          totalPlayed: 0,
          totalWins: 0
        }
      }
    }
  },

  getUser(id) {
    this.addUser(id)
    return db.data.users[id]
  },

  getAllUsers() {
    return db.data.users || {}
  },

  async saveDb() {
    try {
      await db.write()
    } catch (e) {
      console.error(chalk.red('❌ Error saving database:'), e)
    }
  },

  getCoin(id) {
    if (this.isPremium(id) || this.isOwner(id)) return Infinity
    return this.getUser(id).coin || 0
  },

  addCoin(id, amount) {
    if (amount <= 0) return false
    if (this.isPremium(id) || this.isOwner(id)) return true
    const user = this.getUser(id)
    user.coin = (user.coin || 0) + amount
    return true
  },

  subtractCoinIfEnough(id, amount) {
    if (amount <= 0) return false
    if (this.isPremium(id) || this.isOwner(id)) return true
    const user = this.getUser(id)
    if ((user.coin || 0) < amount) return false
    user.coin -= amount
    return true
  },

  giveReward(id, amount) {
    return this.addCoin(id, amount)
  },

  isPremium(id) {
    return this.getUser(id).premium || false
  },

  async setPremium(id, status) {
    const user = this.getUser(id)
    user.premium = status
    await this.saveDb()
  },

  canClaim(id, interval) {
    const user = this.getUser(id)
    user.lastClaimed = user.lastClaimed || {}
    const lastClaim = user.lastClaimed[interval] || 0
    const now = Date.now()

    if (interval === 'daily') {
      const nowMoment = moment().tz('Asia/Jakarta')
      const lastMoment = moment(lastClaim).tz('Asia/Jakarta')
      return (
        nowMoment.date() !== lastMoment.date() ||
        nowMoment.month() !== lastMoment.month() ||
        nowMoment.year() !== lastMoment.year()
      )
    } else if (interval === 'weekly') {
      return now - lastClaim >= 7 * 86400000
    } else if (interval === 'monthly') {
      return now - lastClaim >= 30 * 86400000
    } else if (interval === 'yearly') {
      return now - lastClaim >= 365 * 86400000
    }
    return false
  },

  async setClaim(id, interval) {
    const user = this.getUser(id)
    const now = Date.now()
    user.lastClaimed = user.lastClaimed || {}
    user.claims = user.claims || {}
    user.lastClaimed[interval] = now
    user.claims[interval] = now
    await this.saveDb()
  },

  async addOwner(id) {
    db.data.owner ||= []
    const decodedId = decodeJid(id)
    if (!db.data.owner.includes(decodedId)) {
      db.data.owner.push(decodedId)
      await this.saveDb()
    }
  },

  async removeOwner(id) {
    db.data.owner = (db.data.owner || []).filter(o => o !== decodeJid(id))
    await this.saveDb()
  },

  isOwner(id) {
    const decodedId = decodeJid(id)
    const dbOwners = db.data.owner || []
    const globalOwners = global.owner || []
    return dbOwners.includes(decodedId) || globalOwners.includes(decodedId)
  },

  getOwnerList() {
    const dbOwners = db.data.owner || []
    const globalOwners = global.owner || []
    return [...new Set([...dbOwners, ...globalOwners])].map(decodeJid)
  },

  async removeBl(id) {
    db.data.blacklist = (db.data.blacklist || []).filter(o => o !== decodeJid(id))
    await this.saveDb()
  },

  listBl() {
    return (db.data.blacklist || []).map(decodeJid)
  },

  async banUser(id) {
    const user = this.getUser(id)
    user.isBanned = true
    await this.saveDb()
  },

  async unbanUser(id) {
    const user = this.getUser(id)
    user.isBanned = false
    await this.saveDb()
  },

  isUserBanned(id) {
    return this.getUser(id).isBanned || false
  },

  async addWarning(id, amount = 1) {
    const user = this.getUser(id)
    user.warn = (user.warn || 0) + amount
    await this.saveDb()
    return user.warn
  },

  async resetWarnings(id) {
    const user = this.getUser(id)
    user.warn = 0
    await this.saveDb()
  },

  getWarnings(id) {
    return this.getUser(id).warn || 0
  },

  async updateLastMessage(id) {
    const user = this.getUser(id)
    user.lastMessage = Date.now()
    await this.saveDb()
  },

  getLastMessageTime(id) {
    return this.getUser(id).lastMessage || 0
  },

  getCommandLimit(id) {
    if (this.isPremium(id) || this.isOwner(id)) return Infinity
    return this.getUser(id).limit || 10
  },

  async addCommandCount(id, amount = 1) {
    const user = this.getUser(id)
    user.commandCount = (user.commandCount || 0) + amount
    await this.saveDb()
  },

  async resetCommandCount(id) {
    const user = this.getUser(id)
    user.commandCount = 0
    await this.saveDb()
  },

  canUseCommand(id) {
    const user = this.getUser(id)
    if (this.isPremium(id) || this.isOwner(id)) return true
    return (user.commandCount || 0) < (user.limit || 10)
  },

  async resetDailyLimits() {
    const users = this.getAllUsers()
    let changed = false
    for (const id in users) {
      const user = users[id]
      if (!this.isPremium(id) && !this.isOwner(id)) {
        if (user.commandCount !== 0 || user.limit !== 10) {
          user.commandCount = 0
          user.limit = 10
          changed = true
        }
      }
    }
    if (changed) await this.saveDb()
  },

  async addExp(id, amount = 10) {
    const user = this.getUser(id)
    user.exp = (user.exp || 0) + amount
    let leveledUp = false
    while (user.exp >= user.level * 100) {
      user.exp -= user.level * 100
      user.level++
      this.addCoin(id, user.level * 10)
      leveledUp = true
      console.log(chalk.green(`🆙 ${id} naik ke level ${user.level}`))
    }
    await this.saveDb()
    return leveledUp
  },

  getLevel(id) {
    return this.getUser(id).level || 1
  },

  async setBio(id, text) {
    const user = this.getUser(id)
    user.bio = text
    await this.saveDb()
  },

  getBio(id) {
    return this.getUser(id).bio || ''
  },

  async setName(id, name) {
    const user = this.getUser(id)
    user.name = name
    await this.saveDb()
  },

  async setStatus(id, status) {
    const user = this.getUser(id)
    user.status = status
    await this.saveDb()
  },

  getGlobalSetting(key) {
    db.data.globalSettings ||= {}
    return db.data.globalSettings[key]
  },

  async setGlobalSetting(key, value) {
    db.data.globalSettings ||= {}
    db.data.globalSettings[key] = value
    await this.saveDb()
  },

  async gamePlayed(id) {
    const user = this.getUser(id);
    user.gameStats ||= { totalPlayed: 0, totalWins: 0 };
    user.gameStats.totalPlayed = (user.gameStats.totalPlayed || 0) + 1;
    await this.saveDb();
  },

  async gameWin(id) {
    const user = this.getUser(id);
    user.gameStats ||= { totalPlayed: 0, totalWins: 0 };
    user.gameStats.totalWins = (user.gameStats.totalWins || 0) + 1;
    await this.saveDb();
  },

  gameStats(id) {
    const user = this.getUser(id);
    user.gameStats ||= { totalPlayed: 0, totalWins: 0 };
    return user.gameStats;
  },

  db
}

export default system

