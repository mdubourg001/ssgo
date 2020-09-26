---
title: Conditionally show elements
description: To conditionally include elements of your templates inside of your build pages, simply use the 'if' attribute.
path: conditionally-show-elements
weight: 4
category: Templates
---

# Conditionally show elements

To conditionally include elements of your templates inside of your build pages, simply use the `if` attribute.

For example, let's say that one of your [creators](/docs/about-creators.html) is triggering a build page with the following data:

```typescript
{
  foo: 'bar',
  howmuch: 42
}
```

Then you could conditionally display elements of your templates as follows:

```html
<p if="foo === 'bar'">eeny</p>

<p if="howmuch === 42">meeny</p>

<p if="typeof howmuch === typeof foo">miny</p>

<p if="false">moe</p>
```

Your built page would look like that:

```html
<p if="foo === 'bar'">eeny</p>

<p if="howmuch === 42">meeny</p>
```
