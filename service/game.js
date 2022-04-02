import { Loader } from '../common/loader.js'

const MAX_NON_ALL_DISTANCE = 3

const LOBBY_LEVEL = [
  [ { type: 'box' }, { type: 'box' }, { type: 'box' }, { type: 'box' }, { type: 'box' }],
  [ { type: 'box' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'box' }],
  [ { type: 'box' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'box' }],
  [ { type: 'box' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'box' }],
  [ { type: 'box' }, { type: 'box' }, { type: 'box' }, { type: 'box' }, { type: 'box' }]
]

const BASE_DAT_URL = 'https://raw.githubusercontent.com/johntalton/pacman/master/'

const PHANTOM_ZONE_LEVEL = [
  [ { type: 'phantom_zone' } ]
]

const DB = {
  players: {
    'ASDF': {
      name: 'pierce',
      effects: {},
      level: 'urn:lobby/',
      coord: [1,1]
    }
  },
  instances: {
    'urn:phantom_zone/': Promise.resolve({
      urn: 'urn:phantom_zone',
      level: PHANTOM_ZONE_LEVEL
    }),
    'urn:lobby/': Promise.resolve({
      urn: 'urn:lobby',
      level: LOBBY_LEVEL
    })
  },
  levels: {
    'urn:phantom_zone': {
      type: 'inline',
      home: [Number.NaN, Number.NaN],
      warps: { },
      inlineLevelFn: () => PHANTOM_ZONE_LEVEL
    },
    'urn:lobby': {
      type: 'inline',
      home: [2, 2],
      warps: { 'exit': { at: [4, 2], to: '' } },
      inlineLevelFn: () => PHANTOM_ZONE_LEVEL
    },
    'urn:level001': {
      type: 'dat',
      levelUrl: BASE_DAT_URL + 'LEVEL001.DAT',
      setupUrl: BASE_DAT_URL + 'SETUP001.DAT',
      warpUrl: undefined
    },
    'urn:level002': {
      type: 'dat',
      levelUrl: BASE_DAT_URL + 'LEVEL002.DAT',
      setupUrl: BASE_DAT_URL + 'SETUP002.DAT',
      warpUrl: undefined
    },
    'urn:level003': {
      type: 'dat',
      levelUrl: BASE_DAT_URL + 'LEVEL003.DAT',
      setupUrl: BASE_DAT_URL + 'SETUP003.DAT',
      warpUrl: undefined
    },
    'urn:level004': {
      type: 'dat',
      levelUrl: BASE_DAT_URL + 'LEVEL004.DAT',
      setupUrl: BASE_DAT_URL + 'SETUP004.DAT',
      warpUrl: undefined
    },
    'urn:level010': {
      type: 'dat',
      levelUrl: BASE_DAT_URL + 'LEVEL010.DAT',
      setupUrl: BASE_DAT_URL + 'SETUP010.DAT',
      warpUrl: undefined
    }
  }
}


function pythagorean(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2))
}

function randomToken() {
  const tokenChars = 'ABCDEFabcdef0123456789'
  return new Array(16)
    .fill(tokenChars.length)
    .map(l => Math.floor(l * Math.random()))
    .map(i => tokenChars.charAt(i))
    .join('')
}

class GameService {
  static async fetchLevelDat(level) {
    const [ levelRes, setupRes ] = await Promise.all([
      fetch(level.levelUrl),
      fetch(level.setupUrl)
    ])

    const [ levelDat, setupDat ] = await Promise.all([
      levelRes.text(),
      setupRes.text()
    ])

    return {
      level: Loader.loadLevelDat(levelDat),
      setup: Loader.loadSetupDat(setupDat),
      warps: {}
    }
  }

  static async loadFutureLevel(levelUrn) {
    const level = DB.levels[levelUrn]

    if(level.type === 'inline') {
      return {
        urn: levelUrn,
        level: level.inlineLevelFn(),
        setup: undefined,
        warps: undefined
      }
    }

    if(level.type === 'dat') {
      const datLevel = await GameService.fetchLevelDat(level)

      //console.log('DAT level loaded', levelUrn, datLevel)
      return {
        urn: levelUrn,
        ...datLevel
      }
    }

    throw new Error('unknown level type: ' + level.type)
  }

  static requestFutureLevel(targetLevelUrn, token) {
    const instanceToken = 'GAME-' + randomToken()
    const toUrn = targetLevelUrn + '/' + instanceToken

    const futureLevel = GameService.loadFutureLevel(targetLevelUrn, token)
    futureLevel.catch(e => console.warn('load future level', e))

    DB.instances[toUrn] = futureLevel

    return toUrn
  }

