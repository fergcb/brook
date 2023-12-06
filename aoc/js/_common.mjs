import fs from 'fs'

Array.prototype.sum = function () {
  return this.reduce((acc, cur) => acc + cur, 0);
}

Array.prototype.product = function () {
  return this.reduce((acc, cur) => acc * cur, 1);
}

String.prototype.chars = function () {
  return this.split('')
}

String.prototype.isDigit = function () {
  return isDigit(this)
}

export function getInput(day) {
  day = day.toString().padStart(2, "0");
  return fs.readFileSync(`aoc/input/${day}.txt`).toString()
}

export function getInputLines(day) {
  return getInput(day).split(/[\r\n]+/)
}

export function isDigit(char) {
  return "0123456789".includes(char);
}