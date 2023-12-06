import { getInput } from "./_common.mjs"

const input = getInput(3)
const width = input.indexOf("\n") - 1
const schematic = input.replaceAll("\n", "")

const exp = /([^\d]+)(\d+)/y

const gears = new Map();

while (exp.lastIndex < schematic.length) {
  const match = exp.exec(schematic)
  if (match === null) break
  const numStart = match[1].length
  const numLength = match[2].length
  const num = parseInt(match[2])
  const offset = match.index + numStart

  const neighbours = [
    offset-1,
    offset+numLength
  ]

  for (let i = -1; i <= numLength; i++) {
    const above = offset - width + i - 1;
    if (above >= 0 && above < schematic.length) neighbours.push(above)
    const below = offset + width + i + 1;
    if (below >= 0 && below < schematic.length) neighbours.push(below)
  }

  neighbours.forEach(pos => {
    if (schematic[pos] !== "*") return;
    if (!gears.has(pos)) gears.set(pos, [])
    gears.get(pos).push(num)
  })
}

const sum = [...gears.values()]
  .filter(parts => parts.length === 2)
  .map(gears => gears.product())
  .sum()

console.log(sum)