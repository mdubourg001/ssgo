<p align="center">
  <img src="./assets/logo.png">
</p>

# ssgo

A minimalist, unconfigurable static site generator.

**`ssgo`** is built with Deno, and aims to be used within a Deno ecosystem.

![license: MIT](https://img.shields.io/github/license/mdubourg001/ssgo?style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Quickstart

To install `ssgo` using Deno:

```bash
deno install --unstable --allow-read --allow-write --allow-net https://raw.githubusercontent.com/mdubourg001/ssgo/master/ssgo.ts
```

Here's what a `ssgo` project looks like:

```plaintext
├── creators/    <- here go the scripts creating your pages
├── templates/   <- here go the the templates your pages
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

~~**To serve the build** on port 8000~~ (**soon !**):

```bash
ssgo serve
```

## Roadmap

- [ ] Serve built site using Denoliver
- [ ] Accept multiple top-level nodes in templates
- [ ] Prevent multiple output pages with same names / paths
- [ ] Complete the documentation
