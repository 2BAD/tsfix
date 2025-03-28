#!/usr/bin/env node

import { tsFix } from '../build/tsfix.js'

const parseArgs = () => {
  const args = process.argv.slice(2)
  const input = []
  const flags = {
    extensions: 'js,ts',
    pattern: undefined,
    mode: 'regex'
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith('--')) {
      // Handle long flags with values (--key=value or --key value)
      if (arg.includes('=')) {
        const [key, value] = arg.slice(2).split('=')
        flags[key] = value
      } else {
        const key = arg.slice(2)
        const nextArg = args[i + 1]
        if (nextArg && !nextArg.startsWith('-')) {
          flags[key] = nextArg
          i++ // Skip the next argument as it's the value
        } else {
          flags[key] = true
        }
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1)
      const shortFlagMap = {
        e: 'extensions',
        p: 'pattern',
        m: 'mode',
        h: 'help'
      }

      const longKey = shortFlagMap[key]
      if (longKey) {
        const nextArg = args[i + 1]
        if (nextArg && !nextArg.startsWith('-')) {
          flags[longKey] = nextArg
          i++ // Skip the next argument as it's the value
        } else {
          flags[longKey] = true
        }
      }
    } else {
      // It's a positional argument
      input.push(arg)
    }
  }

  return { flags, input }
}

const showHelp = () => {
  console.log(`
  Usage
    $ tsfix <path> [options]

  Options
    --extensions, -e  File extensions to process (default: js,ts)
    --pattern, -p     Glob pattern to match files against
    --mode, -m        Processing mode: regex or ast (default: regex)
    --help, -h        Show this help message

  Examples
    $ tsfix
    $ tsfix ./dist
    $ tsfix --extensions=js,ts
    $ tsfix --mode=ast
  `)
}

try {
  const { flags, input } = parseArgs()

  if (flags.help || flags.h) {
    showHelp()
    process.exit(0)
  }

  const mode = flags.mode ?? 'regex'
  if (mode !== 'regex' && mode !== 'ast') {
    console.error('Error: mode must be either "regex" or "ast"')
    process.exit(1)
  }

  await tsFix({
    cwd: input[0],
    extensions: flags.extensions,
    pattern: flags.pattern,
    mode: mode
  })
} catch (error) {
  console.error('Error processing files:', error)
}
