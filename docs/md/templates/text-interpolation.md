---
title: Text interpolation
path: text-interpolation
weight: 2
category: Templates
---

# Text interpolation

Text interpolation is one of the most essential features of templates.
It allows you to render text from contextual data.

Every text of the format **`{{ foo }}` will be evaluated as text interpolation.**

For example, let's say that we have a [Creator](/docs/about-creators.html) making a call to `buildPage` with the following context data:

```typescript
{
  foo: 'foo',
  bar: 'bar',
  joinWords: (...words: string[]) => words.join('-')
}
```

And that our template looks something like that:

```html
<div>
  <p>{{ foo }}</p>
  <p>{{ bar }}</p>
  <p>{{ 1 + 2 }}</p>
  <p>{{ joinWords(foo, bar) }}</p>
  <p>{{ `${foo} ${Math.random()}` }}</p>
</div>
```

Once built, our page will look like that:

```html
<div>
  <p>foo</p>
  <p>bar</p>
  <p>3</p>
  <p>foo-bar</p>
  <p>foo 0.351321</p>
</div>
```
