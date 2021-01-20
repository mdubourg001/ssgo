---
title: CLI
description: Here's the reference of the command line interface commands built in ssgo. Commands are build, dev, init, version and help.
path: cli
weight: 5
---

# CLI

Here's the reference of the command line interface commands built in `ssgo`:

## `ssgo build`

> Note that the `build` keyword is optional as running `ssgo` without specified command will simply trigger a build by default.

Builds the `ssgo` project of the current directory to the `dist/` directory.

### Options

- **`--sitemap`**: Generate a sitemap.xml file of the build pages for the given host. Example: `ssgo build --sitemap=https://example.com`. Works only with the `build` command.
- **`--only-creators`**: Filter the creators to run. Example: `ssgo dev --only-creators=index.ts,other.js`. Specifying this option will prevent `ssgo` to empty the `dist/` directory before building. Useful to rebuilt only some pages.

## `ssgo dev`

Same as `build` except `ssgo` will not build the entire project directly, it will instead build only the needed files when requested.

It will also spawn a file watcher on your project files to re-build specific parts of the project upon changes. `dev` will also serve the content of the `dist/` directory over `http://localhost:5580`.

### Options

- **`--host`**: Set the host to serve `dist/` over (default 'localhost'). Example: `ssgo dev --host=0.0.0.0` (to serve `dist/` on local network). Works only with the `dev` command.
- **`--port`**: Set the port to serve `dist/` over (default 5580). Example: `ssgo dev --port=8080`. Works only with the `dev` command.
- **`--only-creators`**: See `ssgo build > Options`.

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
