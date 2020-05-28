# Text interpolation

Text interpolation is one of the most essential features of templates.
It allows you to render text from contextual data.

Every text of the format **`{{ foo }}` will be evaluated as text interpolation.**

For example, let's say we have a [Creator](/docs/about-creators.html) making a call to `buildPage` with a template and some data as follows:

```typescript
// my-creator.ts

export default (buildPage) => {
  buildPage(
    "my-template.html",
    {
        foo: 'foo':
        bar: 'bar',
        joinWords: (...words: string[]) => words.join('-')
    },
    { filename: 'index'}
  );
};
```

Then if our template looks something like that:

```html
<!-- my-template.html -->

<div>
  <p>{{ foo }}</p>
  <p>{{ bar }}</p>
  <p>{{ 1 + 2 }}</p>
  <p>{{ joinWords(foo, bar) }}</p>
  <p>{{ `${foo} ${Math.random()}` }}</p>
</div>
```

Once built, it will look something like that:

```html
<div>
  <p>foor</p>
  <p>bar</p>
  <p>3</p>
  <p>foo-bar</p>
  <p>foo 0.351321</p>
</div>
```
