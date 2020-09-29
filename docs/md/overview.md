---
title: Overview
description: "ssgo basically relies on two types of files: templates, and creators. Templates are the skeleton of your pages and are simply HTML files living inside the templates/ directory (and its subdirectories)."
path: overview
weight: 3
---

# Overview

```text
├── creators/    <- here go the scripts creating your pages
|     └── index.ts
├── templates/   <- here go the templates of your pages
|     └── index.html
├── static/      <- here go your static files
|     └── index.css
└── components/  <- here go your components
```

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

import { BuildPage } from "https://deno.land/x/ssgo/mod.ts"

export default function (buildPage: BuildPage) {
  buildPage(
    "my-template.html",
    { title: "Hello, ssgo !" },
    {
      filename: "index.html",
      dir: "",
    }
  )
}
```

`ssgo` also provides much more cool stuffs like components and static files management.
You can learn more about these by reading the other pages.
