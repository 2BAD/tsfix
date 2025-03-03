# TSFIX - Write TypeScript. Get working ESM. It's that simple.

[![NPM version](https://img.shields.io/npm/v/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![License](https://img.shields.io/npm/l/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/2BAD/tsfix/build.yml)](https://github.com/2BAD/tsfix/actions/workflows/build.yml)
[![Code coverage](https://img.shields.io/codecov/c/github/2BAD/tsfix)](https://codecov.io/gh/2BAD/tsfix)
[![Written in TypeScript](https://img.shields.io/github/languages/top/2BAD/tsfix)](https://github.com/2BAD/tsfix/search?l=typescript)

TSFIX automatically fixes ECMAScript Modules (ESM) compatibility issues in tsc-generated JavaScript. Unlike CommonJS, ESM requires explicit file extensions in import paths, which TypeScript's compiler does not automatically handle.

## Features

- Automatically detects TypeScript configuration and output paths
- Handles all types of imports (absolute, relative, dynamic, etc.)
- Supports both regex and AST-based extraction modes for different performance profiles
- Adds proper `.js` extensions to imports in compiled JavaScript files
- Resolves directory imports to `index.js`
- Properly handles TypeScript's `.ts` extension in source code when `allowImportingTsExtensions` is enabled
- Fixes `.d.ts` declaration files unlike TypeScript's new `--rewriteRelativeImportExtensions` flag which ignores them
- Works with all TypeScript compilers and versions (not just 5.5+)

## Install

```shell
npm install --save-dev @2bad/tsfix
```

## Usage

### As a post-build script

Add `tsfix` as a post-build script in your project's package.json:

```json
{
  "scripts": {
    "build": "tsc",
    "postbuild": "tsfix"
  }
}
```

This automatically runs `tsfix` after TypeScript compilation.

### Manual execution

```sh
npx @2bad/tsfix
```

### Advanced options

```sh
# Use AST-based extraction (more accurate but slower)
npx @2bad/tsfix --mode ast

# Custom file matching pattern
npx @2bad/tsfix --pattern "**/*.js"
```

## Example

Consider the following TypeScript files:

```typescript
// src/main.ts
import { helper } from './utils/helper.ts'

// src/utils/helper.ts
export const helper = () => 'helper function'
```

After running tsc, the compiled JavaScript files might look like this:

```javascript
// dist/main.js
import { helper } from './utils/helper.ts'

// dist/utils/helper.js
export const helper = () => 'helper function'
```

Running tsfix will transform the import paths to:

```javascript
// dist/main.js
import { helper } from './utils/helper.js'
```

## Troubleshooting

Use the `DEBUG` environment variable to enable detailed logging:

```sh
# Enable all debug logging
DEBUG=* tsfix

# Only enable specific components
DEBUG=tsfix:main,tsfix:extractor tsfix

# Show only fixer operations
DEBUG=tsfix:fixer tsfix
```

## Why is this needed?

Despite 8 years of developer requests, TypeScript maintainers have not implemented automatic extension handling for ESM output. While TypeScript 5.5+ added a `--rewriteRelativeImportExtensions` flag, it doesn't fix .d.ts files and has other limitations. This tool saves countless hours for the developers dealing with this fundamental issue that should have been handled by `tsc` directly.

### Major TypeScript Issues (Still Unresolved)

- [#16577](https://github.com/microsoft/TypeScript/issues/16577): Provide a way to add the '.js' file extension to the end of module specifiers (2017)
- [#28288](https://github.com/microsoft/TypeScript/issues/28288): Feature: disable extensionless imports (2018)
- [#40878](https://github.com/microsoft/TypeScript/issues/40878): Compiled JavaScript import is missing file extension (2020)
- [#42151](https://github.com/microsoft/TypeScript/issues/42151): TypeScript cannot emit valid ES modules due to file extension issue (2020)
- [#50501](https://github.com/microsoft/TypeScript/issues/50501): TypeScript is not an ECMAScript superset post-ES2015 (2022)
- [#61037](https://github.com/microsoft/TypeScript/issues/61037): `rewriteRelativeImportExtensions` doesn't rewrite extensions in emitted declaration files (2025)
- [#61213](https://github.com/microsoft/TypeScript/issues/61213): Allow allowImportingTsExtensions: without either '--noEmit' or '--emitDeclarationOnly' (2025)

### Previously Addressed (Partially)

- [#49083](https://github.com/microsoft/TypeScript/issues/49083): "module": "node16" should support extension rewriting (Partially addressed via [#59767](https://github.com/microsoft/TypeScript/pull/59767))

**The core problem remains**: While TypeScript has acknowledged ESM issues through the introduction of node16/nodenext module resolution, developers are still forced to use external tools to handle extension transformation. This requirement creates unnecessary friction in the development workflow that should have been solved directly by the compiler.

### ESM Requirements

ECMAScript Modules has stricter requirements than CommonJS, including:

- Mandatory file extensions in import paths (`.js`, `.mjs`, etc.)
- No automatic resolution of `index.js` files
- No automatic directory-to-file resolution
- Different handling of package.json 'exports' field

## Performance

TSFIX provides two extraction modes:

- **Regex mode** (default): Faster extraction using regular expressions
- **AST mode**: More accurate extraction using TypeScript's Abstract Syntax Tree

You can benchmark both modes using the built-in benchmark runner:

```sh
# Run a benchmark against a GitHub repository
tsx source/benchmark-runner.ts --repo https://github.com/example/repo.git
```

## Contributing

We welcome contributions! If you find a bug or want to request a new feature, please open an issue. If you want to submit a bug fix or new feature, please open a pull request.
