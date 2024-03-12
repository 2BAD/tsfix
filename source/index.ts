import glob from 'fast-glob'
import { readFile, writeFile } from 'node:fs/promises'
import { fixImport } from './fixer.ts'
import { findPackageJson, getPackageDependencies } from './helpers/package.ts'
import { findBuildDir } from './helpers/tsconfig.ts'
import { parseImports } from './parser.ts'

const packageJsonPath = findPackageJson()
const dependencies = packageJsonPath ? await getPackageDependencies(packageJsonPath) : []

const extensions = 'js,ts'
const pattern = `*.{${extensions}}`
const options = {
  absolute: true,
  baseNameMatch: true,
  braceExpansion: true,
  cwd: findBuildDir()
}

// eslint-disable-next-line vitest/require-hook
glob.stream(pattern, options).on('data', async (filePath: string): void => {
  const content = await readFile(filePath, 'utf-8')
  const imports = parseImports(content, dependencies)
  const fixed = fixImport(content, imports)
  await writeFile(filePath, fixed)
})
