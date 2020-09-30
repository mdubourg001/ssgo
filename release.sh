#!/usr/bin/env bash

previous_version=$(head version.ts|grep 'const VERSION' | sed 's/const VERSION = "//' |sed 's/"//' |sed 's/;//')
vr bump-version $1
new_version=$(head version.ts|grep 'const VERSION' | sed 's/const VERSION = "//' |sed 's/"//' |sed 's/;//')

echo -e "\n## v$new_version ($(date "+%Y-%m-%d"))\n" >> CHANGELOG.md
git log --pretty=oneline --abbrev-commit v$previous_version..v$new_version| grep 'feat:\|fix:\|chore:'| sed 's/^/- /' >> CHANGELOG.md

git add version.ts CHANGELOG.md
git commit --amend --no-edit
git tag "v$new_version"
git push --force
git push origin "v$new_version"

eggs publish --version $new_version

echo "Succesfully released $new_version to nest.land and deno.land."