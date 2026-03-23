# Publishing

## Current State

This repository is fully publish-ready locally, but actual public publication is
credential-gated. As of March 23, 2026, the final publish step requires:

- a GitHub account old enough to satisfy ClawHub upload gating
- ClawHub authentication via the `clawhub` CLI
- any optional channel credentials needed for live demos

## Publish Workflow

1. Install dependencies:

   ```bash
   corepack pnpm install
   ```

2. Run the full local gate:

   ```bash
   corepack pnpm check
   ```

3. Authenticate:

   ```bash
   corepack pnpm exec clawhub login
   corepack pnpm exec clawhub whoami
   ```

4. Publish one skill at a time:

   ```bash
   corepack pnpm exec clawhub publish skills/job-tracker --slug job-tracker --name "Job Tracker" --version 0.1.0 --tags latest --changelog "Initial release"
   ```

## Moderation Notes

- Skills are text bundles only. No binary payloads should be included.
- Metadata must match runtime behavior, especially environment variables and shell usage.
- Prefer transparent commands and avoid hidden network calls or opaque shell pipelines.
- Preserve the safety boundaries written in each `SKILL.md` during future updates.
