import debug from 'debug'
import { access, constants, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'pathe'
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
  const dirPath = dirname(filePath.toString())
  const imports = extractImports(sourceCode, dependencies)
  const fixedCode = await applyFixes(sourceCode, imports, dirPath)
  await writeFile(filePath, fixedCode)
}

/**
 * Fixes imports in the source code by applying the necessary changes.
 *
 * @param code - The original source code.
 * @param imports - An array of parsed import objects.
 */
export const applyFixes = async (code: string, imports: Import[], dirPath: string): Promise<string> => {
  for (const i of imports) {
    log('Processing import: %o', i)
    if (i.type === 'absolute' || i.type === 'relative') {
      // append "index.js" for folder imports
      if (i.specifier.endsWith('/')) {
        const fixedSpecifier = `${i.specifier}index.js`
        const importPath = resolve(dirPath, fixedSpecifier)
        log('Resolved import path: %s', importPath)
        try {
          await access(importPath, constants.F_OK)
          code = code.replace(i.specifier, fixedSpecifier)
          log('Appended missing "index.js" to import specifier: %s', i.specifier)
        } catch (error) {
          console.error('File not found: %s', importPath)
        }
      }

      // replace .ts with .js
      if (i.extension === '.ts') {
        const fixedSpecifier = i.specifier.replace('.ts', '.js')
        const importPath = resolve(dirPath, fixedSpecifier)
        log('Resolved import path: %s', importPath)
        try {
          await access(importPath, constants.F_OK)
          code = code.replace(i.specifier, fixedSpecifier)
          log('Fixed extension: %s', fixedSpecifier)
        } catch (error) {
          console.error('File not found: %s', importPath)
        }
      }

      // append .js if extension is missing
      else if (i.extension === null) {
        // wrap specifier in quotes to avoid appending to previously processed occurrences
        const quote = i.source.includes(`'`) ? `'` : `"`

        const fixedSpecifier = `${i.specifier}.js`
        const importPath = resolve(dirPath, fixedSpecifier)
        log('Resolved import path: %s', importPath)

        try {
          await access(importPath, constants.F_OK)
          code = code.replace(`${quote}${i.specifier}${quote}`, `${quote}${fixedSpecifier}${quote}`)
          log('Appended missing ".js" to import specifier: %s', i.specifier)
        } catch (error) {
          log('File not found: %s', importPath)
        }
      }
    }
  }
  return code
}
