import fs from 'fs'
import isEqual from "lodash.isequal"

export class BrookFunction {
  constructor(name, params, returns, func) {
    this.name = name;
    this.params = params;
    this.returns = returns;
    this.arity = params.length;
    this.func = func;
  }

  toString() {
    const lhs = this.params.length >= 1
      ? writeParam(this.params[0]) + " "
      : ""
    const rhs = this.params.length == 2
      ? " " + writeParam(this.params[1])
      : ""
    return `(${lhs}${this.name}${rhs} -> ${writeParam(this.returns)})`
  }

  apply(...args) {
    if (args.length > this.arity) throw new Error(`Function '${this}' takes ${this.arity} arguments, received ${args.length}.`)

    if (this.arity === 0) return this.func()

    const argsToPass = []
    const partialArgs = []

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      const param = this.params[i]

      // console.log(this.name, param, arg)

      // If arg is instance of param type
      if (checkType(param, getType(arg))) {
        argsToPass.push(arg)
        continue;
      }

      if(!(arg instanceof BrookFunction)) {
        throw new Error(`Function ${this} extected argument of type ${writeParam(param)}, received ${writeParam(getType(arg))}.`)
      }

      // If param wants a func and the arg is such a func...
      if (param.kind === "func"
          && arg.arity === param.params.length
          && arg.params.every((p, j) => checkType(param.params[j], p))
          && checkType(arg.returns, param.returns)) {
        argsToPass.push(arg)
        continue;
      }

      // Otherwise make sure that the arg returns the required type
      if(!willReturn(arg.returns, param)) {
        throw new Error(`Function ${this} extected argument of type ${writeParam(param)}, received ${writeParam(arg.returns)}.`)
      }
      
      // If the arg requires no additional params, use it.
      if (arg.arity === 0) {
        argsToPass.push(arg.apply())
        continue;
      }

      // Otherwise, we need more args
      partialArgs.push([arg.params, arg])
    }

    if (args.length < this.arity) partialArgs.push([this.params.slice(args.length), null])

    if (partialArgs.length > 0) {      
      return curry(this.func, this.returns, argsToPass, partialArgs)
    }

    return this.func(...argsToPass)
  }
}

function willReturn(func, type) {
  if (func.kind !== "func") return checkType(type, func)
  return willReturn(func.returns, type)
}

function curry(func, returnType, passedArgs, partialArgs) {
  if (partialArgs.length === 0) {
    return func(...passedArgs)
  }

  const returnsFunc = curryType(returnType, partialArgs.slice(1))
  const [requiredArgs, partialFunc] = partialArgs[0]

  return new BrookFunction("curriedFunc", requiredArgs, returnsFunc, (...nextArgs) => {
    const argsToPass = [
      ...(
        partialFunc
          ? [partialFunc.apply(...nextArgs)]
          : nextArgs
      ),
      ...passedArgs,
    ] 
    return curry(func, returnType, argsToPass, partialArgs.slice(1))
  })
}

function curryType(returnType, partialArgs) {
  if (partialArgs.length === 0) {
    return returnType
  }

  return {
    kind: "func",
    params: partialArgs[0][0],
    returns: curryType(returnType, partialArgs.slice(1))
  }
}

function checkType(p1, p2) {
  // console.log("Checking", p1, p2)
  if (p1 === null || p2 === null) return false
  if (p1.kind === "unknown" || p2.kind === "unknown") return true
  if (p1.kind === "any") return true
  if (p1.kind === "func") return p2.kind === "func" && p1.params.every((p, i) => checkType(p, p2.params[i])) && willReturn(p2, p1.returns)
  if (p1.kind === "array") return p2.kind === "array" && checkType(p1.of, p2.of)
  return p1.kind === p2.kind
}

function writeParam(param) {
  // console.log(param)
  switch(param.kind) {
    case "any":
    case "unknown":
    case "num":
    case "str":
    case "bool":
      return param.kind;
    case "array":
      return `array<${writeParam(param.of)}>`
    case "func":
      return `func(${param.params.map(writeParam).join(" ")})->${writeParam(param.returns)}`
  }
}

export function getType(value) {
  if (typeof value === "string") return { kind: "str" }
  if (typeof value === "number") return { kind: "num" }
  if (typeof value === "boolean") return { kind: "bool" }
  if (Array.isArray(value)) return { kind: "array", of: value.length ? getType(value[0]) : { kind: "unknown" } }
  if (value instanceof BrookFunction) return { kind: "func", params: value.params, returns: value.returns }
  return null
}

function writeType(arg) {
  if (typeof arg === "string") return "str"
  if (typeof arg === "number") return "num"
  if (typeof arg === "boolean") return "bool"
  if (Array.isArray(arg)) return `array<${arg.length ? writeType(arg[0]) : "unknown"}>`
  if (arg instanceof BrookFunction) return `func(${arg.params.map(writeParam).join(" ")})`
  return "unknown"
}

const BUILT_INS = (() => {
  const funcs = new Map();
  const define = (name, params, returns, func) => funcs.set(name, new BrookFunction(name, params, returns, func))
  const any = { kind: "any" }
  const unknown = { kind: "unknown" }
  const num = { kind: "num" }
  const str = { kind: "str" }
  const bool = { kind: "bool" }
  const array = (of) => ({ kind: "array", of })
  const func = (params, returns) => ({ kind: "func", params, returns })


  // Arithmetic
  define("plus",  [num, num], num, (x, y) => x + y)
  define("minus", [num, num], num, (x, y) => x - y)
  define("times", [num, num], num, (x, y) => x * y)
  define("over",  [num, num], num, (x, y) => x / y)
  define("mod",   [num, num], num, (x, y) => x % y)

  // File IO
  define("readFile", [str], str, (x) => fs.readFileSync(x).toString())

  // String Operations
  define("lines", [str], array(str), (x) => x.split(/[\n\r]+/))
  define("chars", [str], array(str), (x) => x.split(""))
  define("length", [str], num, (x) => x.length)
  define("slice", [str, num], str, (x, y) => x.slice(y))
  
  // String Parsing
  define("isDigit", [str], bool, (x) => x.length === 1 && "0123456789".includes(x))
  define("toInt",   [str], num, (x) => parseInt(x, 10))

  // Array Operations
  define(
    "range",
    [num],
    array(num),
    (x) => Array.from({ length: x }, (_, i) => i)
  )

  define(
    "map",
    [array(any), func([any], unknown)],
    array(unknown),
    (xs, f) => xs.map(x => f.apply(x)))

  define(
    "reduce",
    [array(any), func([any, any], unknown)],
    unknown,
    (xs, f) => xs.reduce((acc, cur) => f.apply(acc, cur)))

  define(
    "filter",
    [array(any), func([any], bool)],
    array(unknown),
    (xs, f) => xs.filter(x => f.apply(x)))

  define(
    "sum",
    [array(num)],
    num,
    (xs) => xs.reduce((acc, cur) => acc + cur))

  define(
    "take",
    [array(any), num],
    array(unknown),
    (xs, y) => xs.slice(0, y))

  define(
    "pick",
    [array(any), array(num)],
    array(unknown),
    (xs, ys) => ys.map(y => xs.at(y)))

  define(
    "join",
    [array(str), str],
    str,
    (xs, y) => xs.join(y))

  return funcs;
})()

export function execute(expression) {
  const context = {
    functions: BUILT_INS
  }

  return expression.evaluate(context)
}