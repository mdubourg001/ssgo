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

See the _Options_ documentation under to learn about build options.

## `ssgo dev`

Same as `build` except `ssgo` will also spawn a file watcher on your project files to re-build specific parts of the project upon changes.

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

## `ssgo help`

Shows some help about ssgo commands.

## Options

- **`--sitemap`**: Generates a sitemap.xml file of the build pages for the given host. Example: `ssgo build --sitemap=https://example.com`. Works only with the `build` command.
