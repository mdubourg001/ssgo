---
title: Installation
description: You can install ssgo using deno by running `deno install --unstable --allow-read --allow-write --allow-net -q https://deno.land/x/ssgo/ssgo.ts`. Run the same command with the -f flag to upgrade.
path: installation
weight: 1
---

# Installation

You can install `ssgo` using `deno`:

```bash
deno install --unstable --allow-read --allow-write --allow-net --allow-run -q https://deno.land/x/ssgo/ssgo.ts
```

> The `--unstable` flag is needed for the moment as `ssgo` uses Deno's compiler API, which is still unstable.

You can learn about how to easily start using `ssgo` by reading the [Quickstart](/docs/quickstart.html) page.

## Upgrading

To upgrade `ssgo` whenever a new version is released, just run:

```bash
ssgo upgrade
```
