---
title: Pair with a view library
description: Thanks to Deno, and some of its own built-in mechanisms, `ssgo` allows you to easily include dynamic pieces to your web apps, using React of AlpineJS (for example).
path: pair-with-view-library
weight: 2
category: Guides
---

# Pair with a view library

Even with the fact that `ssgo` provides everything you need to build pages on server side,
you sometimes need to update the UI of your application based on events happening at runtime,
like user input or temporal events.

Thanks to Deno, and some of its own built-in mechanisms, `ssgo` allows you to easily **include dynamic
pieces to your web apps**.

## Usage with AlpineJS

As told in <a href="https://github.com/alpinejs/alpine" target="_blank" rel="noreferrer nofollow noopener">its documentation</a>, Alpine is "a rugged, minimal framework for composing JavaScript behavior in your markup". As Alpine is mainly based on the usage of HTML attributes (like `x-data`, `x-init`, `x-text`...), **it pairs very nicely with ssgo's `eval:` attribute prefix.**

Let's take the basic example of an app displaying a simple shopping list, with **the list being initialized with server-side-fetched data, and hydrated on app mount**:

After having initialized a basic `ssgo` project (by running `ssgo init`), let's give our server-side data to our page build context inside of `creators/index.ts`:

```typescript
// creators/index.ts

import type { BuildPage } from "https://deno.land/x/ssgo/mod.ts"

export default function (buildPage: BuildPage) {
  buildPage(
    "index.html",
    {
      title: "ssgo/alpine shopping list",
      // fake data that could be fetched from an API, or read from filesystem
      list: ["bananas", "carrots", "baguette"],
    },
    { filename: "index.html" }
  )
}
```

Alpine relies on a data model (actually a JS plain object) to do its magic.
In our case, this model needs to be initialized by taking two things into account:

- it musts accepts our server-side-fetched data as initial data
- it should be hydrated after data fetching on mount

With this in mind, let's create **a JS file for our model initialization**:

```javascript
// static/index.js

// using the `function` notation is important here to allow the usage of `this`
function itemsData(initialList) {
  return {
    items: initialList,
    init() {
      fetchData().then((response) => {
        this.items = response
      })
    },
  }
}

async function fetchData() {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(["bananas", "carrots", "baguette", "fromage"]),
      2000
    )
  })
}
```

> If you don't want to bother creating a JS file for this little, have a look at [Alpine Magic Helpers](https://github.com/alpine-collective/alpine-magic-helpers#fetch)

Now let's edit our template to import AlpineJS and our JS file, and to initialize
Alpine to render our shopping list:

```html
<!-- templates/index.html -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ title }}</title>

    <!-- importing our JS file -->
    <script src="index.js"></script>

    <!-- importing AlpineJS -->
    <script
      src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.7.0/dist/alpine.min.js"
      defer
    ></script>
  </head>
  <body>
    <!-- the magic happens here ✨ -->
    <ul eval:x-data="`itemsData(${ssgo.assrc(list)})`" x-init="init()">
      <template x-for="item in items">
        <li x-text="item"></li>
      </template>
    </ul>
  </body>
</html>
```

Let's have a closer look at what we did here:

- as we want our model to use our server-side-fetched data as initial data, we use
  the `eval:` prefix to **evaluate the value of the `x-data` attribute at build time**.
- as our initial data is an array, we need its "source representation" to give to the `itemsData` function: using the built-in `ssgo.assrc` helper (see [About templates](/docs/about-templates.html)), **the source representation of `list` (`['bananas', 'carrots', 'baguette']`) will be evaluated at runtime and used as our model's initial data.**
- as we want our list to be hydrated with some API's data when the app mounts, we call the `init` function in the `x-init` attribute to trigger data fetching, and thus **shopping list rehydration**.

## Usage with React
