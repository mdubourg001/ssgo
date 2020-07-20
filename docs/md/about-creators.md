# About creators

Creators are, with components, the central part of an `ssgo` project. You can see them as **page factories**. They are basically the entry points of your data fetching and your page building.

In order to be known by `ssgo` and to be ran, creators must meet two conditions:

- **creators must be put inside of the `creators/` directory, or nested inside of it**. You can have as much creators as you want, even a single one that build all of your pages: that is up to you.
- **creators must be `.js` or `.ts` files, and must default export a function**. This function will be evaluated by `ssgo` and will be given two arguments: the `buildPage` function, and an object filled with helper functions.

## The `buildPage` function

## The `ssgoBag` and its contents
