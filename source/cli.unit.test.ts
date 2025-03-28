import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { tsFix } from '../build/tsfix.js'

vi.mock('../build/tsfix.js', () => ({
  tsFix: vi.fn()
}))

describe('cli', () => {
  let originalArgv: string[]

  // eslint-disable-next-line vitest/no-hooks
  beforeEach(() => {
    originalArgv = process.argv
  })

  afterEach(() => {
    process.argv = originalArgv
    vi.resetModules()
  })

  it('should call tsFix with correct options', async () => {
    expect.assertions(1)

    process.argv = ['node', 'cli.mjs', './dist', '--extensions=jsx,tsx', '--pattern=*.js', '--mode=regex']

    // @ts-expect-error this module doesn't export anything
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _cliModule = await import('../bin/cli.mjs')

    expect(tsFix).toHaveBeenCalledWith({
      cwd: './dist',
      extensions: 'jsx,tsx',
      pattern: '*.js',
      mode: 'regex'
    })
  })

  it('should call tsFix with correct options using short flags', async () => {
    expect.assertions(1)

    process.argv = ['node', 'cli.mjs', './dist', '-e', 'jsx,tsx', '-p', '*.js', '-m', 'regex']

    // @ts-expect-error this module doesn't export anything
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _cliModule = await import('../bin/cli.mjs')

    expect(tsFix).toHaveBeenCalledWith({
      cwd: './dist',
      extensions: 'jsx,tsx',
      pattern: '*.js',
      mode: 'regex'
    })
  })

  it('should use default values when options are not provided', async () => {
    expect.assertions(1)

    process.argv = ['node', 'cli.mjs', './dist']

    // @ts-expect-error this module doesn't export anything
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _cliModule = await import('../bin/cli.mjs')

    expect(tsFix).toHaveBeenCalledWith({
      cwd: './dist',
      extensions: 'js,ts',
      pattern: undefined,
      mode: 'regex'
    })
  })
})
