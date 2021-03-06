---
title: About creators
description: Creators are, with components, the central part of an ssgo project. You can see them as page factories. They are basically the entry points of your data fetching and your page building.
path: about-creators
weight: 1
category: Creators
---

# About creators

Creators are, with templates, the central part of an `ssgo` project. You can see them as **page factories**. They are basically the entry points of your data fetching and your page building.

In order to be known by `ssgo` and to be ran, creators must meet two conditions:

- **creators must be put inside of the `creators/` directory, or nested inside of it**. You can have as much creators as you want, even a single one that build all of your pages: that is up to you.
- **creators must be `.js` or `.ts` files, and must default export a function**. This function will be evaluated by `ssgo` and will be given two arguments: the `buildPage` function, and an object filled with helper functions. **This function can be `async` if needed.**

## The `buildPage` function

The `buildPage` function is the function given by `ssgo` as first parameter of every creator's default exported function.
You can call it as much as needed to create pages.

The type of the `buildPage` function is the following:

```typescript
(template: string, data: IContextData, options: IBuildPageOptions) => void
```

> IContextData and IBuildPageOptions are defined inside of https://deno.land/x/ssgo/mod.ts

Here's details about the parameters accepted by `buildPage`:

- **`template`**: (_string - **required**_) The path of the [Template](/docs/about-templates.html) to use to build the page **(relative to the root of the templates/ directory)**. It must be a valid `.html` of `.htm` file.
- **`data`**: (_object - **required**_) A key/value object that represents the contextual data used inside of your template. Keys will be callable inside of the `template` (see first parameter ☝️) using the `{{ key }}` notation. Values can be any valid JavaScript statement (primitives, functions, operators...). **If your template doesn't use any data**, you can give an empty object `{}` in place of this parameter.
- **`options`**: (_object - **required**_) The options to use to build the page:
  - **`filename`**: (_string - **required**_) The name (without extension) of the HTML page to create.
  - **`dir`**: (_string - optional_) The sub-directory of `dist/` to create the HTML page in, relative to the root of the `dist/` directory. If the specified directory doesn't exists, it will be created. If this option isn't provided, the page will be built at the root of the `dist/` directory.

## The `ssgoBag` object

The `ssgoBag` is an object containing utilities you might need inside of your creators. It is given by `ssgo` to every creator's default exported function, as second parameter.

At the moment, the `ssgoBag` exposes 3 utility functions:

- **`watchDir`** (_`(path: string) => void`_): Recursively watches the directory given as first parameter and re-run the creator whenever one of the files inside of the directory changes. **The `path` given must be relative to the root of the project.**
- **`watchFile`** (_`(path: string) => void`_): Same as `watchDir` but for a single file. Whenever the watched file changes, the creator is re-ran. Here again, **the `path` given must be relative to the root of the project.**
- **`addStaticToBundle`** (_`(path: string, bundleDest: string, compile?: boolean, override?: boolean) => void`_): Adds the file given as `path` parameter to the `dist/` directory, inside of the `bundleDest` subdirectory. If the file must be put at the root of `dist/`, you can give an empty string as the `bundleDest` parameter.
  - **`compile`** is an optional boolean telling `ssgo` to try to compile the file to add to the bundle. Can be useful if the file is a `.ts` file for example.
  - **`override`** is an optional boolean telling `ssgo` wether it should override the file in the case it already exists in the bundle.
- **`log`** (_`{ info, success, warning, error }`_): Logs a message using the internal `ssgo` logger. `log.error` accepts an additional `throwErr: boolean` argument, throwing an error if set to `true` (default to `false`).
- **`context`** (_`{ mode }`_): `ssgo` context object containing:
  - **`mode`** (`development | production`): Whether ssgo is ran in production (`ssgo build`) or development mode (`ssgo dev`)
  - **`projectRoot`** (`string`): The root of the project containing the current creator

This bag of utilities aims to be filled with more content in the future. **If you have an idea of something useful that could be added to the `ssgoBag`, please feel free to <a href="https://github.com/mdubourg001/ssgo/issues" target="_blank" rel="noreferrer nofollow noopener">fill and issue</a>.**

## Tips

- Paths given to `watchDir`, `watchFile` and `addStaticToBundle` are automatically resolved for the current working directory.
- When running `ssgo` using the `--cwd` option, calling Deno standard library functions (like `fs/walk` for example) might not resolve the paths correctly: you might want to prepend your paths with the `context.projectRoot` value given by `ssgoBag` (second argument given to your creators functions).
