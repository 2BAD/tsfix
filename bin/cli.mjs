#!/usr/bin/env node

import meow from 'meow'
import { tsFix } from '../build/tsfix.js'

const cli = meow(
  `
  Usage
    $ tsfix <path> [options]

  Options
    --extensions, -e  File extensions to process (default: js,ts)
    --pattern, -p     Glob pattern to match files against
    --mode, -m        Processing mode: regex or ast (default: regex)

  Examples
    $ tsfix
    $ tsfix ./dist
    $ tsfix --extensions=js,ts
    $ tsfix --mode=ast
`,
  {
    importMeta: import.meta,
    flags: {
      extensions: {
        type: 'string',
        shortFlag: 'e',
        default: 'js,ts'
      },
      pattern: {
        type: 'string',
        shortFlag: 'p'
      },
      mode: {
        type: 'string',
        shortFlag: 'm',
        default: 'regex'
      }
    }
  }
)

try {
  const mode = cli.flags.mode ?? 'regex'
  if (mode !== 'regex' && mode !== 'ast') {
    console.error('Error: mode must be either "regex" or "ast"')
    process.exit(1)
  }

  await tsFix({
    cwd: cli.input[0],
    extensions: cli.flags.extensions,
    pattern: cli.flags.pattern,
    mode: mode
  })
} catch (error) {
  console.error('Error processing files:', error)
}