  static async openLobbyDoor(token) {
    const player = DB.players[token]
    const instance = await DB.instances[player.level]

    const targetLevelUrn = 'urn:level001'

    const toUrn = GameService.requestFutureLevel(targetLevelUrn, token)

    // TODO this still is to fast for game engine - use chrono
    setTimeout(() => {
      console.log('Let me show you the door', toUrn)

      instance.level[2][4] = { type: 'warp', to: toUrn }

      GameService.bc.postMessage(JSON.stringify({
        type: 'coord-state',
        coord: [4, 2],
        block: { type: 'warp', to: toUrn }
      }))
    }, 1 * 1000)

  }

  /**
   * @param requestedToken {InterfactionToken}
   * @param claim {Claim}
   * @param name {string}
   */
  static async addPlayer(requestedToken, claim, name) {
    if(claim) {
      // claim a spot, validate we have a claim for a open level
      // if so, swap the claim for a token

      // get claim from openClaims list
      // generate a new token and add to claim instance
    }

    const lobbyLevel = DB.levels['urn:lobby']

    let token = requestedToken
    if(token === undefined || DB.players[token] === undefined) {
      token = 'Anon-' + randomToken()

      DB.players[token] = {
        name,
        coord: lobbyLevel.home,
        level: 'urn:lobby/'
      }
    }

    const player = DB.players[token]

    // allow name changes
    player.name = name
    // always start in the lobby
    player.level = 'urn:lobby/'
    player.coord = lobbyLevel.home

    GameService.bc.postMessage(JSON.stringify({
      type: 'player-token',
      token,
      name: player.name
    }))
    GameService.bc.postMessage(JSON.stringify({
      type: 'player-level',
      token,
      level: player.level
    }))
    GameService.bc.postMessage(JSON.stringify({
      type: 'player-coord',
      token,
      coord: player.coord
    }))

    await GameService.openLobbyDoor(token)

    return Promise.resolve()
  }

  static async desireMovePlayer(token, direction) {
    const player = DB.players[token]

    player.direction = direction
    //
  }

  static async movePlayer(token, direction) {
    const player = DB.players[token]

    const dx = direction === 'left' ? -1 :
      direction === 'right' ? 1 :
      0
    const dy = direction === 'up' ? -1 :
      direction === 'down' ? 1 :
      0


    const targetCoord = [ player.coord[0] + dx, player.coord[1] + dy ]

    const instance = await DB.instances[player.level]

    const currentBlock = instance.level[player.coord[1]][player.coord[0]]
    const targetBlock = instance.level[targetCoord[1]][targetCoord[0]]

    if(targetBlock === undefined) {
      console.error('undefined target block')
      return
    }

    const blockMap = {
      'phantom_zone': {
        canEnter: () => false,
        canExit: () => false,
        onEnter: () => console.log('enter phantom zone')
      },
      'box': {
        canEnter: () => false,
        onEnter: () => { throw new Error('entering a box') },
      },
      'warp': {
        onEnter: () => {
          // target is a warp ... start transfer
          console.log('transfer pending...', targetBlock)

          player.level = targetBlock.to
          GameService.bc.postMessage(JSON.stringify({
            type: 'player-level',
            token,
            level: player.level
          }))

          GameService.bc.postMessage(JSON.stringify({
            type: 'player-coord',
            token,
            coord: player.coord,
            warp: true
          }))
        }
      },
      'dot': {
        onEnter: () => {
          // update level block
          targetBlock.type = 'empty'

          GameService.bc.postMessage(JSON.stringify({
            type: 'coord-state',
            coord: targetCoord,
            block: targetBlock
          }))

          // reward
          GameService.bc.postMessage(JSON.stringify({
            type: 'player-reward',
            token,
            reward: { type: 'dot' }
          }))

          const hasDot = instance.level
            .find(row => row.find(item => item.type === 'dot')) !== undefined

          if(!hasDot) {
            // level cleared
            console.log('Level Cleared')
            GameService.bc.postMessage(JSON.stringify({
              type: 'level-cleared',
              token,
              level: player.level
            }))

            player.level = 'urn:phantom_zone/'
            player.coord = [0,0]
            GameService.bc.postMessage(JSON.stringify({
              type: 'player-level',
              token,
              level: player.level
            }))

            // start loading of new level for player
            const toUrn = GameService.requestFutureLevel('urn:level002', token)
            const nextInstance = DB.instances[toUrn]

            nextInstance.then(ni => {
              player.level = toUrn
              player.coord = [1,1]
              GameService.bc.postMessage(JSON.stringify({
                type: 'player-level',
                token,
                level: player.level
              }))
            })
          }
        }
      },
      'power': {
        onEnter: () => {
          console.log('POWER UP')

          // if(consummable)
          targetBlock.type = 'empty'

          GameService.bc.postMessage(JSON.stringify({
            type: 'coord-state',
            coord: targetCoord,
            block: targetBlock
          }))

          GameService.bc.postMessage(JSON.stringify({
            type: 'player-reward',
            token,
            reward: { type: 'power' }
          }))
        }
      },
      'empty': {
      }
    }

    const canExit = blockMap[currentBlock.type]?.canExit ?? (() => true)
    const onExit = blockMap[currentBlock.type]?.onExit ?? (() => {})
    const canEnter = blockMap[targetBlock?.type]?.canEnter ?? (() => true)
    const onEnter = blockMap[targetBlock?.type]?.onEnter ?? (() => {})


    if(!canExit()) {
      return
    }

    if(canEnter() === false) {
      return
    }

    onExit()

    // now allowed, so move to new coord and broadcast
    player.coord = targetCoord

    GameService.bc.postMessage(JSON.stringify({
      type: 'player-coord',
      token,
      coord: player.coord
    }))

    onEnter()

    return Promise.resolve()
  }

