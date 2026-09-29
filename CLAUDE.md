# Gallery Hamiduzzaman

## Git workflow

**Never run `git commit` or `git push`.** Stage only.

When a change is ready, run `git add` on the relevant files and then stop.
Report what was staged and suggest a commit message as plain text in the
reply — do not write it into the repo. The commit and the push are the
user's to make.

This applies even when the user says "commit this" in passing; confirm
first rather than assuming the rule is lifted for that turn.

### Commit messages

Suggested messages are **a single subject line, nothing else** — no body,
no bullet points, no trailers. This matches the existing history
(`Fix build issue`, `Delete assets file`, `Implement Supabase Integration`).

Do **not** append `Co-Authored-By: Claude ...`. The user is the sole
author on this repo.

## Verifying a build

`npm run build` compiles the **working tree**, not what is committed. Code
that only exists uncommitted locally will pass here and still break the
deploy, which builds from a clean checkout. Before claiming a build is
green for something about to be pushed, confirm the files it depends on
are actually committed.
