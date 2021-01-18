---
title: Quickstart
description: After installing it, here's what you would want to do. Initialize a ssgo project. Build the site. Start development mode. How does it work ? What now ?
path: quickstart
weight: 2
---

# Quickstart

> **This documentation website** is actually built using `ssgo` and is a good example of what it is capable of. You can <a href="https://github.com/mdubourg001/ssgo/tree/master/docs" target="_blank" rel="noreferrer nofollow noopener">check the sources here</a>.

`ssgo` is a static site generator.

It aims to be simple and easy to start working with.
[After installing it](/docs/installation.html), here's what you would want to do:

## Initialize a `ssgo` project

```bash
mkdir my-project
cd my-project

ssgo init
```

This will initialize a project in the current directory by creating
the four main directories used by `ssgo`: `templates/`, `creators/`, `components/` and `static/`. **If some of this directories already exists, `ssgo` won't touch them.**

## Build the site

As `ssgo` automatically creates a default creator, template and stylesheet, you can already build the site:

```bash
ssgo
```

Your site will be built inside of the `dist` directory.

## Start development mode

`ssgo` also allows you to build your site in development mode, enabling a file watcher on your project to re-build only what needs to be re-build upon changes:

```bash
ssgo dev
```

`ssgo dev` also **locally serves the `dist/` directory over [http://localhost:5580](http://localhost:5580)**.

## How does it work ?

Here's a little schema to help you figure out about how `ssgo` works:

<img alt="How ssgo works schema" src="/static/images/schema.png" loading="lazy" />

## What now ?

Now that you are up and running, you can learn about the other cool things coming with `ssgo` like:

- [Going further with templates](/docs/about-templates.html)
- [Going further with creators](/docs/about-creators.html)
- [Using your own components](/docs/using-components.html)
- [Using static files](/docs/how-are-static-files-handled.html)
