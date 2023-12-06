import { getInputLines, isDigit } from "./_common.mjs"

const res = getInputLines(1)
  .map(line => {
    let first, last;

    line.chars()
        .filter(isDigit)
        .forEach(char => {
          if (first === undefined) first = char
          last = char
        })
    
    return parseInt(first + last, 10);
  })
  .sum()

console.log(res)