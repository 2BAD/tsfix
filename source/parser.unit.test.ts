import { describe, expect, it } from 'vitest'
import { detectFileExtension, detectSpecifierType, extractSpecifier, parseImports } from './parser.ts'

describe('parseImports', () => {
  const dependencies = ['react', 'lodash']

  it('should return an empty array when there are no import statements', () => {
    expect.assertions(1)
    const code = ''
    expect(parseImports(code, dependencies)).toStrictEqual([])
  })

  it('should correctly parse single import statement with a package specifier', () => {
    expect.assertions(1)
    const code = "import { React } from 'react'"
    const expected = [
      {
        import: "import { React } from 'react'",
        specifier: 'react',
        type: 'package',
        extension: null
      }
    ]
    expect(parseImports(code, dependencies)).toStrictEqual(expected)
  })

  it('should correctly parse multiple import statements with different specifiers', () => {
    expect.assertions(1)
    const code = `
    import { React } from 'react'
    import { debounce } from 'lodash'
    import Foo from './components/Foo'
    import Bar from '/components/Bar'
    `

    const expected = [
      {
        import: "import { React } from 'react'",
        specifier: 'react',
        type: 'package',
        extension: null
      },
      {
        import: "import { debounce } from 'lodash'",
        specifier: 'lodash',
        type: 'package',
        extension: null
      },
      {
        import: "import Foo from './components/Foo'",
        specifier: './components/Foo',
        type: 'relative',
        extension: null
      },
      {
        import: "import Bar from '/components/Bar'",
        specifier: '/components/Bar',
        type: 'absolute',
        extension: null
      }
    ]

    expect(parseImports(code, dependencies)).toStrictEqual(expected)
  })

  describe('should correctly parse valid imports', () => {
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
      expect(parseImports(input, [])[0]?.specifier).toBe(expected)
    })
  })
  describe('should correctly parse valid imports with extra symbols', () => {
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
      expect(parseImports(input, [])[0]?.specifier).toBe(expected)
    })
  })

  describe('should correctly parse multiple imports statements', () => {
    const validInputs: Array<{ input: string; expected: string[] }> = [
      {
        input: `
        import {
          Component
        } from '@angular2/core'
        import   *    as    name   from     "module-name"   `,
        expected: ['@angular2/core', 'module-name']
      }
    ]

    it.each(validInputs)('%j', ({ input, expected }) => {
      expect.assertions(3)
      const result = parseImports(input, [])
      expect(result).toHaveLength(2)
      expect(result[0]?.specifier).toBe(expected[0])
      expect(result[1]?.specifier).toBe(expected[1])
    })
  })

  describe('should correctly parse valid dynamic import', () => {
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
      expect(parseImports(input, [])[0]?.specifier).toBe(expected)
    })
  })
})

describe('extractSpecifier', () => {
  it('should return null for import statement without a specifier', () => {
    expect.assertions(1)
    const statement = 'import { React } from ""'

    expect(extractSpecifier(statement)).toBeNull()
  })

  it('should correctly extract the specifier from an import statement', () => {
    expect.assertions(1)
    const statement = 'import Foo from "./components/Foo"'
    const expected = {
      import: 'import Foo from "./components/Foo"',
      specifier: './components/Foo'
    }

    expect(extractSpecifier(statement)).toStrictEqual(expected)
  })
})

describe('detectSpecifierType', () => {
  it('should correctly detect a package specifier', () => {
    expect.assertions(1)
    const dependencies = ['react']
    const parsedImport = {
      import: 'import { React } from "react"',
      specifier: 'react'
    }
    const expected = {
      import: 'import { React } from "react"',
      specifier: 'react',
      type: 'package'
    }

    expect(detectSpecifierType(dependencies)(parsedImport)).toStrictEqual(expected)
  })
})

describe('detectFileExtension', () => {
  it('should correctly detect the file extension of a specifier', () => {
    expect.assertions(1)
    const parsedImport = {
      import: 'import Foo from "./components/Foo.js"',
      specifier: './components/Foo.js',
      type: 'relative'
    } as const

    expect(detectFileExtension(parsedImport).extension).toBe('.js')
  })
})