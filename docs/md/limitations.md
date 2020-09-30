---
title: Limitations
description: ssgo is a project that I build and maintain on my spare time. It has actually some minor limitations.
path: limitations
weight: 4
---

# Known limitations

`ssgo` is a project that I build and maintain on my spare time, and that is not fully tested yet. Moreover, it is build with [Deno](https://deno.land), that still lacks some third-party tooling because of his youngness (even if I personnally ❤️ it).

Here are the limitations of `ssgo` I know about (if you find some more, please [fill an issue](https://github.com/mdubourg001/ssgo/issues)):

- **`ssgo` does not format or minify the pages he builds (it is also on the roadmap)**.

- **`ssgo` does not remove obsolete files in dev mode**: if one of your template used to reference a static file, and does not anymore, it will not automatically be removed from `dist/`, until next full build.
