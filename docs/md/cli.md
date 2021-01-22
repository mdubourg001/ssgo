---
title: CLI
description: Here's the reference of the command line interface commands built in ssgo. Commands are build, dev, init, version and help.
path: cli
weight: 5
---

# CLI

Here's the reference of the command line interface commands built in `ssgo`:

## `ssgo build`

> Note that the `build` is the default command: running `ssgo` without the `build` keyword is similar.

Builds the `ssgo` project of the current directory to the `dist/` directory.

### Options

- **`--sitemap`**: Generate a sitemap.xml file of the build pages for the given host. Example: `ssgo build --sitemap=https://example.com`. Works only with the `build` command.
- **`--only-creators`**: Filter the creators to run. Example: `ssgo dev --only-creators=index.ts,other.js`.
- **`--clean`**: Clean the `dist/` directory before building.

## `ssgo serve`

Serves the build locally (on _http://localhost:5580_ by default).

**This intends to be used for testing purposes only: you should not use it in production.**

### Options

- **`--host`**: Set the host to serve `dist/` over (default 'localhost'). Example: `ssgo serve --host=0.0.0.0` (to serve `dist/` on local network).
- **`--port`**: Set the port to serve `dist/` over (default 5580). Example: `ssgo serve --port=8080`.

## `ssgo dev`

Same as `build` except `ssgo` will not build the entire project directly, it will instead build only the needed files when requested.

It will also spawn a file watcher on your project files to re-build specific parts of the project upon changes. `dev` will also serve the content of the `dist/` directory over `http://localhost:5580`.

### Options

- **`--host`**: See `ssgo serve > Options`.
- **`--port`**: See `ssgo serve > Options`.
- **`--only-creators`**: See `ssgo build > Options`.
- **`--clean`**: See `ssgo build > Options`.

## `ssgo init`

Initializes a ssgo project in the current working directory by creating the needed directories: `creators/`, `templates/`, `components/`, `static/`. **A default creator, template and stylesheet will also be created.**
`init` will also create a default `.gitignore` file and add the `dist/` directory inside it.

```bash
ssgo init && ls
# .gitignore creators/ templates/ components/ static/

cat .gitignore
# dist/
```

Note that if some of the directories or files to create already exist, `init` will let them untouched.

## `ssgo version`

Outputs the current version of `ssgo`.

## `ssgo upgrade`

Upgrades to the latest ssgo version.

## `ssgo help`

Shows some help about ssgo commands.

## Global options

- **`--cwd`**: Set the current working directory to the given path.
