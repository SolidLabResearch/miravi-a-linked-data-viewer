# Release activities

* [Release tag](#release-tag)
* [Finalize work on the development branch](#finalize-work-on-the-development-branch)
* [Merge to the main branch](#merge-to-the-main-branch)
* [Create a new release](#create-a-new-release)
* [Back on the development branch](#back-on-the-development-branch)

## Release tag

Define the release tag. Example: `v1.7.0`.

> Do not create the tag in git yet.

## Finalize work on the development branch

All feature branches and fix branches should be merged here
and [CHANGELOG.md](./CHANGELOG.md) should reflect all modifications under the `## [Unreleased]` section.

In [CHANGELOG.md](./CHANGELOG.md):

* Create the new release section by adding a new release title line below the `## [Unreleased]` title line. Example: `## [1.7.0] - 2025-04-09`.
* Add a new release link line near the end of the file. Example: `[1.7.0]: https://github.com/SolidLabResearch/miravi-a-linked-data-viewer/releases/tag/v1.7.0`.
* Update the `[Unreleased]` link in the bottom line to use the new release tag. Example: `[Unreleased]: https://github.com/SolidLabResearch/miravi-a-linked-data-viewer/compare/v1.7.0...HEAD`

Enter the release tag in the version string in [/main/src/version.js](./main/src/version.js).

## Merge to the main branch

Go to the github web interface.

Create a new pull request (example: `Merging for v1.7.0`) to the main branch, from the development branch.

* Create a merge commit **(Do not squash and merge here!)**.

## Create a new release

Still in the github web interface...

Create a new release:

* Choose a tag: create a new git tag (our release tag, example: `v1.7.0`).
* Target: the main branch.
* Release title, example: `Release v1.7.0`.
* In the release description, copy from [CHANGELOG.md](./CHANGELOG.md):
  * the new release section created above
  * the new release link created above
* Set as the latest release.

## Back on the development branch

Modify the version string in [/main/src/version.js](./main/src/version.js) back to `(unreleased)`.
