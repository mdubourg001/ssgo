# About templates

Templates are the skeletons of your pages, and are used by [Creators](/docs/about-creators.html) to build pages.
A template can be used as much time as needed to build pages.

For example, this documentation site is built with `ssgo` and uses a single template for all the documentations pages (pages under `/docs`).

Templates are used through the first argument of the `buildPage` method, that is given to every creator default exported function as first parameter.

```typescript
// my-creator.ts

export default (buildPage) => {
  buildPage(
    "my-template.html", // <-- the path of the template to use (relative to the root of the templates/ directory)
    contextData,
    { filename: "my-page.html" }
  );
};
```

`ssgo` templates allow you to do the following things:

- [Text interpolation](/docs/text-interpolation.html)
- [Evaluate tag's attributes at built time](/docs/attributes-evaluation.html)
- [Show elements conditionnally](/docs/conditionnally-show-elements.html)
- [Iterate over data](/docs/templates-loops.html)
