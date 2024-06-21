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

  Examples
    $ tsfix
    $ tsfix ./dist
    $ tsfix --extensions=js,ts
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
      }
    }
  }
)

try {
  await tsFix({ cwd: cli.input[0], extensions: cli.flags.extensions, pattern: cli.flags.pattern })
} catch (error) {
  console.error('Error processing files:', error)
}
