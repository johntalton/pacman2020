import { Renderer } from './renderer.js'


export class TileEngine {
  static setup(state) {
    Renderer.pallet = Renderer.initPallet(state.p5)
    Renderer.imgs = Renderer.initImg(state.p5)
  }

  static flashBlit(state, nextBlit, coord) {
    //return nextBlit

    const blit = () => {
      const {
        xl, xr, yt, yb, xc, yc, w, h
      } = Renderer.toGfxCord(state.scale, ...coord)

      state.p5.fill('red')
      state.p5.rect(xl, yt, w, h)
      state.p5.stroke('green')
      state.p5.fill('white')
      state.p5.rect(xl + 5, yt + 5, w - 10, h - 10)
    }

    setTimeout(() => {
      state.dirtyCoords.push({ blit: nextBlit })
      state.p5.loop()
    }, 0)

    return blit
  }

  static addCoord(state, coord, block) {
    const lookup = {
      'box': () => Renderer.drawBox(state.p5, state.scale, ...coord),
      'dot': () => Renderer.drawDot(state.p5, state.scale, ...coord),
      'power': () => Renderer.drawPower(state.p5, state.scale, ...coord),
      'warp': () => Renderer.drawWarp(state.p5, state.scale, ...coord),
      'empty': () => Renderer.drawEaten(state.p5, state.scale, ...coord)
    }

    const blit = TileEngine.flashBlit(state, lookup[block.type], coord)

    if(blit === undefined) {
      console.error('missing blit', block.type)
      return
    }
    state.dirtyCoords.push({ blit })

    if(state.dirtyCoords.length === 1) {
       state.p5.loop()
      //  noLoop()
    }
  }

  static addImg(state, coord, block) {
    state.animationCoords.push({
      epoch: 0,
      targetOffset: 0,
      chronos: 100,
      blit: t => {

        Renderer.drawImg(state.p5, 'player', state.scale, ...coord)
      }
    })

    state.p5.loop()
  }


  static draw(state) {
    //if(state.dirtyCoords.length === 0) { console.warn('why are we draw if not dirty', state.dirtyCoords.length); return }

    state.dirtyCoords.forEach(coord => {
      coord.blit()
    })

    state.dirtyCoords = []

    state.animationCoords = state.animationCoords.filter(ani => ani.chronos !== 0)
    state.animationCoords.forEach(ani => {
      ani.chronos -= 1 // TODO this is so wrong ... clock from server
      ani.blit(ani.chronos)
    })

    if(state.animationCoords.length === 0) {
      state.p5.noLoop()
    }


    // state.sprites
  }
}