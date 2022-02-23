import { Chan } from '../../src/index.js'
import { Src, log, genPromise } from '../util.js'

const { print } = log()

const s: Src[] = [
  ['a', 'f', 500],
  ['b', 'f', 700],
  ['c', 'f', 600],
  ['d', 'f', 2000],
  ['e', 'r', 800], // 少し待ってから reject
  ['f', 'f', 200],
  ['g', 'f', 1000],
  ['h', 'f', 600],
  ['i', 'f', 700],
  ['j', 'f', 300]
]

const c = new Chan<Promise<string>>(3)

;(async () => {
  let err: any
  for (let idx = 0; err === undefined && idx < s.length; idx++) {
    const p = genPromise(s[idx], print)
    // chain は別の chain となるようにする.
    // ここでの戻り値(新し Promise インスタンス)を send すると
    // chain の先頭になるのでバッファーの中で reject されない.
    // (このサンプルだと send しようとしても型があわないからそもそもできない)
    p.catch((r) => {
      print(`handle reject(send loop) ${r}`)
      err = r
    })
    await c.send(p)
  }
  c.close()
})()

try {
  for await (let i of c.receiver()) {
    print(`recv value: ${i}`)
  }
} catch (r) {
  print(`handle reject(recv loop) ${r}`)
}
