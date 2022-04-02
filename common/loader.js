

export class Loader {
  static loadSetupDat(dat) {
    const line = dat.split('')
    const [ homeX, homeY, Gcount, ...tail ] = line
    const [ _, warp, speed ] = tail

    return {
      homeCoord: (homeX, homeY),
      ghosts: new Array(parseInt(Gcount, 10)).forEach(g => {}),
      warp: warp === '1',
      speed: parseInt(speed, 10)
    }
  }

  static loadWarpDat(dat) {


  }

  static loadLevelDat(dat) {
    const lines = dat.split('\n')
    const [ size, ...boardLines ] = lines
    //console.log('size', size)
    return boardLines.map(line => {
      const lineValues = line.split(' ')
        .map(i => i.trim())
        .filter(i => i !== '')

      return lineValues.map(value => {
        const type =
          value === '0' ? 'box' :
          value === '1' ? 'dot' :
          value === '2' ? 'power' :
          value === '3' ? 'warp' :
          value === '4' ? 'secret' :
          value === '5' ? 'cherry' :
          'unknown('+value+')'
        return {
          type
        }
      })
    })
  }
}
