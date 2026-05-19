# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of PR Task Checker action
- Fails the workflow if any task checkboxes in a PR body are unchecked
- Support for suppressing individual tasks with a `Not applicable` sub-item
- Support for bulk-ignoring tasks via `<!-- ignore-task-list-start -->` / `<!-- ignore-task-list-end -->` blocks
