# Upstream OpenClaw PR Draft

## Target

- Repository: `openclaw/openclaw`
- Issue: `#47139`
- Local branch: `codex/f-gen-2-skills-ux-fix`

## Suggested PR Title

`fix(ui): keep workspace-installed skills grouped by source`

## Suggested PR Body

```md
## Summary

Fix the Control Panel skills grouping logic so workspace-installed skills stay in the workspace group even when they also carry a bundled badge.

This addresses #47139, where installed copies of formerly bundled skills could appear under Built-in Skills instead of Workspace Skills.

## What changed

- use `skill.source` as the primary grouping signal in the skills UI
- keep `bundled` as secondary metadata only
- add a browser regression test covering a workspace skill that also has `bundled: true`

## Verification

- `corepack pnpm --dir ui exec vitest run --config vitest.config.ts src/ui/views/skills.browser.test.ts`
- `corepack pnpm --dir ui build`
```

## Changed Files

- `ui/src/ui/views/skills-grouping.ts`
- `ui/src/ui/views/skills.browser.test.ts`
