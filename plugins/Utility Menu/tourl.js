import axios from 'axios'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'

export default {
  command: ['tourl'],
  tag: 'utility',
  description: 'Upload media ke hosting (catbox, gofile, anon).',
  public: true,

  async run(criv, { m, text }) {
    const host = (text || 'catbox').toLowerCase()
    const quoted = m.quoted || m
    const mime = (quoted.msg || quoted).mimetype || ''
    if (!mime) return m.reply('Reply media dengan perintah .tourl <catbox|gofile|anon>')

    try {
      const buffer = await quoted.download()

      let ext = mime.split('/')[1] || 'bin'
      if (ext === 'plain') ext = 'txt'

      const fileName = `upload-${Date.now()}.${ext}`
      const tempDir = './tmp'
      const tempPath = path.join(tempDir, fileName)

      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)
      await fs.promises.writeFile(tempPath, buffer)

      let url
      if (host === 'catbox') {
        const form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('userhash', '')
        form.append('fileToUpload', fs.createReadStream(tempPath), {
          filename: fileName,
          contentType: mime
        })

        const res = await axios.post('https://catbox.moe/user/api.php', form, {
          headers: form.getHeaders()
        })
        url = res.data

      } else if (host === 'gofile') {
        const serverRes = await axios.get('https://api.gofile.io/getServer')
        const server = serverRes.data.data.server

        const form = new FormData()
        form.append('file', fs.createReadStream(tempPath))

        const upload = await axios.post(`https://${server}.gofile.io/uploadFile`, form, {
          headers: form.getHeaders()
        })
        url = upload.data.data.downloadPage

      } else if (host === 'anon') {
        const form = new FormData()
        form.append('file', fs.createReadStream(tempPath))

        const res = await axios.post('https://api.anonfiles.com/upload', form, {
          headers: form.getHeaders()
        })

        url = res.data?.data?.file?.url?.full
      } else {
        return m.reply('❌ Host tidak dikenal! Gunakan: catbox, gofile, anon')
      }

      await fs.promises.unlink(tempPath)

      if (!url) return m.reply('❌ Gagal upload file.')

      await m.reply(`> *URL* (${host}):\n${url}`)

    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message)
      m.reply('Terjadi kesalahan saat upload.')
    }
  }
}