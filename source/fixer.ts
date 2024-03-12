import { type ParsedImport } from './types.ts'

/**
 * Fixes imports by appending '.js' to relative import specifiers.
 *
 * @param code - The original source code with imports.
 * @param imports - An array of parsed imports.
 */
export const fixImport = (code: string, imports: ParsedImport[]): string => {
  for (const i of imports) {
    if (i.type === 'relative') {
      code = i.extension === '.ts' ? code.replace(i.specifier, i.specifier.substring(0, i.specifier.length - 3)) : code
      i.specifier = i.specifier.replace(i.extension ?? '.ts', '')
      code = code.replace(i.specifier, i.specifier + '.js')
    }
  }
  return code
}
