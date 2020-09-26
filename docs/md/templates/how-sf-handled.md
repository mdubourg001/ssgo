---
title: Static files resolution
description: ssgo provides a simple way to use static ressources (like images, stylesheets, scripts...) inside of your templates and components. To be able to use static ressources, add them to the 'static/' directory.
path: static-files-resolution
weight: 6
category: Templates
---

# Static files resolution

`ssgo` provides a simple way to use static ressources (like images, stylesheets, scripts...) inside of your templates and components. To be able to use static ressources, **add them to the `static/` directory at the root of your project**. Then you can simply reference them from any template or component using common html attributes pointing to your static ressource in the form of **a path relative to the root of the `static/` directory**.

For example, let's say you want to use an image in one of your templates:

```html
<!-- Here, the static/ directory contains 'path/to/my/image.jpg' -->
<img src="path/to/my/image.jpg" alt="Cake" />
```

When building, `ssgo` will automatically detect that this `src` attribute leads to an existing static ressources into the `static/` directory, and will copy it to the `dist/static/` directory, **keeping the sub-directory structure**. When built, we will have:

```html
<img src="/static/path/to/my/image.jpg" alt="Cake" />
```

```bash
ls -R dist/static/
# path/to/my/image.jpg
```

`ssgo` automatically runs this treatment on **every `src`, `href`, `srcset`, `icon` and `poster` attributes leading to an existing file inside of the `static/` directory, or one of its subdirectories.**

## The case of `.ts` and `.js` files

As `ssgo` runs using the Deno runtime, it uses Deno's compilation API to **automatically bundle TypeScript (`.ts`) and JavaScript (`.js`) files before adding them to the `dist/static/` directory**. This allows you to write your scripts using TypeScript out of the box, and to have them bundled and minified for production use.
