<p align="center">
  <img src="./assets/logo.png">
</p>

# ssgo

The minimalistic but flexible static site generator.

**`ssgo`** is built with Deno and relies on it.

![license: MIT](https://img.shields.io/github/license/mdubourg001/ssgo?style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![netlify: passing](https://img.shields.io/netlify/d9dae2e0-b3b2-4c86-aee8-7a625de6e18a?style=flat-square)

## Documentation

Read the documentation at https://ssgo.netlify.app/docs.

## Quickstart

To install `ssgo` using Deno:

```bash
deno install --unstable --allow-read --allow-write --allow-net --allow-run -q https://deno.land/x/ssgo/ssgo.ts
```

**To create a `ssgo` project starter** just run:

```bash
mkdir my-ssgo-project && cd my-ssgo-project
ssgo init
```

Here's what a `ssgo` project looks like:

```plaintext
├── creators/    <- here go the scripts creating your pages
├── templates/   <- here go the templates of your pages
├── components/  <- here go your custom components
└── static/      <- here go your static files
```

**To launch a build**: just run:

```bash
ssgo
```

Your site will be built inside of the `dist/` directory.s

**To start development mode** with file watching, and a hot reloaded dev server:

```bash
ssgo dev
```

The `dist/` directory will be served over `http://localhost:5580`.

## Overview

`ssgo` basically relies on two types of files: **templates**, and **creators**.

**Templates** are the skeleton of your pages and are simply HTML files living inside the `templates/` directory (and its subdirectories):

```html
<!-- templates/my-template.html -->

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ title }}</title>

    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <h1>Hello, ssgo !</h1>
    <p>Just run <code>ssgo dev</code> to get started !</p>
  </body>
</html>
```

**Creators** are like page factories. Using a `buildPage` function given by `ssgo`, they use **templates** and datas to build pages. Creators live in the `creators/` directory (and its subdirectories):

```typescript
// creators/my-creator.ts

import type { BuildPage } from "https://deno.land/x/ssgo/mod.ts"
import { fetchTitle } from "../src/api.ts"

export default async function (buildPage: BuildPage) {
  const title = await fetchTitle()

  buildPage(
    "my-template.html",
    { title: title },
    {
      filename: "index.html",
      dir: "",
    }
  )
}
```

`ssgo` also provides much more cool stuffs like components, automatic static files management, or just-in-time page build in dev mode. You can learn more about all this things by [reading the documentation](https://ssgo.netlify.app/docs).

## Roadmap

- [ ] Expose buildTemplateAsString from mod.ts
- [ ] Stop cleaning dist dir by default (provide --clean option ?)
- [ ] Provide --compress option (brotli or choice between brotli and gzip ?)
- [ ] Provide --format option to format built pages using prettier
- [ ] Pass undefined if variable doesn't exist when passing props
- [ ] Use CWD's `.tsconfig.json` for typescript compilation if exists
- [ ] Add a support for a config file (.ssgorc, ssgo.config.js)
- [ ] Provide a way to opt out of static ressources resolution on a per-file basis
