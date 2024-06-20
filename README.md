# TSFIX

[![NPM version](https://img.shields.io/npm/v/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![License](https://img.shields.io/npm/l/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/2BAD/tsfix/build.yml)](https://github.com/2BAD/tsfix/actions/workflows/build.yml)
[![Code coverage](https://img.shields.io/codecov/c/github/2BAD/tsfix)](https://codecov.io/gh/2BAD/tsfix)
[![Written in TypeScript](https://img.shields.io/github/languages/top/2BAD/tsfix)](https://github.com/2BAD/tsfix/search?l=typescript)

This tool ensures that your compiled JavaScript files are valid ESM by replacing or appending missing extensions in the output files.

## Features

Automatically detects typescript configuration and paths.
Handles all types of imports (absolute, relative, internal, dynamic etc.)

## Install

```shell
npm install --save-dev @2bad/tsfix
```

## Usage

You can use `tsfix` as a post-build script in your project. Add the following script to your package.json:

```json
{
  "scripts": {
    "build": "tsc",
    "postbuild": "tsfix"
  }
}
```

This will run `tsfix` automatically after your TypeScript compilation. Alternatively, you can run tsfix manually:

```sh
npx @2bad/tsfix
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

The `DEBUG` environment variable can be used to figure out why it's working as you may have expected.

```sh
DEBUG=* tsfix
```

## Contributing

We welcome contributions! If you find a bug or want to request a new feature, please open an issue. If you want to submit a bug fix or new feature, please open a pull request.
