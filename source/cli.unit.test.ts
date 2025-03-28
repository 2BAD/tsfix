import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { run } from './cli.ts'
import { tsFix } from './tsfix.ts'

vi.mock('./tsfix.ts', () => ({
  tsFix: vi.fn()
}))
vi.mock('./cli.ts', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./cli.ts')>()
  return {
    ...mod,
    run: vi.fn().mockImplementation(mod.run)
  }
})

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

    await run()

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

    await run()

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

    await run()

    expect(tsFix).toHaveBeenCalledWith({
      cwd: './dist',
      extensions: 'js,ts',
      pattern: undefined,
      mode: 'regex'
    })
  })
})