  static async pulsePlayer(token, all, statics) {
    const player = DB.players[token]
    if(player === undefined) {
      console.log('unknown player', token)
      return
    }

    if(player.level === 'urn:phantom_zone/') {
      console.log('player in phantom zone, no pulse')
      return
    }

    const maxDistance = (all ? Infinity : MAX_NON_ALL_DISTANCE)

    const instance = await DB.instances[player.level]


    // this magic maps the row, col format down into
    // a list of objects with coords and block.
    // it is reduced from its array-of-arrays structure
    // into a single flat list.
    // to create a block listing in player-centric order
    // the distance to that origin is calculated
    // and used to sort.
    // if statics are enabled, result will include 'box' block types
    // the result is broadcast
    instance.level.map((row, y) => row.map((item, x) => ({
      coord: [x, y],
      block: item,
      //d: pythagorean(x, y, player.coord[0], player.coord[1]) // inline d ?
    })))
    .reduce((acc, item) => acc.concat(item), [])
    .filter(item => (statics === true ? true : item.block.type !== 'box'))
    .map(item => ({
      ...item,
      shuffle: Math.random(),
      d: pythagorean(
        item.coord[0], item.coord[1],
        player.coord[0], player.coord[1])
    }))
    .filter(item => item.d < maxDistance)
    .sort((a, b) => a.d < b.d ? -1 : 1)
    // shuffle .sort((a, b) => a.shuffle - b.shuffle)
    .forEach(item => {
      GameService.bc.postMessage(JSON.stringify({
        type: 'coord-state',
        coord: item.coord,
        block: item.block
      }))
    })

    // this method loops the entire level and broadcasts in order
    // while it is simple it is limited in utility
    // player.level.forEach((row, y) => row.forEach((item, x) => {
    //   GameService.bc.postMessage(JSON.stringify({
    //     type: 'coord-state',
    //     coord: [x, y],
    //     block: item
    //   }))
    // }))

    return Promise.resolve()
  }
}



const messageFnMap = {
  'add-plyaer': (token, claim, name) => GameService.addPlayer(token, claim, name)
}

GameService.bc = new BroadcastChannel('urn:game-state')
GameService.bc.onmessage = ev => {
  const message = JSON.parse(ev.data)
  //console.log('GameService received broadcast', message)
  const { type } = message
  switch(type) {
    case 'add-player': {
      const { token, name, claim } = message
      GameService.addPlayer(token, claim, name)
        .catch(e => console.error('addPlayer', e))
    } break
    case 'move-player': {
      const { token, direction } = message
      GameService.movePlayer(token, direction)
      //GameService.desireMovePlayer(token, direction)
        .catch(e => console.error('movePlayer', e))
    } break
    case 'pulse-coords': {
      const { token, all, statics } = message
      GameService.pulsePlayer(token, all, statics)
        .catch(e => console.error('pulsePlayer', e))
    } break
    default: {
      console.warn('unknown message type', type)
      console.debug(message)
    } break
  }
}