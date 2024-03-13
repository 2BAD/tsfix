import { stream } from 'fast-glob'
import { readFile, writeFile } from 'node:fs/promises'
import { extractImports } from './extractor.ts'
import { applyFixes } from './fixer.ts'
import { getPackageDependencies } from './helpers/package.ts'
import { findBuildDir } from './helpers/tsconfig.ts'

const dependencies = await getPackageDependencies()

const extensions = 'js,ts'
const pattern = `*.{${extensions}}`
const options = {
  absolute: true,
  baseNameMatch: true,
  braceExpansion: true,
  cwd: findBuildDir()
}

// @ts-expect-error should be fixed later
// eslint-disable-next-line vitest/require-hook
stream(pattern, options).on('data', async (filePath: string): void => {
  const sourceCode = await readFile(filePath, 'utf-8')
  const imports = extractImports(sourceCode, dependencies)
  const fixedCode = applyFixes(sourceCode, imports)
  await writeFile(filePath, fixedCode)
})
