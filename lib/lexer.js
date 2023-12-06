const TOKENS = {
  "NUM": /^[+-]?\d+(\.\d+)?/,
  "STR": /^"((\\"|[^"])*)"/,
  "IDENT": /^[a-zA-Z][a-zA-Z0-9]*/,
  "LPAREN": "(",
  "RPAREN": ")",
  "LBRACKET": "[",
  "RBRACKET": "]",
}

export function lex(input) {
  const tokens = []

  let rest = input;

  lexOne: while (rest.length > 0) {

    rest = rest.trimStart();
    
    for (const [kind, pattern] of Object.entries(TOKENS)) {
      const match = pattern instanceof RegExp
        ? rest.match(pattern)?.[0]
        : rest.startsWith(pattern)
          ? pattern
          : null
      
      if (match) {
        tokens.push({ kind, text: match })
        rest = rest.slice(match.length)
        continue lexOne;
      }
    }

    if (rest.length > 0) throw new Error(`Failed to match token at '${rest}'`)
  }

  return tokens;
}