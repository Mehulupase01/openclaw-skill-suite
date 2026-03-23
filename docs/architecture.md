# Architecture

## Goals

- Keep each skill independently publishable.
- Keep persistent state local and auditable.
- Prefer deterministic helper scripts for storage and formatting tasks.
- Keep repo-level quality checks separate from skill runtime logic.

## Skill Design Pattern

Each skill follows the same contract:

- `SKILL.md` defines metadata, use criteria, commands, and safety boundaries.
- `scripts/` contains deterministic helpers.
- `references/` stores domain-specific guidance the agent may consult.
- `test_*.py` validates the helper logic without requiring OpenClaw itself.

## Shared Repo Tooling

- `tools/validate-skills.ts` enforces publish-safe structure and metadata hygiene.
- `tools/package-skills.ts` computes packaging summaries and file allowlist checks.
- `tests/*.test.ts` confirms the repo-level contract remains stable across all skills.

## Persistent State

- `job-tracker`, `expense-snap`, and `smart-scheduler` use SQLite.
- Runtime database files are created in each skill's `.runtime/` directory.
- No runtime databases are committed to the repository.
