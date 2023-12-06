#! /usr/bin/env node

import { Command } from "commander"
import fs from "fs"
import brook from "../lib/index.js"

const program = new Command()

program
  .name("brook")
  .description("CLI for the Brook programming language.")
  .version("0.1.0")

program
  .command("run")
  .description("Execute a Brook program from a source file.")
  .argument('<input-file>', "The Brook source file to execute.")
  .action((inputFile) => {
    if(!fs.existsSync(inputFile) || fs.statSync(inputFile).isDirectory()) {
      console.log(`No such source file \"${inputFile}\".`)
      process.exit(1);
    }

    const source = fs.readFileSync(inputFile).toString();

    brook.execute(source)
  })

program
  .command("fmt")
  .description("Print the fully-parenthesised form Brook program.")
  .argument('<input-file>', "The Brook source file to reformat.")
  .action((inputFile) => {
    if(!fs.existsSync(inputFile) || fs.statSync(inputFile).isDirectory()) {
      console.log(`No such source file \"${inputFile}\".`)
      process.exit(1);
    }

    const source = fs.readFileSync(inputFile).toString();

    console.log(brook.format(source))
  })

program.parse()