import { spawnSync } from "node:child_process";
import path from "node:path";
import { buildPublishCommand, readReleaseManifest } from "./lib/release.ts";
import { repoRoot } from "./lib/skills.ts";

async function main() {
  const execute = process.argv.includes("--execute");
  const skills = await readReleaseManifest();

  for (const skill of skills) {
    const command = buildPublishCommand(skill);
    if (!execute) {
      console.log(`[dry-run] ${command}`);
      continue;
    }

    const result = spawnSync("corepack", ["pnpm", "exec", "clawhub", "publish", skill.path, "--slug", skill.slug, "--name", skill.name, "--version", skill.version, "--tags", "latest", "--changelog", skill.changelog], {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

void main();
