import { type ParsedImport } from './types.ts'

/**
 * Fixes imports by appending '.js' to relative import specifiers.
 *
 * @param code - The original source code with imports.
 * @param imports - An array of parsed imports.
 */
export const fixImport = (code: string, imports: ParsedImport[]): string => {
  for (const i of imports) {
    console.log(i.specifier)
    if ((i.type === 'absolute' || i.type === 'relative') && i.extension === '.ts') {
      code = code.replace(i.specifier, i.specifier.replace('.ts', '.js'))
    }
  }
  return code
}
