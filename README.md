<p align="center">
  <img src="./assets/logo.png">
</p>

# ssgo

A minimalist, unconfigurable static site generator.

**`ssgo`** is built with Deno, and aims to be used within a Deno ecosystem.

![license: MIT](https://img.shields.io/github/license/mdubourg001/ssgo?style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![netlify: passing](https://img.shields.io/netlify/d9dae2e0-b3b2-4c86-aee8-7a625de6e18a?style=flat-square)

## Documentation

Read the (yet incomplete 😕) documentation at https://ssgo.netlify.app/docs.

## Quickstart

To install `ssgo` using Deno:

```bash
deno install --unstable --allow-read --allow-write --allow-net https://deno.land/x/ssgo/ssgo.ts
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

**For the moment**, `ssgo` doesn't provide a web server out of the box.
It is on the roadmap.

## Roadmap

- [ ] Serve built site
- [ ] Complete the documentation
- [ ] Format the built pages
- [ ] Add a --minify flag to allow minification
- [ ] Serialize the cache on FS to allow faster cold builds
- [ ] Find a way to make Deno.bundle quiet
- [ ] Find a way to clear import / compiler cache programmatically
- [ ] Do not throw when errors occur in dev mode
- [ ] Provide a way to opt out of static ressources resolution on a per-file basis
