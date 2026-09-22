# Rules and Submission Checklist

This checklist is derived from the official competition README. If the website and repository disagree, the repository README wins.

## Eligibility and team

- [ ] Every team member is 18 or the age of majority where they live.
- [ ] Team has one to four people.
- [ ] Every person is associated with only one entry.
- [ ] No team member works on 404, the 404 subnet, or Atlas if the team intends to win.
- [ ] Team is not prohibited from entering by local law or sanctions.

## Repository and history

- [ ] Entry source repository is public.
- [ ] First source-repository commit is on or after 11 September 2026, 00:00 UTC.
- [ ] Development history is genuine and spread across meaningful commits.
- [ ] Work is not uploaded as one final commit.
- [ ] Exact deployed commit SHA is recorded.

## 3D and asset compliance

- [ ] Every 3D object is Three.js code written through the 404 recipe.
- [ ] Asset modules construct geometry from Three.js constructors and operations.
- [ ] No downloaded meshes or asset-store models.
- [ ] No hand-modelled meshes.
- [ ] No literal vertex arrays or base64 blobs hiding mesh data.
- [ ] Any `harness/ship.mjs` warning is reviewed and resolved or documented.
- [ ] Textures, skies, sprites, sound, and music are either ours or generated with permitted tools.
- [ ] Every external or generated image/sound source is declared.
- [ ] We hold the rights to everything shipped.

## Originality and tools

- [ ] No trademarked characters, names, or logos.
- [ ] No copied code or assets from 404 reference games.
- [ ] All coding agents and models are named in the entry JSON.
- [ ] All image and sound generators/models are named in the entry JSON.
- [ ] The unique discovery is a mechanic, rule, visual treatment, or control scheme in the game itself.

## Live gate

Run from the official recipe repository:

```bash
node harness/jam.mjs https://DEPLOYED_URL/game/ --commit=EXACT_SHA
```

- [ ] Ready within the gate time limit under a 4G profile.
- [ ] Total transferred size is under 10 MB.
- [ ] Game starts from a real tap.
- [ ] Game moves/responds under a real finger.
- [ ] Stays below 900 draw calls.
- [ ] Stays below 1.5 million triangles.
- [ ] No HTTP 404 responses.
- [ ] No console errors.
- [ ] Gate tests the same public URL and commit used in the submission.
- [ ] Final verdict block is pasted into the PR completely and unedited.

## Submission

- [ ] Fork `404-Repo/404-game-jam`.
- [ ] Add exactly one `entries/<slug>.json` based on `entries/_template.json`.
- [ ] Provide title and matching slug.
- [ ] List team GitHub handles.
- [ ] Provide live play URL.
- [ ] Provide public source URL.
- [ ] Provide exact gate-tested commit SHA.
- [ ] Choose genre.
- [ ] List agent and models.
- [ ] Declare original art and list it accurately.
- [ ] Write `what_i_found` in no more than three sentences.
- [ ] Provide a Bittensor SS58 wallet or use `later`.
- [ ] Provide reachable email or X contact.
- [ ] Open the pull request before 25 September 2026, 23:59 UTC.
- [ ] Leave enough margin for the organisers' gate rerun.

## Rights acknowledgement

- [ ] Team understands it retains ownership of the game.
- [ ] Team accepts the non-exclusive promotional licence described in the rules.
- [ ] Team accepts responsibility for applicable taxes.

