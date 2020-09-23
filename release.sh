#!/usr/bin/env bash

vr bump-version $1

new_version=$(cat ./VERSION)

git add VERSION
git commit --amend --no-edit
git tag "v$new_version"
git push --force
git push origin "v$new_version"

eggs publish --version $new_version

echo "Succesfully released $new_version to nest.land and deno.land."