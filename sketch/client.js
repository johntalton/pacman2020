
import { TileEngine } from './tile-engine.js'

export class Client {
  static sendConnect(port, name) {
    port.postMessage(JSON.stringify({
      type: 'add-player',
      name
    }))
  }

  static sendMove(port, token, direction) {
    port.postMessage(JSON.stringify({
      type: 'move-player',
      token,
      direction
    }))
  }

  static sendPulse(port, token, all, statics) {
    port.postMessage(JSON.stringify({
      type: 'pulse-coords',
      token,
      all,
      statics
    }))
  }


  static connect(state) {
      //
    state.bc.onmessage = ev => {
      const message = JSON.parse(ev.data)
      // console.log('UI received broadcast', message)
      performance.mark('onmessage:begin:' + message.type)

      Client.messageHandler(state, message)

      performance.mark('onmessage:end:' + message.type)
      performance.measure('onmessage', 'onmessage:begin:' + message.type, 'onmessage:end:' + message.type)
    }

    //
    Client.sendConnect(state.bc, state.name)

    state._connectPoll = setInterval(() => {
      Client.sendConnect(state.bc, state.name)
    }, 10 * 1000)
  }

  static messageHandler(state, message) {
    switch(message.type) {
    case 'player-token': {
        const { token, name } = message

        if(state.token !== undefined && token !== state.token) {
          //console.log('token for another user, take note', name, token)
          break
        }

        state.token = token

        //
        clearTimeout(state._connectPoll)

        state.input.activeKeyMap = {
          'ArrowUp': () => Client.sendMove(state.bc, token, 'up'),
          'ArrowDown': () => Client.sendMove(state.bc, token, 'down'),
          'ArrowLeft': () => Client.sendMove(state.bc, token, 'left'),
          'ArrowRight': () => Client.sendMove(state.bc, token, 'right')
        }

        // request everything around
        Client.sendPulse(state.bc, token, true, true)
      } break
    case 'player-coord': {
      const { token, coord, lastCoord, warp } = message

      //
      TileEngine.addImg(state.engine, coord, { type: 'player' })

      if(warp) {
        // request everything around
        Client.sendPulse(state.bc, token, true, true)
      }
    } break
    case 'coord-state': {
      const { block, coord } = message

      //
      //console.log('coords state', block, coord)
      TileEngine.addCoord(state.engine, coord, block)

    } break
    case 'move-player': {
      // other players movements
    } break
    case 'player-reward': {
      // we just got a reward
      const { reward } = message
      console.log('reward', reward.type)
    } break
    case 'player-level': {
      const { token } = message
      Client.sendPulse(state.bc, token, true, true)
    } break
    default:
      console.warn('unknown message type', message.type)
      console.debug(message)
      break
    }
  }
}
