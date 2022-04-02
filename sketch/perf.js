
//setInterval(() => performance.measure('draw', 'draw:begin', 'draw:end'), 60 * 1000)


const drawAvg = { sum: 0, count: 0 }
setInterval(() => console.log(drawAvg.sum / drawAvg.count), 10 * 1000)

function po_handler(list, observer) {
  const { sum, count } = list.getEntries()
    .filter(entry => entry.entryType === 'measure')
    //.map(x => { console.log('x is', x); return x })
    .map(entry => entry.duration)
    .reduce((prev, cur) => ({
      sum: prev.sum + cur,
      count: prev.count + 1
    }), { sum: 0, count: 0 } )

  drawAvg.sum += sum
  drawAvg.count += count

  //if(result.count > 0) { console.log(drawAvg.sum / drawAvg.count) }
}
const po = new PerformanceObserver(po_handler)
po.observe({ entryTypes: ['resource', 'measure', 'paint', 'mark'] })
performance.mark('Ahoy')