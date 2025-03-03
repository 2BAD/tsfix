import type { Options, Pattern } from 'fast-glob'
import { resolve } from 'pathe'
import { findOutDir } from './tsconfig.ts'

export type Mode = 'regex' | 'ast'

export type Args = {
  cwd?: string
  pattern?: Pattern
  extensions?: string
  mode?: Mode
}

/**
 * Generates options for fast-glob.
 *
 * @param args - The args object. It can have zero or more of following properties:
 * - [cwd]: - Path to search for files. If not provided, the function will use the output directory of the TypeScript compiler.
 * - [pattern]: - The pattern to match files. If not provided, the function will use '*.{js}' as the default pattern.
 * - [extensions]: - File extensions to process. If not provided, defaults to 'js'.
 * - [mode]: - Processing mode ('regex' or 'ast'). If not provided, defaults to 'regex'.
 */
export const setupOptions = (args: Args): { pattern: Pattern; options: Options; mode: Mode } => {
  const extensions = args.extensions ?? 'js'
  return {
    pattern: args.pattern ?? `*.{${extensions}}`,
    mode: args.mode ?? 'regex',
    options: {
      absolute: true,
      baseNameMatch: true,
      braceExpansion: true,
      ignore: ['**/node_modules/**'],
      cwd: args.cwd ? resolve(args.cwd) : findOutDir()
    }
  }
}
