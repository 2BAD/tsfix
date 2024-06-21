import debug from 'debug'
import { readFile, writeFile } from 'node:fs/promises'
import { extractImports } from './extractor.js'
import { type Import } from './types.js'

const log = debug('tsfix:fixer')

/**
 * Processes a file by extracting its imports, applying fixes, and writing the fixed code back to the file.
 *
 * @param filePath - The path to the file to be processed.
 * @param dependencies - The dependencies to be considered when extracting imports.
 */
export const processFile = async (filePath: string | Buffer, dependencies: string[]): Promise<void> => {
  const sourceCode = await readFile(filePath, 'utf-8')
  log('Extracting imports from file: %s', filePath)
  const imports = extractImports(sourceCode, dependencies)
  const fixedCode = applyFixes(sourceCode, imports)
  await writeFile(filePath, fixedCode)
}

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
      // replace .ts with .js
      if (i.extension === '.ts') {
        const fixedSpecifier = i.specifier.replace('.ts', '.js')
        code = code.replace(i.specifier, fixedSpecifier)
        fixed = true
        log('Fixed extension: %s', fixedSpecifier)
      }
      // append .js if extension is missing
      else if (i.extension === null) {
        // wrap specifier in quotes to avoid appending to previously processed occurrences
        const quote = i.source.includes(`'`) ? `'` : `"`
        code = code.replace(`${quote}${i.specifier}${quote}`, `${quote}${i.specifier}.js${quote}`)
        fixed = true
        log('Appended missing ".js" to import specifier: %s', i.specifier)
      }
    }
    if (!fixed) {
      log('No fixes needed.')
    }
  }
  return code
}
