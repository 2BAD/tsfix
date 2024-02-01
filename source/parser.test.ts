import { describe, expect, it } from 'vitest'
import { parseImports } from './parser.ts'

describe('parse valid imports', () => {
  const validInputs: Array<{ input: string; expected: string }> = [
    {
      input: 'import defaultExport from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import { namedExport } from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import { one, two } from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import { reallyReallyLongModuleExportName as shortName } from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import { "a-b" as a } from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import myDefault, * as myModule from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import myDefault, { foo, bar } from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import { default as myDefault } from "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import "module-name";',
      expected: 'module-name'
    },
    {
      input: 'import "/modules/my-module";',
      expected: '/modules/my-module'
    },
    {
      input: 'import "./modules/my-module";',
      expected: './modules/my-module'
    },
    {
      input: 'import "../../modules/my-module";',
      expected: '../../modules/my-module'
    },
    {
      input: 'import "/modules/my-module.js";',
      expected: '/modules/my-module.js'
    },
    {
      input: 'import "/modules/my-module.ts";',
      expected: '/modules/my-module.ts'
    },
    {
      input: 'import "/modules/my-module.ts";',
      expected: '/modules/my-module.ts'
    },
    {
      input: 'import "/modules/my-module.ts";',
      expected: '/modules/my-module.ts'
    }
  ]

  it.each(validInputs)('%j', ({ input, expected }) => {
    expect.assertions(1)
    expect(parseImports(input)[0]?.specifier).toBe(expected)
  })
})
describe('parse valid imports with extra', () => {
  const validInputs: Array<{ input: string; expected: string }> = [
    {
      input: `
        import {
          Component
        } from '@angular2/core'`,
      expected: '@angular2/core'
    },
    {
      input: 'import   *    as    name   from     "module-name"   ',
      expected: 'module-name'
    }
  ]

  it.each(validInputs)('%j', ({ input, expected }) => {
    expect.assertions(1)
    expect(parseImports(input)[0]?.specifier).toBe(expected)
  })
})
describe('parse valid dynamic import', () => {
  const validInputs: Array<{ input: string; expected: string }> = [
    {
      input: `import('/my-module.js')`,
      expected: '/my-module.js'
    },
    {
      input: 'import("/my-module.js")',
      expected: '/my-module.js'
    },
    {
      input: 'import("/my-module.js").then(console.log)',
      expected: '/my-module.js'
    }
  ]

  it.each(validInputs)('%j', ({ input, expected }) => {
    expect.assertions(1)
    expect(parseImports(input)[0]?.specifier).toBe(expected)
  })
})
