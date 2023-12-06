import fs from 'fs'
import isEqual from "lodash.isequal"

class BrookFunction {
  constructor(name, params, func) {
    this.name = name;
    this.params = params;
    this.arity = params.length;
    this.func = func;
  }

  toString() {
    const args = ['', 'x', 'x y'][this.arity]
    return this.name + `(${args})`
  }

  apply(...args) {
    if (args.length > this.arity) throw new Error(`Function '${this}' takes ${this.arity} arguments, received ${args.length}.`)
    
    if (this.arity === 0) return this.func()

    const argsToPass = [];
    let partialLHS = null;
    let partialRHS = null; 

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      const param = this.params[i]
      if (checkType(param, arg)) {
        argsToPass.push(arg);
      } else {
        if (param.kind !== "func" && arg instanceof BrookFunction && arg.arity === 1) {
          if (i === 0) partialLHS = arg;
          else partialRHS = arg;
        } else throw new Error(
          `Function '${this}' expected ${['LHS', 'RHS'][i]} to be of type ${writeParam(param)}, received ${writeType(arg)}:\n${arg}`)
      }
    }

    if (partialLHS && partialRHS) {
      return new BrookFunction("anonymous_partial", [...partialLHS.params, ...partialRHS.params], (x, y) => {
        return this.func(partialLHS.apply(x), partialRHS.apply(y))
      })
    } else if (partialLHS) {
      if (this.arity === 2 && argsToPass.length === 0) {
        return new BrookFunction("anonymous_partial", [...partialLHS.params, this.params[1]], (x, y) => {
          return this.func(partialLHS.apply(x), y)
        })
      }
      return new BrookFunction("anonymous_partial", [...partialLHS.params], (x) => {
        return this.func(partialLHS.apply(x), ...argsToPass)
      })
    } else if (partialRHS) {
      if (this.arity === 2 && argsToPass.length === 0) {
        return new BrookFunction("anonymous_partial", [this.params[0], ...partialRHS.params], (x, y) => {
          return this.func(x, partialRHS.apply(y))
        })
      }

      return new BrookFunction("anonymous_partial", [...partialRHS.params], (y) => {
        return this.func(...argsToPass, partialLHS.apply(y))
      })
    }

    if (argsToPass.length < this.arity) {
      return new BrookFunction(`${this.name}_partial`, this.params.slice(argsToPass.length), (...args) => {
        return this.func(...argsToPass, ...args)
      })
    }

    return this.func(...argsToPass)
  }
}

function checkType(param, arg) {
  if (param.kind === "any") return true
  if (param.kind === "num") return typeof arg === "number"
  if (param.kind === "str") return typeof arg === "string"
  if (param.kind === "array") return Array.isArray(arg) && arg.every(el => checkType(param.of, el))
  if (param.kind === "func")
    return arg instanceof BrookFunction
        && param.params.length === arg.arity
        && arg.params.every((el, i) => checkParamType(param.params[i], el))
}

function checkParamType(p1, p2) {
  return p1.kind === "any" || isEqual(p1, p2)
}

function writeParam(param) {
  switch(param.kind) {
    case "any":
    case "num":
    case "str":
      return param.kind;
    case "array":
      return `array<${writeParam(param.of)}>`
    case "func":
      return `func(${param.params.map(writeParam).join(" ")})`
  }
}

function writeType(arg) {
  if (typeof arg === "string") return "str"
  if (typeof arg === "number") return "num"
  if (Array.isArray(arg)) return `array<${arg.length ? writeType(arg[0]) : "unknown"}>`
  if (arg instanceof BrookFunction) return `func(${arg.params.map(writeParam).join(" ")})`
  return "unknown"
}

const BUILT_INS = (() => {
  const funcs = new Map();
  const define = (name, params, func) => funcs.set(name, new BrookFunction(name, params, func))
  const any = { kind: "any" }
  const num = { kind: "num" }
  const str = { kind: "str" }
  const array = (of) => ({ kind: "array", of })
  const func = (...params) => ({ kind: "func", params })


  // Arithmetic
  define("plus",  [num, num], (x, y) => x + y)
  define("minus", [num, num], (x, y) => x - y)
  define("times", [num, num], (x, y) => x * y)
  define("over",  [num, num], (x, y) => x / y)
  define("mod",   [num, num], (x, y) => x % y)

  // File IO
  define("readFile", [str], (x) => fs.readFileSync(x).toString())

  // String Operations
  define("lines", [str], (x) => x.split(/[\n\r]+/))
  define("chars", [str], (x) => x.split(""))
  
  // String Parsing
  define("isDigit", [str], (x) => x.length === 1 && "0123456789".includes(x))
  define("toInt",   [str], (x) => parseInt(x, 10))

  // Array Operations
  define(
    "map",
    [array(any), func(any)],
    (xs, f) => xs.map(x => f.apply(x)))

  define(
    "reduce",
    [array(any), func(any, any)],
    (xs, f) => xs.reduce((acc, cur) => f.apply(acc, cur)))

  define(
    "filter",
    [array(any), func(any)],
    (xs, f) => xs.filter(x => f.apply(x)))

  define(
    "sum",
    [array(num)],
    (xs) => xs.reduce((acc, cur) => acc + cur))

  define(
    "take",
    [array(any), num],
    (xs, y) => xs.slice(0, y))

  define(
    "pick",
    [array(any), array(num)],
    (xs, ys) => ys.map(y => xs.at(y)))

  define(
    "join",
    [array(str), str],
    (xs, y) => xs.join(y))

  return funcs;
})()

export function execute(expression) {
  const context = {
    functions: BUILT_INS
  }

  return expression.evaluate(context)
}