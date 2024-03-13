import { stream } from 'fast-glob'
import { readFile, writeFile } from 'node:fs/promises'
import { fixImport } from './fixer.ts'
import { getPackageDependencies } from './helpers/package.ts'
import { findBuildDir } from './helpers/tsconfig.ts'
import { parseImports } from './parser.ts'

const dependencies = await getPackageDependencies()

const extensions = 'js,ts'
const pattern = `*.{${extensions}}`
const options = {
  absolute: true,
  baseNameMatch: true,
  braceExpansion: true,
  cwd: findBuildDir()
}

// eslint-disable-next-line vitest/require-hook
stream(pattern, options).on('data', async (filePath: string): void => {
  const content = await readFile(filePath, 'utf-8')
  const imports = parseImports(content, dependencies)
  const fixed = fixImport(content, imports)
  await writeFile(filePath, fixed)
})
