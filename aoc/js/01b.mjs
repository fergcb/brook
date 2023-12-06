import { getInputLines, isDigit } from "./_common.mjs"

const nums = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"
]
const numPattern = new RegExp(`^(${nums.join("|")})`);

const res = getInputLines(1)
  .map(line => {
    let first, last;

    line.chars().forEach((_, i) => {
      const match = line.slice(i).match(numPattern);
      if (!match) return;
      const digit = (nums.indexOf(match[0]) % 9 + 1).toString()
      if (first === undefined) first = digit;
      last = digit;
    })
    
    return parseInt(first + last, 10);
  })
  .sum()

console.log(res)