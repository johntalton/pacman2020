import { Ghost } from './ghost.js'

class GraveyardService {
  static async awaken(claim) {
    GraveyardService.bc.postMessage(JSON.stringify({
      type: 'add-player',
      claim
    }))

    GraveyardService.openClaims.push({
      claim,
      timer: setTimeout(() => {
        if(GraveyardService.openClaims.includes(claim)) {
          console.log('Dropping Open Claim, timeout')
          const c = GraveyardService.openClaims.find(item => item.claim === claim)
          clearTimeout(c.timer)
          GraveyardService.openClaims = GraveyardService.openClaims
            .filter(item => item.claim === claim)
        }
      }, 5 * 1000)
    })
  }

  static async arise(token) {
    function heartBeat() {
      console.log('heartBeat')
      GraveyardService.bc.postMessage(JSON.stringify({
        type: 'move-player',
        token,

        direction: 'left'
      }))
    }

    setInterval(heartBeat, 5 * 1000)
  }
}

GraveyardService.bc = new BroadcastChannel('urn:game-state')
GraveyardService.bc.onmessage = ev => {
  const message = JSON.parse(ev.data)
  const { type } = message
  switch(type) {
    // case 'awaken-token': {
    //   const { token } = message
    //   console.log('GraveyardService received broadcast awaken', message)
    //   GraveyardService.awaken(token)
    //     .catch(e => console.log('GraveyardService awaken', e))
    // } break
    case 'player-token': {
      const { token } = message
      GraveyardService.arise(token)
      .catch(e => console.log('GraveyardService arise', e))
    } break
    case 'coord-state':
    case 'pulse-coords':
    case 'move-player':
      // ignore from game service
      break
    case 'add-player':
    case 'player-coord':
    case 'player-reward':
      // ignore from other players
      break
    default:  {
      console.warn('unknown message type', type)
      console.debug(message)
    } break
  }
}

GraveyardService.openClaims = []
