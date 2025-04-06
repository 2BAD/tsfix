import { describe, expect, it } from 'vitest'
import { detectFileExtension, detectSpecifierType, extractImports, extractSpecifier } from './extractor.ts'

describe('extractImports', () => {
  const dependencies = ['react', 'lodash']

  it('should return an empty array when there are no import statements', () => {
    expect.assertions(1)

    const code = ''

    expect(extractImports(code, dependencies)).toStrictEqual([])
  })

  it('should correctly extract single import statement with a package specifier', () => {
    expect.assertions(1)

    const code = "import { React } from 'react'"
    const expected = [
      {
        source: "import { React } from 'react'",
        specifier: 'react',
        type: 'package',
        extension: null
      }
    ]

    expect(extractImports(code, dependencies)).toStrictEqual(expected)
  })

  it('should correctly extract multiple import statements with different specifiers', () => {
    expect.assertions(1)

    const code = `
    import { React } from 'react'
    import { debounce } from 'lodash'
    import Foo from './components/Foo'
    import Bar from '/components/Bar'
    import fs from 'node:fs'
    import * as js from './js.js'
    import * as js from './js.ts'
    `

    const expected = [
      {
        source: "import { React } from 'react'",
        specifier: 'react',
        type: 'package',
        extension: null
      },
      {
        source: "import { debounce } from 'lodash'",
        specifier: 'lodash',
        type: 'package',
        extension: null
      },
      {
        source: "import Foo from './components/Foo'",
        specifier: './components/Foo',
        type: 'relative',
        extension: null
      },
      {
        source: "import Bar from '/components/Bar'",
        specifier: '/components/Bar',
        type: 'absolute',
        extension: null
      },
      {
        source: "import fs from 'node:fs'",
        specifier: 'node:fs',
        type: 'builtin',
        extension: null
      },
      {
        source: "import * as js from './js.js'",
        specifier: './js.js',
        type: 'relative',
        extension: '.js'
      },
      {
        source: "import * as js from './js.ts'",
        specifier: './js.ts',
        type: 'relative',
        extension: '.ts'
      }
    ]

    expect(extractImports(code, dependencies)).toStrictEqual(expected)
  })

  describe('should correctly extract valid imports', () => {
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
      },
      {
        input: "import * as js from './js.js'",
        expected: './js.js'
      },
      {
        input: 'import type { Props } from "./components/types";',
        expected: './components/types'
      },
      {
        input: 'import type { User, Role } from "/models/user";',
        expected: '/models/user'
      },
      {
        input: 'export type { Config } from "./config";',
        expected: './config'
      },
      {
        input: 'export type { APIResponse } from "@/api/types";',
        expected: '@/api/types'
      }
    ]

    it.each(validInputs)('%j', ({ input, expected }) => {
      expect.assertions(1)

      expect(extractImports(input, [])[0]?.specifier).toBe(expected)
    })
  })
  describe('should correctly extract valid imports with extra symbols', () => {
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

      expect(extractImports(input, [])[0]?.specifier).toBe(expected)
    })
  })

  describe('should correctly extract multiple imports statements', () => {
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

      const result = extractImports(input, [])

      expect(result).toHaveLength(2)
      expect(result[0]?.specifier).toBe(expected[0])
      expect(result[1]?.specifier).toBe(expected[1])
    })
  })

  describe('should correctly extract valid dynamic import', () => {
    const validInputs: Array<{ input: string; expected: string }> = [
      {
        input: "import('/my-module.js')",
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

      expect(extractImports(input, [])[0]?.specifier).toBe(expected)
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
      source: 'import Foo from "./components/Foo"',
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
      source: 'import { React } from "react"',
      specifier: 'react'
    }
    const expected = {
      source: 'import { React } from "react"',
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
      source: 'import Foo from "./components/Foo.js"',
      specifier: './components/Foo.js',
      type: 'relative'
    } as const

    expect(detectFileExtension(parsedImport).extension).toBe('.js')
  })
})
