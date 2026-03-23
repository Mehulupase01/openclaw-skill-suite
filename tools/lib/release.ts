import fs from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./skills.ts";

export type ReleaseSkill = {
  slug: string;
  name: string;
  version: string;
  path: string;
  changelog: string;
  summary: string;
};

export const releaseManifestPath = path.join(repoRoot, "release", "skills-manifest.json");

export async function readReleaseManifest(): Promise<ReleaseSkill[]> {
  const raw = await fs.readFile(releaseManifestPath, "utf8");
  return JSON.parse(raw) as ReleaseSkill[];
}

export function parseFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

export function escapeDoubleQuotes(value: string): string {
  return value.replaceAll("\"", "\\\"");
}

export function buildPublishCommand(skill: ReleaseSkill): string {
  return [
    "corepack pnpm exec clawhub publish",
    skill.path,
    `--slug ${skill.slug}`,
    `--name \"${escapeDoubleQuotes(skill.name)}\"`,
    `--version ${skill.version}`,
    "--tags latest",
    `--changelog \"${escapeDoubleQuotes(skill.changelog)}\"`
  ].join(" ");
}
