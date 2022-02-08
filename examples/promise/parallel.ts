import { Chan } from '../../src/index.js'

const s: [string, number][] = [
  ['0', 80],
  ['1', 100],
  ['2', 50],
  ['3', 280],
  ['4', 200],
  ['5', 240],
  ['6', 150],
  ['7', 10],
  ['8', 130]
]

const p = (value: string, timeout: number) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(value), timeout))

const c = new Chan<Promise<string>>(3)

const n = Date.now()
;(async () => {
  for (let idx = 0; idx < s.length; idx++) {
    console.log(
      `write start elapsed time: ${`${Date.now() - n}`.padStart(
        4,
        '0'
      )} index: ${idx}`
    )
    await c.write(p(s[idx][0], s[idx][1]))
    console.log(
      `write done  elapsed time: ${`${Date.now() - n}`.padStart(
        4,
        '0'
      )} index: ${idx}`
    )
  }
  c.close()
})()
;(async () => {
  for await (let i of c.reader()) {
    console.log(
      `read        elapsed time: ${`${Date.now() - n}`.padStart(
        4,
        '0'
      )} value: ${i}`
    )
  }
})()

// $ node --loader ts-node/esm examples/serial.ts
//
// write start elapsed time: 0000 index: 0
// write done  elapsed time: 0002 index: 0
// write start elapsed time: 0003 index: 1
// write done  elapsed time: 0004 index: 1
// write start elapsed time: 0004 index: 2
// write done  elapsed time: 0005 index: 2
// write start elapsed time: 0005 index: 3
// write done  elapsed time: 0005 index: 3
// write start elapsed time: 0005 index: 4
// read        elapsed time: 0081 value: 0
// write done  elapsed time: 0081 index: 4
// write start elapsed time: 0082 index: 5
// read        elapsed time: 0104 value: 1
// write done  elapsed time: 0104 index: 5
// write start elapsed time: 0105 index: 6
// read        elapsed time: 0105 value: 2
// write done  elapsed time: 0105 index: 6
// write start elapsed time: 0105 index: 7
// read        elapsed time: 0286 value: 3
// write done  elapsed time: 0286 index: 7
// write start elapsed time: 0286 index: 8
// read        elapsed time: 0286 value: 4
// write done  elapsed time: 0286 index: 8
// read        elapsed time: 0322 value: 5
// read        elapsed time: 0322 value: 6
// read        elapsed time: 0322 value: 7
// read        elapsed time: 0416 value: 8
