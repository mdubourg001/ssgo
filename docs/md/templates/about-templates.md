---
title: About templates
description: Templates are the skeletons of your pages, and are used by Creators to build pages. Templates are used through the first argument of the buildPage function.
path: about-templates
weight: 1
category: Templates
---

# About templates

Templates are the skeletons of your pages, and are used by [Creators](/docs/about-creators.html) to build pages.
A template can be used as much time as needed to build pages.

For example, this documentation site is built with `ssgo` and uses a single template for all the documentations pages (pages under `/docs`).

Templates are used through the first argument of the `buildPage` function, that is given to every creator default exported function as first parameter.

```typescript
// my-creator.ts

export default (buildPage) => {
  buildPage(
    "my-template.html", // <-- the path of the template to use (relative to the root of the templates/ directory)
    contextData,
    { filename: "my-page.html" }
  )
}
```

`ssgo` templates allow you to do the following things:

- [Text interpolation](/docs/text-interpolation.html)
- [Evaluate tag's attributes at built time](/docs/attributes-evaluation.html)
- [Show elements conditionnally](/docs/conditionally-show-elements.html)
- [Iterate over data](/docs/loops.html)

Some helpers are also automatically provided to page builds contexts under the `ssgo` key:

- **`ssgo.assrc`** (_`(expression: any) => string`_): Using [tosource](https://www.pika.dev/npm/tosource) under the hood, `assrc` allows you to convert a JavaScript expression to its textual representation (ex: `ssgo.assrc([1, 2, 3]) === '[1, 2, 3]'`). It can be really useful when using `ssgo` with [AlpineJS](https://github.com/alpinejs/alpine), when populating `x-data` attributes using the `eval:` prefix. [Check out an usage example in the sidebar component of this website](https://github.com/mdubourg001/ssgo/blob/master/docs/components/docs-sidebar.html).
