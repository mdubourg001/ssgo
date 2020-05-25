# About templates

Templates are the skeletons of your pages, and are used by [Creators](/docs/about-creators.html) to build pages.
You can choose to use a template for a single page,
or you can also choose to reuse a template to build multiple pages of your site.

For example, this documentation site is built with `ssgo` and uses a single template for all the pages under `/docs`.

`ssgo` templates allow you to do the following things:

- [Text interpolation](/docs/text-interpolation.html)
- [Evaluate tag's attributes value at built time](/docs/attributes-evaluation.html)
- [Render elements conditionnally](/docs/conditionnally-render-elements.html)
- [Iterate over data](/docs/templates-loops.html)

Templates are used through the first argument of the `buildPage` method, that is given to every creator has first parameter.

```typescript
// my-creator.ts

export default (buildPage) => {
  buildPage(
    "my-template.html", // <-- the path of the template to use (relative to the root of project)
    contextData,
    { filename: "my-page.html" }
  );
};
```
