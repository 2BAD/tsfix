import debug from 'debug'
import { execa } from 'execa'
import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { extractImportsRegex } from '../extractor.ts'
import { IMPORT_TYPE } from '../types.ts'

const log = debug('tsfix:integration-test')

test('Integration test with real code', async () => {
  const testDir = join(tmpdir(), `tsfix-test-${Date.now()}`)
  await fs.mkdir(testDir, { recursive: true })

  const repoUrl = 'https://github.com/2bad/tsfix'
  const repoDir = join(testDir, 'tsfix')
  const buildDir = join(repoDir, 'build')

  try {
    log('Cloning repository...')
    await execa('git', ['clone', '--depth=1', '--single-branch', '--no-tags', repoUrl, repoDir])

    log('Installing dependencies...')
    await execa('npm', ['ci'], { cwd: repoDir })

    log('Building project...')
    await execa('npm', ['pkg', 'set', 'scripts.postbuild=echo 1'], { cwd: repoDir })
    await execa('npm', ['run', 'build'], { cwd: repoDir })

    const beforeFiles = await findJsFilesWithImports(buildDir)
    expect(beforeFiles.length, 'Should have JS files with imports').toBeGreaterThan(0)

    log('Running tsfix on build directory...')
    await execa('node', ['./bin/cli.mjs', buildDir], { cwd: process.cwd() })

    const afterFiles = await findJsFilesWithImports(buildDir)

    for (const file of afterFiles) {
      const content = await fs.readFile(file, 'utf8')
      const imports = extractImportsRegex(content, [])
      for (const importItem of imports) {
        if (importItem.type === IMPORT_TYPE.RELATIVE) {
          expect(importItem.specifier).toMatch(/\.js$/)
        }
      }
    }
  } finally {
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      log('Failed to clean up test directory: %o', error)
    }
  }
})

/**
 * Finds JavaScript files with import statements.
 *
 * @param dir - Directory to scan recursively for JS files with imports
 * @returns Array of file paths containing import statements
 */
async function findJsFilesWithImports(dir: string): Promise<string[]> {
  const result: string[] = []

  /**
   * Recursively scans a directory for JS files with imports.
   *
   * @param directory - Directory to scan
   */
  async function scan(directory: string) {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(directory, entry.name)

      if (entry.isDirectory()) {
        await scan(fullPath)
      } else if (entry.name.endsWith('.js')) {
        const content = await fs.readFile(fullPath, 'utf8')
        if (content.includes('import ')) {
          result.push(fullPath)
        }
      }
    }
  }

  await scan(dir)
  return result
}
