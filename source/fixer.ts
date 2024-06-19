import debug from 'debug'
import { type Import } from './types.ts'

const log = debug('tsfix:fixer')

/**
 * Fixes imports by appending '.js' to relative import specifiers.
 *
 * @param code - The original source code with imports.
 * @param imports - An array of parsed imports.
 */
export const applyFixes = (code: string, imports: Import[]): string => {
  for (const i of imports) {
    let fixed = false
    log('Processing import: %o', i)
    if (i.type === 'absolute' || i.type === 'relative') {
      if (i.extension === '.ts') {
        // replace .ts with .js
        const fixedSpecifier = i.specifier.replace('.ts', '.js')
        code = code.replace(i.specifier, fixedSpecifier)
        fixed = true
        log('Fixed extension: %s', fixedSpecifier)
      } else if (i.extension === null) {
        // append .js if extension is missing
        code = code.replace(i.specifier, i.specifier + '.js')
        fixed = true
        log('Appended missing ".js" to import specifier: %s', i.specifier)
      }
    }
    if (!fixed) {
      log('No fixes needed for import: %o', i)
    }
  }
  return code
}
