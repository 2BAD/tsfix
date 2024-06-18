#!/usr/bin/env node

import meow from 'meow'
import { tsFix } from '../build/index.js'

const cli = meow(
  `
  Usage
    $ tsfix [options]

  Options
    --extensions, -e  File extensions to process (default: js,ts)

  Examples
    $ tsfix --extensions=js,ts
`,
  {
    importMeta: import.meta,
    flags: {
      extensions: {
        type: 'string',
        shortFlag: 'e',
        default: 'js,ts'
      }
    }
  }
)

try {
  await tsFix(cli.flags.extensions)
  console.log('Imports fixed successfully!')
} catch (error) {
  console.error('Error processing files:', error)
}
