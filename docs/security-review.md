# Security Review

## Threat Model

These skills operate in agent workflows that may receive untrusted text, images,
or repository content. The main risks are:

- prompt injection through issue bodies, PR descriptions, or receipt text
- accidental execution of untrusted shell commands
- unsafe persistence of sensitive data
- overclaiming what a skill verified versus what it inferred

## Repository Guardrails

- Persistent state is stored locally in SQLite, not remote services.
- Helper scripts use Python standard library only.
- Scripts return structured output and avoid dynamic code execution.
- Skill instructions require the agent to treat user-provided content as untrusted.

## Per-Skill Review Focus

- `code-review-bot`: never merge, approve, or execute repository code automatically.
- `job-tracker`: store only the fields explicitly provided or inferred by the user.
- `expense-snap`: treat image OCR as fallible and ask the agent to confirm ambiguous fields.
- `smart-scheduler`: do not finalize bookings without an explicit chosen slot.

## Release Checklist

- Run `corepack pnpm check`.
- Confirm every `SKILL.md` still has a `Safety Boundaries` section.
- Confirm runtime env references match frontmatter declarations.
- Confirm no generated runtime database or export artifacts are committed.
