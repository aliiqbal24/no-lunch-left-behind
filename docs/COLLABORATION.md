# Parallel Codex workflow

This repository is the **game source** and will remain the final public source URL. The separate `404-Repo/404-game-jam` fork is only for `entries/<slug>.json` and the submission PR near the deadline. Do not turn this game source into that fork.

## Roles and ownership

The integration session works in the existing checkout on `main`. It owns `game/src/main.js`, `game/index.html`, `game/style.css`, `docs/NOW.md`, the final playthrough, recipe ship/gate runs, and deployment. It reviews each contributor commit before cherry-picking it, resolves any integration hooks, and updates `docs/NOW.md`.

Each contributor gets one bounded task, one worktree/branch, and an exclusive file list. Good independent slices are an asset module or set of asset modules under `game/assets/`, a focused audio change in `game/src/audio.js`, an input change in `game/src/input.js`, or a read-only review. No two active coding tasks own the same file. A contributor who discovers they need `main.js`, HTML, CSS, or another person's files stops at the boundary and writes the requested hook in the handoff.

## Starting a session

1. Integration first checks that its `main` working tree is clean, records the task, owner, branch/worktree, owned files, and acceptance criteria in `docs/NOW.md`.
2. In Codex, start a new chat for the task and choose **Worktree** from the project on current `main`. Give it the task prompt below. If Codex creates a detached-HEAD worktree, create a named `codex/<task>` branch there before committing.
3. A terminal alternative is `git worktree add -b codex/<task> /home/ali/HeCode/404-game-jam-worktrees/<task> main` from this repository, using a unique task name and an existing parent directory. Do not run this for speculative tasks; create a worktree when an owner is assigned.
4. The contributor checks status before editing and commits only owned files. They do not deploy or merge to `main`.
5. Integration inspects the commit and cherry-picks its SHA onto a clean `main`, then runs the relevant checks and local playthrough. Integration updates `docs/NOW.md` after the handoff is accepted.

For reviewing a contributor's live build, start the 404 recipe server against that worktree's `game/` on a distinct port. The always-on main preview at `http://localhost:8080/__game__/game/` serves the integration checkout, not a contributor worktree.

## Copy/paste task prompt

```text
You are a contributor to /home/ali/HeCode/404-game-jam-submission.
Read AGENTS.md and docs/NOW.md. Work in your own Codex worktree on branch codex/<task>.
Task: <one bounded outcome and acceptance criteria>.
Own only: <exact files or glob that does not overlap another task>.
Do not edit game/src/main.js, game/index.html, game/style.css, or docs/NOW.md.
Do not deploy, push to production, use Atlas credits, or merge to main.
Before editing, inspect git status and the owned files. Preserve other work.
Commit your changes and report the full commit SHA, files changed, checks run/results,
and any exact hook the integration session needs to connect.
```

For a read-only review, ask for findings with file/line references and no commit. The integration session decides which fixes to assign.

## Integration checklist

- Confirm `main` has no uncommitted work that a cherry-pick could overwrite; inspect the contributor diff and 404 compliance.
- Cherry-pick one reviewed commit at a time; resolve integration changes only in the integration checkout.
- Run `node --check` on changed JavaScript and `node harness/ship.mjs <game-dir>` from the 404 recipe repository for game-code changes. Exercise the affected scene locally. Run the official mobile gate against the exact deployed commit only when the project owner approves release.
- Record accepted SHA, test result, and next task in `docs/NOW.md`.
- Push `main` only after checking that doing so will not auto-deploy an unapproved build. Never deploy Vercel merely because a contributor finished.

Codex reads repository `AGENTS.md` when a session starts. Start new chats/worktrees after this setup; restart older sessions if they do not see these rules.
