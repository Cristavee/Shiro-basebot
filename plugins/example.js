
export default {
  command: [''], 
  tag: '', 
  description: '', 
  owner: false,
  admin: false, 
  botAdmin: false, 
  public: true, 
  group: false, // ini group only
  premium: false,
  coin: 5,
  cooldown: 5000,

  async run(criv, { system,  m,  body,  from,  args,  command,  sender,  pushName,  text,  greet, target, amount,  user,  helpers,  mentioned,  readMore,  fakeQuote }) {
  
  }
}


/* Game Example

import { createReplyGame } from '../../lib/replyGame.js'
import system from '../../lib/system.js'

export default {
  command: [''],
  tag: '',
  description: '',
  coin: 5,
  public: true,
  cooldown: 5000,
  
  async run(criv, { m, sender }) {
  
    createReplyGame(?.key.id, {
      answer: ,
      sender,
      onCorrect: async () => {},
      onWrong: async () => {},
      onTimeout: async () => {}
    })
  }
}

*/