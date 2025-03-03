import debug from 'debug'
import { access, constants, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'pathe'
import { extractImports } from './extractor.ts'
import type { Import, Mode } from './types.ts'

const log = debug('tsfix:fixer')

/**
 * Processes a file by extracting its imports, applying fixes, and writing the fixed code back to the file.
 *
 * @param filePath - The path to the file to be processed.
 * @param dependencies - The dependencies to be considered when extracting imports.
 * @param mode - The extraction mode ('regex' or 'ast').
 */
export const processFile = async (
  filePath: string | Buffer,
  dependencies: string[],
  mode: Mode = 'regex'
): Promise<void> => {
  const sourceCode = await readFile(filePath, 'utf-8')
  log('Extracting imports from file: %s using %s mode', filePath, mode)
  const dirPath = dirname(filePath.toString())
  const imports = extractImports(sourceCode, dependencies, mode)
  const fixedCode = await applyFixes(sourceCode, imports, dirPath)
  await writeFile(filePath, fixedCode)
}

/**
 * Fixes imports in the source code by applying the necessary changes.
 *
 * @param code - The original source code.
 * @param imports - An array of parsed import objects.
 * @param dirPath - The directory path of the file being processed.
 */
export const applyFixes = async (code: string, imports: Import[], dirPath: string): Promise<string> => {
  for (const i of imports) {
    if (i.type === 'absolute' || i.type === 'relative') {
      log('Processing import: %o', i)
      let fixedSpecifier: string | undefined

      if (i.specifier.endsWith('/')) {
        fixedSpecifier = `${i.specifier}index.js`
      } else if (i.extension === '.ts') {
        fixedSpecifier = i.specifier.replace('.ts', '.js')
      } else if (i.extension === null) {
        const importPath = resolve(dirPath, i.specifier)
        const stats = await stat(importPath)
        if (stats.isDirectory()) {
          fixedSpecifier = `${i.specifier}/index.js`
        } else {
          fixedSpecifier = `${i.specifier}.js`
        }
      }

      if (fixedSpecifier) {
        const importPath = resolve(dirPath, fixedSpecifier)
        log('Resolved import path: %s', importPath)

        try {
          await access(importPath, constants.F_OK)
          const quote = i.source.includes("'") ? "'" : '"'
          // biome-ignore lint/style/noParameterAssign: replace the imports if possible otherwise return the original code
          code = code.replace(`${quote}${i.specifier}${quote}`, `${quote}${fixedSpecifier}${quote}`)
          log('Fixed import specifier: %s', i.specifier)
        } catch {
          console.error('Unable to find file at import path: %s', importPath)
        }
      }
    }
  }
  return code
}
