import { describe, expect, it } from 'vitest'
import { applyFixes } from './fixer.ts'
import { type Import } from './types.ts'

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

  it('should fix imports by appending .js to relative import specifiers with .js extension', () => {
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
})
