import { Chan } from '../../src/index.js'
import { log } from '../util.js'

const { print, printElapsed } = log()

const s: [string, number][] = [
  ['a', 500],
  ['b', 700],
  ['c', 600],
  ['d', 2000],
  ['e', 800],
  ['f', 200],
  ['h', 1000],
  ['j', 600],
  ['k', 700]
]

const p = (value: string, timeout: number) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(value), timeout))

const c = new Chan<() => Promise<string>>()

;(async () => {
  for (let idx = 0; idx < s.length; idx++) {
    // print(`send start ${idx + 1}`)
    // ここで Promise を作成しておかなとコールバックが実行されないので順次実行と変わらないので注意.
    const t = p(s[idx][0], s[idx][1])
    await c.send(() => t)
    // print(`send end ${idx + 1}`)
  }
  c.close()
})()
;(async () => {
  for await (let i of c.receiver()) {
    print(`recv value: ${await i()}`)
  }
})()
