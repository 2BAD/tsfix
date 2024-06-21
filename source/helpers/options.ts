import type { Options, Pattern } from 'fast-glob'
import { resolve } from 'pathe'
import { findOutDir } from './tsconfig.js'

export type Args = {
  cwd?: string
  pattern?: Pattern
  extensions?: string
}

/**
 * Generates options for fast-glob.
 *
 * @param args - The args object. It can have zero or more of following properties:
 * - [cwd]: - Path to search for files. If not provided, the function will use the output directory of the TypeScript compiler.
 * - [pattern]: - The pattern to match files. If not provided, the function will use '*.{js}' as the default pattern.
 */
export const setupOptions = (args: Args): { pattern: Pattern; options: Options } => {
  const extensions = args.extensions ?? 'js'
  return {
    pattern: args.pattern ?? `*.{${extensions}}`,
    options: {
      absolute: true,
      baseNameMatch: true,
      braceExpansion: true,
      ignore: ['**/node_modules/**'],
      cwd: args.cwd ? resolve(args.cwd) : findOutDir()
    }
  }
}
