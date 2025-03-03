/* eslint-disable jsdoc/require-jsdoc */
import type { Stats } from 'node:fs'
import type fs from 'node:fs/promises'
import { access, readFile, stat, writeFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyFixes, processFile } from './processor.ts'
import type { Import } from './types.ts'

vi.mock('node:fs/promises', async (importOriginal) => {
  const original = await importOriginal<typeof fs>()
  return {
    ...original,
    access: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
    writeFile: vi.fn()
  }
})

describe('processFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should properly process the file', async () => {
    expect.assertions(2)

    const filePath = 'test.js'
    const sourceCode = 'import x from "./testFolder/x";'
    const dependencies = ['dependency1', 'dependency2']
    const fixedCode = 'import x from "./testFolder/x.js";'

    vi.mocked(readFile).mockResolvedValueOnce(sourceCode)
    vi.mocked(writeFile).mockResolvedValueOnce()
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => false } as Stats)

    await processFile(filePath, dependencies)

    expect(readFile).toHaveBeenCalledWith(filePath, 'utf-8')
    expect(writeFile).toHaveBeenCalledWith(filePath, fixedCode)
  })
})

describe('applyFixes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fix imports by replacing .ts to .js in relative import specifiers', async () => {
    expect.assertions(1)

    const code = `
      import { foo } from './bar.ts';
      import { baz } from '../qux.ts';
    `
    const imports: Import[] = [
      { source: "import { foo } from './bar.ts'", specifier: './bar.ts', type: 'relative', extension: '.ts' },
      { source: "import { baz } from '../qux.ts'", specifier: '../qux.ts', type: 'relative', extension: '.ts' }
    ]
    const dirPath = '/path/to/file'
    vi.mocked(access).mockResolvedValue()

    const result = await applyFixes(code, imports, dirPath)

    expect(result).toBe(`
      import { foo } from './bar.js';
      import { baz } from '../qux.js';
    `)
  })

  it('should fix imports by appending .js to relative import specifiers with missing extension', async () => {
    expect.assertions(1)

    const code = `
      import { foo } from './bar';
      import { baz } from '../qux';
    `
    const imports: Import[] = [
      { source: "import { foo } from './bar'", specifier: './bar', type: 'relative', extension: null },
      { source: "import { baz } from '../qux'", specifier: '../qux', type: 'relative', extension: null }
    ]
    const dirPath = '/path/to/file'
    vi.mocked(access).mockResolvedValue()
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => false } as Stats)

    const result = await applyFixes(code, imports, dirPath)

    expect(result).toBe(`
      import { foo } from './bar.js';
      import { baz } from '../qux.js';
    `)
  })

  it('should fix imports by appending .js to relative import specifiers with "js" in its path and code', async () => {
    expect.assertions(1)

    const code = `
      import ts from 'typescript-eslint'
      import * as js from './js.ts'

      const all: Linter.FlatConfig = Object.freeze({
        ...js.configs.all,
        ...ts.configs.all
      })

      export default all
    `
    const imports: Import[] = [
      { source: "import ts from 'typescript-eslint'", specifier: 'typescript-eslint', type: 'alias', extension: null },
      { source: "import * as js from './js.ts'", specifier: './js.ts', type: 'relative', extension: '.ts' }
    ]
    const dirPath = '/path/to/file'
    vi.mocked(access).mockResolvedValue()
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => false } as Stats)

    const result = await applyFixes(code, imports, dirPath)

    expect(result).toBe(`
      import ts from 'typescript-eslint'
      import * as js from './js.js'

      const all: Linter.FlatConfig = Object.freeze({
        ...js.configs.all,
        ...ts.configs.all
      })

      export default all
    `)
  })

  it('should fix imports by appending /index.js to directory import specifiers', async () => {
    expect.assertions(1)

    const code = `
      import foo from './foo/';
      import bar from '../bar/index';
    `
    const imports: Import[] = [
      { source: "import foo from './foo/'", specifier: './foo/', type: 'relative', extension: null },
      { source: "import bar from '../bar/index'", specifier: '../bar/index', type: 'relative', extension: null }
    ]
    const dirPath = '/path/to/file'
    vi.mocked(access).mockResolvedValue()

    // First call for './foo/' - it's a directory
    // Second call for '../bar/index' - it's a file
    vi.mocked(stat).mockImplementation(async (path) => {
      if (path.toString().includes('foo')) {
        return { isDirectory: () => true } as Stats
      }
      return { isDirectory: () => false } as Stats
    })

    const result = await applyFixes(code, imports, dirPath)

    expect(result).toBe(`
      import foo from './foo/index.js';
      import bar from '../bar/index.js';
    `)
  })

  it('should append /index.js if the import path is a directory', async () => {
    expect.assertions(1)

    const code = `
      import { foo } from './bar';
    `
    const imports: Import[] = [
      { source: "import { foo } from './bar'", specifier: './bar', type: 'relative', extension: null }
    ]
    const dirPath = '/path/to/file'

    vi.mocked(stat).mockResolvedValueOnce({ isDirectory: () => true } as Stats)

    const result = await applyFixes(code, imports, dirPath)

    expect(result).toBe(`
      import { foo } from './bar/index.js';
    `)
  })

  it('should log an error when the import path is not found', async () => {
    expect.assertions(2)

    const code = `
      import { foo } from './bar';
    `
    const imports: Import[] = [
      { source: "import { foo } from './bar'", specifier: './bar', type: 'relative', extension: null }
    ]
    const dirPath = '/path/to/file'
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue()

    vi.mocked(stat).mockResolvedValue({ isDirectory: () => false } as Stats)
    vi.mocked(access).mockRejectedValueOnce(new Error('File not found'))

    const result = await applyFixes(code, imports, dirPath)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to find file at import path: %s', expect.any(String))
    expect(result).toBe(code)

    consoleErrorSpy.mockRestore()
  })
})
