import axios from 'axios'

export function groupEventHandler(criv) {
  criv.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update

    let metadata = null
    let groupName = 'Group' // Default group name
    let groupDescription = 'Tidak ada deskripsi.' // Default group description

    try {
      metadata = await criv.groupMetadata(id)
      groupName = metadata.subject || 'Group'
      groupDescription = metadata.desc || 'Tidak ada deskripsi.'
    } catch (err) {
      console.error(`❌ Gagal mengambil metadata grup ${id}:`, err)
    }

    for (const user of participants) {
      try {
        let name = 'User' 

        if (criv.contacts && criv.contacts[user]) {
            name = criv.contacts[user].name || criv.contacts[user].verifiedName || user.split('@')[0] || 'User';
        } else if (metadata) {
            const participant = metadata.participants.find(p => p.id === user)
            name = participant?.notify || participant?.id?.split('@')[0] || 'User'
        } else {
            name = user.split('@')[0] || 'User'
        }

  
        let avatar = await criv.profilePictureUrl(user, 'image').catch(() => null)
        avatar = avatar || 'https://pomf2.lain.la/f/cnshx2qg.png' 

        const background = 'https://pomf2.lain.la/f/49wc027g.jpg' 

        if (action === 'add') {
          const apiDescription = `Welcome ${name} to ${groupName}!`
          const captionText = `> Selamat datang di ${groupName},  @${user.split('@')[0]}!`

          console.log(`ℹ️ Memicu welcome untuk ${name} di grup ${groupName} (${id})`)

          const res = await axios.get('https://api.siputzx.my.id/api/canvas/welcomev4', {
            responseType: 'arraybuffer',
            params: {
              avatar,
              background,
              description: apiDescription 
            }
          })

          await criv.sendImage(id, res.data, captionText, null, { mentions: [user] }) // captionText sebagai caption
          console.log(`✅ Welcome message berhasil dikirim untuk ${name}.`)

        } else if (action === 'remove') {
          const apiDescription = `Sayonara, ${name} from ${groupName}!`
          const captionText = `> Sayonara dari ${groupName},  @${user.split('@')[0]}!`

          console.log(`ℹ️ Memicu goodbye untuk ${name} di grup ${groupName} (${id})`)

          const res = await axios.get('https://api.siputzx.my.id/api/canvas/goodbyev4', {
            responseType: 'arraybuffer',
            params: {
              avatar,
              background,
              description: apiDescription 
            }
          })

          await criv.sendImage(id, res.data, captionText, null, { mentions: [user] }) 
          console.log(`✅ Goodbye message berhasil dikirim untuk ${name}.`)
        }

      } catch (err) {
        console.error(`❌ Error saat memproses event untuk user ${user} di grup ${id}:`, err)
        const fallbackMessage = (action === 'add') ?
                                `👋 Selamat datang di ${groupName}, @${user.split('@')[0]}!` :
                                `👋 Selamat jalan, @${user.split('@')[0]} dari ${groupName}!`;
        try {
            await criv.sendMessage(id, { text: fallbackMessage }, { mentions: [user] });
            console.log(`✅ Fallback message dikirim untuk ${user.split('@')[0]}.`);
        } catch (fallbackErr) {
            console.error(`❌ Gagal mengirim fallback message untuk user ${user}:`, fallbackErr);
        }
      }
    }
  })
}
    
