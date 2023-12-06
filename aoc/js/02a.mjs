import { getInputLines } from "./_common.mjs"

const MAX_COUNT = {
  "red": 12,
  "green": 13,
  "blue": 14
}

const res = getInputLines(2)
  .flatMap(line => {
    const id = parseInt(line.slice(5), 10)
    const groups = line.slice(line.indexOf(":") + 2).split("; ")
    const invalid = groups.some(group => {
      return group.split(", ")
        .map(item => item.split(" "))
        .some(([count, color]) => parseInt(count, 10) > MAX_COUNT[color])
    })

    return invalid ? [] : [id]
  })
  .sum()

console.log(res)