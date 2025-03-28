// biome-ignore lint/style/noNamespaceImport: needed for mocking
import * as typescript from 'typescript'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findOutDir, getPathAliases, loadTSConfig } from './tsconfig.ts'

vi.mock('typescript', async () => {
  const actual = await vi.importActual('typescript')
  return {
    ...actual,
    findConfigFile: vi.fn(),
    readConfigFile: vi.fn(),
    parseJsonConfigFileContent: vi.fn(),
    sys: {
      fileExists: vi.fn(),
      readFile: vi.fn()
    }
  }
})

describe('tsconfig', () => {
  // eslint-disable-next-line vitest/no-hooks
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(typescript.findConfigFile).mockReturnValue('/test/tsconfig.json')
    vi.mocked(typescript.readConfigFile).mockReturnValue({ config: {} })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('loadTSConfig', () => {
    it('loads and parses tsconfig file', () => {
      const mockParsedConfig = { fileNames: [], errors: [], options: { outDir: 'dist' } }
      vi.mocked(typescript.parseJsonConfigFileContent).mockReturnValue(mockParsedConfig)

      const result = loadTSConfig()

      expect(result).toEqual({
        tsconfigPath: '/test/tsconfig.json',
        parsedConfig: mockParsedConfig
      })
      expect(typescript.findConfigFile).toHaveBeenCalledWith(process.cwd(), typescript.sys.fileExists)
    })

    it('throws error if tsconfig is not found', () => {
      vi.mocked(typescript.findConfigFile).mockReturnValue(undefined)

      expect(() => loadTSConfig()).toThrow('Unable to locate tsconfig')
    })
  })

  describe('findOutDir', () => {
    it('returns outDir from tsconfig', () => {
      vi.mocked(typescript.parseJsonConfigFileContent).mockReturnValue({
        fileNames: [],
        errors: [],
        options: { outDir: 'dist' }
      })

      const outDir = findOutDir()

      expect(outDir).toBe('dist')
    })

    it('throws error if no outDir in tsconfig', () => {
      vi.mocked(typescript.parseJsonConfigFileContent).mockReturnValue({
        fileNames: [],
        errors: [],
        options: {}
      })

      expect(() => findOutDir()).toThrow('No outDir specified in tsconfig')
    })
  })

  describe('getPathAliases', () => {
    it('returns null if no paths in tsconfig', () => {
      vi.mocked(typescript.parseJsonConfigFileContent).mockReturnValue({
        fileNames: [],
        errors: [],
        options: { outDir: 'dist' }
      })

      const result = getPathAliases()

      expect(result).toBeNull()
    })

    it('returns resolved path aliases with default baseUrl', () => {
      vi.mocked(typescript.parseJsonConfigFileContent).mockReturnValue({
        fileNames: [],
        errors: [],
        options: {
          paths: {
            '@/*': ['src/*'],
            'components/*': ['src/components/*'],
            lib: ['src/lib/index.ts']
          }
        }
      })

      const result = getPathAliases()

      expect(result).toEqual({
        '@/': ['src/'],
        'components/': ['src/components/'],
        lib: ['src/lib/index.ts']
      })
    })

    it('uses baseUrl from tsconfig when provided', () => {
      vi.mocked(typescript.parseJsonConfigFileContent).mockReturnValue({
        fileNames: [],
        errors: [],
        options: {
          baseUrl: './app',
          paths: {
            '@/*': ['src/*']
          }
        }
      })

      const result = getPathAliases()

      expect(result).toEqual({
        '@/': ['app/src/']
      })
    })
  })
})
