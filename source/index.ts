import debug from 'debug'
import glob from 'fast-glob'
import { readFile, writeFile } from 'node:fs/promises'
import { performance } from 'node:perf_hooks'
import { extractImports } from './extractor.js'
import { applyFixes } from './fixer.js'
import { getPackageDependencies } from './helpers/package.js'
import { findOutDir } from './helpers/tsconfig.js'

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
    cwd: findOutDir()
  }

  log('Searching for files with extensions: %s', extensions)
  log('Using build directory: %s', options.cwd)

  let processedFiles = 0
  const startTime = performance.now()
  const stream = glob.stream(pattern, options)

  for await (const filePath of stream) {
    const sourceCode = await readFile(filePath, 'utf-8')
    log('Extracting imports from file: %s', filePath)
    const imports = extractImports(sourceCode, dependencies)
    const fixedCode = applyFixes(sourceCode, imports)
    await writeFile(filePath, fixedCode)
    processedFiles++
  }

  const endTime = performance.now()
  const duration = (endTime - startTime).toFixed(2)
  console.log('Successfully fixed imports in %d files (%sms)', processedFiles, duration)
}
