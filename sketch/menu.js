

/*
// something, ASCII, (desired, charCode)
('É', 201, ('╔', 9556))
('Í', 205, ('═', 9552))
('»', 187, ('╗', 9559))
('º', 186, ('║', 9553))
('Ì', 204, ('╠' ))
('¹', 185, ('╣' ))
('È', 200, ('╚'))
('¼', 188, ('╝'))


174 '«'
175 '»
*/

const mainMenu = [
    '╔══════════════════╗',
    '║      HELP        ║',
    '╠══════════════════╣',
    '║   \'H\'-Help       ║',
    '║      HELP        ║',
    '║  Move-Arrow Keys ║',
    '╠══════════════════╣',
    '║  Press any Key   ║',
    '╚══════════════════╝'
  ]


   // if(sharredGame.menu === 'open-help') {
  //   fill(color(0,0,0, 200))
  //   rect(0, 0, width, height)

  //   fill('black')
  //   rect(275, 175, 160, 72)

  //   stroke('black')
  //   fill('white')
  //   textSize(8)
  //   textFont('Courier New')

  //   mainMenu.forEach((line, i) => {
  //     text(line, 275, 175 + (i * 8))
  //   })

  //   sharredGame.menu = 'help'
  // }