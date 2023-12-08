import { ArrayExpression, FunctionCallExpression, LiteralExpression } from "./ast.js";

export function parse(tokens) {
  tokens.reverse()
  const [match, rest] = parseExpression(tokens)
  if (match === null) throw new Error("Failed to parse expression.")
  if (rest.length > 0) throw new Error("Unconsumed tokens.")
  
  return match;
}

function parseIdent(tokens) {
  if (tokens.length === 0) return [null, tokens]
  const tok = tokens[0]
  if (tok.kind === "IDENT") {
    return [tok.text, tokens.slice(1)]
  }
  return [null, tokens]
}

function parseNum(tokens) {
  if (tokens.length === 0) return [null, tokens]
  const tok = tokens[0]
  if (tok.kind === "NUM") {
    return [parseFloat(tok.text), tokens.slice(1)]
  }
  return [null, tokens]
}

function parseStr(tokens) {
  if (tokens.length === 0) return [null, tokens]
  const tok = tokens[0]
  if (tok.kind === "STR") {
    return [tok.text.slice(1, -1), tokens.slice(1)]
  }
  return [null, tokens]
}

function parseLiteral(tokens) {
  if (tokens.length === 0) return [null, tokens]

  let [match, rest] = parseNum(tokens)
  if (match !== null) return [new LiteralExpression(match), rest]
  ; [match, rest] = parseStr(tokens)
  if (match !== null) return [new LiteralExpression(match), rest]
  return [null, tokens]
}

function parseFunc(tokens) {
  let [func, rest] = parseParenExpression(tokens)
  if (func !== null) return [func, rest];
  ; [func, rest] = parseIdent(tokens)
  if (func !== null) return [func, rest];
  return [null, tokens];
}

function parseNullaryFunctionCall(tokens) {
  let [func, rest] = parseFunc(tokens)
  if (func === null) return [null, tokens]

  return [new FunctionCallExpression(null, func, null), rest]
}

function parseUnaryFunctionCall(tokens) {
  let func, lhs
  let rest = tokens

  ; [func, rest] = parseFunc(rest)
  if (func === null) return [null, tokens]
  
  ; [lhs, rest] = parseExpression(rest)
  if (lhs === null) return [null, tokens]
  
  return [new FunctionCallExpression(lhs, func, null), rest]
}

function parseBinaryFunctionCall(tokens) {
  let rhs, func, lhs
  let rest = tokens

  ; [rhs, rest] = parseRHS(rest)
  if (rhs === null) return [null, tokens]

  ; [func, rest] = parseFunc(rest)
  if (func === null) return [null, tokens]

  ; [lhs, rest] = parseExpression(rest)
  if (lhs === null) return [null, tokens]

  return [new FunctionCallExpression(lhs, func, rhs), rest]
}

function parseParenExpression(tokens) {
  if (tokens[0]?.kind !== "RPAREN") return [null, tokens]
  
  const [expr, rest] = parseExpression(tokens.slice(1))
  if (expr === null) return [null, tokens]

  if (rest[0].kind !== "LPAREN") return [null, tokens]

  return [expr, rest.slice(1)]
}

function parseRHS(tokens) {
  let [match, rest] = parseLiteral(tokens)
  if (match !== null) return [match, rest]
  ; [match, rest] = parseParenExpression(tokens)
  if (match !== null) return [match, rest]
  ; [match, rest] = parseArray(tokens)
  if (match !== null) return [match, rest]
  return [null, tokens]
}

function parseArray(tokens) {
  if (tokens[0]?.kind !== "RBRACKET") return [null, tokens]

  const members = []
  let match = null
  let rest = tokens.slice(1)
  do {
    ; [match, rest] = parseExpression(rest)
    if (match !== null) members.unshift(match)
  } while (match !== null)

  if (rest[0].kind !== "LBRACKET") return [null, tokens]

  return [new ArrayExpression(members), rest.slice(1)]
}

function parseExpression(tokens) {
  let [match, rest] = parseBinaryFunctionCall(tokens)
  if (match !== null) return [match, rest]

  ; [match, rest] = parseUnaryFunctionCall(tokens)
  if (match !== null) return [match, rest]

  ; [match, rest] = parseNullaryFunctionCall(tokens)
  if (match !== null) return [match, rest]

  ; [match, rest] = parseLiteral(tokens)
  if (match !== null) return [match, rest]

  ; [match, rest] = parseArray(tokens)
  if (match !== null) return [match, rest]

  ; [match, rest] = parseParenExpression(tokens)
  if (match !== null) return [match, rest]

  return [null, tokens]
}