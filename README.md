# PR Task Checker

This action reads the PR body, parses GFM task-list checkboxes (`- [ ]` / `- [x]`), and fails the workflow if any tasks remain unchecked. 
Tasks can be individually suppressed with a `Not applicable` line or excluded in bulk using an ignore block.

## Usage

```yaml
name: PR Task Check

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

permissions:
  contents: read

jobs:
  check-tasks:
    name: Check PR task list
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check PR tasks
        uses: ./
```

## Ignoring tasks

### "Not applicable"

Add an indented `Not applicable` checkbox on the following line beneath an unchecked task to ignore it.

```markdown
- [ ] Deploy to staging
  - [ ] Not applicable
```

The sub-checkbox can be either checked or unchecked — its presence is what marks the parent task as ignored.

### Ignore block

Wrap any tasks in `<!-- ignore-task-list-start -->` / `<!-- ignore-task-list-end -->` to exclude them entirely.

```markdown
<!-- ignore-task-list-start -->
- [ ] This task is ignored
- [ ] So is this one
<!-- ignore-task-list-end -->
```

## Supported events

The action runs on `pull_request` and `pull_request_review` events. On all other events it logs a warning and exits successfully.

## Development

```bash
pnpm install         # install dependencies
pnpm test            # run tests
pnpm check           # lint & format check (Biome)
pnpm format          # auto-format
pnpm bundle          # rebuild dist/index.js
```

`dist/index.js` must be committed — GitHub Actions runners execute the pre-built bundle directly.
