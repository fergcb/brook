import { BrookFunction } from "./interpreter.js";

class Expression {
  constructor() {
    if (this.constructor == Expression) {
      throw new Error("Expression is an abstract class and cannot be instantiated.");
    }
  }

  write() {
    throw new Error("Abstract method not implemented.")
  }

  evaluate(context) {
    throw new Error("Abstract method not implemented.")
  }
}

export class LiteralExpression extends Expression {
  constructor(value) {
    super()
    this.value = value;
  }

  write() {
    return JSON.stringify(this.value)
  }

  evaluate(context) {
    return this.value;
  }
}

export class ArrayExpression extends Expression {
  constructor(members) {
    super()
    this.members = members;
  }

  write() {
    const contents = this.members.map(m => m.write()).join(" ")
    return `[${contents}]`
  }

  evaluate(context) {
    return this.members.map(m => m.evaluate(context))
  }
}

export class AssignmentExpression extends Expression {
  constructor(name, expr) {
    super()
    this.name = name;
    this.expr = expr;
  }

  write() {
    return `(${this.name} <- ${this.expr.write()})`
  }

  evaluate(context) {
    const value = this.expr.evaluate(context)
    context.symbols.set(this.name, value)
    return value
  }
}

export class FunctionCallExpression extends Expression {
  constructor(lhs, func, rhs) {
    super()
    this.lhs = lhs;
    this.func = func;
    this.rhs = rhs;
  }

  write() {
    let str = ""
    if (this.lhs !== null) str += this.lhs.write() + " "
    str += this.func instanceof FunctionCallExpression ? this.func.write() : this.func
    if (this.rhs !== null) str += " " + this.rhs.write()
    return "(" + str + ")"
  }

  evaluate(context) {
    const func = this.func instanceof FunctionCallExpression
      ? this.func.evaluate(context)
      : context.symbols.get(this.func)
    
    if (!func) throw new Error(`No such function ${this.func}.`)
    if (!(func instanceof BrookFunction)) {
      if (this.lhs || this.rhs) throw new Error(`${this.func} is not a function, so cannot be called like ${this.write()}.`)
      return func;
    }

    const args = []
    if (this.lhs !== null) args.push(this.lhs.evaluate(context))
    if (this.rhs !== null) args.push(this.rhs.evaluate(context))

    return func.apply(...args)
  }
}