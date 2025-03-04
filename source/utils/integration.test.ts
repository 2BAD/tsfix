/* eslint-disable vitest/no-hooks */
import debug from 'debug'
import { execa } from 'execa'
import glob from 'fast-glob'
import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { extractImportsRegex } from '../extractor.ts'
import { IMPORT_TYPE } from '../types.ts'

const log = debug('tsfix:integration-test')

type TestEnvironment = {
  testDir: string
  repoDir: string
  buildDir: string
  files: string[]
}

let regexEnv: TestEnvironment
let astEnv: TestEnvironment

/**
 * Clone and build a repository
 *
 * @param testDir - Directory to create the clone in
 * @param dirName - Name of subdirectory for this specific clone
 * @returns Object containing paths and files with imports
 */
async function prepareRepository(testDir: string, dirName: string) {
  const repoUrl = 'https://github.com/2bad/tsfix'
  const repoDir = join(testDir, dirName)
  const buildDir = join(repoDir, 'build')

  log(`Cloning repository into ${dirName}...`)
  await execa('git', ['clone', '--depth=1', '--single-branch', '--no-tags', repoUrl, repoDir])

  log(`Installing dependencies in ${dirName}...`)
  await execa('npm', ['ci'], { cwd: repoDir })

  log(`Building project in ${dirName}...`)
  await execa('npm', ['pkg', 'set', 'scripts.postbuild=echo 1'], { cwd: repoDir })
  await execa('npm', ['run', 'build'], { cwd: repoDir })

  const files = await findJsFilesWithImports(buildDir)
  expect(files.length, 'Should have JS files with imports').toBeGreaterThan(0)

  return { repoDir, buildDir, files }
}

/**
 * Setup test environments with two clones of the repository
 */
beforeAll(async () => {
  // Create single parent directory for all test environments
  const testDir = join(tmpdir(), `tsfix-test-${Date.now()}`)
  await fs.mkdir(testDir, { recursive: true })

  // Prepare two separate environments for our tests
  const regexResult = await prepareRepository(testDir, 'regex-mode')
  const astResult = await prepareRepository(testDir, 'ast-mode')

  regexEnv = {
    testDir,
    ...regexResult
  }

  astEnv = {
    testDir,
    ...astResult
  }
}, 180000) // 3 minute timeout for setup

/**
 * Clean up test environments after all tests
 */
afterAll(async () => {
  log('Cleaning up test directories...')
  try {
    // Since both environments share the same parent testDir, we only need to remove it once
    await fs.rm(regexEnv.testDir, { recursive: true, force: true })
  } catch (error) {
    log('Failed to clean up test directory: %o', error)
  }
})

/**
 * Verify imports in files have proper .js extensions
 *
 * @param files - Array of file paths with imports
 */
async function verifyImports(files: string[]) {
  let totalFiles = 0
  let filesWithImports = 0
  let totalImports = 0
  let relativeImports = 0
  let jsExtensionImports = 0

  for (const file of files) {
    totalFiles++
    const content = await fs.readFile(file, 'utf8')
    const imports = extractImportsRegex(content, [])

    if (imports.length > 0) {
      filesWithImports++
      totalImports += imports.length

      for (const importItem of imports) {
        if (importItem.type === IMPORT_TYPE.RELATIVE) {
          relativeImports++
          if (importItem.specifier.endsWith('.js')) {
            jsExtensionImports++
          }
        }
      }
    }
  }

  log('Import statistics:')
  log('- Total files scanned: %d', totalFiles)
  log('- Files with imports: %d', filesWithImports)
  log('- Total imports found: %d', totalImports)
  log('- Relative imports: %d', relativeImports)
  log('- JS extension imports: %d', jsExtensionImports)

  // Skip validation if there are no imports to check
  if (relativeImports === 0) {
    log('No relative imports found to verify')
    return
  }

  // If we have relative imports, make sure they all have .js extensions
  expect(relativeImports).toBeGreaterThan(0)
  expect(jsExtensionImports).toBe(relativeImports)
}

test('Integration test with CLI (regex mode)', async () => {
  // Verify that we have files with imports before running
  expect(regexEnv.files.length).toBeGreaterThan(0)

  // Capture the original files to verify changes were made
  const originalContents = new Map<string, string>()
  for (const file of regexEnv.files) {
    originalContents.set(file, await fs.readFile(file, 'utf8'))
  }

  log('Running tsfix CLI on build directory...')
  await execa('node', ['./bin/cli.mjs', regexEnv.buildDir], { cwd: process.cwd() })

  // Verify files were modified
  let atLeastOneFileChanged = false
  for (const file of regexEnv.files) {
    const newContent = await fs.readFile(file, 'utf8')
    if (newContent !== originalContents.get(file)) {
      atLeastOneFileChanged = true
      break
    }
  }
  expect(atLeastOneFileChanged).toBe(true)

  // Verify imports were properly processed
  await verifyImports(regexEnv.files)
})

test('Integration test with CLI (AST mode)', async () => {
  // Verify that we have files with imports before running
  expect(astEnv.files.length).toBeGreaterThan(0)

  // Capture the original files to verify changes were made
  const originalContents = new Map<string, string>()
  for (const file of astEnv.files) {
    originalContents.set(file, await fs.readFile(file, 'utf8'))
  }

  log('Running tsfix CLI on build directory with AST mode...')
  await execa('node', ['./bin/cli.mjs', astEnv.buildDir, '--mode=ast'], { cwd: process.cwd() })

  // Verify files were modified
  let atLeastOneFileChanged = false
  for (const file of astEnv.files) {
    const newContent = await fs.readFile(file, 'utf8')
    if (newContent !== originalContents.get(file)) {
      atLeastOneFileChanged = true
      break
    }
  }
  expect(atLeastOneFileChanged).toBe(true)

  // Verify imports were properly processed
  await verifyImports(astEnv.files)
})

/**
 * Finds JavaScript files with import statements
 *
 * @param dir - Directory to scan recursively for JS files with imports
 * @returns Array of file paths containing import statements
 */
async function findJsFilesWithImports(dir: string): Promise<(string | Buffer)[]> {
  const result = []
  const pattern = '**/*.js'
  const options = {
    cwd: dir,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false
  }

  log('Searching for files with pattern: %s in %s', pattern, dir)
  const stream = glob.stream(pattern, options)

  for await (const filePath of stream) {
    const content = await fs.readFile(filePath, 'utf8')
    if (content.includes('import ') || content.includes('export ')) {
      result.push(filePath)
    }
  }

  log(`Found ${result.length} JS files with imports/exports in ${dir}`)
  return result
}
