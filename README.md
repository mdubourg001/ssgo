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

- [ ] Serve built site using Denoliver
- [ ] Accept multiple top-level nodes in templates
- [x] Prevent multiple output pages with same names / paths
- [ ] Complete the documentation
- [ ] Format the built pages
- [ ] Add --minify a flag to allow minification
- [x] Add an 'init' argument to initialize project directories
- [ ] Serialize the cache on FS to allow faster cold builds
- [ ] Allow nodes inside of custom-components
- [x] Display version number on launch
- [x] Add a velociraptor file for development tasks
