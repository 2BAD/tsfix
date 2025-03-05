import { axiom } from '@2bad/axiom'

// biome-ignore lint/style/noDefaultExport: acceptable for this use case
export default [
  {
    ignores: ['bin']
  },
  axiom(import.meta.dirname),
  {
    rules: {
      'import-x/no-named-as-default-member': 'off'
    }
  }
].flat()
