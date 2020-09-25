---
title: Templating utilities
path: templating-utilities
weight: 2
category: Guides
---

# Plug some templating utilities

If you are already familiar with templating engines like **Jinja** or **Twig**,
you might want to use some utility functions from within your templates
(for example to capitalize some text, or to check for some value's nullity).

As `ssgo` aims to be really minimalistic, it does not provide such functions in templates out of the box.
**However, as `ssgo` allows you to call any JavaScript (or TS) code from within your templates**, you
can easily plug all the utility functions you need to your template **by simply giving it to `buildPage` context**.

For example, try to simply give the `lodash` library to your build context:

```typescript
// my-creator.ts
import lodash from "https://cdn.skypack.dev/lodash";

export default (buildPage) => {
  buildPage(
    "my-template.html",
    {
      foobar: maybeSomeNullishData,
      _: lodash, // making lodash available from within my template
    },
    { filename: "my-page.html" }
  );
};
```

Now you'll be able to use it from within your template:

```html
<!-- my-template.html -->

<div if="!_.isNil(foobar)">{{ _.capitalize(foobar) }}</div>
```
