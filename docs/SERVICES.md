# Services and Deployment

Do not commit passwords, access tokens, API keys, personal email addresses, or other credentials to this project.

## Confirmed connections

### GitHub

- Connected identity: `aliiqbal24`
- Competition repository is readable.
- Public game repository: https://github.com/aliiqbal24/no-lunch-left-behind
- Local `main` tracks `origin/main`; the first three jam commits are pushed.
- Competition fork and submission pull request remain intentionally deferred until the final build is locked.
- Intended use: public source, real commit history, competition fork, and submission pull request.

### Atlas Studio

- Browser access verified to `Ali Iqbal's 404 Game Jam Workspace`.
- Credit claim: 2,600 total, composed of 2,000 campaign credits and 600 trial credits.
- The workspace is still showing its initial personalization/onboarding dialog.
- Direct Atlas MCP/API access is not configured in this environment.
- Generating a workspace API key is a separate security-sensitive action and must be approved when needed.
- Intended use: concept/reference images, textures, skies, sprites, or sound if useful. All generated assets and models used must be declared in the entry.

### Vercel

- Connected team: `alijiqbal24-gmailcoms-projects`
- Project: `no-lunch-left-behind`
- Stable URL: https://no-lunch-left-behind.vercel.app
- The first production deployment was created from the verified `game/` directory.
- This environment can create deployments and inspect projects, deployments, logs, and errors.
- Intended use: static production hosting tied to the exact submitted source commit.

## Hosting decision

Primary recommendation: Vercel.

Why it fits this jam:

- direct deployment access is already connected;
- static assets are served through a CDN;
- preview deployments make gate testing safer;
- build and runtime failures can be inspected from this environment;
- the final production deploy can be tied to the exact SHA named in the gate and pull request.

Fallback: GitHub Pages. It is a good zero-dependency static host and aligns with the example URL in the rules. Keep it as a fallback rather than maintaining two live production paths during the jam.

## Deployment guardrails

- Deploy early, on the first day of implementation.
- Use a stable production URL for the submission.
- Record the exact source commit for every gate run.
- Confirm the deployment contains that exact commit before pasting the verdict.
- Do not mutate the submitted production build after the final gate run.
- Test from a clean browser session and the official 4G phone profile.
- Keep all transferred assets below 10 MB in total.
