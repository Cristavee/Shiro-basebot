// lib/db.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'

// Setup direktori
const __dirname = dirname(fileURLToPath(import.meta.url))
const dbDir = join(__dirname, 'database')

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

// File database
const file = join(dbDir, 'data.json')
const adapter = new JSONFile(file)

// Struktur default data
const defaultData = {
  users: {},       // Data user pribadi
  groups: {},      // Data grup
  owner: [],       // List owner bot
  blacklist: [],   // Pengguna yang diblokir
  rooms: {},       // Game rooms seperti suit
  faqUsers: [],    // Penyimpanan input FAQ dari user
  faqTimeout: 86400000 // Timeout FAQ (default 1 hari)
}

// Inisialisasi database
const db = new Low(adapter, defaultData)
await db.read()

// Merge agar field baru tetap masuk tanpa menghapus data lama
db.data = { ...defaultData, ...db.data }

// Fallback untuk memastikan setiap field ada
if (!db.data.users) db.data.users = {}
if (!db.data.groups) db.data.groups = {}
if (!db.data.owner) db.data.owner = []
if (!db.data.blacklist) db.data.blacklist = []
if (!db.data.rooms) db.data.rooms = {}
if (!db.data.faqUsers) db.data.faqUsers = []
if (!db.data.faqTimeout) db.data.faqTimeout = 86400000

await db.write()

export default db