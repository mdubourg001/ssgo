---
title: Limitations
path: limitations
weight: 3
---

# Known limitations

`ssgo` is a project that I build and maintain on my spare time, and that is not fully tested yet. Moreover, it is build with [Deno](https://deno.land), that still lacks some third-party tooling because of his youngness (even if I personnally ❤️ it).

Here are the limitations of `ssgo` I know about (if you find some more, please [fill an issue](https://github.com/mdubourg001/ssgo/issues)):

- **`ssgo` does not serve what he builds out of the box (it is on the roadmap)**: you will have to use a third-party file server to preview your pages during development. Some of my personal choices would be [simple-hot-reload-server](https://github.com/imcuttle/simple-hot-reload-server), or more simply, a good ol' python server (`python -m http.server 8080`).

- **`ssgo` does not format or minify the pages he builds (it is also on the roadmap)**.

- **`ssgo` does not remove obsolete files in dev mode**: if one of your template used to reference a static file, and does not anymore, it will not automatically be removed from `dist/`, until next full build.
