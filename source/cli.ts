import { tsFix } from './tsfix.ts'
import type { Args, Mode } from './types.ts'

type Flags = {
  extensions: string
  pattern?: string | undefined
  mode: string
  help?: boolean | undefined
  [key: string]: string | boolean | undefined
}

type ParsedArgs = {
  flags: Flags
  input: string[]
}

/**
 * Parse command-line arguments
 */
export const parseArgs = (): ParsedArgs => {
  const args = process.argv.slice(2)
  const input: string[] = []
  const flags: Flags = {
    extensions: 'js,ts',
    pattern: undefined,
    mode: 'regex'
  }

  if (args.length === 0) {
    return { flags, input }
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg) {
      continue
    }

    if (arg.startsWith('--')) {
      // Handle long flags with values (--key=value or --key value)
      if (arg.includes('=')) {
        const [key, value] = arg.slice(2).split('=')
        if (key && key in flags) {
          flags[key] = value
        }
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
      const shortFlagMap: Record<string, string> = {
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

/**
 * Display help information
 */
export const showHelp = (): void => {
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

/**
 * Run the CLI
 */
export const run = async (): Promise<void> => {
  try {
    const { flags, input } = parseArgs()

    if (flags.help || flags['h']) {
      showHelp()
    }

    const mode = flags.mode ?? 'regex'
    if (mode !== 'regex' && mode !== 'ast') {
      throw Error('Error: mode must be either "regex" or "ast"')
    }

    await tsFix({
      cwd: input[0],
      extensions: flags.extensions,
      pattern: flags.pattern,
      mode: mode as Mode
    } as Args)
  } catch (error) {
    console.error('Error processing files:', error)
  }
}
