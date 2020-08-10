---
title: Attributes evaluation
path: attributes-evaluation
weight: 3
category: Templates
---

# Attributes evaluation

Attributes evaluation allow you to dynamically compute the value of your attributes.

To dinamically compute the value of an attribute, just prefix it with `eval:`. `ssgo` will simply evaluate the expression given as value of the attribute, and will replace it into the built page.

For example, let's say that one of your [creators](/docs/about-creators.html) is triggering a build page with the following data:

```typescript
{
  metaTitle: 'Lorem ipsum dolor si amet',
  slugify: (str: string) => str.toLowerCase().replace(' ', '-')
  image: {
    imgSrc: 'https://example.com/image.png',
  },
}
```

Then you can evaluate the value of attributes as follows:

```html
<html>
  <head>
    <meta name="title" eval:content="metaTitle" />
  </head>
  <body>
    <img eval:src="image.imgSrc" eval:alt="slugify(metaTitle)" />
  </body>
</html>
```

Once built, our page will look like that:

```html
<html>
  <head>
    <meta name="title" content="Lorem ipsum dolor si amet" />
  </head>
  <body>
    <img src="https://example.com/image.png" alt="lorem-ipsum-dolor-si-amet" />
  </body>
</html>
```

## The special treatment of the `class` attribute

As the `class` attribute generally contains more than one value, `ssgo` allows passing a object to `eval:class`: every value of the object will be evaluated, and if truthy, the corresponding key will be added to the resulting `class` attribute:

```html
<div
  eval:class="({
    'flex shadow': true,
    'flex-col': metaTitle.lenght > 2,
    'flex-row justify-between': metaTitle.length <= 2
  })"
></div>
```

> Note the use of braces around the object notation, **it is needed for `ssgo` to correctly evaluate object expressions**

The previous example will output:

- `<div class="flex shadow flex-col"></div>` if `metaTitle.length > 2` is true
- `<div class="flex shadow flex-row justify-between"></div>` if `metaTitle.length <= 2` is true
