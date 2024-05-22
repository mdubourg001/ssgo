#!/usr/bin/env bash

set -e

previous_version=$(head version.ts|grep 'const VERSION' | sed 's/const VERSION = "//' |sed 's/"//' |sed 's/;//')
vr bump-version $1
new_version=$(head version.ts|grep 'const VERSION' | sed 's/const VERSION = "//' |sed 's/"//' |sed 's/;//')

git fetch --tags

git add version.ts
git commit --amend --no-edit
git tag "v$new_version"

echo -e "# Changelog

_This page is updated automatically for every new release._

## v$new_version ($(date "+%Y-%m-%d"))

$(git log --pretty=oneline --abbrev-commit v$previous_version..v$new_version| grep 'feat:\|fix:\|chore:'| sed 's/^/- /')
$(tail -n +4 CHANGELOG.md)
" > CHANGELOG.md

#eggs publish --version $new_version --no-check

git add CHANGELOG.md egg.json
git commit -m "release: v$new_version"

git push --force
git push origin "v$new_version"

echo "Succesfully released $new_version to nest.land and deno.land."
