/**
{
                   ---------==========================-------
                                   Date 12-20-2020
                                  By John Talton
                   ---------==========================--------

Notes to me:
  add all the game logic

 THIS PROGRAM RUNS BEST ON A 486-66 OR BETTER
}
**/


// TODO inline image dat to solve split between loader module and
//  script p5 sketch. Also simplifying the initial state for loading
//  as we do not wait for assets (see `_loadFromDat`)
// TODO this also uses string template in order to represent the multiline
//  dat format over standard single quote
const PACMAN_15 =
`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 0 0 1 1 1 1 1 0 0 0 0 0 0
0 0 1 1 1 1 1 1 1 1 1 1 0 0 0
0 1 1 1 1 1 1 1 0 0 1 1 1 0 0
1 1 1 1 1 1 1 1 0 0 1 1 1 1 0
1 1 1 1 1 1 1 1 1 1 1 1 0 0 0
1 1 1 1 1 1 1 1 1 1 1 0 0 0 0
1 1 1 1 1 1 1 1 1 0 0 0 0 0 0
1 1 1 1 1 1 1 1 1 1 1 0 0 0 0
1 1 1 1 1 1 1 1 1 1 1 1 0 0 0
0 1 1 1 1 1 1 1 1 1 1 1 1 1 0
0 1 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 0 0 0
0 0 0 0 1 1 1 1 1 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
`
const PACMAN_30 = ''
const GHOST_15 =
`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 0 0 1 1 1 1 1 1 1 0 0 0 0
0 0 0 1 1 1 1 1 1 1 1 1 0 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 0 0 1 1 1 0 0 1 1 0 0
0 0 1 1 0 0 1 1 1 0 0 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 1 1 1 1 1 0 0
0 1 0 0 1 1 0 0 0 1 1 0 1 1 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
`

const GHOST_30 = '' // TODO
const CHERRY_15 = '' // TODO
const CHARRY_30 = '' // TODO

/**
 * Port of Pascal rendering function.
 *
 * Provides the core set of rending geometry needed to implement
 * the visuals found in the pascal version.
 *
 * This is written to work over an existing loaded P5js and thus
 * it assumes standards calls to `color`, `rect`, `line`, etc
 *
 * The `x` `y` coordinate system used is for `x` to start at Zero
 * at the top-left and increment by One. While `y` traverses Downward.
 * These units are in level-blocks. Each function takes a `meta` data
 * that indicates the final rending scale for each level-block.
 * Using the `toGfxCord` call in order to translate that to final render
 * location.
 *
 * Two initialization function must be called via P5js:
 * `initImg` and `initPallet`. And assigned to the global withing this class.
 *
 *
 */
export class Renderer {
  static toGfxCord(meta, x, y) {
    let xl = x * meta.xScale
    let xr = (x + 1) * meta.xScale
    let yt = y * meta.yScale
    let yb = (y + 1) * meta.yScale

    let xc = xl + (meta.xScale / 2.0)
    let yc = yt + (meta.yScale / 2.0)

    return {
      xl, xr, yt, yb, xc, yc, w: meta.xScale, h: meta.yScale
    }
  }

  static initImg(p5) {
    return {
      player: { img: Renderer._loadFromDat(p5, PACMAN_15, 15, 10), size: 15 },
      ghost: { img: Renderer._loadFromDat(p5, GHOST_15, 15, 20), size: 15 }
    }
  }

  static _loadFromDat(p5, dat, size, offset) {
    let img = p5.createImage(size, size)
    img.loadPixels()

    dat.split('\n')
      .forEach((line, ri) => {
        line.split(' ')
          .filter(l => l !== '')
          .forEach((c, ci) => {
            let col = Renderer.pallet[offset + parseInt(c, 10)]
            let index = ((ri * size) + ci) * 4;

            img.pixels[index + 0] = p5.red(col)
            img.pixels[index + 1] = p5.green(col)
            img.pixels[index + 2] = p5.blue(col)
            img.pixels[index + 3] = p5.alpha(col)
          })
      })

    img.updatePixels()
    return img
  }

  static initPallet(p5) {
    // this represents a close representation to the
    // original colors used.
    return {
      0: p5.color(0, 0, 0), // background
      1: p5.color('Maroon'), // board
      2: p5.color('hsb(160, 100%, 50%)'), // dot
      4: p5.color('darkblue'), // power

      10: p5.color(0,0,0, 0), // player
      11: p5.color('yellow'),

      20: p5.color(0,0,0, 0), // cherry
      21: p5.color('green'),
      22: p5.color('red')
    }
  }

  static drawBox(p5, meta, x, y) {
    //push()

    const {
      xl, xr, yt, yb, xc, yc, w, h
    } = Renderer.toGfxCord(meta, x, y)

    p5.noStroke()
    p5.fill(Renderer.pallet[1])
    p5.rect(xl, yt, w, h)

    p5.stroke(Renderer.pallet[1])
    p5.line(xl, yt, xr, yt)

    p5.noStroke()
    p5.fill(Renderer.pallet[4])
    p5.triangle(xl, yt, xc, yc, xr, yt)
    p5.triangle(xl, yb, xc, yc, xr, yb)

    //pop()
  }

  static drawWarp(p5, meta, x, y) {
    //push()

    const {
      xl, xr, yt, yb, xc, yc, w, h
    } = Renderer.toGfxCord(meta, x, y)

    p5.noStroke()
    p5.fill(Renderer.pallet[2])
    p5.rect(xl, yt, w, h)

    //pop()
  }

  static drawDot(p5, meta, x, y) {
    //push()

    const {
      xl, xr, yt, yb, xc, yc, w, h
    } = Renderer.toGfxCord(meta, x, y)

    p5.noStroke()
    p5.fill(Renderer.pallet[0])
    p5.rect(xl, yt, w, h)

    p5.fill(Renderer.pallet[2])
    p5.ellipse(xc, yc, w / 4, h / 4)

    //pop()
  }

  static drawEaten(p5, meta, x, y) {
    //push()

    const {
      xl, xr, yt, yb, xc, yc, w, h
    } = Renderer.toGfxCord(meta, x, y)

    p5.noStroke()
    p5.fill(Renderer.pallet[0])
    p5.rect(xl, yt, w, h)

    //pop()
  }

  static drawPower(p5, meta, x, y) {
    //push()

    const {
      xl, xr, yt, yb, xc, yc, w, h
    } = Renderer.toGfxCord(meta, x, y)

    p5.noStroke()
    p5.fill(Renderer.pallet[0])
    p5.rect(xl, yt, w, h)

    p5.noStroke()
    p5.fill(Renderer.pallet[4])
    p5.ellipse(xc, yc, w / 4, h / 4)

    //pop()
  }

  static drawSecret(p5, meta, x, y) {
    Renderer.drawBox(p5, meta, x, y)
  }

  static drawImg(p5, img, meta, x, y) {
    const {
      xl, xr, yt, yb, xc, yc, w, h
    } = Renderer.toGfxCord(meta, x, y)

    const i = Renderer.imgs[img]
    p5.image(i.img,
          xl, yt,
          w, h,
          0, 0,
          i.size, i.size)
  }
}

Renderer.pallet = undefined
Renderer.imgs = undefined