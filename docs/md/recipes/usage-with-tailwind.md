---
title: Usage with TailwindCSS
description: In order to integrate the awesome TailwindCSS framework within your `ssgo` development process, you might want to proceed as follows.
path: usage-with-tailwind
weight: 3
category: Recipes
---

# Usage with TailwindCSS

> **This documentation website** is actually built using `ssgo` and `Tailwind`. You can <a href="https://github.com/mdubourg001/ssgo/tree/master/docs" target="_blank" rel="noreferrer nofollow noopener">check the sources here</a>.

In order to integrate [the awesome TailwindCSS framework](https://tailwindcss.com) within your `ssgo` development process, you might want to proceed as follows:

## Initialize Tailwind and customize your configuration

First, **simply initialize a Tailwind configuration file using `tailwind-cli`**:

```bash
npx tailwindcss-cli@latest init
```

Then, customize your Tailwind configuration to match your needs and add `ssgo` templates and components files to the `purge` configuration object:

```js
// tailwind.config.js

module.exports = {
  purge: ["./templates/**/*.html", "./components/**/*.html"],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
```

This way, the outputed CSS will **only contain the style actually used by your site**.

## Integrate the Tailwind build to your build process

In order to allow `ssgo` to import the built stylesheet, **the Tailwind built should be ran just before the `ssgo` build**:

```bash
# building tailwind against our config file and adding the output to static files
npx tailwindcss-cli@latest build -c ./tailwind.config.js -o ./static/tailwind.css

# build the site
ssgo
```

The built Tailwind stylesheet can just be imported as follows in your templates:

```html
<link href="tailwind.css" rel="stylesheet" />
```

In order to keep short CLI commands, you might want to use the [Velociraptor](https://github.com/umbopepato/velociraptor) script runner:

```bash
# velociraptor.yaml

scripts:
  build-tailwind:
    cmd: npx tailwindcss-cli@latest build -c ./tailwind.config.js -o ./static/tailwind.css
  build:
    cmd: vr build-tailwind && ssgo
    env:
      NODE_ENV: production # by default, Tailwind purge is enabled only when NODE_ENV == 'production'
  develop:
    cmd: vr build-tailwind && ssgo dev
```
