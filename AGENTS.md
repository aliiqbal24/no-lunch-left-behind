# Collaboration rules for this game

Read `docs/NOW.md` for the current assignment before changing files. At the start of every task, check `git status --short --branch`, `git worktree list`, and the relevant diff. Existing edits belong to another session until proven otherwise: never reset, overwrite, or silently include them in your commit.

- One integration session owns `main`, `game/src/main.js`, `game/index.html`, `game/style.css`, `docs/NOW.md`, the full playthrough, the official gate, and deployment. Other sessions use a separate branch and worktree, edit only their assigned files, and hand a commit SHA to integration. If a task needs an integration-owned file, describe the needed hook in the handoff instead of editing it.
- Only the integration session edits the task board or merges/cherry-picks work into `main`. Before beginning unassigned or overlapping work, get a bounded task and file ownership from the project owner/integration session. See `docs/COLLABORATION.md`.
- Keep this local-first. Do not deploy to Vercel, connect automatic Git deployments, submit the jam PR, or spend Atlas credits unless the project owner explicitly asks. The local preview is `http://localhost:8080/__game__/game/` when the development service is running.
- Preserve 404 jam compliance: every 3D object is editable Three.js code made through the 404 recipe; no downloaded/hand-modelled meshes, hidden mesh data, literal vertex arrays, or base64 geometry. Keep asset provenance current. Read `docs/RULES_CHECKLIST.md` before declaring a build shippable.
- Run checks relevant to the files changed. Report the commit SHA, files changed, checks and results, and any integration steps. Never claim a final gate pass from a local-only check.
