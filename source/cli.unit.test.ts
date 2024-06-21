import meow from 'meow'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tsFix } from '../build/tsfix.js'

vi.mock('meow')
vi.mock('../build/tsfix.js', () => ({
  tsFix: vi.fn()
}))

describe('CLI', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call tsFix with provided options when arguments are provided', async () => {
    expect.assertions(1)
    const mockFlags = { extensions: 'jsx,tsx', pattern: '*.js' }
    const mockInput: string[] = ['./dist']
    vi.mocked(meow).mockReturnValue({ flags: mockFlags, input: mockInput })

    await import('../bin/cli.mjs')

    expect(tsFix).toHaveBeenCalledWith({ cwd: './dist', extensions: 'jsx,tsx', pattern: '*.js' })
  })
})
