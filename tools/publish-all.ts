import { spawnSync } from "node:child_process";
import path from "node:path";
import { buildPublishCommand, readReleaseManifest } from "./lib/release.ts";
import { repoRoot } from "./lib/skills.ts";

async function main() {
  const execute = process.argv.includes("--execute");
  const skills = await readReleaseManifest();
  const command = process.platform === "win32" ? "corepack.cmd" : "corepack";

  for (const skill of skills) {
    const preview = buildPublishCommand(skill);
    if (!execute) {
      console.log(`[dry-run] ${preview}`);
      continue;
    }

    const skillPath = path.isAbsolute(skill.path) ? skill.path : path.join(repoRoot, skill.path);
    const result = spawnSync(command, ["pnpm", "exec", "clawhub", "publish", skillPath, "--slug", skill.slug, "--name", skill.name, "--version", skill.version, "--tags", "latest", "--changelog", skill.changelog], {
      cwd: repoRoot,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

void main();
