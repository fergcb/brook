# Brook
**Brook is toy functional programming language.**

Brook programs are compose of left-associative binary, unary and nullary functions which support partial application, allowing for flexible function composition.

## Installation
```sh
git clone https://github.com/fergcb/brook
cd brook
npm i -g
```

## Usage
```sh
brook run aoc/01a.brk
```

Here are the contents of `aoc/01a.brk`:
```
"aoc/input/01.txt" readFile lines
map (
  chars
  filter (isDigit)
  pick [0 -1]
  join ""
  toInt
)
sum
```

An explicitly parenthesised version of this code would look like the following:
```
(
  (
    (
      ("aoc/input/01.txt" readFile) lines
    ) map (
      (
        (
          (
            (chars) filter (isDigit)
          ) pick [0 -1]
        ) join ""
      ) toInt
    )
  ) sum
)
```