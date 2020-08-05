# About creators

Creators are, with components, the central part of an `ssgo` project. You can see them as **page factories**. They are basically the entry points of your data fetching and your page building.

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

## The `ssgoBag` and its contents
