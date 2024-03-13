import { type Import } from './types.ts'

/**
 * Fixes imports by appending '.js' to relative import specifiers.
 *
 * @param code - The original source code with imports.
 * @param imports - An array of parsed imports.
 */
export const applyFixes = (code: string, imports: Import[]): string => {
  for (const i of imports) {
    if (i.type === 'absolute' || i.type === 'relative') {
      if (i.extension === '.ts') {
        // replace .ts with .js
        code = code.replace(i.specifier, i.specifier.replace('.ts', '.js'))
      } else if (i.extension === null) {
        // append .js if extension is missing
        code = code.replace(i.specifier, i.specifier + '.js')
      }
    }
  }
  return code
}
