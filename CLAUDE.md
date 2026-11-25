# Hemanth-55: GitHub profile README, session context

The profile page people see at github.com/Hemanth-55. `README.md` is the page; `assets/` holds images generated in code.
Claude: read this file, then `notes/`, at the start of every session.

## The project
- `node scripts/build-assets.mjs` (`npm run assets`) builds the profile images. Text is converted to vector paths so GitHub shows the exact typography (Inter, JetBrains Mono in `scripts/fonts/`).
- `scripts/activity.mjs` draws the activity chart. GitHub Actions (`.github/workflows/activity.yml`) runs it daily and on pushes to `scripts/`, and commits as github-actions[bot]. So **always `git pull --rebase` before pushing.**
- Data for the visuals: `scripts/data/soccer-test.json` (from the soccer model) and `scripts/data/cv-poses.json` (from the CV project).
- Profile rules: speak to tech people. No "stance"/handedness lines and no sport-target lines.

## Rules
- Apple-level quality: minimal, professional, clear to a layman at a glance. Speak to tech people, no gimmicks.
- Never describe projects as done at BU.
- Never commit secrets, raw licensed data or large media.

## Session routine
- Start: `/session-start` · End: `/session-end` (log, commit, `git pull --rebase`, push)
- Several sessions can share this repo; the notes are the shared memory. Facts come only from the repo, the notes and Hemi. Ask, don't guess.

## Related
- Hub: https://github.com/Hemanth-55/Tamil- (index of all repos in `notes/repos.md`)
- Portfolio: https://github.com/Hemanth-55/Portfolio-Website (live: hemanthkumargopi.vercel.app)
