import { ChanRace, ChanSend, ChanRecv } from '../../src/index.js'
import { Src, log, genPromose } from '../util.js'

const { print } = log()

const s: Src[] = [
  ['1', 'f', 500],
  ['2', 'f', 700],
  ['3', 'f', 600],
  ['4', 'f', 2000],
  ['5', 'f', 800],
  ['6', 'f', 200],
  ['7', 'f', 1000],
  ['8', 'f', 600],
  ['9', 'f', 700],
  ['10', 'f', 300]
]

type SourcePromise = string
type ValuePromise = string
type ResultPromise = string

async function proc1(
  send: ChanSend<Promise<ValuePromise>>,
  recv: ChanRecv<SourcePromise>
) {
  for await (let value of recv) {
    const p = genPromose([`proc1-${value}`, 'f', 100], print)
    await send(p)
  }
}

async function proc2(
  send: ChanSend<Promise<ValuePromise>>,
  recv: ChanRecv<SourcePromise>
) {
  for await (let value of recv) {
    const p = genPromose([`proc2-${value}`, 'f', 200], print)
    await send(p)
  }
}

function run(src: Src[]): ChanRecv<ResultPromise> {
  const ch1 = new ChanRace<SourcePromise>(2)
  const ch2 = new ChanRace<SourcePromise>(2)
  const chRecv = new ChanRace<ValuePromise>(3)

  ;(async () => {
    for (let i of src) {
      const p = genPromose(i, print)
      if (Number.parseInt(i[0], 10) % 2 === 0) {
        await ch1.send(p)
      } else {
        await ch2.send(p)
      }
    }
    console.log('close ch1')
    ch1.close()
    console.log('close ch2')
    ch2.close()
  })()
  ;(async () => {
    await Promise.all([
      proc1(chRecv.send, ch1.receiver()),
      proc2(chRecv.send, ch2.receiver())
    ])
    console.log('close chRecv')
    chRecv.close()
  })()

  return chRecv.receiver()
}

await (async () => {
  print('run')
  for await (let i of run(s)) {
    print(`recv: ${i}`)
  }
  print('done')
})()
