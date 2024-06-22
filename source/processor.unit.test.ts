import { readFile, writeFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyFixes, processFile } from './processor.js'
import { type Import } from './types.js'

vi.mock('node:fs/promises', () => {
  return {
    readFile: vi.fn(),
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
    const sourceCode = 'import x from "./x";'
    const dependencies = ['dependency1', 'dependency2']
    const fixedCode = 'import x from "./x.js";'

    vi.mocked(readFile).mockResolvedValueOnce(sourceCode)
    vi.mocked(writeFile).mockResolvedValueOnce()

    await processFile(filePath, dependencies)

    expect(readFile).toHaveBeenCalledWith(filePath, 'utf-8')
    expect(writeFile).toHaveBeenCalledWith(filePath, fixedCode)
  })
})

describe('applyFixes', () => {
  it('should fix imports by appending .js to relative import specifiers with .ts extension', () => {
    expect.assertions(1)
    const code = `
      import { foo } from './bar.ts';
      import { baz } from '../qux.ts';
    `
    const imports: Import[] = [
      { source: "import { foo } from './bar.ts'", specifier: './bar.ts', type: 'relative', extension: '.ts' },
      { source: "import { baz } from '../qux.ts'", specifier: '../qux.ts', type: 'relative', extension: '.ts' }
    ]

    const result = applyFixes(code, imports)

    expect(result).toBe(`
      import { foo } from './bar.js';
      import { baz } from '../qux.js';
    `)
  })

  it('should fix imports by appending .js to relative import specifiers with missing extension', () => {
    expect.assertions(1)
    const code = `
      import { foo } from './bar';
      import { baz } from '../qux';
    `
    const imports: Import[] = [
      { source: "import { foo } from './bar'", specifier: './bar', type: 'relative', extension: null },
      { source: "import { baz } from '../qux'", specifier: '../qux', type: 'relative', extension: null }
    ]

    const result = applyFixes(code, imports)

    expect(result).toBe(`
      import { foo } from './bar.js';
      import { baz } from '../qux.js';
    `)
  })

  it('should fix imports by appending .js to relative import specifiers with "js" in its path', () => {
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
      {
        source: "import ts from 'typescript-eslint'",
        specifier: 'typescript-eslint',
        type: 'alias',
        extension: null
      },
      {
        source: "import * as js from './js.ts'",
        specifier: './js.ts',
        type: 'relative',
        extension: '.ts'
      }
    ]

    const result = applyFixes(code, imports)

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

  it('should fix imports by appending .js to directory import specifiers', () => {
    expect.assertions(1)
    const code = `
      import foo from './foo/';
      import bar from '../bar/index';
    `
    const imports: Import[] = [
      { source: "import foo from './foo'", specifier: './foo/', type: 'relative', extension: null },
      { source: "import bar from '../bar/index'", specifier: '../bar/index', type: 'relative', extension: null }
    ]

    const result = applyFixes(code, imports)

    expect(result).toBe(`
      import foo from './foo/index.js';
      import bar from '../bar/index.js';
    `)
  })
})
