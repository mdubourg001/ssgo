---
title: Using components
description: Components are a nice and simple way to do code splitting inside of your templates. If you are familiar with JavaScript frameworks, you already know what ssgo components are about.
path: using-components
weight: 1
category: Components
---

# Using components

Components are a nice and simple way to do code splitting inside of your templates. **If you are familiar with JavaScript frameworks like ReactJS of Angular**, you already know what `ssgo` components are about.

In summary, components are `.html` or `.htm` files living inside of the `components/` directory (or inside one of its subdirectories, recursively). They **allow you to do anything you can do inside of regular [Templates](/docs/about-templates.html)**. The point of components is that they are **easily reusable** and that they allow you to have a nice splitted code architecture.

Before building your pages, `ssgo` first recursively walks inside of your `components/` directory for every `.html` (or `.htm`) files he can find.

## Usage

Every component found is usable from templates or from other components. **To use a component, just use the name of its HTML declaration file as an HTML tag**. The data needed by your component must be given to it using the tag's attributes.

For example, let's say your `components/` directory looks like this:

```
components/
└── misc/
    └── seo.html
└── layout.html
```

```html
// seo.html

<title>{{ pageTitle }}</title>

<meta eval:charset="pageCharset" />
<meta property="og:title" eval:content="pageTitle" />

<meta
  for="meta"
  of="metaTags"
  eval:property="meta.property"
  eval:content="meta.content"
/>

// layout.html

<!DOCTYPE html>
<html eval:lang="lang">
  <head>
    <seo pageCharset="'utf-8'" pageTitle="title"></seo>
  </head>

  <body>
    {{ children }}
  </body>
</html>
```

Your template files could use these components as follows:

```html
// my-template.html

<layout lang="'en'" title="fetchedPageTitle" metaTags="[]">
  <section>
    <!-- [...] -->
  </section>
</layout>
```

There are some interesting things to notice in this example:

- Components are used using the name of their declaration file: `seo` is used as `<seo></seo>` and `layout` is used as `<layout></layout>`.
- Data used by components is given through their tag's attributes. **You can think of these as ReactJS component's props.**
- The `layout` component uses **a specific `children` property**: like in ReactJS, this allows components to nest content inside of their structure. **The `children` property is automatically filled and given to components by `ssgo` when needed.**
