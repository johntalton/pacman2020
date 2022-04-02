import * as p5lib from './p5.min.js'
import { Client } from './client.js'
import { TileEngine } from './tile-engine.js'

const applicationState = {
  registered: true,
  cheat: false,
  debug: true,

  name: 'pierce',
  token: undefined,

  // inter-service communication channel
  bc: new BroadcastChannel('urn:game-state'),

  // rendering information
  engine: {
    scale: {
      xScale: 0,
      yScale: 0
    },
    dirtyCoords: [],
    animationCoords: [],
    // coordCache: {},
    chronometer: {}
  },

  //
  input: {
    activeKeyMap: {}
  }
}

function preload() {
  Client.connect(applicationState)
}

function setup() {
  // housekeeping setup
  TileEngine.setup(applicationState.engine)

  // main canvas
  applicationState.engine.p5.createCanvas(
    applicationState.engine.p5.windowWidth - 10,
    applicationState.engine.p5.windowHeight - 10)

  // The TileEngine will control loop triggering
  applicationState.engine.p5.noLoop()

  // TitleEngine.scale(levelW, levelH, width, height)
  applicationState.engine.scale.xScale = applicationState.engine.p5.width / 20
  applicationState.engine.scale.yScale = applicationState.engine.p5.height / 16
}

function windowResized() {
  applicationState.engine.p5.resizeCanvas(
    applicationState.engine.p5.windowWidth - 10,
    applicationState.engine.p5.windowHeight - 10)

  // TitleEngine.scale(levelW, levelH, width, height)
  applicationState.engine.scale.xScale = applicationState.engine.p5.width / 20
  applicationState.engine.scale.yScale = applicationState.engine.p5.height / 16
}

function keyPressed() {
  console.log('key', applicationState.engine.p5.key)

  const refreshKeys = {
    'r': { all: false, statics: false }, // r
    'R': { all: true, statics: false }, // shift + r
    '®': { all: false, statics: true }, // alt + r
    '‰': { all: true, statics: true }, // shit + alt + r
  }

  const refreshOption = refreshKeys[applicationState.engine.p5.key]

  if(applicationState.debug && refreshOption !== undefined) {
    // refresh triggered
    applicationState.bc.postMessage(JSON.stringify({
      type: 'pulse-coords',
      token: applicationState.token,
      ...refreshOption
    }))
  }

  if(applicationState.engine.p5.key === ' ') {
    const fs = applicationState.engine.p5.fullscreen()
    applicationState.engine.p5.fullscreen(!fs)
    return
  }

  const keyFn = applicationState.input.activeKeyMap[applicationState.engine.p5.key]
  if(keyFn !== undefined) {
    // console.log('active key', key)
    try {
      keyFn()
    }
    catch(e) {
      console.warn('key function', e)
    }
  }
}

function draw() {
  performance.mark('draw:begin')

  TileEngine.draw(applicationState.engine)

  performance.mark('draw:end')
  performance.measure('draw', 'draw:begin', 'draw:end')
}


applicationState.engine.p5 = new p5((p) => {
  p.preload = preload
  p.setup = setup
  p.windowResized = windowResized
  p.keyPressed = keyPressed
  p.draw = draw
})
