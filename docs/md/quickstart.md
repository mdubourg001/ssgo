---
title: Quickstart
path: quickstart
weight: 2
---

# Quickstart

> **This documentation website** is actually built using `ssgo` and is a good example of what it is capable of. You can <a href="https://github.com/mdubourg001/ssgo/tree/master/docs" target="_blank" rel="noreferrer nofollow noopener">check the sources here</a>.

`ssgo` is a minimalist static site generator.

It aims to be simple and easy to start working with.
[After installing it](/docs/installation.html), here's what you would want to do:

## Initialize a `ssgo` project

```bash
mkdir my-project
cd my-project

ssgo init
```

This will initialize a project in the current directory by creating
the four main directories used by `ssgo`:

```text
├── creators/    <- here go the scripts creating your pages
├── templates/   <- here go the templates of your pages
├── components/  <- here go your components
└── static/      <- here go your static files
```

> If some of this directories already exists, `ssgo` won't touch them.

## Create a template

> You can learn more about them by reading [About templates](/docs/about-templates.html).

Template files are the HTML files used as skeletons to build your pages.
These template file are located in the `templates` directory.

Here's what a basic template would look like:

```html
<!-- post.html -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="title" eval:content="post.metas.title" />

    <title>My blog - {{ post.title }}</title>

    <link rel="stylesheet" href="/css/index.css" />
  </head>
  <body>
    <i if="post.readTime">Read time: {{ post.readTime }}</i>

    {{ post.content }}
  </body>
</html>
```

## Add a creator

> You can learn more about them by reading [About creators](/docs/about-creators.html).

Creators are the scripts evaluated by `ssgo` to build your static pages.
They are basically `.ts` or `.js` modules living inside of the `creators` directory.

Here's what a basic creator would look like:

```typescript
// blog-posts.ts

import { fetchBlogPosts } from "../src/api.ts";

export default function (buildPage) {
  const blogPosts = fetchBlogPosts();

  for (const post of blogPosts) {
    buildPage("post.html", post, {
      filename: post.slug,
      dir: "blog-posts/",
    });
  }
}
```

## Build the site

Now that you have some template files and creators, launching the build of your site is as easy as this:

```bash
ssgo
```

Your site will be built inside of the `dist` directory.

## Start development mode

`ssgo` also allows you to build your site in development mode, enabling a file watcher on your project to re-build only what needs to be re-build upon changes:

```bash
ssgo dev
```

## How does it work ?

Here's a little schema to help you figure out about how `ssgo` works:

![How ssgo works schema](/static/images/schema.png)

## What now ?

Now that you are up and running, you can learn about the other cool things coming with `ssgo` like:

- [Using your own components](/docs/using-components.html)
- [Using static files](/docs/how-are-static-files-handled.html)
- [Having a dynamic runtime using AlpineJS](/docs/having-a-dynamic-runtime.html)
