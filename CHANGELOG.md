# Changelog

_This page is updated automatically for every new release._

## v0.20.2 (2024-05-22)

- 9568aa8 fix: prevent autoclosing tag on doctype tag

## v0.20.1 (2022-03-12)

- 3180195 chore: upgraded to std@0.129

## v0.20.0 (2021-12-17)

- 8f7d748 chore: upgraded to std@0.118 + upgraded to oak@9.1
- 4e83355 chore: updated README.md
- 6d1ba51 chore: bumped to std@0.90.0

## v0.19.3 (2021-03-09)

- abc8e2e fix: static files compilation + automatic cleaning for prod builds

## v0.19.2 (2021-02-23)

- a62636c chore: bumped to std@0.88.0 (deno v1.7.5)
- cba5df1 chore: updated Deno.bundle calls to new Deno.emit API

## v0.19.1 (2021-01-25)

- 76e84ea chore: bumped to std@0.88.0 (deno v1.7.0)

## v0.19.0 (2021-01-23)

- 0123d7c feat: added the serve flag to allow serving the dist/ directory
- 46cec61 feat: added the --clean option to empty dist directory before building
- 9c8483a feat: exposing buildTemplateToString from mod.ts
- a7ea7c7 feat: added the --clean option to empty dist directory before building
- aba77cf feat: exposing buildTemplateToString from mod.ts

## v0.18.5 (2021-01-21)

- e63a5db feat: added the --cwd option and added projectRoot to ssgoBag's context

## v0.18.4 (2021-01-19)

- 62fa121 fix: fixed sitemap.xml generation by caching build in prod mode

## v0.18.3 (2021-01-18)

- e713e8b feat: giving context.mode to ssgoBag
- 1c2e9de fix: prevent full site rebuild in dev mode when a component changes

## v0.18.2 (2021-01-18)

- 2306641 fix: prevent full site rebuild in dev mode when a component changes

## v0.18.1 (2021-01-17)

- 33531a2 feat: improved text interpolation regex and removed need of braces around evaluated objects

## v0.18.0 (2021-01-17)

- 3455eb1 fix: allowing recursive components calls
- 632b310e feat(dev): stop building the entire project in dev mode but just the requested ressources

## v0.17.0 (2020-12-13)

- c4a7a9e1 chore: bumped to std@0.80.0 (deno v1.6.0)
- a4b7e9bf fix: fixing version in deno upgrade && added run flag to install instructions

## v0.16.1 (2020-10-06)

- 665a025 chore: changed default project wording

## v0.16.0 (2020-10-03)

- ee7c2e4 feat: added 'ssgo upgrade' CLI command to upgrade to latest version
- 33f3ccb chore: fetching tags before generating CHANGELOG

## v0.15.0 (2020-10-02)

- b0155b9 feat: added internal ssgo logger to ssgoBag
- d6519a3 fix: added missing import type in default (init) creator
- db0f2ac fix: prevent useless copy of creator to temp file when not in dev mode
- 3c29957 feat: logging duration of build on build success
- 71447a0 feat: allowing filtering creators to run through --only-creators
- ade5908 chore: fixed ordering of tags in CHANGELOG.md
- a706305 feat: improved the look of the init default project

## v0.14.1 (2020-09-30)

- dedcda7 feat: improved the look of the init default project

## v0.14.0 (2020-09-30)

- 0dbfc96 feat: added --port and --host dev options
- 086cb12 feat: serve dist/ directory on dev mode
- 62a4bb6 chore: set up of automatic changelog generation on release
- 072548b chore: fixed egg.json config

