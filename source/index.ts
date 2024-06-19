import debug from 'debug'
import glob from 'fast-glob'
import { readFile, writeFile } from 'node:fs/promises'
import { extractImports } from './extractor.ts'
import { applyFixes } from './fixer.ts'
import { getPackageDependencies } from './helpers/package.ts'
import { findBuildDir } from './helpers/tsconfig.ts'

const log = debug('tsfix:main')

/**
 * Fixes import statements in compiled files.
 *
 * @param extensions - A comma-separated list of file extensions to fix.
 */
export const tsFix = async (extensions: string): Promise<void> => {
  const dependencies = await getPackageDependencies()

  const pattern = `*.{${extensions}}`

  const options = {
    absolute: true,
    baseNameMatch: true,
    braceExpansion: true,
    cwd: findBuildDir()
  }

  log('Searching for files with extensions: %s', extensions)
  log('Using build directory: %s', options.cwd)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  glob.stream(pattern, options).on('data', async (filePath: string): Promise<void> => {
    const sourceCode = await readFile(filePath, 'utf-8')
    log('Extracting imports from file: %s', filePath)
    const imports = extractImports(sourceCode, dependencies)
    const fixedCode = applyFixes(sourceCode, imports)
    log('Fixed imports in file: %s', filePath)
    await writeFile(filePath, fixedCode)
  })
}
