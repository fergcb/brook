import * as lexer from "./lexer.js"
import * as parser from "./parser.js"
import * as interpreter from "./interpreter.js"

function execute(source) {
  const tokens = lexer.lex(source)
  const program = parser.parse(tokens)
  const value = interpreter.execute(program)
  console.log(value)
}

function format(source) {
  const tokens = lexer.lex(source)
  const program = parser.parse(tokens)
  const out = program.map(expr => expr.write() + ";\n").join("")
  return out
}

export default {
  execute,
  format
}