<p align="center">
  <img src="./assets/logo.png">
</p>

# ssgo

A minimalist, unconfigurable static site generator.

**`ssgo`** is built with Deno, and aims to be used within a Deno ecosystem.

![license: MIT](https://img.shields.io/github/license/mdubourg001/ssgo?style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![netlify: passing](https://img.shields.io/netlify/d9dae2e0-b3b2-4c86-aee8-7a625de6e18a?style=flat-square)

## Quickstart

To install `ssgo` using Deno:

```bash
deno install --unstable --allow-read --allow-write --allow-net https://denopkg.com/mdubourg001/ssgo/ssgo.ts
```

Here's what a `ssgo` project looks like:

```plaintext
├── creators/    <- here go the scripts creating your pages
├── templates/   <- here go the templates of your pages
├── components/  <- here go your custom components
└── static/      <- here go your static files
```

**To launch a build**:, just run:

```bash
ssgo
```

Your site will be built inside of the `dist/` directory.

**To start dev mode** with file watching:

```bash
ssgo dev
```

~~**To serve the build** on port 8000~~ (**soon !** You can use [Denoliver](https://github.com/joakimunge/denoliver) in the meantime):

```bash
ssgo serve
```

## Roadmap

- [x] Allow comments as top-level nodes
- [ ] Serve built site
- [ ] Complete the documentation
- [ ] Format the built pages
- [ ] Add --minify a flag to allow minification
- [ ] Serialize the cache on FS to allow faster cold builds
- [ ] Allow nodes inside of custom-components
- [x] Make init create a .gitignore and add \*_/_/\_\_ssgo\* and dist/ to it
- [ ] Find a way to make Deno.bundle quiet
- [ ] Find a way to clear import / compiler cache programmatically
- [x] Clean \_\_ssgo prefixed temp files on launch
- [x] Add a flag allowing adding directories to watcher
- [x] Export types useful to creators from a 'mod.ts' module
- [x] Add an addStaticToBundle function to ssgoBag
