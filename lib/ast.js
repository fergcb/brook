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

export class FunctionCallExpression extends Expression {
  constructor(lhs, func, rhs) {
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
      : context.functions.get(this.func)
    
    if (!func) throw new Error(`No such function ${this.func}.`)

    const args = []
    if (this.lhs !== null) args.push(this.lhs.evaluate(context))
    if (this.rhs !== null) args.push(this.rhs.evaluate(context))

    return func.apply(...args)
  }
}