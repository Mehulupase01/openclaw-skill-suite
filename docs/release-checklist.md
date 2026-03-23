# Release Checklist

## What Is Already Done

- Local skill suite implementation completed.
- Local validation and tests passed.
- OpenClaw upstream UI fix implemented and locally verified.
- Public slug availability checked on March 23, 2026:
  - `code-review-bot`
  - `job-tracker`
  - `expense-snap`
  - `smart-scheduler`

## Skill Suite Repo Release

1. Create the public GitHub repository.
2. Push the local `openclaw-skill-suite` repository to that remote.
3. Stamp skill homepages with the real public repo URL:

   ```bash
   corepack pnpm run release:set-homepages -- --repo-url https://github.com/<owner>/openclaw-skill-suite
   ```

4. Re-run the local gate:

   ```bash
   corepack pnpm check
   ```

5. Render the final publish commands:

   ```bash
   corepack pnpm run release:plan -- --repo-url https://github.com/<owner>/openclaw-skill-suite
   ```

## ClawHub Publish

1. Authenticate:

   ```bash
   corepack pnpm run clawhub:login:windows
   corepack pnpm exec clawhub whoami
   ```

2. Dry run the publish sequence:

   ```bash
   corepack pnpm run release:publish:dry-run
   ```

3. Execute the real publish sequence:

   ```bash
   corepack pnpm run release:publish
   ```

## Upstream OpenClaw PR

1. Push local branch `codex/f-gen-2-skills-ux-fix`.
2. Open a PR against `openclaw/openclaw`.
3. Use the draft content in [upstream-openclaw-pr.md](upstream-openclaw-pr.md).
