import { getInput } from "./_common.mjs"

const input = getInput(3)
const width = input.indexOf("\n") - 1
const schematic = input.replaceAll("\n", "")

const exp = /([^\d]+)(\d+)/y

let sum = 0;

while (exp.lastIndex < schematic.length) {
  const match = exp.exec(schematic)
  if (match === null) break
  const numStart = match[1].length
  const numLength = match[2].length
  const num = parseInt(match[2])
  const offset = match.index + numStart

  const neighbours = [
    schematic[offset-1],
    schematic[offset+numLength]
  ]

  for (let i = -1; i <= numLength; i++) {
    const above = offset - width + i - 1;
    if (above >= 0 && above < schematic.length) neighbours.push(schematic[above])
    const below = offset + width + i + 1;
    if (below >= 0 && below < schematic.length) neighbours.push(schematic[below])
  }

  if (neighbours.every(n => n === ".")) continue;

  sum += num;
}

console.log(sum)