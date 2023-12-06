import { getInputLines } from "./_common.mjs"

const res = getInputLines(2)
  .map(line => {
    const mins = new Map();

    const groups = line.slice(line.indexOf(":") + 2).split("; ")
    groups.forEach(group => {
      group.split(", ")
        .map(item => item.split(" "))
        .forEach(([count, color]) => {
          count = parseInt(count, 10)
          if (!mins.has(color) || mins.get(color) < count)
            mins.set(color, count)
        })
    })

    return [...mins.values()].product()
  })
  .sum()

console.log(res)